import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import { iconsWithPaths } from "@/constants/common-constants";
import styles from "@/styles/components/FileCard.module.scss";
import { UploadedFile } from "@/types/files";
import FileType from "@/components/ui/FileType";
import { formatFileDate, getAvatarColor } from "@/lib/utils";
import { TelegramUser } from "@/types/auth";
import { FileKind } from "@/types/dashboard";

export default function FileCard({
  file,
  user,
  big = false,
}: {
  file: UploadedFile;
  user?:
    | (TelegramUser & {
        userId: string;
      })
    | null;
  big?: boolean;
}) {
  const createdAt = formatFileDate(file.createdAt);
  const ownerInitials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "";

  const fileExtension = file.name.split(".")[1] as FileKind;

  return (
    <div
      className={`${styles.card} ${big ? styles.cardBig : ""}`.trim()}
      data-slot="file-card"
    >
      <div className={styles.header}>
        <FileType kind={fileExtension} />
        <div className={styles.headerActions}>
          {file.starred && (
            <Icon
              d={iconsWithPaths.star}
              size={13}
              className={styles.starIcon}
            />
          )}
          <Icon d={iconsWithPaths.more} size={14} className={styles.moreIcon} />
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
              tone={getAvatarColor(user?.userId ?? "")}
              size="sm"
            />
            <span className={styles.modTime}>{createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
