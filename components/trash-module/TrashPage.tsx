import { iconsWithPaths } from "@/constants/common-constants";
import Icon from "../ui/icon";
import styles from "./TrashPage.module.scss";
import { ColumnDef } from "@/types/component-types";
import { TrashInterface } from "@/types/trash";
import FileType from "../ui/fileType";
import { FileKind } from "@/types/dashboard";
import { formatBytes } from "@/store/store";
import { formatFileDate } from "@/lib/utils";
import { FunctionComponent } from "react";
import DataTable from "../ui/datatable";
import TrashTableActionColumn from "./TrashTableActionColumn";
import EmptyTrashButton from "./EmptyTrashButton";

const TrashPage: FunctionComponent<{
  trashedItems: Array<TrashInterface>;
}> = async ({ trashedItems }) => {
  const fileExtension = (file: TrashInterface) =>
    file.fileName.split(".")[1] as FileKind;

  const columns: ColumnDef<TrashInterface>[] = [
    {
      id: "name",
      header: (
        <span className={styles.sortable}>
          Name <Icon d={iconsWithPaths.chevDown} size={10} />
        </span>
      ),
      className: styles.fileCell,
      cell: (item) => (
        <>
          {item.folderId && item.fileId === null ? (
            <>
              <Icon
                d={iconsWithPaths.folder}
                size={14}
                fill="currentColor"
                className={styles.folderIcon}
              />
              <span className={styles.fileName}>{item.folderName}</span>
            </>
          ) : (
            <>
              <FileType kind={fileExtension(item)} />
              <span className={styles.fileName}>{item.fileName}</span>
            </>
          )}
        </>
      ),
    },
    {
      id: "size",
      width: "120px",
      header: "Size",
      className: styles.metaCell,
      cell: (file) => <span>{formatBytes(file?.size)}</span>,
    },
    {
      id: "deleted",
      width: "130px",
      header: "Deleted",
      className: styles.metaCell,
      cell: (file) => <span>{formatFileDate(file.createdAt)}</span>,
    },
    {
      id: "autodelete",
      width: "110px",
      header: "Auto-delete",
      className: styles.metaCell,
      cell: (file) => {
        const autoDeleteAt =
          new Date(file.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000;

        const daysLeft = Math.ceil(
          (autoDeleteAt - Date.now()) / (1000 * 60 * 60 * 24),
        );

        return (
          <span className={daysLeft < 10 ? styles.autoDeleteIn10Days : ""}>
            {daysLeft > 0 ? `in ${daysLeft} days` : "Expired"}
          </span>
        );
      },
    },
    {
      id: "actions",
      width: "64px",
      header: "",
      className: styles.actions,
      cell: (item) => <TrashTableActionColumn trashed={item} />,
    },
  ];

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headingsContainer}>
          <div className={styles.headings}>
            <div className={styles.iconBox}>
              <Icon d={iconsWithPaths.trash} size={20} />
            </div>
            <div>
              <div className={styles.title}>
                <span>Trash</span>
              </div>
              <div className={styles.subHeading}>
                Items are permanently removed from your Telegram channel after
                30 days.
              </div>
            </div>
          </div>
          <EmptyTrashButton isDisabled={trashedItems.length === 0} />
        </div>
        <div className={styles.content}>
          {/* Flat folder hint */}
          <div className={styles.flatHint}>
            <Icon
              d={iconsWithPaths.shield}
              size={14}
              className={styles.flatHintIcon}
            />
            <span className={styles.flatHintText}>
              Files in Trash still count toward your channel storage until
              they're permanently deleted.
            </span>
          </div>
        </div>
      </div>
      <div className={styles.dataTable}>
        <DataTable
          data={trashedItems}
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

export default TrashPage;
