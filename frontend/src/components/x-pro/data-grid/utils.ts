import { getValueAtPath } from 'mantine-datatable';
import type { DataGridColumn, DataGridRow, DataGridRowId } from './types';

// 内部工具列的 accessor 前缀（不参与筛选 / 排序 / 导出 / 单元格选择）
export const UTILITY_PREFIX = '__dg_';
export const REORDER_ACCESSOR = `${UTILITY_PREFIX}reorder`;
export const EXPAND_ACCESSOR = `${UTILITY_PREFIX}expand`;
export const TREE_ACCESSOR = `${UTILITY_PREFIX}tree`;
export const GROUP_ACCESSOR = `${UTILITY_PREFIX}group`;

export const fieldOf = <T extends DataGridRow>(col: DataGridColumn<T>): string => String(col.accessor);

export const getCellValue = <T extends DataGridRow>(col: DataGridColumn<T>, row: T): unknown =>
  col.valueGetter ? col.valueGetter(row) : getValueAtPath(row, col.accessor);

// 纯文本列名：headerName > 字符串 title > accessor
export const columnLabel = <T extends DataGridRow>(col: DataGridColumn<T>): string =>
  col.headerName ?? (typeof col.title === 'string' ? col.title : fieldOf(col));

export const defaultGetRowId = <T extends DataGridRow>(row: T): DataGridRowId => {
  const id = row.id;
  return typeof id === 'number' ? id : String(id);
};

// 排序 / 筛选用的比较：数字优先按数值，否则按本地化字符串
export const compareValues = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

export const toNumber = (v: unknown): number => (typeof v === 'number' ? v : parseFloat(String(v)));

export const formatValue = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (v instanceof Date) return v.toLocaleString();
  return String(v);
};
