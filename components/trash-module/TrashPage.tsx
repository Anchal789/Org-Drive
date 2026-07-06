import { ChevronDown, Folder, Shield, Trash2 } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { formatFileDate, getFileExtension } from '@/lib/utils';
import { formatBytes } from '@/store/store';
import type { ColumnDef } from '@/types/component-types';
import type { TrashInterface } from '@/types/trash';
import DataTable from '../ui/datatable';
import FileType from '../ui/fileType';
import EmptyTrashButton from './EmptyTrashButton';
import styles from './TrashPage.module.scss';
import TrashTableActionColumn from './TrashTableActionColumn';

const TrashPage: FunctionComponent<{
  trashedItems: Array<TrashInterface>;
}> = async ({ trashedItems }) => {
  const columns: ColumnDef<TrashInterface>[] = [
    {
      id: 'name',
      header: (
        <span className={styles.sortable}>
          Name <ChevronDown size={10} />
        </span>
      ),
      className: styles.fileCell,
      cell: (item) => (
        <>
          {item.folderId && item.fileId === null ? (
            <>
              <Folder
                size={14}
                fill='currentColor'
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
      id: 'size',
      width: '120px',
      header: 'Size',
      className: styles.metaCell,
      cell: (file) => <span>{formatBytes(file?.size)}</span>,
    },
    {
      id: 'deleted',
      width: '130px',
      header: 'Deleted',
      className: styles.metaCell,
      cell: (file) => <span>{formatFileDate(file.createdAt)}</span>,
    },
    {
      id: 'autodelete',
      width: '110px',
      header: 'Auto-delete',
      className: styles.metaCell,
      cell: (file) => {
        const autoDeleteAt =
          new Date(file.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000;

        const daysLeft = Math.ceil(
          (autoDeleteAt - Date.now()) / (1000 * 60 * 60 * 24),
        );

        return (
          <span className={daysLeft < 10 ? styles.autoDeleteIn10Days : ''}>
            {daysLeft > 0 ? `in ${daysLeft} days` : 'Expired'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      width: '64px',
      header: '',
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
              <Trash2 size={20} />
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
            <Shield size={14} className={styles.flatHintIcon} />
            <span className={styles.flatHintText}>
              Files in Trash still count toward your channel storage until
              they&apos;re permanently deleted.
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
