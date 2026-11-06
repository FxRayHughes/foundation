import { Loader } from '@mantine/core';
import clsx from 'clsx';
import { DataTable, humanize } from 'mantine-datatable';
import type {
  DataTableColumn,
  DataTablePaginationProps,
  DataTableProps,
  DataTableRowExpansionProps,
  DataTableSelectionProps,
  DataTableSortProps,
} from 'mantine-datatable';
import type { MantineStyleProp } from '@mantine/core';
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useT } from '@/i18n';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import type { DataGridRecord } from './premium-types';
import type { DataGridProProps, DataGridRow } from './types';
import type { DataGridViewModel } from './useDataGridPro';
import { CELL_COL_ATTR, CELL_ROW_ATTR, usePinnedRowOffsets } from './features';
import { ColumnsPanel } from './DataGridColumnMenu';
import { AggregateValue, DetailToggle, GroupLabel, HeaderTitle, RowDragHandle, TreeCell } from './DataGridCells';
import {
  EXPAND_ACCESSOR,
  GROUP_ACCESSOR,
  REORDER_ACCESSOR,
  TREE_ACCESSOR,
  columnLabel,
  fieldOf,
  formatValue,
  getCellValue,
} from './utils';
import { registerDataGridLocales } from './lang';
import classes from './DataGrid.module.css';

registerDataGridLocales();

type Rec<T extends DataGridRow> = DataGridRecord<T>;
type Col<T extends DataGridRow> = DataTableColumn<Rec<T>>;

interface DataGridSurfaceProps<T extends DataGridRow> {
  vm: DataGridViewModel<T>;
  props: DataGridProProps<T>;
  /** 表格上方插槽（Premium 工具栏） */
  toolbar?: ReactNode;
}

