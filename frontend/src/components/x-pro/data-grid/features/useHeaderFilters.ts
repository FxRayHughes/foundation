import { useCallback, useMemo, useState } from 'react';
import type {
  DataGridColumn,
  DataGridFilterItem,
  DataGridFilterModel,
  DataGridRow,
  HeaderFilterConfig,
} from '../types';
import { fieldOf, getCellValue, toNumber } from '../utils';

// 表头筛选：每列表头下方渲染一个输入框（见 DataGridCells.HeaderTitle），
// 这里只负责筛选模型（受控 / 非受控）与客户端过滤。

interface UseHeaderFiltersParams<T extends DataGridRow> {
  columns: DataGridColumn<T>[];
  config?: HeaderFilterConfig;
}

export interface UseHeaderFiltersResult<T extends DataGridRow> {
  isActive: boolean;
  filterModel: DataGridFilterModel;
  getFilterValue: (field: string) => string;
  onFilterChange: (field: string, value: string) => void;
  applyFilters: (rows: T[]) => T[];
}

const EMPTY: DataGridFilterModel = { items: [] };

const matches = (cell: unknown, item: DataGridFilterItem, numeric: boolean): boolean => {
  const needle = item.value.trim();
  if (!needle) return true;
  if (['gt', 'gte', 'lt', 'lte'].includes(item.operator) || (numeric && item.operator === 'equals')) {
    const a = toNumber(cell);
    const b = toNumber(needle);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (item.operator) {
      case 'gt': return a > b;
      case 'gte': return a >= b;
      case 'lt': return a < b;
      case 'lte': return a <= b;
      default: return a === b;
    }
  }
  const hay = String(cell ?? '').toLowerCase();
  const n = needle.toLowerCase();
  switch (item.operator) {
    case 'equals': return hay === n;
    case 'startsWith': return hay.startsWith(n);
    case 'endsWith': return hay.endsWith(n);
    default: return hay.includes(n);
  }
};

export function useHeaderFilters<T extends DataGridRow>({
  columns,
  config,
}: UseHeaderFiltersParams<T>): UseHeaderFiltersResult<T> {
  const [internalModel, setInternalModel] = useState<DataGridFilterModel>(EMPTY);
  const isActive = !!config?.enabled;
  const filterModel = config?.filterModel ?? internalModel;

  const getFilterValue = useCallback(
    (field: string) => filterModel.items.find((i) => i.field === field)?.value ?? '',
    [filterModel],
  );

  const onFilterChange = useCallback(
    (field: string, value: string) => {
      const items: DataGridFilterItem[] = [
        ...filterModel.items.filter((i) => i.field !== field),
        ...(value ? [{ field, operator: 'contains' as const, value }] : []),
      ];
      const next = { items };
      if (!config?.filterModel) setInternalModel(next);
      config?.onFilterModelChange?.(next);
    },
    [config, filterModel],
  );

  const applyFilters = useCallback(
    (rows: T[]): T[] => {
      const items = filterModel.items.filter((i) => i.value.trim().length > 0);
      if (!isActive || items.length === 0) return rows;
      const colMap = new Map(columns.map((c) => [fieldOf(c), c]));
      return rows.filter((row) =>
        items.every((item) => {
          const col = colMap.get(item.field);
          const cell = col ? getCellValue(col, row) : row[item.field];
          return matches(cell, item, col?.type === 'number');
        }),
      );
    },
    [columns, filterModel, isActive],
  );

  return useMemo(
    () => ({ isActive, filterModel, getFilterValue, onFilterChange, applyFilters }),
    [isActive, filterModel, getFilterValue, onFilterChange, applyFilters],
  );
}
