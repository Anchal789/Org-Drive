"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type FunctionComponent,
} from "react";
import { useFileLayout } from "@/store/store";
import type { SessionUser } from "@/types/auth";
import type { UploadedFile, UploadedFolder } from "@/types/files";
import DashGrid from "./GridSection/DashGrid";
import DashList from "./ListSection/DashList";

const SwitchLayout: FunctionComponent<{
  user: SessionUser;
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
}> = ({ user, files, folders }) => {
  const { fileLayout, setFileLayout } = useFileLayout();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const layout = localStorage.getItem("fileLayout");

    if (layout) {
      setFileLayout(layout as "list" | "grid");
    }

    setHydrated(true);
  }, []);

  return hydrated ? (
    fileLayout === "list" ? (
      <DashList user={user} files={files} folders={folders} />
    ) : (
      <DashGrid user={user} files={files} folders={folders} />
    )
  ) : null;
};

export default SwitchLayout;
