import type { DataTableColumn } from 'mantine-datatable';
import type { ReactNode } from 'react';

// ============================================================================
// DataGrid Pro —— 基于 mantine-datatable 的自实现 "Pro" 表格
// ============================================================================

/** 行 id（默认取 row.id，可通过 getRowId 自定义） */
export type DataGridRowId = string | number;

/** 行数据：任意普通对象 */
export type DataGridRow = Record<string, unknown>;

/**
 * 列定义：在 mantine-datatable 的 DataTableColumn 之上补充表格语义字段。
 *  - accessor：字段名（等价于 MUI 的 field）
 *  - headerName：纯文本表头；未给 title 时作为 title，导出 / aria 也用它
 *  - type：'number' 时默认右对齐，筛选 / 排序按数值比较
 *  - sortable：默认 true（与 MUI DataGrid 一致），显式 false 关闭
 *  - filterable：是否出现在表头筛选行，默认 true
 *  - valueGetter：自定义取值（排序 / 筛选 / 聚合 / 导出 / 复制都走它）
 *  - render：接收原始行 T（框架内部的分组 / 树形包装对调用方透明）
 */
export type DataGridColumn<T extends DataGridRow = DataGridRow> = Omit<
  DataTableColumn<T>,
  'render' | 'footer'
> & {
  headerName?: string;
  type?: 'string' | 'number';
  filterable?: boolean;
  valueGetter?: (row: T) => unknown;
  valueFormatter?: (value: unknown, row: T) => ReactNode;
  render?: (row: T, index: number) => ReactNode;
  /** 拖拽调整列宽的最小宽度（px），默认 60 */
  minWidth?: number;
  // 以下沿用 DataTableColumn 的字段名，但由 DataGrid 自己解释（不会转交 mantine-datatable，避免其 localStorage 方案）：
  //  - resizable: false → 该列不出现列宽拖拽手柄
  //  - pinnable:  false → 列菜单不出现钉住项
  //  - toggleable: false → 不能在列菜单 / 列管理里隐藏
  //  - hidden: true → 初始隐藏（之后由列菜单 / 列管理在内存中切换）
};

export interface PinnedColumns {
  left?: string[];
  right?: string[];
}

export interface PinnedRows<T extends DataGridRow = DataGridRow> {
  top?: T[];
  bottom?: T[];
}

export interface TreeDataConfig<T extends DataGridRow = DataGridRow> {
  getTreeDataPath: (row: T) => string[];
  defaultGroupingExpansionDepth?: number;
  groupColDef?: { headerName?: string; width?: number };
}

export interface MasterDetailConfig<T extends DataGridRow = DataGridRow> {
  getDetailPanelContent: (row: T) => ReactNode;
  getDetailPanelHeight?: (row: T) => number | 'auto';
}

export interface LazyLoadingConfig {
  /** 滚动到底（或首屏不足一屏）时触发；startIndex = 当前已加载行数 */
  onFetchRows: (params: { startIndex: number; endIndex: number }) => void;
  /** 当前已加载的行数 */
  rowCount: number;
  loading?: boolean;
  /** 显式声明没有更多数据，停止触发 onFetchRows；默认 true */
  hasMore?: boolean;
  /** 每批请求的行数，默认 50 */
  pageSize?: number;
}

export type DataGridFilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export interface DataGridFilterItem {
  field: string;
  operator: DataGridFilterOperator;
  value: string;
}

export interface DataGridFilterModel {
  items: DataGridFilterItem[];
}

export interface HeaderFilterConfig {
  enabled: boolean;
  /** 受控筛选模型；不传则内部维护 */
  filterModel?: DataGridFilterModel;
  onFilterModelChange?: (model: DataGridFilterModel) => void;
}

export interface ClipboardPasteContext {
  /** 粘贴区域覆盖到的行 id（按显示顺序，超出可见行的部分被截断） */
  rowIds: DataGridRowId[];
  /** 粘贴区域覆盖到的列字段（按显示顺序） */
  fields: string[];
}

export interface ClipboardPasteConfig {
  enabled: boolean;
  /**
   * data：解析后的二维数组（TSV / CSV）。
   * startRow / startCol：粘贴起点在"当前显示顺序"中的行 / 数据列索引。
   * context：起点对应的行 id 与列字段，方便直接回写数据源。
   */
  onPaste?: (data: string[][], startRow: number, startCol: number, context: ClipboardPasteContext) => void;
}

export interface DataGridSortModel {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DataGridProProps<T extends DataGridRow = DataGridRow> {
  rows: T[];
  columns: DataGridColumn<T>[];
  getRowId?: (row: T) => DataGridRowId;

  pinnedColumns?: PinnedColumns;
  pinnedRows?: PinnedRows<T>;
  treeData?: TreeDataConfig<T>;
  masterDetail?: MasterDetailConfig<T>;
  lazyLoading?: LazyLoadingConfig;
  headerFilters?: HeaderFilterConfig;
  clipboardPaste?: ClipboardPasteConfig;
  columnReordering?: boolean;
  rowReordering?: boolean;
  onColumnOrderChange?: (columns: string[]) => void;
  onRowOrderChange?: (params: { oldIndex: number; newIndex: number }) => void;

  /** 关闭表头列菜单（排序 / 钉住 / 隐藏 / 管理列），默认开启 */
  disableColumnMenu?: boolean;
  /** 关闭列菜单里的钉住项（pinnedColumns 仍然生效），默认开启 */
  disableColumnPinning?: boolean;
  /** 关闭表头边缘拖拽调整列宽，默认开启 */
  disableColumnResize?: boolean;
  /** 列宽 / 显隐 / 钉住被用户改动时回调（状态只在内存中；需要记住时调用方自行存 PreferencesService） */
  onColumnWidthChange?: (field: string, width: number) => void;
  onColumnVisibilityChange?: (hiddenFields: string[]) => void;
  onPinnedColumnsChange?: (model: PinnedColumns) => void;

  /** 排序：不传则内部维护（单列排序，点击表头切换） */
  sortModel?: DataGridSortModel | null;
  onSortModelChange?: (model: DataGridSortModel | null) => void;

  /** 行勾选（checkbox 列） */
  checkboxSelection?: boolean;
  rowSelectionModel?: DataGridRowId[];
  onRowSelectionModelChange?: (ids: DataGridRowId[]) => void;

  /** 客户端分页：true 使用默认 pageSize=25；对象可自定义 */
  pagination?: boolean | { pageSize?: number; pageSizeOptions?: number[] };

  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  striped?: boolean;
  /** 表格高度，默认 100%（填满父容器） */
  height?: number | string;
  className?: string;
}
