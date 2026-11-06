import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DataGridPremiumProps, DataGridRecord } from './premium-types';
import type { ClipboardPasteContext, DataGridColumn, DataGridRow, DataGridRowId } from './types';
import { defaultGetRowId, fieldOf, getCellValue } from './utils';
import {
  useAggregation,
  useCellSelection,
  useClipboardPaste,
  useColumnPinning,
  useColumnReordering,
  useColumnResizing,
  useColumnVisibility,
  useExcelExport,
  useHeaderFilters,
  useLazyLoading,
  useMasterDetail,
  useRowGrouping,
  useRowPinning,
  useRowReordering,
  useSorting,
  useTreeData,
} from './features';

// ============================================================================
// DataGrid ViewModel（Pro 与 Premium 共用）
// ============================================================================
//
// 数据管线（顺序有意义）：
//   rows ─▶ 剔除钉住行 ─▶ 行拖拽顺序 ─▶ 表头筛选 ─▶ 排序 ─▶ 树形 / 行分组 ─▶ 分页 ─▶ + 钉住行
// 列管线：
//   columns ─▶ 列拖拽顺序 ─▶ 列钉住（left / center / right）
// 本 hook 只产出数据与回调，不产出 JSX；mantine-datatable 列定义由 View（DataGridSurface）构建。

const DEFAULT_PAGE_SIZE = 25;

