import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';
import { bookmarkMultiple, deleteMultiple } from '@/services/file-service';
import type { UploadedFile } from '@/types/files';

export const handleDeleteMultiple = async ({
  selectedFileObjects,
  router,
  handleCloseAlertDialog,
  pathName,
}: {
  selectedFileObjects: Array<UploadedFile & { shareId?: number }>;
  router: AppRouterInstance;
  handleCloseAlertDialog: () => void;
  pathName: string;
}) => {
  const payloadItems = selectedFileObjects.map((f) => ({
    id: f.shareId ? f.shareId : f.id,
    isFile: true,
    shared: !!f.shareId || false,
  }));

  const response = await deleteMultiple(payloadItems, pathName);

  if (response?.success) {
    handleCloseAlertDialog();
    router.refresh();
  }
};

export const handleBookmarMultiple = async ({
  selectedFileObjects,
  router,
  clearSelection,
  pathName,
}: {
  selectedFileObjects: Array<UploadedFile & { shareId?: number }>;
  router: AppRouterInstance;
  clearSelection: () => void;
  pathName: string;
}) => {
  if (selectedFileObjects.length === 0) return;
  const allAreBookmarked = selectedFileObjects.every((f) => f.bookmark);
  const targetState = !allAreBookmarked;
  const alreadyInTargetState = selectedFileObjects.filter(
    (f) => !!f.bookmark === targetState,
  );

  if (alreadyInTargetState.length > 0) {
    const stateStr = targetState ? 'bookmarked' : 'unbookmarked';
    const fileNames = alreadyInTargetState.map((f) => f.name).join(', ');

    toast.error(`Already ${stateStr}: ${fileNames}`);
  }

  const itemsToUpdate = selectedFileObjects.filter(
    (f) => !!f.bookmark !== targetState,
  );

  if (itemsToUpdate.length === 0) {
    return;
  }

  const payloadItems = itemsToUpdate.map((f) => ({
    id: f.shareId ? f.shareId : f.id,
    isFile: true,
    shared: !!f.shareId || false,
  }));

  // 6. CALL API
  const response = await bookmarkMultiple(payloadItems, targetState, pathName);

  if (response?.success) {
    router.refresh();
    clearSelection();
  }
};
