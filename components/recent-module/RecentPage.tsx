'use client';

import { Clock, Folder, MoreHorizontal } from 'lucide-react';
import { type FunctionComponent, useMemo } from 'react';
import { getFileExtension } from '@/lib/utils';
import { formatBytes } from '@/store/store';
import type { RecentLogsType } from '@/types/recent';
import { Button } from '../ui/button';
import FileType from '../ui/fileType';
import styles from './Recent.module.scss';

const RecentPage: FunctionComponent<{
  recentLogs: Array<RecentLogsType>;
  currentUserId: number;
}> = ({ recentLogs, currentUserId }) => {
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof recentLogs> = {
      Today: [],
      Yesterday: [],
      'Earlier this week': [],
      Older: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6);

    for (const log of recentLogs) {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === today.getTime()) {
        groups.Today.push(log);
      } else if (logDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(log);
      } else if (logDate >= startOfWeek) {
        groups['Earlier this week'].push(log);
      } else {
        groups.Older.push(log);
      }
    }

    return groups;
  }, [recentLogs]);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <Clock size={20} />
        </div>
        <div>
          <div className={styles.title}>Recent</div>
          <div className={styles.subHeading}>
            Everything you&apos;ve touched lately, newest first.
          </div>
        </div>
      </div>
      <div className={styles.wrapper}>
        {Object.entries(groupedLogs).map(([groupName, logs]) => {
          if (logs.length === 0) return null;

          return (
            <div key={groupName} className={styles.group}>
              <div className={styles.groupLabel}>{groupName}</div>
              <div className={styles.list}>
                {logs.map((log) => {
                  const isMe = log.actionBy === currentUserId;
                  const actorName = isMe ? 'You' : log.editorFirstName;
                  const itemName =
                    log.fileName || log.folderName || 'Unknown File';
                  const dateObj = new Date(log.createdAt);
                  const timeString =
                    groupName === 'Earlier this week' || groupName === 'Older'
                      ? dateObj.toLocaleDateString('en-US', {
                          weekday: 'short',
                        })
                      : dateObj.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                  return (
                    <div key={log.id} className={styles.row}>
                      <FileType kind={getFileExtension(log.fileName || '')} />

                      <div className={styles.details}>
                        <div className={styles.fileName}>{itemName}</div>
                        <div className={styles.meta}>
                          <span className={styles.actor}>
                            {actorName} {log.action}
                          </span>
                          <span>·</span>
                          <Folder
                            size={11}
                            className={styles.metaIcon}
                            fill='currentColor'
                          />
                          <span>{log.folderName || 'Drive'}</span>
                        </div>
                      </div>

                      <span className={styles.timestamp}>{timeString}</span>
                      <span className={styles.size}>
                        {log.fileSize ? formatBytes(log.fileSize) : '--'}
                      </span>

                      <Button className={styles.moreBtn}>
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RecentPage;
