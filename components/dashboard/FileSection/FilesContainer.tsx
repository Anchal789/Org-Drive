"use client";

import { UploadedFile } from "@/types/files";
import FileCard from "./FileCard";
import { useEffect, useMemo } from "react";
import styles from "./FileCard.module.scss";
import { useSelectedFilesStore } from "@/store/store";

const FilesContainer = ({ files }: { files: Array<UploadedFile> }) => {
  const { selectedFiles, setSelectedFiles, setFileCount } =
    useSelectedFilesStore();
  const selectedIds = useMemo(() => {
    return selectedFiles.map((f) => f.id);
  }, [selectedFiles]);

  const handleToggleSelect = (file: UploadedFile) => {
    const isSelected = selectedIds.includes(file.id);
    const updatedSelectedFiles = isSelected
      ? selectedFiles.filter((f) => f.id !== file.id)
      : [...selectedFiles, file];

    setSelectedFiles(updatedSelectedFiles);
  };

  useEffect(() => {
    setFileCount(files.length);
  }, [files, setFileCount]);

  return (
    <>
      {files.map((file) => (
        <div
          key={file.id}
          data-slot="file-card"
          role="button"
          className={styles.cardWrapper}
          onClick={() => handleToggleSelect(file)}
        >
          <FileCard file={file} isSelected={selectedIds.includes(file.id)} />
        </div>
      ))}
    </>
  );
};

export default FilesContainer;
