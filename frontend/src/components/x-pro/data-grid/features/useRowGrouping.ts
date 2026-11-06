import { useCallback, useMemo, useState } from 'react';
import type { AggregationModel, DataGridRecord, RowGroupingModel, RowGroupingResult } from '../premium-types';
import type { DataGridColumn, DataGridRow, DataGridRowId } from '../types';
import { defaultGetRowId, fieldOf, getCellValue } from '../utils';
import { computeAggregates } from './useAggregation';

// 行分组（多级）：按 rowGroupingModel.fields 依次嵌套分组，
// 输出"分组行 + 数据行"的扁平显示记录；分组行携带计数与（可选）组内聚合值。
// 展开状态 = "默认展开深度" XOR "用户切换过"。

interface UseRowGroupingParams<T extends DataGridRow> {
  rows: T[];
  rowGroupingModel?: RowGroupingModel;
  aggregationModel?: AggregationModel;
  columns?: DataGridColumn<T>[];
  getRowId?: (row: T) => DataGridRowId;
}

export function useRowGrouping<T extends DataGridRow>({
  rows,
  rowGroupingModel,
  aggregationModel,
  columns,
  getRowId = defaultGetRowId,
}: UseRowGroupingParams<T>): RowGroupingResult<T> {
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());

  const toggleGroup = useCallback((groupKey: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const isActive = !!rowGroupingModel && rowGroupingModel.fields.length > 0;

  const groupedRows = useMemo((): DataGridRecord<T>[] => {
    const toRecord = (row: T, depth: number): DataGridRecord<T> => {
      const rowId = getRowId(row);
      return { key: `row:${String(rowId)}`, kind: 'row', row, rowId, depth };
    };
    if (!rowGroupingModel || rowGroupingModel.fields.length === 0) {
      return rows.map((r) => toRecord(r, 0));
    }

    const { fields } = rowGroupingModel;
    const defaultDepth = rowGroupingModel.defaultExpansionDepth ?? 0;
    const colMap = new Map((columns ?? []).map((c) => [fieldOf(c), c]));
    const valueOf = (row: T, field: string) => {
      const col = colMap.get(field);
      return col ? getCellValue(col, row) : row[field];
    };
    const hasAgg = !!aggregationModel && Object.keys(aggregationModel).length > 0;
    const out: DataGridRecord<T>[] = [];

    const build = (subset: T[], depth: number, parentKey: string) => {
      const field = fields[depth];
      if (field === undefined) {
        subset.forEach((r) => out.push(toRecord(r, depth)));
        return;
      }
      // 保持首次出现顺序（上游已排序时组内顺序也随之有序）
      const buckets = new Map<string, { value: unknown; rows: T[] }>();
      for (const row of subset) {
        const value = valueOf(row, field);
        const k = String(value ?? '');
        const bucket = buckets.get(k);
        if (bucket) bucket.rows.push(row);
        else buckets.set(k, { value, rows: [row] });
      }
      for (const [k, bucket] of buckets) {
        const groupKey = `${parentKey}/${field}=${k}`;
        const expanded = (depth < defaultDepth) !== toggled.has(groupKey);
        out.push({
          key: `group:${groupKey}`,
          kind: 'group',
          row: null,
          rowId: null,
          depth,
          groupField: field,
          groupValue: bucket.value,
          groupCount: bucket.rows.length,
          groupAggregates: hasAgg ? computeAggregates(bucket.rows, aggregationModel!, columns) : undefined,
          treeKey: groupKey,
          hasChildren: true,
          expanded,
        });
        if (expanded) build(bucket.rows, depth + 1, groupKey);
      }
    };
    build(rows, 0, '');
    return out;
  }, [rows, rowGroupingModel, aggregationModel, columns, toggled, getRowId]);

  return { groupedRows, isActive, toggleGroup };
}
