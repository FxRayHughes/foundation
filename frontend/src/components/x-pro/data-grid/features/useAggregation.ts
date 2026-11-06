import { useMemo } from 'react';
import type { AggregationFunction, AggregationModel, AggregationResult } from '../premium-types';
import type { DataGridColumn, DataGridRow } from '../types';
import { fieldOf, getCellValue, toNumber } from '../utils';

// 聚合：对（筛选后的）全部数据行按字段计算 sum / avg / min / max / count / 自定义函数。
// 结果渲染在 mantine-datatable 原生 footer 行（sticky 在底部），分组行也复用同一套计算。

interface UseAggregationParams<T extends DataGridRow> {
  rows: T[];
  aggregationModel?: AggregationModel;
  /** 提供列定义时按列的 valueGetter 取值，否则直接读 row[field] */
  columns?: DataGridColumn<T>[];
}

export function computeBuiltIn(values: unknown[], fn: AggregationFunction): number {
  const nums = values.map(toNumber).filter((n) => !Number.isNaN(n));
  switch (fn) {
    case 'count':
      return values.length;
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case 'min':
      return nums.length > 0 ? Math.min(...nums) : 0;
    case 'max':
      return nums.length > 0 ? Math.max(...nums) : 0;
  }
}

export function computeAggregates<T extends DataGridRow>(
  rows: T[],
  aggregationModel: AggregationModel,
  columns?: DataGridColumn<T>[],
): DataGridRow {
  const colMap = new Map((columns ?? []).map((c) => [fieldOf(c), c]));
  const out: DataGridRow = {};
  for (const [field, fn] of Object.entries(aggregationModel)) {
    const col = colMap.get(field);
    const values = rows.map((r) => (col ? getCellValue(col, r) : r[field]));
    out[field] = typeof fn === 'function' ? fn(values) : computeBuiltIn(values, fn);
  }
  return out;
}

export function useAggregation<T extends DataGridRow>({
  rows,
  aggregationModel,
  columns,
}: UseAggregationParams<T>): AggregationResult {
  const footerRow = useMemo(() => {
    if (!aggregationModel || Object.keys(aggregationModel).length === 0) return null;
    return computeAggregates(rows, aggregationModel, columns);
  }, [rows, aggregationModel, columns]);

  return { footerRow };
}
