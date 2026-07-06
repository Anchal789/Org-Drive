import FileType from '@/components/ui/fileType';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import { iconsWithPaths, TINTS } from '@/constants/common-constants';
import { DRIVE_FILES, DRIVE_FOLDERS } from '@/constants/dashboard-constants';
import styles from '@/styles/components/DashMobile.module.scss';

export default function DashMobile() {
  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <Icon d={iconsWithPaths.list} size={20} />
        <div className={styles.title}>My drive</div>
        <UserAvatar initials="MK" tone="violet" size="sm" ring />
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <Icon
            d={iconsWithPaths.search}
            size={14}
            style={{ color: 'var(--muted-foreground)' }}
          />
          <span className={styles.searchPlaceholder}>Search files</span>
        </div>
      </div>

      <div className={styles.scroll}>
        <div className={styles.sectionLabel}>Folders</div>
        <div className={styles.foldersGrid}>
          {DRIVE_FOLDERS.slice(0, 4).map((folder) => (
            <div key={folder.name} className={styles.folderCard}>
              <Icon
                d={iconsWithPaths.folder}
                size={22}
                fill={TINTS[folder.tone].bd}
                stroke={0}
              />
              <div className={styles.folderName}>{folder.name}</div>
              <div className={styles.folderCount}>{folder.count} files</div>
            </div>
          ))}
        </div>

        <div className={`${styles.sectionLabel} ${styles.sectionSpaced}`}>
          Files
        </div>
        {DRIVE_FILES.slice(0, 6).map((file) => (
          <div key={file.id} className={styles.fileRow}>
            <FileType kind={file.kind} />
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileMeta}>
                {file.size} · {file.mod}
              </div>
            </div>
            {file.bookmark && (
              <Icon
                d={iconsWithPaths.star}
                size={13}
                style={{
                  color: TINTS.amber.bd,
                  fill: TINTS.amber.bg,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile upload mini widget */}
      <div className={styles.uploadMini}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          className={styles.miniRing}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeDasharray={`${(2 * Math.PI * 15 * 62) / 100} 999`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
          <text
            x="18"
            y="22"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="var(--primary)"
          >
            62
          </text>
        </svg>
        <div className={styles.uploadInfo}>
          <div className={styles.uploadTitle}>Uploading 3 files</div>
          <div className={styles.uploadSubtitle}>
            1m 24s left · streaming to Telegram
          </div>
        </div>
        <Icon
          d={iconsWithPaths.chevDown}
          size={14}
          style={{ color: 'var(--muted-foreground)' }}
        />
      </div>

      {/* Tab bar */}
      <div className={styles.tabbar}>
        {[
          iconsWithPaths.cloud,
          iconsWithPaths.users,
          iconsWithPaths.star,
          iconsWithPaths.activity,
        ].map((d, i) => (
          <Icon
            key={d}
            d={d}
            size={20}
            style={{
              color: i === 0 ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          />
        ))}
      </div>

      {/* FAB */}
      <button type="button" className={styles.fab}>
        <Icon d={iconsWithPaths.plus} size={22} stroke={2.4} />
      </button>
    </div>
  );
}
