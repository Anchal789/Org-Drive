"use client";

import { Button } from "@/components/ui/button";
import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths } from "@/constants/common-constants";
import { fetchFolderFromFile } from "@/lib/share";
import { useShareDialogStore } from "@/store/store";
import styles from "@/styles/components/ShareDialog.module.scss";
import { FileKind } from "@/types/dashboard";
import { ShareWithMePerson } from "@/types/share-with-me";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PEOPLE: ShareWithMePerson[] = [
  {
    name: "Marcus Kim",
    initials: "MK",
    tone: "violet",
    role: "owner",
    email: "marcus.kim@zuru.com",
    me: true,
  },
  {
    name: "Alia Lopez",
    initials: "AL",
    tone: "blue",
    role: "editor",
    email: "alia.lopez@zuru.com",
  },
  {
    name: "Ravi Shah",
    initials: "RS",
    tone: "green",
    role: "viewer",
    email: "ravi.shah@zuru.com",
  },
];

export default function ShareDialog() {
  const { open, setOpen, file } = useShareDialogStore();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open && file?.folderId) {
      setIsLoading(true);
      fetchFolderFromFile(Number(file.userId), Number(file.folderId))
        .then((folder) => {
          setFolderName(folder?.name ?? null);
        })
        .catch((err) => console.error("Failed to fetch folder:", err))
        .finally(() => setIsLoading(false));
    } else {
      setFolderName(null);
    }
  }, [open, file]);

  if (!open) return null;

  const fileExtension = file?.name?.split(".")?.[1] as FileKind;

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        {/* Header */}
        <div className={styles.header}>
          <FileType kind={fileExtension} />
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              Share &quot;{file?.name}&quot;
            </div>
            <div className={styles.headerSubtitle}>
              {file?.folderId
                ? isLoading
                  ? "Loading folder..."
                  : `Inside Folder: ${folderName}`
                : "Standalone File"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setOpen(false)}
          >
            <Icon d={iconsWithPaths.x} size={16} />
          </Button>
        </div>

        {/* Add people input */}
        <div className={styles.invite}>
          <Icon
            d={iconsWithPaths.users}
            size={14}
            style={{ color: "var(--muted-foreground)" }}
          />
          <span className={styles.invitePlaceholder}>
            Add people using @telegram-handles
          </span>
          <Button size="sm" variant="primary">
            Invite
          </Button>
        </div>

        {/* People with access */}
        <div>
          <div className={styles.sectionLabel}>People with access</div>
          {PEOPLE.map((person) => (
            <div key={person.name} className={styles.personRow}>
              <UserAvatar
                initials={person.initials}
                tone={person.tone}
                size="default"
              />
              <div className={styles.personInfo}>
                <div className={styles.personName}>
                  {person.name}
                  {person.me && <span className={styles.youTag}>(you)</span>}
                </div>
                <div className={styles.personEmail}>{person.email}</div>
              </div>
              <Select defaultValue={person.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* General access */}
        <div className={styles.generalAccess}>
          <div className={styles.sectionLabel}>General access</div>
          <div className={styles.generalRow}>
            <div className={styles.generalIcon}>
              <Icon d={iconsWithPaths.users} size={16} />
            </div>
            <div className={styles.generalInfo}>
              <div className={styles.generalTitle}>
                Zuru Tech members
                <Icon
                  d={iconsWithPaths.chevDown}
                  size={12}
                  style={{ color: "var(--muted-foreground)" }}
                />
              </div>
              <div className={styles.generalSubtitle}>
                Anyone in the org can view via the link.
              </div>
            </div>
            <div className={styles.roleSelector}>
              Viewer
              <Icon d={iconsWithPaths.chevDown} size={11} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="outline" size="sm">
            <Icon d={iconsWithPaths.link} size={14} />
            Copy link
          </Button>
          <div className={styles.footerSpacer} />
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
