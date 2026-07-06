import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  recentTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from '@/db/schema';
import {
  calculatePercentage,
  formatBytes,
  getActionTone,
} from '@/helpers/analytics.helper';
import type {
  ActivityEvent,
  Contributor,
  FileTypeStat,
  FolderInsight,
} from '@/types/analytics';
import type { Tone } from '@/types/dashboard';

export const analyticsRepository = {
  async getOverviewStats(userId: number) {
    const storageRes = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${uploadedFilesTable.size}), 0)`,
      })
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.userId, userId));

    const filesRes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.userId, userId));

    return {
      totalSizeBytes: Number(storageRes[0]?.totalSize || 0),
      totalFilesCount: Number(filesRes[0]?.count || 0),
      activeMembers: 1,
    };
  },

  async getUploadsLast90Days(userId: number) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const uploads = await db
      .select({ createdAt: uploadedFilesTable.createdAt })
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          gte(uploadedFilesTable.createdAt, ninetyDaysAgo),
        ),
      );

    return uploads.map((u) => ({
      createdAt: new Date(u.createdAt).toISOString(),
    }));
  },

  async getRecentActivity(userId: number, limit = 6): Promise<ActivityEvent[]> {
    const logs = await db
      .select({
        id: recentTable.id,
        action: recentTable.action,
        createdAt: recentTable.createdAt,
        userId: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        fileName: uploadedFilesTable.name,
      })
      .from(recentTable)
      .innerJoin(userTable, eq(recentTable.userId, userTable.id))
      .leftJoin(
        uploadedFilesTable,
        eq(recentTable.fileId, uploadedFilesTable.id),
      )
      .where(eq(recentTable.userId, userId))
      .orderBy(desc(recentTable.createdAt))
      .limit(limit);

    return logs.map((log) => {
      const fName = log.firstName || '';
      const lName = log.lastName || '';
      return {
        id: String(log.id),
        userInitials: `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase(),
        userName: fName,
        action: log.action,
        itemName: log.fileName || 'Unknown Item',
        timeAgo: new Date(log.createdAt).toLocaleDateString(),
        tone: getActionTone(log.action),
      };
    });
  },

  async getStorageByType(userId: number): Promise<FileTypeStat[]> {
    const files = await db
      .select({ name: uploadedFilesTable.name, size: uploadedFilesTable.size })
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.userId, userId));

    let pdf = 0;
    let docs = 0;
    let sheets = 0;
    let slides = 0;
    let other = 0;
    let total = 0;

    for (const f of files) {
      const ext = f.name?.split('.').pop()?.toLowerCase() || '';
      const size = Number(f.size || 0);
      total += size;

      if (ext === 'pdf') pdf += size;
      else if (['doc', 'docx', 'txt'].includes(ext)) docs += size;
      else if (['xls', 'xlsx', 'csv'].includes(ext)) sheets += size;
      else if (['ppt', 'pptx'].includes(ext)) slides += size;
      else other += size;
    }

    const types: FileTypeStat[] = [
      {
        name: 'PDF',
        tone: 'blue',
        sizeBytes: pdf,
        sizeFormatted: formatBytes(pdf),
        percentage: calculatePercentage(pdf, total),
      },
      {
        name: 'Documents',
        tone: 'violet',
        sizeBytes: docs,
        sizeFormatted: formatBytes(docs),
        percentage: calculatePercentage(docs, total),
      },
      {
        name: 'Spreadsheets',
        tone: 'green',
        sizeBytes: sheets,
        sizeFormatted: formatBytes(sheets),
        percentage: calculatePercentage(sheets, total),
      },
      {
        name: 'Slides',
        tone: 'amber',
        sizeBytes: slides,
        sizeFormatted: formatBytes(slides),
        percentage: calculatePercentage(slides, total),
      },
      {
        name: 'Other',
        tone: 'slate',
        sizeBytes: other,
        sizeFormatted: formatBytes(other),
        percentage: calculatePercentage(other, total),
      },
    ];

    return types.sort((a, b) => b.sizeBytes - a.sizeBytes);
  },

  async getTopContributors(userId: number): Promise<Contributor[]> {
    const contributorsRaw = await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        fileCount: sql<number>`COUNT(${uploadedFilesTable.id})`,
        totalSize: sql<number>`SUM(${uploadedFilesTable.size})`,
      })
      .from(uploadedFilesTable)
      .innerJoin(userTable, eq(uploadedFilesTable.userId, userTable.id))
      .where(eq(uploadedFilesTable.userId, userId))
      .groupBy(userTable.id, userTable.firstName, userTable.lastName)
      .orderBy(desc(sql`SUM(${uploadedFilesTable.size})`))
      .limit(5);

    if (contributorsRaw.length === 0) return [];
    const maxVal = Math.max(...contributorsRaw.map((c) => Number(c.totalSize)));

    return contributorsRaw.map((c, i) => {
      const fName = c.firstName || '';
      const lName = c.lastName || '';
      const tones: Tone[] = ['violet', 'blue', 'green', 'teal', 'amber'];
      return {
        id: c.id,
        name: `${fName} ${lName}`,
        initials: `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase(),
        tone: tones[i % tones.length],
        filesCount: Number(c.fileCount),
        sizeBytes: Number(c.totalSize),
        sizeFormatted: formatBytes(Number(c.totalSize)),
        percentage: calculatePercentage(Number(c.totalSize), maxVal),
      };
    });
  },

  async getFolderInsights(userId: number): Promise<FolderInsight[]> {
    const foldersData = await db
      .select({
        id: uploadFoldersTable.id,
        name: uploadFoldersTable.name,
        fileCount: sql<number>`COUNT(${uploadedFilesTable.id})`,
        totalSize: sql<number>`COALESCE(SUM(${uploadedFilesTable.size}), 0)`,
      })
      .from(uploadFoldersTable)
      .leftJoin(
        uploadedFilesTable,
        eq(uploadFoldersTable.id, uploadedFilesTable.folderId),
      )
      .where(eq(uploadFoldersTable.userId, userId))
      .groupBy(uploadFoldersTable.id, uploadFoldersTable.name)
      .orderBy(desc(sql`COALESCE(SUM(${uploadedFilesTable.size}), 0)`));

    const tones: Tone[] = [
      'violet',
      'blue',
      'teal',
      'sky',
      'amber',
      'red',
      'slate',
    ];

    return foldersData.map((f, i) => ({
      id: f.id,
      name: f.name || 'Unknown',
      sizeBytes: Number(f.totalSize),
      sizeFormatted: formatBytes(Number(f.totalSize)),
      filesCount: Number(f.fileCount),
      tone: tones[i % tones.length],
    }));
  },
};
