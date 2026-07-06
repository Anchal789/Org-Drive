'use client';

import {
  ChevronDown,
  Download,
  Folder,
  Share,
  Sparkle,
  Tag,
  Trash2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import { useMemo, useState } from 'react';
import AlertModal from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/datatable';
import { Dialog } from '@/components/ui/dialog';
import FileType from '@/components/ui/fileType';
import { Separator } from '@/components/ui/separator';
import UserAvatar from '@/components/ui/user-avatar';
import { TINTS } from '@/constants/common-constants';
import { handleBookmarMultiple, handleDeleteMultiple } from '@/helpers/file-fn';
import { formatFileDate, getAvatarColor, getFileExtension } from '@/lib/utils';
import { downloadMultiple } from '@/services/file-service';
import { formatBytes, useShareDialogStore } from '@/store/store';
import type { ColumnDef } from '@/types/component-types';
import type { UploadedFile } from '@/types/files';
import FileMenu from '../FileSection/FileMenu';
import styles from './FileTable.module.scss';

const MoveModal = dynamic(() => import('./MoveModal'));

const FileTable: FunctionComponent<{
  files: Array<UploadedFile & { shareId?: number }>;
}> = ({ files }) => {
  const { setOpen, setFiles, setFile } = useShareDialogStore();
  const [selectedFiles, setSelectedFiles] = useState<(string | number)[]>([]);
  const [modalState, setModalState] = useState<{
    open: boolean;
    file: Array<UploadedFile> | null;
    action: 'share' | 'move' | 'bookmark' | 'delete' | null;
  }>({
    open: false,
    file: null,
    action: null,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const router = useRouter();

  const columns: ColumnDef<UploadedFile>[] = [
    {
      id: 'name',
      width: '100%',
      header: (
        <span className={styles.sortable}>
          Name <ChevronDown size={10} />
        </span>
      ),
      className: styles.fileCell,
      cell: (file) => (
        <>
          <FileType kind={getFileExtension(file.name || '')} />
          <span className={styles.fileName}>{file.name}</span>
          {file.bookmark && <Tag size={12} style={{ color: TINTS.amber.bd }} />}
        </>
      ),
    },
    {
      id: 'type',
      width: '100px',
      header: 'Type',
      className: styles.kindCell,
      cell: (file) => getFileExtension(file.name || ''),
    },
    {
      id: 'owner',
      width: '130px',
      header: 'Owner',
      className: styles.ownerCell,
      cell: (file) => {
        const ownerInitials = `${file.ownerFirstName?.charAt(0) ?? ''}${file.ownerLastName?.charAt(0) ?? ''}`;
        return (
          <>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(file?.userId ?? '')}
              size='sm'
            />
            <span className={styles.ownerName} />
          </>
        );
      },
    },
    {
      id: 'modified',
      width: '110px',
      header: 'Modified',
      className: styles.metaCell,
      cell: (file) => formatFileDate(file.createdAt),
    },
    {
      id: 'size',
      width: '110px',
      header: 'Size',
      className: styles.metaCell,
      cell: (file) => formatBytes(file.size),
    },
    {
      id: 'actions',
      width: '48px',
      header: '',
      cell: (file) => <FileMenu file={file} />,
    },
  ];

  const selectedFileObjects = useMemo(() => {
    if (selectedFiles.length === 0) return [];

    const idSet = new Set(selectedFiles);
    return files.filter((file) => idSet.has(file.id));
  }, [files, selectedFiles]);

  const closeModal = () => {
    setModalState({ open: false, file: null, action: null });
  };

  const handleCloseAlertDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedFiles([]);
  };
  return (
    <>
      <Dialog
        open={modalState.open && modalState.action === 'move'}
        onOpenChange={(open) => {
          if (!open) {
            setModalState({ open: false, file: null, action: null });
          }
        }}
        modal
      >
        {modalState.open && modalState.action === 'move' && (
          <MoveModal files={modalState.file || []} closeModal={closeModal} />
        )}
      </Dialog>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title='Delete file?'
        description={`Are you sure you want to delete ${selectedFileObjects.length} items?`}
        confirmText='Delete'
        confirmVariant='destructive'
        cancelText='Cancel'
        onConfirm={() =>
          handleDeleteMultiple({
            selectedFileObjects,
            router,
            handleCloseAlertDialog,
          })
        }
        onCancel={() => setOpenDeleteDialog(false)}
      />
      <DataTable
        data={files}
        columns={columns}
        getRowId={(file) => file.id}
        enableSelection
        selectedIds={selectedFiles}
        onSelectionChange={setSelectedFiles}
        renderSelectionActions={(_selectedIds, clearSelection) => (
          <>
            <Button
              className={styles.actionButton}
              onClick={() => {
                downloadMultiple(selectedFileObjects);
              }}
            >
              <Download size={14} /> Download
            </Button>

            <Button
              className={styles.actionButton}
              variant={'ghost'}
              onClick={() => {
                selectedFileObjects.length > 1
                  ? setFiles(selectedFileObjects)
                  : setFile(selectedFileObjects[0]);
                useShareDialogStore.setState({ onSuccess: clearSelection });
                setOpen(true);
              }}
            >
              <Share size={14} /> Share
            </Button>
            <Button
              className={styles.actionButton}
              onClick={() =>
                setModalState({
                  open: true,
                  file: selectedFileObjects,
                  action: 'move',
                })
              }
            >
              <Folder size={14} /> Move
            </Button>
            <Button
              className={styles.actionButton}
              onClick={() => {
                handleBookmarMultiple({
                  selectedFileObjects,
                  router,
                  clearSelection,
                });
              }}
            >
              <Tag size={14} /> Bookmark
            </Button>
            <Separator orientation='vertical' />
            <Button className={styles.actionButton}>
              <Sparkle size={14} /> Ask AI
            </Button>

            <Separator orientation='vertical' />
            <Button
              className={`${styles.actionButton} ${styles['actionButton-destructive']}`}
              onClick={() => {
                setOpenDeleteDialog(true);
              }}
            >
              <Trash2 size={14} /> Delete
            </Button>
          </>
        )}
        classes={{
          table: styles.table,
        }}
      />
    </>
  );
};

export default FileTable;
