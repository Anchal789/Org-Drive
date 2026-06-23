"use client";

import { useState } from "react";
import type { FunctionComponent } from "react";
import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { formatFileDate, getAvatarColor } from "@/lib/utils";
import { formatBytes } from "@/store/store";
import type { FileKind } from "@/types/dashboard";
import type { UploadedFile } from "@/types/files";
import FileMenu from "../FileSection/FileMenu";
import styles from "./FileTable.module.scss";
import { ColumnDef } from "@/types/component-types";
import DataTable from "@/components/ui/datatable";

const FileTable: FunctionComponent<{
  files: UploadedFile[];
}> = ({ files }) => {
  const [selectedFiles, setSelectedFiles] = useState<(string | number)[]>([]);

  const fileExtension = (file: UploadedFile) =>
    file.name.split(".")[1] as FileKind;

  const columns: ColumnDef<UploadedFile>[] = [
    {
      id: "name",
      width: "100%",
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
          {file.bookmark && (
            <Icon
              d={iconsWithPaths.bookmark}
              size={12}
              style={{ color: TINTS.amber.bd }}
            />
          )}
        </>
      ),
    },
    {
      id: "type",
      width: "100px",
      header: "Type",
      className: styles.kindCell,
      cell: (file) => fileExtension(file),
    },
    {
      id: "owner",
      width: "130px",
      header: "Owner",
      className: styles.ownerCell,
      cell: (file) => {
        const ownerInitials = `${file.ownerFirstName?.charAt(0) ?? ""}${file.ownerLastName?.charAt(0) ?? ""}`;
        return (
          <>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(file?.userId ?? "")}
              size="sm"
            />
            <span className={styles.ownerName} />
          </>
        );
      },
    },
    {
      id: "modified",
      width: "110px",
      header: "Modified",
      className: styles.metaCell,
      cell: (file) => formatFileDate(file.createdAt),
    },
    {
      id: "size",
      width: "110px",
      header: "Size",
      className: styles.metaCell,
      cell: (file) => formatBytes(file.size),
    },
    {
      id: "actions",
      width: "48px",
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
      }}
    />
  );
};

export default FileTable;
