import { TINTS } from "@/constants/common-constants";
import styles from "./ShareWithMePage.module.scss";
import DataTable from "../ui/datatable";
import type { FunctionComponent } from "react";
import type { ColumnDef } from "@/types/component-types";
import FileType from "../ui/fileType";
import UserAvatar from "../ui/user-avatar";
import { formatFileDate, getAvatarColor, getFileExtension } from "@/lib/utils";
import type { SharedWithMeItemsType } from "@/types/share-with-me";
import ShareWithMeActionColumn from "./ShareWithMeActionColumn";
import { ChevronDown, Folder, Users } from "lucide-react";

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case "editor":
      return {
        bg: TINTS.green.bg,
        color: TINTS.green.tx,
      };
    case "viewer":
      return {
        bg: TINTS.slate.bg,
        color: TINTS.slate.tx,
      };
    case "commenter":
      return {
        bg: TINTS.amber.bg,
        color: TINTS.amber.tx,
      };
    default:
      return {
        bg: TINTS.slate.bg,
        color: TINTS.slate.tx,
      };
  }
};

const columns: ColumnDef<SharedWithMeItemsType>[] = [
  {
    id: "name",
    width: "100%",
    header: (
      <span className={styles.sortable}>
        Name <ChevronDown size={10} />
      </span>
    ),
    className: styles.fileCell,
    cell: (item) => (
      <>
        {item.fileId === null ? (
          <>
            <Folder
              size={14}
              fill="currentColor"
              className={styles.folderIcon}
            />
            <span className={styles.fileName}>{item.folderName}</span>
          </>
        ) : (
          <>
            <FileType kind={getFileExtension(item.fileName)} />
            <span className={styles.fileName}>{item.fileName}</span>
          </>
        )}
      </>
    ),
  },
  {
    id: "sharedBy",
    width: "200px",
    header: "Shared by",
    className: styles.metaCell,
    cell: (item) => {
      const ownerInitials = `${item.ownerFirstName?.charAt(0) ?? ""}${item.ownerLastName?.charAt(0) ?? ""}`;
      return (
        <div className={styles.owner}>
          <UserAvatar
            initials={ownerInitials}
            tone={getAvatarColor(item?.userId ?? "")}
            size="sm"
          />
          <span className={styles.ownerName}>
            {item.ownerFirstName} {item.ownerLastName}
          </span>
        </div>
      );
    },
  },
  {
    id: "dateShared",
    width: "130px",
    header: "Date shared",
    className: styles.metaCell,
    cell: (item) => <span>{formatFileDate(item.sharedDate)}</span>,
  },
  {
    id: "permission",
    width: "110px",
    header: "Your Access",
    className: styles.metaCell,
    cell: (file) => {
      const colorStyle = getPermissionColor(file.permission);
      return (
        <span
          className={styles.permission}
          style={{
            backgroundColor: colorStyle.bg,
            color: colorStyle.color,
          }}
        >
          {file.permission.charAt(0).toUpperCase() + file.permission.slice(1)}
        </span>
      );
    },
  },
  {
    id: "actions",
    width: "32px",
    header: "",
    className: styles.actions,
    cell: (item) => <ShareWithMeActionColumn props={item} />,
  },
];

const ShareWithMePage: FunctionComponent<{
  sharedItems: Array<SharedWithMeItemsType>;
}> = ({ sharedItems }) => {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headingsContainer}>
          <div className={styles.headings}>
            <div className={styles.iconBox}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.title}>
                <span>Shared with me</span>
              </div>
              <div className={styles.subHeading}>
                Files and folders other people have given you access to.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.dataTable}>
        <DataTable
          data={sharedItems}
          columns={columns}
          getRowId={(item) => item.id}
          enableSelection={false}
          classes={{
            table: styles.table,
            header: styles.tableHeader,
            row: styles.tableRow,
            rowLast: styles.tableRowLast,
          }}
        />
      </div>
    </>
  );
};

export default ShareWithMePage;
