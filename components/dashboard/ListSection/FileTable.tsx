"use client";

import { useState } from "react";
import type { FunctionComponent } from "react";
import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { formatFileDate, getAvatarColor } from "@/lib/utils";
import { formatBytes } from "@/store/store";
import type { SessionUser } from "@/types/auth";
import type { FileKind } from "@/types/dashboard";
import type { UploadedFile } from "@/types/files";
import FileMenu from "../FileSection/FileMenu";
import styles from "./DashList.module.scss";
import { ColumnDef } from "@/types/component-types";
import DataTable from "@/components/ui/datatable";

const FileTable: FunctionComponent<{
  files: UploadedFile[];
  user: SessionUser;
}> = ({ files, user }) => {
  const [selectedFiles, setSelectedFiles] = useState<(string | number)[]>([]);

  const fileExtension = (file: UploadedFile) =>
    file.name.split(".")[1] as FileKind;
  const ownerInitials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "";

  const columns: ColumnDef<UploadedFile>[] = [
    {
      id: "name",
      header: (
        <span className={styles.sortable}>
          Name <Icon d={iconsWithPaths.chevDown} size={10} />
        </span>
      ),
      className: styles.fileCell,
      cell: (file) => (
        <>
          <FileType kind={fileExtension(file)} />
          <span className={styles.fileName}>{file.name}</span>
          {file.starred && (
            <Icon
              d={iconsWithPaths.star}
              size={12}
              style={{ color: TINTS.amber.bd, fill: TINTS.amber.bg }}
            />
          )}
        </>
      ),
    },
    {
      id: "type",
      header: "Type",
      className: styles.kindCell,
      cell: (file) => fileExtension(file),
    },
    {
      id: "owner",
      header: "Owner",
      className: styles.ownerCell,
      cell: () => (
        <>
          <UserAvatar
            initials={ownerInitials}
            tone={getAvatarColor(user?.userId ?? "")}
            size="sm"
          />
          <span className={styles.ownerName} />
        </>
      ),
    },
    {
      id: "modified",
      header: "Modified",
      className: styles.metaCell,
      cell: (file) => formatFileDate(file.createdAt),
    },
    {
      id: "size",
      header: "Size",
      className: styles.metaCell,
      cell: (file) => formatBytes(file.size),
    },
    {
      id: "actions",
      header: "",
      cell: (file) => <FileMenu file={file} />,
    },
  ];

  return (
    <DataTable
      data={files}
      columns={columns}
      getRowId={(file) => file.id}
      enableSelection={true}
      selectedIds={selectedFiles}
      onSelectionChange={setSelectedFiles}
      classes={{
        table: styles.table,
        header: styles.tableHeader,
        row: styles.tableRow,
        rowLast: styles.tableRowLast,
      }}
    />
  );
};

export default FileTable;
