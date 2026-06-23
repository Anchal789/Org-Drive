"use client";

import { SharedWithMeItemsType } from "@/types/share-with-me";
import { FunctionComponent, useState } from "react";
import styles from "./ShareWithMePage.module.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Icon from "../ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { renameSharedItem } from "@/services/shared-with-me-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ShareWithMeActionColumn: FunctionComponent<{
  props: SharedWithMeItemsType;
}> = ({ props }) => {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [newNameState, setNewNameState] = useState<{
    name: string;
    error: string | null;
  }>({
    name: "",
    error: null,
  });

  const handleRename = async () => {
    const response = await renameSharedItem(props.id, newNameState.name);
    if (response.success) {
      setRenameOpen(false);
      toast.success(response.message);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <>
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
              <Input
                id="name"
                name="name"
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
                onBlur={(event) => {
                  if (!event.target.value) {
                    setNewNameState({
                      name: "",
                      error: "Name cannot be empty",
                    });
                  }
                }}
              />
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" className={styles.moreBtn}>
            <Icon
              d={iconsWithPaths.more}
              size={14}
              className={styles.moreIcon}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Download
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.download} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
              Rename
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.share} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Delete
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.trash} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShareWithMeActionColumn;
