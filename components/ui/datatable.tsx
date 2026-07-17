import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DataTableProps } from '@/types/component-types';
import { Button } from './button';
import styles from './Component.module.scss';

const EMPTY_SELECTED_IDS: Array<string | number> = [];

type ExtendedDataTableProps<T> = DataTableProps<T> & {
  renderSelectionActions?: (
    selectedIds: (string | number)[],
    clearSelection: () => void,
  ) => React.ReactNode;
};

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  classes,
  enableSelection = false,
  selectedIds = EMPTY_SELECTED_IDS,
  onSelectionChange,
  renderSelectionActions,
}: ExtendedDataTableProps<T>) {
  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(data.map(getRowId));
    } else {
      onSelectionChange([]);
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) onSelectionChange([]);
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const hasSelection = selectedIds.length > 0;
  const showSelectionBar = hasSelection && !!renderSelectionActions;
  const selectedIdSet = new Set(selectedIds);

  return (
    <div className={`${styles.table} ${classes?.table || ''}`}>
      <Table>
        <TableHeader className={classes?.header}>
          <TableRow notApplyBackground className={classes?.header}>
            {showSelectionBar ? (
              <TableHead
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                className={styles.selectionCell}
              >
                <div className={styles.selectionBar}>
                  {enableSelection && (
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        handleSelectAll(!!checked);
                      }}
                    />
                  )}

                  <span className={styles.selectedCount}>
                    {selectedIds.length} selected
                  </span>

                  <Button
                    type='button'
                    onClick={clearSelection}
                    aria-label='Clear selection'
                    className={styles.clearButton}
                  >
                    <X size={14} strokeWidth={1.6} />
                  </Button>

                  <div className={styles.actionsGap} />

                  <div className={styles.actionsGroup}>
                    {renderSelectionActions?.(selectedIds, clearSelection)}
                  </div>
                </div>
              </TableHead>
            ) : (
              <>
                {enableSelection && (
                  <TableHead className={styles.checkboxCell}>
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    style={{ width: col.width }}
                    className={col.headerClassName}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                noData
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedIdSet.has(rowId);

              return (
                <TableRow
                  key={rowId}
                  className={`${classes?.row || ''} ${
                    isSelected ? styles.selectedRow : ''
                  }`}
                >
                  {enableSelection && (
                    <TableCell className={styles.checkboxCell}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(rowId, !!checked)
                        }
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => {
                    const headerText =
                      typeof col.header === 'string' ? col.header : '';

                    return (
                      <TableCell
                        key={`${rowId}-${col.id}`}
                        className={col.className}
                        data-label={headerText}
                      >
                        {col.cell(row, rowIndex)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
