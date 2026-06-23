export const dynamic = "force-dynamic";

import { iconsWithPaths } from "@/constants/common-constants";
import Icon from "../ui/icon";
import styles from "./Bookmark.module.scss";
import { FunctionComponent } from "react";
import { UploadedFile, UploadedFolder } from "@/types/files";
import FileCard from "../dashboard/FileSection/FileCard";
import FolderContainer from "../dashboard/FolderSection/FolderContainer";

const BookmarkPage: FunctionComponent<{
  bookmarkedFolders: UploadedFolder[];
  bookmarkedFiles: UploadedFile[];
}> = ({ bookmarkedFiles, bookmarkedFolders }) => {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headings}>
          <div className={styles.iconBox}>
            <Icon d={iconsWithPaths.bookmark} size={20} />
          </div>
          <div>
            <div className={styles.title}>
              <span>Bookmark</span>
            </div>
            <div className={styles.subHeading}>
              Quick access to the files and folders you've bookmarked.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={`${styles.sectionLabel} ${styles.spacedBottom}`}>
          Folders
        </div>
        <div className={`${styles.grid} ${styles.grid4}`}>
          {bookmarkedFolders.map((folder) => (
            <FolderContainer key={folder.id} folder={folder} layout="grid" />
          ))}
        </div>
        <div className={`${styles.sectionLabel} ${styles.spaced}`}>Files</div>
        <div className={`${styles.grid} ${styles.grid4}`}>
          {bookmarkedFiles.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      </div>
    </>
  );
};

export default BookmarkPage;
