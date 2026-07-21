import { Link } from 'lucide-react';
import { AsyncButton } from '@/components/ui/async-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import styles from './ShareDialog.module.scss';

interface ShareDialogFooterProps {
  showCopyLink: boolean;
  onCopyLink: () => unknown | Promise<unknown>;
  onCancel: () => void;
  onSubmit: () => unknown | Promise<unknown>;
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
          <AsyncButton variant='outline' size='sm' onClick={onCopyLink}>
            <Link size={14} />
            Copy link
          </AsyncButton>
        )}
        <div className={styles.footerSpacer} />
        <Button variant='ghost' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <AsyncButton variant='primary' size='sm' onClick={onSubmit}>
          {submitLabel}
        </AsyncButton>
      </div>
    </>
  );
}
