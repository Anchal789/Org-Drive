"use client";

import { UploadedFile } from "@/types/files";
import { FunctionComponent, useEffect, useState } from "react";
import styles from "./DashFolder.module.scss";
import FileCard from "../FileSection/FileCard";
import FileTable from "../ListSection/FileTable";
import { useFileLayout } from "@/store/store";

const LayoutForInsideFolder: FunctionComponent<{
  files: Array<UploadedFile>;
}> = ({ files }) => {
  const { fileLayout, setFileLayout } = useFileLayout();

  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const layout = localStorage.getItem("fileLayout");

    if (layout) {
      setFileLayout(layout as "list" | "grid");
    }

    setHydrated(true);
  }, []);

  return (
    <>
      {hydrated ? (
        fileLayout === "grid" ? (
          <div className={styles.filesGrid}>
            {files?.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <FileTable files={files} />
        )
      ) : null}
    </>
  );
};

export default LayoutForInsideFolder;
