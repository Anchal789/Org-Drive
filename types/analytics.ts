import { Tone } from "./dashboard";

export type Timeframe = "24h" | "7d" | "30d" | "90d";

export interface StatData {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  tone: Tone;
  sparkData?: number[];
  href?: string;
}

export interface ActivityEvent {
  id: string;
  userInitials: string;
  userName: string;
  action: string;
  itemName: string;
  timeAgo: string;
  tone: Tone;
}

export interface FileTypeStat {
  name: string;
  tone: Tone;
  sizeBytes: number;
  sizeFormatted: string;
  percentage: number;
}

export interface Contributor {
  id: number;
  name: string;
  initials: string;
  tone: Tone;
  filesCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  percentage: number;
}

export interface FolderInsight {
  id: number;
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  filesCount: number;
  tone: Tone;
}

export interface ChartBucket {
  label: string;
  uploads: number;
  indexed: number;
}

export interface AnalyticsOverviewData {
  storageUsed: StatData;
  totalFiles: StatData;
  activeMembers: StatData;
  systemHealth: StatData;
  uploadActivity: ChartBucket[];
  storageByType: FileTypeStat[];
  recentActivity: ActivityEvent[];
  topContributors: Contributor[];
}

export interface AnalyticsInsightsData {
  totalStorageGB: number;
  growthRate: string;
  folders: FolderInsight[];
}

export interface AnalyticsDataPayload {
  overview: {
    totalSizeBytes: number;
    totalFilesCount: number;
    activeMembers: number;
    storageByType: FileTypeStat[];
    recentActivity: ActivityEvent[];
    topContributors: Contributor[];
  };
  insights: AnalyticsInsightsData;
  uploadsLast90Days: { createdAt: string }[];
}