export function useDataGridPro<T extends DataGridRow>(props: DataGridPremiumProps<T>) {
  const {
    rows,
    columns,
    getRowId: getRowIdProp,
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
    sortModel,
    onSortModelChange,
    checkboxSelection,
    rowSelectionModel,
    onRowSelectionModelChange,
    pagination,
    rowGroupingModel,
    aggregationModel,
    cellSelection,
    onCellSelectionChange,
    disableColumnMenu,
    disableColumnPinning,
    disableColumnResize,
    onColumnWidthChange,
    onColumnVisibilityChange,
    onPinnedColumnsChange,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const getRowId = useMemo(() => getRowIdProp ?? defaultGetRowId<T>, [getRowIdProp]);

  // ---------- 列 ----------
  const columnDrag = useColumnReordering({ columns, enabled: columnReordering, onColumnOrderChange });
  const {
    pinnedColumns: orderedColumns,
    leftFields,
    rightFields,
    hasLeftPinned,
    pinColumn,
  } = useColumnPinning({
    columns: columnDrag.reorderedColumns,
    pinnedColumns,
    onPinnedColumnsChange,
  });
  const visibility = useColumnVisibility({ columns: orderedColumns, onColumnVisibilityChange });
  const dataColumns = visibility.visibleColumns;
  const resizing = useColumnResizing({ enabled: !disableColumnResize, onColumnWidthChange });
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);

  // ---------- 行 ----------
  const { topRows, mainRows, bottomRows } = useRowPinning({ rows, pinnedRows, getRowId });

  const rowDrag = useRowReordering({ rows: mainRows, enabled: rowReordering, getRowId, onRowOrderChange });

  const filters = useHeaderFilters({ columns: orderedColumns, config: headerFilters });
  const sorting = useSorting({ columns: orderedColumns, sortModel, onSortModelChange });

  const { sortRows } = sorting;
  const { applyFilters } = filters;
  const dataRows = useMemo(
    () => sortRows(applyFilters(rowDrag.reorderedRows)),
    [sortRows, applyFilters, rowDrag.reorderedRows],
  );

  const tree = useTreeData({ rows: dataRows, config: treeData, getRowId });
  const grouping = useRowGrouping({
    rows: dataRows,
    rowGroupingModel: tree.isTreeActive ? undefined : rowGroupingModel,
    aggregationModel,
    columns: orderedColumns,
    getRowId,
  });

  const mainRecords: DataGridRecord<T>[] = tree.treeRecords ?? grouping.groupedRows;

  // ---------- 分页 ----------
  const paginationEnabled = !!pagination && !lazyLoading;
  const pageSizeOptions = typeof pagination === 'object' ? pagination.pageSizeOptions : undefined;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    (typeof pagination === 'object' && pagination.pageSize) || DEFAULT_PAGE_SIZE,
  );
  const totalRecords = mainRecords.length;
  const maxPage = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(page, maxPage);
  const pagedRecords = useMemo(
    () =>
      paginationEnabled
        ? mainRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : mainRecords,
    [paginationEnabled, mainRecords, currentPage, pageSize],
  );
  const onPageSizeChange = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

  // ---------- 最终显示记录（含钉住行） ----------
  const toPinned = useCallback(
    (row: T, side: 'top' | 'bottom'): DataGridRecord<T> => {
      const rowId = getRowId(row);
      return { key: `pinned-${side}:${String(rowId)}`, kind: 'row', row, rowId, depth: 0, pinned: side };
    },
    [getRowId],
  );
  const records = useMemo(
    () => [
      ...topRows.map((r) => toPinned(r, 'top')),
      ...pagedRecords,
      ...bottomRows.map((r) => toPinned(r, 'bottom')),
    ],
    [topRows, pagedRecords, bottomRows, toPinned],
  );

  // ---------- 主从明细 ----------
  const detail = useMasterDetail({ config: masterDetail });

  // ---------- 聚合 ----------
  const aggregation = useAggregation({ rows: dataRows, aggregationModel, columns: orderedColumns });

  // ---------- 行勾选 ----------
  const [internalSelection, setInternalSelection] = useState<DataGridRowId[]>([]);
  const selectionIds = rowSelectionModel ?? internalSelection;
  const selectedRecords = useMemo(() => {
    if (!checkboxSelection) return undefined;
    const ids = new Set(selectionIds);
    return records.filter((r) => r.kind === 'row' && r.rowId !== null && ids.has(r.rowId));
  }, [checkboxSelection, selectionIds, records]);
  const onSelectedRecordsChange = useCallback(
    (selected: DataGridRecord<T>[]) => {
      const ids = selected.flatMap((r) => (r.kind === 'row' && r.rowId !== null ? [r.rowId] : []));
      if (rowSelectionModel === undefined) setInternalSelection(ids);
      onRowSelectionModelChange?.(ids);
    },
    [rowSelectionModel, onRowSelectionModelChange],
  );

  // ---------- 单元格选择 + 复制 ----------
  const cells = useCellSelection({ enabled: cellSelection, onChange: onCellSelectionChange });
  const { ranges } = cells.cellSelectionModel;

  useEffect(() => {
    const container = containerRef.current;
    if (!cellSelection || !container) return;
    const onCopy = (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
      const range = ranges[0];
      if (!range) return;
      const lines: string[] = [];
      for (let r = range.startRow; r <= range.endRow; r++) {
        const rec = records[r];
        if (!rec?.row) continue;
        const row = rec.row;
        const values: string[] = [];
        for (let c = range.startCol; c <= range.endCol; c++) {
          const col = dataColumns[c];
          const v = col ? getCellValue(col, row) : '';
          values.push(v == null ? '' : String(v));
        }
        lines.push(values.join('\t'));
      }
      e.clipboardData?.setData('text/plain', lines.join('\n'));
      e.preventDefault();
    };
    container.addEventListener('copy', onCopy);
    return () => container.removeEventListener('copy', onCopy);
  }, [cellSelection, ranges, records, dataColumns]);

  // ---------- 剪贴板粘贴 ----------
  const getAnchor = useCallback(() => {
    const r = ranges[0];
    return r ? { row: r.startRow, col: r.startCol } : null;
  }, [ranges]);

  const resolvePasteContext = useCallback(
    (startRow: number, startCol: number, height: number, width: number): ClipboardPasteContext => {
      const rowIds: DataGridRowId[] = [];
      for (let i = startRow; i < records.length && rowIds.length < height; i++) {
        const rec = records[i];
        if (rec && rec.kind === 'row' && rec.rowId !== null) rowIds.push(rec.rowId);
      }
      const fields = dataColumns.slice(startCol, startCol + width).map(fieldOf);
      return { rowIds, fields };
    },
    [records, dataColumns],
  );

  useClipboardPaste({ config: clipboardPaste, containerRef, getAnchor, resolveContext: resolvePasteContext });

  // ---------- 懒加载 ----------
  const lazy = useLazyLoading({ config: lazyLoading, scrollViewportRef });

  // ---------- 导出 ----------
  const exporter = useExcelExport({ rows: dataRows, columns: dataColumns as DataGridColumn<T>[] });

  return {
    containerRef,
    scrollViewportRef,

    // 列
    dataColumns,
    leftFields,
    rightFields,
    hasLeftPinned,
    /** 全部列（含隐藏列，按显示顺序）——列管理面板用 */
    allColumns: orderedColumns,
    columnDrag,
    filters,
    sorting,
    resizing,
    visibility,
    columnMenu: {
      enabled: !disableColumnMenu,
      pinningEnabled: !disableColumnPinning,
      pinColumn,
      columnsPanelOpen,
      openColumnsPanel: () => setColumnsPanelOpen(true),
      closeColumnsPanel: () => setColumnsPanelOpen(false),
    },

    // 行
    records,
    dataRows,
    getRowId,

    // 功能
    tree: { isActive: tree.isTreeActive, toggle: tree.toggleExpand, config: treeData },
    grouping: { isActive: grouping.isActive, toggle: grouping.toggleGroup },
    detail: { ...detail, config: masterDetail },
    rowDrag: { enabled: !!rowReordering, ...rowDrag },
    aggregation: { model: aggregationModel, footerRow: aggregation.footerRow },
    cells: { enabled: !!cellSelection, ...cells },
    clipboardPasteEnabled: !!clipboardPaste?.enabled,
    lazy,
    selection: { enabled: !!checkboxSelection, selectedRecords, onSelectedRecordsChange },
    pagination: paginationEnabled
      ? {
          page: currentPage,
          onPageChange: setPage,
          pageSize,
          onPageSizeChange,
          pageSizeOptions,
          totalRecords,
        }
      : null,
    exporter,
  };
}

export type DataGridViewModel<T extends DataGridRow> = ReturnType<typeof useDataGridPro<T>>;
