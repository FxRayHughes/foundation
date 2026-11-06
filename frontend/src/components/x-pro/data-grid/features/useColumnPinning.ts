import { useCallback, useMemo, useState } from 'react';
import type { DataGridColumn, DataGridRow, PinnedColumns } from '../types';
import { fieldOf } from '../utils';

// 列钉住：把 pinnedColumns.left / right 映射到 mantine-datatable 原生的 column.pinned，
// 并按 left（按配置顺序）→ 中间 → right（按配置顺序）重排。
// 粘性定位 / 偏移量 / 阴影由 mantine-datatable 测量 DOM 后自动处理。
//
// 初始模型 = props.pinnedColumns + 列定义里自带的 pinned（配置优先）；
// 用户在列菜单里钉住 / 取消钉住后，改为内存中的完整模型（不落任何存储）。

interface UseColumnPinningParams<T extends DataGridRow> {
  columns: DataGridColumn<T>[];
  pinnedColumns?: PinnedColumns;
  onPinnedColumnsChange?: (model: PinnedColumns) => void;
}

interface UseColumnPinningResult<T extends DataGridRow> {
  pinnedColumns: DataGridColumn<T>[];
  leftFields: Set<string>;
  rightFields: Set<string>;
  hasLeftPinned: boolean;
  /** 钉到左 / 右；side 为 null 时取消钉住 */
  pinColumn: (field: string, side: 'left' | 'right' | null) => void;
}

export function useColumnPinning<T extends DataGridRow>({
  columns,
  pinnedColumns,
  onPinnedColumnsChange,
}: UseColumnPinningParams<T>): UseColumnPinningResult<T> {
  const [override, setOverride] = useState<PinnedColumns | null>(null);

  // 当前生效的模型（完整的 left / right 列表）
  const model = useMemo((): Required<PinnedColumns> => {
    if (override) return { left: override.left ?? [], right: override.right ?? [] };
    const left = [...(pinnedColumns?.left ?? [])];
    const right = [...(pinnedColumns?.right ?? [])];
    for (const c of columns) {
      const f = fieldOf(c);
      if (left.includes(f) || right.includes(f)) continue;
      if (c.pinned === 'left') left.push(f);
      else if (c.pinned === 'right') right.unshift(f);
    }
    return { left, right };
  }, [override, pinnedColumns, columns]);

  const result = useMemo(() => {
    const leftFields = new Set(model.left);
    const rightFields = new Set(model.right);
    const byField = new Map(columns.map((c) => [fieldOf(c), c]));
    const pick = (order: string[], side: 'left' | 'right') =>
      order.flatMap((f) => {
        const c = byField.get(f);
        return c ? [{ ...c, pinned: side } as DataGridColumn<T>] : [];
      });
    const center = columns
      .filter((c) => !leftFields.has(fieldOf(c)) && !rightFields.has(fieldOf(c)))
      .map((c) => (c.pinned ? ({ ...c, pinned: undefined } as DataGridColumn<T>) : c));
    const left = pick(model.left, 'left');
    const right = pick(model.right, 'right');
    return {
      pinnedColumns: [...left, ...center, ...right],
      leftFields,
      rightFields,
      hasLeftPinned: left.length > 0,
    };
  }, [columns, model]);

  const pinColumn = useCallback(
    (field: string, side: 'left' | 'right' | null) => {
      const left = model.left.filter((f) => f !== field);
      const right = model.right.filter((f) => f !== field);
      if (side === 'left') left.push(field);
      if (side === 'right') right.unshift(field);
      const next = { left, right };
      setOverride(next);
      onPinnedColumnsChange?.(next);
    },
    [model, onPinnedColumnsChange],
  );

  return { ...result, pinColumn };
}
