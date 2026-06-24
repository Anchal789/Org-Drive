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
import Rename from "./ShareWithMeActionModals/Rename";

const ShareWithMeActionColumn: FunctionComponent<{
  props: SharedWithMeItemsType;
}> = ({ props }) => {
  const [renameOpen, setRenameOpen] = useState<boolean>(false);

  return (
    <>
      <Rename
        props={props}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
      />
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
