import styles from '@/styles/components/IndexStatus.module.scss';
import type { FileStatus, Tone } from '@/types/dashboard';
import Badge from './badge';

const STATUS_MAP: Record<FileStatus, { tone: Tone; label: string }> = {
  indexed: { tone: 'green', label: 'Indexed' },
  processing: { tone: 'amber', label: 'Processing' },
  failed: { tone: 'red', label: 'Failed' },
  queued: { tone: 'slate', label: 'Queued' },
};

export default function IndexStatus({ status }: { status: FileStatus }) {
  const c = STATUS_MAP[status];
  return (
    <Badge tone={c.tone}>
      <span className={styles.dot} />
      {c.label}
    </Badge>
  );
}
