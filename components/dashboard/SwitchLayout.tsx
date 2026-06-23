"use client";

import { useEffect, useState, type FunctionComponent } from "react";
import { useFileLayout } from "@/store/store";
import type { UploadedFile, UploadedFolder } from "@/types/files";
import DashGrid from "./GridSection/DashGrid";
import DashList from "./ListSection/DashList";

const SwitchLayout: FunctionComponent<{
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  insideFolder?: boolean;
}> = ({ files, folders }) => {
  const { fileLayout, setFileLayout } = useFileLayout();

  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const layout = localStorage.getItem("fileLayout");

    if (layout) {
      setFileLayout(layout as "list" | "grid");
    }

    setHydrated(true);
  }, []);

  return hydrated ? (
    fileLayout === "list" ? (
      <DashList files={files} folders={folders} />
    ) : (
      <DashGrid files={files} folders={folders} />
    )
  ) : null;
};

export default SwitchLayout;
