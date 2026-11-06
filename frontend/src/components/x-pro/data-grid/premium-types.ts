import type { DataGridProProps, DataGridRow, DataGridRowId } from './types';

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

export type CustomAggregationFn = (values: unknown[]) => unknown;

export type AggregationModel = Record<string, AggregationFunction | CustomAggregationFn>;

export interface RowGroupingModel {
  /** 分组字段（多个字段 = 多级分组，按顺序嵌套） */
  fields: string[];
  /** 默认展开的层级数：0 全部折叠，1 展开第一级，Infinity 全展开 */
  defaultExpansionDepth?: number;
}

export interface CellSelectionModel {
  ranges: CellRange[];
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ExcelExportOptions {
  /** 默认文件名；扩展名会按导出格式自动替换为 .csv / .xlsx */
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  /** 原生「另存为」对话框标题（调用方传 t() 结果；DataGridPremium 工具栏已内置） */
  dialogTitle?: string;
  /** 原生对话框里文件类型过滤器的显示名（调用方经 t() 传入） */
  filterLabel?: string;
}

/**
 * 表格内部的"显示记录"：把原始行 / 分组行 / 树节点统一包装，
 * mantine-datatable 渲染的是它，列的 render 再解包成原始行交给调用方。
 */
export interface DataGridRecord<T extends DataGridRow = DataGridRow> {
  /** 唯一 key（mantine-datatable 的 idAccessor） */
  key: string;
  kind: 'row' | 'group';
  /** kind === 'row' 时为原始行，分组行为 null */
  row: T | null;
  rowId: DataGridRowId | null;
  /** 树形 / 分组层级（0 起） */
  depth: number;
  /** 置顶 / 置底行 */
  pinned?: 'top' | 'bottom';
  // 树形数据
  treeKey?: string;
  treeLabel?: string;
  hasChildren?: boolean;
  expanded?: boolean;
  // 行分组
  groupField?: string;
  groupValue?: unknown;
  groupCount?: number;
  groupAggregates?: Record<string, unknown>;
}

export interface RowGroupingResult<T extends DataGridRow = DataGridRow> {
  groupedRows: DataGridRecord<T>[];
  isActive: boolean;
  toggleGroup: (groupKey: string) => void;
}

export interface AggregationResult {
  /** 字段 → 聚合结果；未配置聚合时为 null */
  footerRow: DataGridRow | null;
}

export interface CellSelectionResult {
  cellSelectionModel: CellSelectionModel;
  onMouseDown: (rowIndex: number, colIndex: number, extend?: boolean) => void;
  onMouseMove: (rowIndex: number, colIndex: number) => void;
  onMouseUp: () => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  clearSelection: () => void;
}

export interface DataGridPremiumProps<T extends DataGridRow = DataGridRow> extends DataGridProProps<T> {
  rowGroupingModel?: RowGroupingModel;
  aggregationModel?: AggregationModel;
  cellSelection?: boolean;
  onCellSelectionChange?: (model: CellSelectionModel) => void;
  /** 顶部工具栏（CSV / Excel 导出），默认 false */
  showToolbar?: boolean;
  excelExportOptions?: ExcelExportOptions;
}
