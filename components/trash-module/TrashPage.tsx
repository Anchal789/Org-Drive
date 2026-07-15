import { ChevronDown, Folder, Shield, Trash2 } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { formatFileDate, getFileExtension } from '@/lib/utils';
import { formatBytes } from '@/store/store';
import type { ColumnDef } from '@/types/component-types';
import type { TrashInterface } from '@/types/trash';
import PageHeader from '../page-header/PageHeader';
import FlexibleTile from '../responsive-list/FlexibleTile';
import DataTable from '../ui/datatable';
import FileType from '../ui/fileType';
import AutoDeleteCountdown from './AutoDeleteCountdown';
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
      cell: (file) => (
        <AutoDeleteCountdown
          createdAt={file.createdAt}
          expiringSoonClassName={styles.autoDeleteIn10Days}
        />
      ),
    },
    {
      id: 'actions',
      width: '64px',
      header: '',
      className: styles.actions,
      cell: (item) => <TrashTableActionColumn trashed={item} />,
    },
  ];

  const flatHintContent = (
    <div className={styles.flatHint}>
      <Shield size={14} className={styles.flatHintIcon} />
      <span className={styles.flatHintText}>
        Files in Trash still count toward your channel storage until they're
        permanently deleted.
      </span>
    </div>
  );

  return (
    <>
      <PageHeader
        icon={<Trash2 size={20} />}
        tone='red'
        title='Trash'
        subHeading='Items are permanently removed from your Telegram channel after 30 days.'
        action={<EmptyTrashButton isDisabled={trashedItems.length === 0} />}
        hideOnMobile
      >
        {flatHintContent}
      </PageHeader>
      <div className={styles.flatHintContainerForMobile}>{flatHintContent}</div>
      <div className={styles.dataTableMobile}>
        <span className={styles.deleteHint}>
          <h6 className={styles.deleteHintText}>
            Item will be permanently deleted after 30 days.
          </h6>
          <EmptyTrashButton isDisabled={trashedItems.length === 0} />
        </span>
        {trashedItems.map((item) => (
          <FlexibleTile
            key={item.id}
            extension={
              item.folderId && item.fileId === null ? (
                <Folder
                  size={14}
                  fill='currentColor'
                  className={styles.folderIcon}
                />
              ) : (
                <FileType kind={getFileExtension(item.fileName)} />
              )
            }
            name={
              item.folderId && item.fileId === null ? (
                <span className={styles.fileName}>{item.folderName}</span>
              ) : (
                <span className={styles.fileName}>{item.fileName}</span>
              )
            }
            description={
              <AutoDeleteCountdown
                createdAt={item.createdAt}
                expiringSoonClassName={styles.autoDeleteIn10Days}
                normalClassName={styles.autoDeleteIn30Days}
                labelPrefix='Auto-delete '
              />
            }
            size={formatBytes(item?.size) || ''}
            folder={item.folderName}
            date={formatFileDate(item.createdAt)}
            actions={<TrashTableActionColumn trashed={item} />}
          />
        ))}
      </div>
      <div className={styles.dataTableDesktop}>
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
