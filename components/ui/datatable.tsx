import { Checkbox } from "@/components/ui/checkbox";
import { DataTableProps } from "@/types/component-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styles from "./Component.module.scss";

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  classes,
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
}: DataTableProps<T>) {
  // Handle Row Selection
  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(data.map(getRowId));
    } else {
      onSelectionChange([]);
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className={`${styles.table} ${classes?.table || ""}`}>
      <Table>
        <TableHeader className={classes?.header}>
          <TableRow className={classes?.header} notApplyBackground={true}>
            {enableSelection && (
              <TableHead style={{ width: "40px" }} className="px-4">
                <Checkbox
                  checked={isAllSelected}
                  onClick={(checked) => handleSelectAll(!!checked)}
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
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow key={rowId} className={classes?.row}>
                  {enableSelection && (
                    <TableCell className="px-4">
                      <Checkbox
                        checked={isSelected}
                        onClick={(checked) => handleSelectRow(rowId, !!checked)}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell
                      key={`${rowId}-${col.id}`}
                      className={col.className}
                    >
                      {col.cell(row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
