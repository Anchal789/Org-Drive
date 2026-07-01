import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths } from "@/constants/common-constants";
import { formatFileDate, getAvatarColor } from "@/lib/utils";
import type { FileKind } from "@/types/dashboard";
import type { UploadedFile } from "@/types/files";
import styles from "./FileCard.module.scss";
import FileMenu from "./FileMenu";
import { Checkbox } from "@/components/ui/checkbox";

export default function FileCard({
  file,
  isSelected = false,
  big = false,
}: {
  file: UploadedFile;
  isSelected?: boolean;
  big?: boolean;
}) {
  const createdAt = formatFileDate(file.createdAt);
  const ownerInitials = file
    ? `${file.ownerFirstName?.charAt(0) ?? ""}${file.ownerLastName?.charAt(0) ?? ""}`
    : "";

  const fileExtension = file.name.split(".")[1] as FileKind;

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""} ${big ? styles.cardBig : ""}`.trim()}
    >
      <div className={styles.header}>
        {isSelected ? (
          <Checkbox checked={isSelected} size="21.39px" />
        ) : (
          <FileType kind={fileExtension} />
        )}
        <div className={styles.headerActions}>
          {file.bookmark && (
            <Icon
              d={iconsWithPaths.bookmark}
              size={13}
              className={styles.starIcon}
            />
          )}
          <FileMenu file={file} />
        </div>
      </div>

      <div className={styles.preview}>
        <Icon
          d={iconsWithPaths.file}
          size={big ? 30 : 24}
          className={styles.fileIcon}
        />
      </div>

      <div>
        <div className={styles.name}>{file.name}</div>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(file?.userId ?? "")}
              size="sm"
            />
            <span className={styles.modTime}>{createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
