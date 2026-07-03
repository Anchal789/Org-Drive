"use client";

import { UploadedFile } from "@/types/files";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import styles from "./DashFolder.module.scss";
import FileTable from "../ListSection/FileTable";
import { useFileLayout, useSortByStore } from "@/store/store";
import FilesContainer from "../FileSection/FilesContainer";

const LayoutForInsideFolder: FunctionComponent<{
  files: Array<UploadedFile>;
}> = ({ files }) => {
  const { fileLayout, setFileLayout } = useFileLayout();
  const { sortBy } = useSortByStore();

  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const layout = localStorage.getItem("fileLayout");

    if (layout) {
      setFileLayout(layout as "list" | "grid");
    }

    setHydrated(true);
  }, [setFileLayout]);

  const sortedData = useMemo(() => {
    const getModTime = (item: UploadedFile) => {
      const date = item.updatedAt || item.createdAt;
      return date ? new Date(date).getTime() : 0;
    };

    const sortedFiles = [...files];

    switch (sortBy) {
      case "name":
        sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "modified":
        sortedFiles.sort((a, b) => getModTime(b) - getModTime(a));
        break;

      case "size":
        sortedFiles.sort((a, b) => (b.size || 0) - (a.size || 0));

        break;

      case "type":
        sortedFiles.sort((a, b) => {
          const typeA = a.mimeType || "";
          const typeB = b.mimeType || "";
          return typeA.localeCompare(typeB);
        });
        break;

      default:
        break;
    }

    return { files: sortedFiles };
  }, [files, sortBy]);

  return (
    <>
      {hydrated ? (
        fileLayout === "grid" ? (
          <div className={styles.filesGrid}>
            <FilesContainer files={sortedData.files} />
          </div>
        ) : (
          <FileTable files={sortedData.files} />
        )
      ) : null}
    </>
  );
};

export default LayoutForInsideFolder;
