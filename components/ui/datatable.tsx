import { Checkbox } from "@/components/ui/checkbox";
import { DataTableProps } from "@/types/component-types";

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
    <div className={classes?.table}>
      {/* HEADER ROW */}
      <div className={classes?.header}>
        {enableSelection && (
          <span>
            <Checkbox
              checked={isAllSelected}
              onClick={(checked) => handleSelectAll(!!checked)}
            />
          </span>
        )}

        {columns.map((col) => (
          <span key={col.id} className={col.className}>
            {col.header}
          </span>
        ))}
      </div>

      {/* DATA ROWS */}
      {data.map((row, rowIndex) => {
        const rowId = getRowId(row);
        const isSelected = selectedIds.includes(rowId);
        const isLastRow = rowIndex === data.length - 1;

        return (
          <div
            key={rowId}
            className={`${classes?.row} ${isLastRow ? classes?.rowLast : ""}`}
          >
            {enableSelection && (
              <Checkbox
                checked={isSelected}
                onClick={(checked) => handleSelectRow(rowId, !!checked)}
              />
            )}

            {columns.map((col) => (
              <span key={`${rowId}-${col.id}`} className={col.className}>
                {col.cell(row, rowIndex)}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
