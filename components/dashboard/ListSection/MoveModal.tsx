'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type FunctionComponent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchData } from '@/lib/api-fn';
import { moveFile } from '@/services/file-service';
import type { UploadedFile } from '@/types/files';
import styles from './MoveModal.module.scss';

const MoveModal: FunctionComponent<{
  files: Array<UploadedFile>;
  closeModal: () => void;
}> = ({ files, closeModal }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [allFolders, setAllFolders] = useState<
    Array<{ id: string | null; name: string }>
  >([]);

  const router = useRouter();

  const pathName = usePathname();

  const [currentFolderId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get('folderId');
  });

  const handleMove = async () => {
    const folderIdStr = String(selectedFolder);
    const filesId = files.map((file) => file.id);
    const response = await moveFile(filesId, folderIdStr, pathName);

    if (response.success) {
      closeModal();
      router.refresh();
    }
  };

  useEffect(() => {
    let isMounted = true;
    const getAllFoldersWithIdName = async () => {
      const response = await fetchData<
        Array<{ id: string | null; name: string }>
      >({
        url: '/api/all/get/folders-with-id-name',
      });

      if (response.success && isMounted) {
        const updatedFolders: Array<{ id: string | null; name: string }> =
          currentFolderId ? [{ id: 'my-drive', name: 'My Drive' }] : [];

        const combinedFolders = [...updatedFolders, ...response.data];
        setAllFolders(combinedFolders);

        const initialSelected = currentFolderId
          ? 'my-drive'
          : response.data.length > 0
            ? String(response.data[0].id)
            : null;

        if (initialSelected) {
          setSelectedFolder(initialSelected);
        }
      }
    };

    getAllFoldersWithIdName();

    return () => {
      isMounted = false;
    };
  }, [currentFolderId]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Move file/files </DialogTitle>
        <DialogDescription>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant='outline'>Files to move {files.length}</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className={styles.fileToMoveList}>
                {files.map((file) => (
                  <span key={file.id}>{file.name}</span>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </DialogDescription>
      </DialogHeader>

      <div className={styles.container}>
        <RadioGroup
          className={styles.radioGroup}
          value={selectedFolder}
          onValueChange={setSelectedFolder}
        >
          {allFolders.map((folder) => (
            <FieldLabel key={folder.id} htmlFor={folder.name}>
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle>{folder.name}</FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value={String(folder.id) || ''}
                  id={folder.name}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant='destructive'>Cancel</Button>
        </DialogClose>
        <Button variant='primary' onClick={handleMove}>
          Move
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default MoveModal;
