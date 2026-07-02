"use client";

import { useEffect, useMemo, useState, type FunctionComponent } from "react";
import { useFileLayout, useSortByStore } from "@/store/store";
import type { UploadedFile, UploadedFolder } from "@/types/files";
import DashGrid from "./GridSection/DashGrid";
import DashList from "./ListSection/DashList";

const SwitchLayout: FunctionComponent<{
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  insideFolder?: boolean;
}> = ({ files, folders }) => {
  const { fileLayout, setFileLayout } = useFileLayout();
  const { sortBy } = useSortByStore();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const layout = localStorage.getItem("fileLayout");

    if (layout) {
      setFileLayout(layout as "list" | "grid");
    }

    setHydrated(true);
  }, [setFileLayout]);

  const sortedData = useMemo(() => {
    const getModTime = (item: UploadedFile | UploadedFolder) => {
      const date = item.updatedAt || item.createdAt;
      return date ? new Date(date).getTime() : 0;
    };

    const sortedFiles = [...files];
    const sortedFolders = [...folders];

    switch (sortBy) {
      case "name":
        sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
        sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "modified":
        sortedFiles.sort((a, b) => getModTime(b) - getModTime(a));
        sortedFolders.sort((a, b) => getModTime(b) - getModTime(a));
        break;

      case "size":
        sortedFiles.sort((a, b) => (b.size || 0) - (a.size || 0));
        sortedFolders.sort((a, b) => {
          const sizeA = a.fileCount || 0;
          const sizeB = b.fileCount || 0;
          return sizeA === sizeB ? a.name.localeCompare(b.name) : sizeB - sizeA;
        });
        break;

      case "type":
        sortedFiles.sort((a, b) => {
          const typeA = a.mimeType || "";
          const typeB = b.mimeType || "";
          return typeA.localeCompare(typeB);
        });
        sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        break;
    }

    return { files: sortedFiles, folders: sortedFolders };
  }, [files, folders, sortBy]);

  if (!hydrated) return null;

  return fileLayout === "list" ? (
    <DashList files={sortedData.files} folders={sortedData.folders} />
  ) : (
    <DashGrid files={sortedData.files} folders={sortedData.folders} />
  );
};

export default SwitchLayout;
