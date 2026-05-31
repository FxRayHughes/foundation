import { useMemo } from 'react';
import type { GridRowModel } from '@mui/x-data-grid';
import type { PinnedRows } from '../types';

interface UseRowPinningParams {
  rows: GridRowModel[];
  pinnedRows?: PinnedRows;
}

interface UseRowPinningResult {
  topRows: GridRowModel[];
  mainRows: GridRowModel[];
  bottomRows: GridRowModel[];
  hasPinnedRows: boolean;
}

export function useRowPinning({ rows, pinnedRows }: UseRowPinningParams): UseRowPinningResult {
  const { topRows, mainRows, bottomRows } = useMemo(() => {
    if (!pinnedRows) {
      return { topRows: [], mainRows: rows, bottomRows: [] };
    }

    const topIds = new Set(
      (pinnedRows.top ?? []).map((r) => r.id),
    );
    const bottomIds = new Set(
      (pinnedRows.bottom ?? []).map((r) => r.id),
    );

    const top = pinnedRows.top ?? [];
    const bottom = pinnedRows.bottom ?? [];
    const main = rows.filter(
      (r) => !topIds.has(r.id) && !bottomIds.has(r.id),
    );

    return { topRows: top, mainRows: main, bottomRows: bottom };
  }, [rows, pinnedRows]);

  return {
    topRows,
    mainRows,
    bottomRows,
    hasPinnedRows: topRows.length > 0 || bottomRows.length > 0,
  };
}
