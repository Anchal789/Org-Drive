import { useRouter } from 'next/navigation';
import {
  type Dispatch,
  type FunctionComponent,
  type SetStateAction,
  useState,
} from 'react';
import { toast } from 'sonner';
import { AsyncButton } from '@/components/ui/async-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { getFileExtension, getFileNameWithoutExtension } from '@/lib/utils';
import { renameItem } from '@/services/folder-service';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import styles from './Rename.module.scss';

const RenameItem: FunctionComponent<{
  file?: UploadedFile & { shareId?: number };
  folder?: UploadedFolder;
  setRenameOpen: Dispatch<SetStateAction<boolean>>;
  renameOpen: boolean;
  pathName?: string;
}> = ({ file, folder, setRenameOpen, renameOpen, pathName }) => {
  const router = useRouter();
  const [newNameState, setNewNameState] = useState<{
    name: string;
    error: string | null;
  }>({
    name: '',
    error: null,
  });
  const [prevRenameOpen, setPrevRenameOpen] = useState(renameOpen);
  if (prevRenameOpen !== renameOpen) {
    setPrevRenameOpen(renameOpen);
    setNewNameState(
      renameOpen
        ? {
            name: file?.name
              ? getFileNameWithoutExtension(file?.name)
              : folder?.name || '',
            error: null,
          }
        : {
            name: '',
            error: null,
          },
    );
  }

  const handleRename = async () => {
    const trimmedName = newNameState.name.trim();

    if (trimmedName.length > 200) {
      setNewNameState({
        name: newNameState.name,
        error: 'File name must be 200 characters or fewer',
      });
      return;
    }
    if (!trimmedName) {
      setNewNameState({
        name: newNameState.name,
        error: 'Name cannot be empty',
      });
      return;
    }

    const finalName = `${trimmedName}${file ? `.${fileExtension}` : ''}`;

    const response = await renameItem(
      folder?.id || file?.id || 0,
      finalName,
      !!file?.id,
      file?.shareId,
      pathName,
    );

    if (response.success) {
      setRenameOpen(false);
      toast.success(response.message);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  const fileExtension = getFileExtension(file?.name || '');

  return (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen} modal>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription className={styles.originalName}>
            Original name: {file?.name || folder?.name}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor='name'>New name</Label>
            <InputGroup className='max-w-xs'>
              <InputGroupInput
                id='name'
                name='name'
                value={newNameState.name}
                aria-invalid={!!newNameState.error}
                aria-describedby={
                  newNameState.error ? 'rename-error' : undefined
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setNewNameState({
                    name: value,
                    error: value.trim() ? null : 'Name cannot be empty',
                  });
                }}
              />
              {fileExtension && (
                <InputGroupAddon align='inline-end'>
                  .{fileExtension}
                </InputGroupAddon>
              )}
            </InputGroup>
            <FieldError id='rename-error'>{newNameState.error}</FieldError>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='destructive'>Cancel</Button>
          </DialogClose>
          <AsyncButton variant='primary' onClick={handleRename}>
            Save changes
          </AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameItem;
