export const dynamic = "force-dynamic";

import type { UploadedFile, UploadedFolder } from "@/types/files";
import DriveCrumb from "../DriveCrumb/DriveCrumb";
import FileCard from "../FileSection/FileCard";
import FolderContainer from "../FolderSection/FolderContainer";
import styles from "./DashGrid.module.scss";
import Image from "next/image";
import NoDataImage from "@/public/assets/No-Data.svg";
import FilesContainer from "../FileSection/FilesContainer";
import FileSelectionBar from "../FileSection/FileSelectionBar";

export default function DashGrid({
  files,
  folders,
}: {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
}) {
  return (
    <>
      <DriveCrumb inFolder="" />
      {files.length === 0 && folders.length === 0 && (
        <div className={styles.emptyHint}>
          <Image
            src={NoDataImage}
            width={350}
            height={350}
            alt="No data"
            loading="eager"
            className={styles.emptyHintImage}
          />
          Drag your files and folders here or use the &apos;New&apos; button to
          upload
        </div>
      )}
      <div className={styles.content}>
        <FileSelectionBar files={files} />
        {files.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Suggested</div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {files.slice(0, 4).map((file) => (
                <FileCard key={file.id} file={file} big />
              ))}
            </div>
          </>
        )}

        {folders.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionLabel}>Folders</div>
              <span className={styles.sectionMeta}>
                Top-level only · no nesting
              </span>
            </div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {folders.map((folder) => (
                <FolderContainer
                  key={folder.id}
                  folder={folder}
                  layout="grid"
                />
              ))}
            </div>
          </>
        )}

        {files.length > 0 && (
          <>
            <div className={`${styles.sectionLabel} ${styles.spaced}`}>
              Files
            </div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              <FilesContainer files={files} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