// DataGrid 的 View：把 ViewModel 的数据 / 回调翻译成 mantine-datatable 的列与属性。
// Pro 与 Premium 共用；Premium 额外传入 toolbar。
export function DataGridSurface<T extends DataGridRow>({ vm, props, toolbar }: DataGridSurfaceProps<T>) {
  const t = useT();
  const { records } = vm;

  const topCount = records.filter((r) => r.pinned === 'top').length;
  const bottomCount = records.filter((r) => r.pinned === 'bottom').length;
  const hasPinnedRows = topCount + bottomCount > 0;
  const hasFooter = !!vm.aggregation.footerRow;

  // 钉住行的真实行高（内容换行变高时偏移跟着变）
  const pinnedOffsets = usePinnedRowOffsets({
    containerRef: vm.containerRef,
    topCount,
    bottomCount,
    // 列宽 / 显隐变化引起的行高变化由 ResizeObserver 捕获；记录变化时重新挂载监听
    deps: records,
  });

  const columns = useMemo((): Col<T>[] => {
    // ---- 钉住行：sticky 偏移（按测量行高累加）+ z-index 阶梯 ----
    const pinnedRowStyle = (rec: Rec<T>, index: number, colPinned: boolean): CSSProperties | undefined => {
      if (rec.pinned === 'top') {
        return {
          position: 'sticky',
          top: `calc(var(--mantine-datatable-header-height) + ${pinnedOffsets.top(index)}px)`,
          zIndex: colPinned ? 3 : 2,
        };
      }
      if (rec.pinned === 'bottom') {
        const base = pinnedOffsets.bottom(records.length - 1 - index);
        return {
          position: 'sticky',
          bottom: hasFooter ? `calc(var(--mantine-datatable-footer-height) + ${base}px)` : `${base}px`,
          zIndex: colPinned ? 3 : 2,
        };
      }
      return hasPinnedRows && colPinned ? { zIndex: 1 } : undefined;
    };

    const utilityPinned = vm.hasLeftPinned ? ('left' as const) : undefined;
    const utility = (
      accessor: string,
      width: number,
      render: (rec: Rec<T>, index: number) => ReactNode,
      title: ReactNode = '',
    ): Col<T> => ({
      accessor,
      title,
      width,
      pinned: utilityPinned,
      cellsClassName: classes.utilityCell,
      titleClassName: classes.utilityCell,
      cellsStyle: (rec, i) => pinnedRowStyle(rec, i, !!utilityPinned),
      render,
    });

    const cols: Col<T>[] = [];

    // 行拖拽手柄
    if (vm.rowDrag.enabled) {
      cols.push(
        utility(REORDER_ACCESSOR, 40, (rec) =>
          rec.kind === 'row' && !rec.pinned && rec.rowId !== null ? (
            <RowDragHandle handleProps={vm.rowDrag.getRowHandleProps(rec.rowId)} />
          ) : null,
        ),
      );
    }

    // 主从明细展开按钮
    if (vm.detail.isActive) {
      cols.push(
        utility(EXPAND_ACCESSOR, 44, (rec) =>
          rec.kind === 'row' && !rec.pinned ? (
            <DetailToggle expanded={vm.detail.isExpanded(rec.key)} onToggle={() => vm.detail.toggleExpand(rec.key)} />
          ) : null,
        ),
      );
    }

    // 树形分组列
    if (vm.tree.isActive) {
      const groupDef = vm.tree.config?.groupColDef;
      cols.push(
        utility(
          TREE_ACCESSOR,
          groupDef?.width ?? 200,
          (rec) =>
            rec.pinned ? null : (
              <TreeCell
                depth={rec.depth}
                hasChildren={!!rec.hasChildren}
                expanded={!!rec.expanded}
                onToggle={() => rec.treeKey && vm.tree.toggle(rec.treeKey)}
              >
                {rec.treeLabel}
              </TreeCell>
            ),
          groupDef?.headerName ?? '',
        ),
      );
    }

    // 行分组列
    if (vm.grouping.isActive) {
      cols.push(
        utility(
          GROUP_ACCESSOR,
          220,
          (rec) =>
            rec.kind === 'group' ? (
              <TreeCell
                depth={rec.depth}
                hasChildren
                expanded={!!rec.expanded}
                onToggle={() => rec.treeKey && vm.grouping.toggle(rec.treeKey)}
              >
                <GroupLabel value={formatValue(rec.groupValue)} count={rec.groupCount ?? 0} />
              </TreeCell>
            ) : null,
          t('dataGrid.groupColumn'),
        ),
      );
    }

    // 数据列
    const aggModel = vm.aggregation.model;
    const footerRow = vm.aggregation.footerRow;
    const cellInteractive = vm.cells.enabled || vm.clipboardPasteEnabled;

    vm.dataColumns.forEach((col, colIndex) => {
      const {
        headerName: _headerName,
        type,
        filterable,
        valueGetter: _valueGetter,
        valueFormatter,
        render: userRender,
        cellsClassName: userCellsClassName,
        cellsStyle: userCellsStyle,
        customCellAttributes: userCellAttributes,
        title,
        titleClassName: userTitleClassName,
        minWidth,
        width: defaultWidth,
        // 以下由 DataGrid 自己解释，不转交 mantine-datatable（它的实现依赖 storeColumnsKey / localStorage）
        resizable,
        pinnable,
        toggleable: _toggleable,
        draggable: _draggable,
        defaultToggle: _defaultToggle,
        hidden: _hidden,
        ...rest
      } = col;
      const field = fieldOf(col);
      const text = columnLabel(col);
      const pinSide: 'left' | 'right' | null = vm.leftFields.has(field) ? 'left' : vm.rightFields.has(field) ? 'right' : null;
      const colPinned = pinSide !== null;
      const sortable = col.sortable !== false;
      const sortModel = vm.sorting.sortModel;
      const menu = vm.columnMenu.enabled
        ? {
            sort: sortable
              ? {
                  direction: sortModel?.field === field ? sortModel.direction : null,
                  onSort: (direction: 'asc' | 'desc' | null) =>
                    vm.sorting.setSortModel(direction ? { field, direction } : null),
                }
              : null,
            pin:
              vm.columnMenu.pinningEnabled && pinnable !== false
                ? { side: pinSide, onPin: (side: 'left' | 'right' | null) => vm.columnMenu.pinColumn(field, side) }
                : null,
            onHide: vm.visibility.canHide(field) ? () => vm.visibility.setColumnVisible(field, false) : null,
            onManageColumns: vm.columnMenu.openColumnsPanel,
          }
        : null;
      const aggFn = aggModel?.[field];
      const isDragging = vm.columnDrag.draggingField === field;
      const isDropTarget = vm.columnDrag.dropTargetField === field && !isDragging;

      cols.push({
        ...rest,
        accessor: field,
        textAlign: col.textAlign ?? (type === 'number' ? 'right' : undefined),
        sortable,
        width: vm.resizing.getWidth(field) ?? defaultWidth,
        titleClassName: clsx(classes.headerCell, userTitleClassName),
        title: (
          <HeaderTitle
            label={title ?? col.headerName ?? humanize(field)}
            text={text}
            dragProps={vm.columnDrag.getColumnDragProps(field)}
            isDragging={isDragging}
            isDropTarget={isDropTarget}
            filter={
              vm.filters.isActive && filterable !== false
                ? { value: vm.filters.getFilterValue(field), onChange: (v) => vm.filters.onFilterChange(field, v) }
                : null
            }
            menu={menu}
            resizeProps={resizable !== false ? vm.resizing.getResizeHandleProps(field, minWidth) : null}
            isResizing={vm.resizing.resizingField === field}
          />
        ),
        footer:
          footerRow && aggFn !== undefined ? <AggregateValue fn={aggFn} value={footerRow[field]} /> : undefined,
        render: (rec, index) => {
          if (rec.kind === 'group' || !rec.row) {
            const agg = rec.groupAggregates;
            return agg && aggFn !== undefined && field in agg ? (
              <AggregateValue fn={aggFn} value={agg[field]} showLabel={false} />
            ) : null;
          }
          if (userRender) return userRender(rec.row, index);
          const value = getCellValue(col, rec.row);
          return valueFormatter ? valueFormatter(value, rec.row) : formatValue(value);
        },
        cellsClassName: (rec, index) => {
          const user =
            rec.row && userCellsClassName
              ? typeof userCellsClassName === 'function'
                ? userCellsClassName(rec.row, index)
                : userCellsClassName
              : undefined;
          return (
            clsx(
              user,
              cellInteractive && rec.kind === 'row' && classes.cellFocusable,
              vm.cells.enabled && rec.kind === 'row' && classes.cellSelectable,
              vm.cells.enabled && rec.kind === 'row' && vm.cells.isCellSelected(index, colIndex) && classes.cellSelected,
            ) || undefined
          );
        },
        cellsStyle: (rec, index) => {
          const user: MantineStyleProp | undefined = rec.row && userCellsStyle ? userCellsStyle(rec.row, index) : undefined;
          const mine = pinnedRowStyle(rec, index, colPinned);
          if (!user) return mine;
          return mine ? [user, mine] : user;
        },
        customCellAttributes: (rec, index) => {
          const user = rec.row && userCellAttributes ? userCellAttributes(rec.row, index) : {};
          if (!cellInteractive || rec.kind !== 'row') return user;
          return {
            ...user,
            [CELL_ROW_ATTR]: index,
            [CELL_COL_ATTR]: colIndex,
            tabIndex: 0,
            onMouseDown: vm.cells.enabled
              ? (e: React.MouseEvent<HTMLElement>) => {
                  if (e.button !== 0) return;
                  vm.cells.onMouseDown(index, colIndex, e.shiftKey);
                  e.currentTarget.focus();
                }
              : undefined,
            onMouseEnter: vm.cells.enabled ? () => vm.cells.onMouseMove(index, colIndex) : undefined,
          };
        },
      } as Col<T>);
    });

    return cols;
  }, [vm, records, hasFooter, hasPinnedRows, pinnedOffsets, t]);

  // ---------- 行属性 ----------
  const rowClassName = (rec: Rec<T>, index: number) =>
    clsx(
      rec.pinned && classes.pinnedRow,
      rec.pinned === 'top' && index === topCount - 1 && classes.pinnedRowTopLast,
      rec.pinned === 'bottom' && index === records.length - bottomCount && classes.pinnedRowBottomFirst,
      rec.kind === 'group' && classes.groupRow,
      rec.rowId !== null && vm.rowDrag.draggingId === rec.rowId && classes.rowDragging,
      rec.rowId !== null &&
        vm.rowDrag.dropTargetId === rec.rowId &&
        vm.rowDrag.draggingId !== rec.rowId &&
        classes.rowDropTarget,
    ) || undefined;

  const customRowAttributes = (rec: Rec<T>): Record<string, unknown> => {
    if (rec.pinned) return { 'data-pinned-row': rec.pinned, 'aria-label': t('dataGrid.pinnedRow') };
    if (rec.kind === 'row' && rec.rowId !== null) return { ...vm.rowDrag.getRowDropProps(rec.rowId) };
    return {};
  };

  // ---------- 可选能力（mantine-datatable 的联合类型属性） ----------
  const sortProps = {
    sortStatus: vm.sorting.sortStatus,
    onSortStatusChange: vm.sorting.onSortStatusChange,
  } as unknown as DataTableSortProps<Rec<T>>;

  const selectionProps = (
    vm.selection.enabled
      ? {
          selectedRecords: vm.selection.selectedRecords,
          onSelectedRecordsChange: vm.selection.onSelectedRecordsChange,
          isRecordSelectable: (rec: Rec<T>) => rec.kind === 'row' && !rec.pinned,
        }
      : {}
  ) as DataTableSelectionProps<Rec<T>>;

  const p = vm.pagination;
  const paginationProps = (
    p
      ? {
          page: p.page,
          onPageChange: p.onPageChange,
          totalRecords: p.totalRecords,
          recordsPerPage: p.pageSize,
          // 自行计算区间：mantine 的 from/to 按 records.length 算，会把钉住行也计入
          paginationText: () =>
            t('dataGrid.paginationText', {
              from: p.totalRecords === 0 ? 0 : (p.page - 1) * p.pageSize + 1,
              to: Math.min(p.page * p.pageSize, p.totalRecords),
              total: p.totalRecords,
            }),
          ...(p.pageSizeOptions
            ? {
                recordsPerPageOptions: p.pageSizeOptions,
                onRecordsPerPageChange: p.onPageSizeChange,
                recordsPerPageLabel: t('dataGrid.recordsPerPage'),
              }
            : {}),
        }
      : {}
  ) as DataTablePaginationProps;

  const rowExpansion: DataTableRowExpansionProps<Rec<T>> | undefined = vm.detail.config
    ? {
        trigger: 'never',
        allowMultiple: true,
        expandable: ({ record }) => record.kind === 'row' && !record.pinned,
        expanded: { recordIds: vm.detail.expandedKeys, onRecordIdsChange: vm.detail.setExpandedKeys },
        content: ({ record }) => {
          const cfg = vm.detail.config;
          if (!cfg || !record.row) return null;
          const h = cfg.getDetailPanelHeight?.(record.row) ?? 'auto';
          return (
            <div className={classes.detailPanel} style={{ height: h === 'auto' ? undefined : h }}>
              {cfg.getDetailPanelContent(record.row)}
            </div>
          );
        },
      }
    : undefined;

  const tableProps = {
    className: classes.table,
    height: '100%',
    records,
    columns,
    idAccessor: 'key',
    highlightOnHover: true,
    striped: props.striped,
    verticalAlign: 'center',
    c: FOUNDATION_CSS_VARS.text.primary,
    backgroundColor: FOUNDATION_CSS_VARS.bg.surface,
    borderColor: FOUNDATION_CSS_VARS.divider,
    rowBorderColor: FOUNDATION_CSS_VARS.divider,
    stripedColor: FOUNDATION_CSS_VARS.bg.elevated,
    highlightOnHoverColor: FOUNDATION_CSS_VARS.bg.hover,
    fetching: props.loading,
    loaderColor: 'foundation',
    noRecordsText: t('dataGrid.noRecords'),
    loadingText: t('dataGrid.loading'),
    rowClassName,
    customRowAttributes,
    rowExpansion,
    scrollViewportRef: vm.scrollViewportRef,
    onScrollToBottom: vm.lazy.onScrollToBottom,
    onRowClick: props.onRowClick
      ? ({ record, index }: { record: Rec<T>; index: number }) => {
          if (record.kind === 'row' && record.row) props.onRowClick?.(record.row, index);
        }
      : undefined,
    ...sortProps,
    ...selectionProps,
    ...paginationProps,
  } as DataTableProps<Rec<T>>;

  return (
    <div
      ref={vm.containerRef}
      className={clsx(classes.root, props.className)}
      style={props.height !== undefined ? { height: props.height } : undefined}
    >
      {toolbar}
      <div className={classes.tableWrap}>
        <DataTable<Rec<T>> {...tableProps} />
        {vm.columnMenu.enabled && (
          <ColumnsPanel
            opened={vm.columnMenu.columnsPanelOpen}
            onClose={vm.columnMenu.closeColumnsPanel}
            items={vm.allColumns.map((c) => {
              const field = fieldOf(c);
              const visible = !vm.visibility.isHidden(field);
              return { field, label: columnLabel(c), visible, canToggle: !visible || vm.visibility.canHide(field) };
            })}
            onToggle={vm.visibility.setColumnVisible}
            onSetAll={vm.visibility.setAllVisible}
          />
        )}
        {vm.lazy.isLoading && (
          <div className={classes.lazyLoader} role="status" aria-label={t('dataGrid.loading')}>
            <Loader size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
