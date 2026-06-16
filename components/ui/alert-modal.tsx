'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { AlertModalProps } from '@/types/component-types';
import { AsyncButton } from './async-button';
import styles from './Component.module.scss';

export default function AlertModal({
  trigger,
  title,
  description,
  confirmText = 'Continue',
  confirmVariant = 'default',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  open,
  onOpenChange,
}: AlertModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {cancelText && confirmText && (
          <AlertDialogFooter>
            {cancelText && (
              <AsyncButton onClick={onCancel}>{cancelText}</AsyncButton>
            )}

            {confirmText && (
              <AsyncButton
                className={styles[confirmVariant]}
                onClick={onConfirm}
              >
                {confirmText}
              </AsyncButton>
            )}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
