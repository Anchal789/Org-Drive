import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Field, FieldError, FieldGroup } from "../../ui/field";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import { renameSharedItem } from "@/services/shared-with-me-service";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { SharedWithMeItemsType } from "@/types/share-with-me";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FileKind } from "@/types/dashboard";

const Rename: FunctionComponent<{
  props: SharedWithMeItemsType;
  setRenameOpen: Dispatch<SetStateAction<boolean>>;
  renameOpen: boolean;
}> = ({ props, setRenameOpen, renameOpen }) => {
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
        name: props.fileName || props.folderName || "",
        error: null,
      });
    } else {
      setNewNameState({
        name: "",
        error: null,
      });
    }
  }, [renameOpen, props.fileName, props.folderName]);

  const handleRename = async () => {
    if (!newNameState.name) {
      setNewNameState({
        name: "",
        error: "Name cannot be empty",
      });
      return;
    }
    const response = await renameSharedItem(props.id, newNameState.name);
    if (response.success) {
      setRenameOpen(false);
      toast.success(response.message);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  const fileExtension = props?.fileName?.split(".")[1] as FileKind;

  return (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen} modal>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>
            Original name: {props.fileName || props.folderName}
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
              <InputGroupAddon align="inline-end">
                .{fileExtension}
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{newNameState.error}</FieldError>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive">Cancel</Button>
          </DialogClose>
          <Button variant={"primary"} onClick={handleRename}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Rename;
