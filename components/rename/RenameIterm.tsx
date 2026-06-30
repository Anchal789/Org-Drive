import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { renameItem } from "@/services/folder-service";
import { UploadedFile, UploadedFolder } from "@/types/files";
import { getFileExtension, getFileNameWithoutExtension } from "@/lib/utils";
import styles from "./Rename.module.scss";

const RenameItem: FunctionComponent<{
  file?: UploadedFile & { shareId?: number };
  folder?: UploadedFolder;
  setRenameOpen: Dispatch<SetStateAction<boolean>>;
  renameOpen: boolean;
}> = ({ file, folder, setRenameOpen, renameOpen }) => {
  const router = useRouter();
  const [newNameState, setNewNameState] = useState<{
    name: string;
    error: string | null;
  }>({
    name: "",
    error: null,
  });

  useEffect(() => {
    if (renameOpen) {
      setNewNameState({
        name: file?.name
          ? getFileNameWithoutExtension(file?.name)
          : folder?.name || "",
        error: null,
      });
    } else {
      setNewNameState({
        name: "",
        error: null,
      });
    }
  }, [renameOpen, file?.name, folder?.name]);

  const handleRename = async () => {
    if (!newNameState.name) {
      setNewNameState({
        name: "",
        error: "Name cannot be empty",
      });
      return;
    }

    const finalName = `${newNameState.name}${file ? "." + fileExtension : ""}`;

    let response;
    response = await renameItem(
      folder?.id || file?.id || 0,
      finalName,
      !!file?.id,
      file?.shareId,
    );

    if (response.success) {
      setRenameOpen(false);
      toast.success(response.message);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  const fileExtension = getFileExtension(file?.name || "");

  return (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen} modal>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription className={styles.originalName}>
            Original name: {file?.name || folder?.name}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="name">New name</Label>
            <InputGroup className="max-w-xs">
              <InputGroupInput
                id="name"
                name="name"
                value={newNameState.name}
                onChange={(event) => {
                  if (event.target.value) {
                    setNewNameState({
                      name: event.target.value,
                      error: null,
                    });
                  } else {
                    setNewNameState({
                      name: "",
                      error: "Name cannot be empty",
                    });
                  }
                }}
              />
              {fileExtension && (
                <InputGroupAddon align="inline-end">
                  .{fileExtension}
                </InputGroupAddon>
              )}
            </InputGroup>
            <FieldError>{newNameState.error}</FieldError>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive">Cancel</Button>
          </DialogClose>
          <Button variant="primary" onClick={handleRename}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameItem;
