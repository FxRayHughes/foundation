import { useRef, useMemo } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import type { DataGridProProps } from './types';
import {
  useColumnPinning,
  useColumnReordering,
  useRowReordering,
  useTreeData,
  useMasterDetail,
  useRowPinning,
  useLazyLoading,
  useHeaderFilters,
  useClipboardPaste,
} from './features';

export function useDataGridPro(props: DataGridProProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    columns = [],
    rows,
    pinnedColumns,
    pinnedRows,
    treeData,
    masterDetail,
    lazyLoading,
    headerFilters,
    clipboardPaste,
    columnReordering,
    rowReordering,
    onColumnOrderChange,
    onRowOrderChange,
    ...restProps
  } = props;

  const { reorderedColumns, dragHandlers } = useColumnReordering({
    columns: columns as GridColDef[],
    enabled: columnReordering,
    onColumnOrderChange,
  });

  const { flattenedRows, groupColumn, isTreeActive } = useTreeData({
    rows,
    config: treeData,
  });

  const { processedRows, expandColumn } = useMasterDetail({
    rows: isTreeActive ? flattenedRows : rows,
    config: masterDetail,
    getRowId: restProps.getRowId as ((row: Record<string, unknown>) => string | number) | undefined,
  });

  const { reorderedRows, reorderColumn, dragRowHandlers } = useRowReordering({
    rows: processedRows,
    enabled: rowReordering,
    onRowOrderChange,
  });

  const { topRows, mainRows, bottomRows, hasPinnedRows } = useRowPinning({
    rows: reorderedRows,
    pinnedRows,
  });

  const { getStickyStyles } = useColumnPinning({
    columns: reorderedColumns,
    pinnedColumns,
  });

  const { filterModel, headerFilterRow, isActive: headerFiltersActive } = useHeaderFilters({
    columns: reorderedColumns,
    config: headerFilters,
  });

  const { sentinelRef, isLoading } = useLazyLoading({
    config: lazyLoading,
    containerRef,
  });

  useClipboardPaste({ config: clipboardPaste, containerRef });

  const finalColumns: GridColDef[] = useMemo(() => {
    const cols: GridColDef[] = [];
    if (reorderColumn) cols.push(reorderColumn);
    if (expandColumn) cols.push(expandColumn);
    if (groupColumn) cols.push(groupColumn);

    const source = headerFiltersActive && headerFilterRow ? headerFilterRow : reorderedColumns;
    for (const col of source) {
      const stickyStyles = getStickyStyles(col.field);
      if (Object.keys(stickyStyles).length > 0) {
        cols.push({ ...col, cellClassName: `pinned-${col.field}` });
      } else {
        cols.push(col);
      }
    }
    return cols;
  }, [reorderColumn, expandColumn, groupColumn, headerFilterRow, headerFiltersActive, reorderedColumns, getStickyStyles]);

  return {
    containerRef,
    finalColumns,
    topRows,
    mainRows,
    bottomRows,
    hasPinnedRows,
    filterModel: headerFiltersActive ? filterModel : restProps.filterModel,
    sentinelRef,
    isLoading,
    dragHandlers,
    dragRowHandlers,
    restProps,
  };
}
