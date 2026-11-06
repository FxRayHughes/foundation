import { useMemo } from 'react';
import type { DataGridRow, DataGridRowId, PinnedRows } from '../types';

// 行置顶 / 置底：从主数据中剔除被钉住的行（按 id 匹配），
// 渲染时以 sticky 行的形式放在表头下 / 表尾上（见 useDataGridPro）。

interface UseRowPinningParams<T extends DataGridRow> {
  rows: T[];
  pinnedRows?: PinnedRows<T>;
  getRowId: (row: T) => DataGridRowId;
}

interface UseRowPinningResult<T extends DataGridRow> {
  topRows: T[];
  mainRows: T[];
  bottomRows: T[];
  hasPinnedRows: boolean;
}

export function useRowPinning<T extends DataGridRow>({
  rows,
  pinnedRows,
  getRowId,
}: UseRowPinningParams<T>): UseRowPinningResult<T> {
  return useMemo(() => {
    const top = pinnedRows?.top ?? [];
    const bottom = pinnedRows?.bottom ?? [];
    if (top.length === 0 && bottom.length === 0) {
      return { topRows: [], mainRows: rows, bottomRows: [], hasPinnedRows: false };
    }
    const pinnedIds = new Set([...top, ...bottom].map(getRowId));
    return {
      topRows: top,
      mainRows: rows.filter((r) => !pinnedIds.has(getRowId(r))),
      bottomRows: bottom,
      hasPinnedRows: true,
    };
  }, [rows, pinnedRows, getRowId]);
}
