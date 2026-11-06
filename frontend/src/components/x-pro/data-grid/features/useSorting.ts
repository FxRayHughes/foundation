import { useCallback, useState } from 'react';
import type { DataTableSortStatus } from 'mantine-datatable';
import type { DataGridColumn, DataGridRow, DataGridSortModel } from '../types';
import { compareValues, fieldOf, getCellValue } from '../utils';

// 客户端单列排序（受控 / 非受控），对接 mantine-datatable 的 sortStatus。

interface UseSortingParams<T extends DataGridRow> {
  columns: DataGridColumn<T>[];
  sortModel?: DataGridSortModel | null;
  onSortModelChange?: (model: DataGridSortModel | null) => void;
}

export interface UseSortingResult<T extends DataGridRow> {
  sortStatus: DataTableSortStatus<DataGridRow> | undefined;
  onSortStatusChange: (status: DataTableSortStatus<DataGridRow>) => void;
  sortRows: (rows: T[]) => T[];
  /** 当前排序（列菜单用） */
  sortModel: DataGridSortModel | null;
  /** 直接设置排序；null 清除（列菜单用） */
  setSortModel: (model: DataGridSortModel | null) => void;
}

export function useSorting<T extends DataGridRow>({
  columns,
  sortModel,
  onSortModelChange,
}: UseSortingParams<T>): UseSortingResult<T> {
  const [internal, setInternal] = useState<DataGridSortModel | null>(null);
  const model = sortModel !== undefined ? sortModel : internal;

  const setSortModel = useCallback(
    (next: DataGridSortModel | null) => {
      if (sortModel === undefined) setInternal(next);
      onSortModelChange?.(next);
    },
    [sortModel, onSortModelChange],
  );

  const onSortStatusChange = useCallback(
    (status: DataTableSortStatus<DataGridRow>) =>
      setSortModel({ field: String(status.columnAccessor), direction: status.direction }),
    [setSortModel],
  );

  const sortRows = useCallback(
    (rows: T[]): T[] => {
      if (!model) return rows;
      const col = columns.find((c) => fieldOf(c) === model.field);
      if (!col) return rows;
      const dir = model.direction === 'desc' ? -1 : 1;
      // 稳定排序：相等时保持原相对顺序
      return rows
        .map((row, i) => ({ row, i, v: getCellValue(col, row) }))
        .sort((a, b) => compareValues(a.v, b.v) * dir || a.i - b.i)
        .map((x) => x.row);
    },
    [columns, model],
  );

  return {
    sortStatus: model ? { columnAccessor: model.field, direction: model.direction } : undefined,
    onSortStatusChange,
    sortRows,
    sortModel: model,
    setSortModel,
  };
}
