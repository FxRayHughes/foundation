import { useCallback, useMemo, useState } from 'react';
import type { DataGridColumn, DataGridRow } from '../types';
import { fieldOf } from '../utils';

// 列显隐（列菜单"隐藏列" / "管理列"）。
// 初始值取列定义的 hidden；用户改动后只存在内存里（不落 localStorage）。
// toggleable: false 的列不能被隐藏；始终至少保留一列可见。

interface UseColumnVisibilityParams<T extends DataGridRow> {
  columns: DataGridColumn<T>[];
  onColumnVisibilityChange?: (hiddenFields: string[]) => void;
}

export interface UseColumnVisibilityResult<T extends DataGridRow> {
  visibleColumns: DataGridColumn<T>[];
  isHidden: (field: string) => boolean;
  canHide: (field: string) => boolean;
  setColumnVisible: (field: string, visible: boolean) => void;
  /** 全部显示 / 全部隐藏（隐藏时保留不可隐藏列，至少保留第一列） */
  setAllVisible: (visible: boolean) => void;
}

export function useColumnVisibility<T extends DataGridRow>({
  columns,
  onColumnVisibilityChange,
}: UseColumnVisibilityParams<T>): UseColumnVisibilityResult<T> {
  const [override, setOverride] = useState<Set<string> | null>(null);

  const hidden = useMemo(
    () => override ?? new Set(columns.filter((c) => c.hidden).map(fieldOf)),
    [override, columns],
  );

  const toggleableOf = useMemo(() => new Map(columns.map((c) => [fieldOf(c), c.toggleable !== false])), [columns]);

  const commit = useCallback(
    (next: Set<string>) => {
      // 至少保留一列可见
      if (columns.length > 0 && columns.every((c) => next.has(fieldOf(c)))) {
        const first = columns[0];
        if (first) next.delete(fieldOf(first));
      }
      setOverride(next);
      onColumnVisibilityChange?.([...next]);
    },
    [columns, onColumnVisibilityChange],
  );

  // 可见列去掉 hidden 标记（初始隐藏的列被用户重新显示后，导出等下游不应再把它当隐藏列）
  const visibleColumns = useMemo(
    () =>
      columns
        .filter((c) => !hidden.has(fieldOf(c)))
        .map((c) => (c.hidden ? ({ ...c, hidden: undefined } as DataGridColumn<T>) : c)),
    [columns, hidden],
  );
  const visibleCount = visibleColumns.length;

  const isHidden = useCallback((field: string) => hidden.has(field), [hidden]);
  const canHide = useCallback(
    (field: string) => toggleableOf.get(field) !== false && !(visibleCount <= 1 && !hidden.has(field)),
    [toggleableOf, visibleCount, hidden],
  );

  const setColumnVisible = useCallback(
    (field: string, visible: boolean) => {
      if (!visible && toggleableOf.get(field) === false) return;
      const next = new Set(hidden);
      if (visible) next.delete(field);
      else next.add(field);
      commit(next);
    },
    [hidden, toggleableOf, commit],
  );

  const setAllVisible = useCallback(
    (visible: boolean) => {
      commit(visible ? new Set() : new Set(columns.filter((c) => c.toggleable !== false).map(fieldOf)));
    },
    [columns, commit],
  );

  return { visibleColumns, isHidden, canHide, setColumnVisible, setAllVisible };
}
