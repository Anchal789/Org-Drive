import Badge from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import styles from './HeroPanel.module.scss';

export default function HeroPanel() {
  return (
    <div className={styles.panelWrapper}>
      <div className={styles.headerRow}>
        <div className={styles.logoSquare}>OD</div>
        <span className={styles.logoText}>Org Drive</span>
      </div>

      <div className={styles.mainContent}>
        <Badge className={styles.badgeCustom}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>Powered by Telegram</span>
        </Badge>

        <h1 className={styles.heroTitle}>
          Your team's files,
          <br />
          on infinite storage.
        </h1>

        <p className={styles.heroSubtitle}>
          A Drive-style workspace backed by your own Telegram channel. No seats,
          no per-GB fees. Optional AI when you want it.
        </p>

        <div className={styles.featuresList}>
          {[
            'Unlimited file storage via your channel',
            'Folder organization & quick share links',
            'Optional AI chat & semantic search',
          ].map((text) => (
            <div key={text} className={styles.featureItem}>
              <span className={styles.featureIconCircle}>
                <Icon
                  d={iconsWithPaths.check}
                  size={11}
                  stroke={2.5}
                  className="text-white"
                />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        © Org Drive 2026 · <span className={styles.footerLink}>Privacy</span> ·{' '}
        <span className={styles.footerLink}>Terms</span>
      </div>

      {/* Decorative Background Elements */}
      <div className={styles.bgCircleLarge} />
      <div className={styles.bgCircleSmall} />
    </div>
  );
}
