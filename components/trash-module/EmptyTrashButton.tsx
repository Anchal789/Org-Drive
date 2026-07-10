'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { emptyTrash } from '@/services/trash-service';
import AlertModal from '../ui/alert-modal';
import { Button } from '../ui/button';
import styles from './TrashPage.module.scss';

export default function EmptyTrashButton({
  isDisabled,
}: {
  isDisabled: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmptyTrash = async () => {
    setIsDeleting(true);
    const response = await emptyTrash();
    if (response?.success) {
      setIsDeleting(false);
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <AlertModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title='Empty Trash?'
        description='Are you absolutely sure? All files and folders in the trash will be permanently deleted from Telegram. This action cannot be undone.'
        confirmText={isDeleting ? 'Emptying...' : 'Delete Permanently'}
        confirmVariant='destructive'
        cancelText='Cancel'
        onConfirm={handleEmptyTrash}
      />

      <Button
        variant='outline'
        onClick={() => setIsOpen(true)}
        disabled={isDisabled || isDeleting}
        className={styles.emptyTrashButton}
      >
        <Trash2 size={14} />
        {isDeleting ? 'Emptying...' : 'Empty trash'}
      </Button>
    </>
  );
}
