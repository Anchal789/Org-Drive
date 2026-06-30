"use client";

import { UploadedFile } from "@/types/files";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import styles from "./DashFolder.module.scss";
import FileCard from "../FileSection/FileCard";
import FileTable from "../ListSection/FileTable";
import { useFileLayout, useSortByStore } from "@/store/store";

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
    const getModTime = (item: any) => {
      const date =
        item.updatedAt || item.modifiedAt || item.modTime || item.createdAt;
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
          const typeA = a.mimeType || (a as any).extension || "";
          const typeB = b.mimeType || (b as any).extension || "";
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
            {sortedData.files?.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <FileTable files={sortedData.files} />
        )
      ) : null}
    </>
  );
};

export default LayoutForInsideFolder;
