import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import styles from './ShareDialog.module.scss';

interface ShareDialogFooterProps {
  showCopyLink: boolean;
  onCopyLink: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

export default function ShareDialogFooter({
  showCopyLink,
  onCopyLink,
  onCancel,
  onSubmit,
  submitLabel,
}: ShareDialogFooterProps) {
  return (
    <>
      <Separator />
      <div className={styles.footer}>
        {showCopyLink && (
          <Button variant='outline' size='sm' onClick={onCopyLink}>
            <Link size={14} />
            Copy link
          </Button>
        )}
        <div className={styles.footerSpacer} />
        <Button variant='ghost' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='primary' size='sm' onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </>
  );
}
