import { useMemo } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import type { PinnedColumns } from '../types';

interface StickyStyle {
  position?: string;
  left?: number;
  right?: number;
  zIndex?: number;
  bgcolor?: string;
}

interface UseColumnPinningParams {
  columns: GridColDef[];
  pinnedColumns?: PinnedColumns;
}

interface UseColumnPinningResult {
  leftColumns: GridColDef[];
  centerColumns: GridColDef[];
  rightColumns: GridColDef[];
  leftWidth: number;
  rightWidth: number;
  getStickyStyles: (field: string) => StickyStyle;
}

export function useColumnPinning({
  columns,
  pinnedColumns,
}: UseColumnPinningParams): UseColumnPinningResult {
  const { leftColumns, centerColumns, rightColumns } = useMemo(() => {
    if (!pinnedColumns) {
      return { leftColumns: [], centerColumns: columns, rightColumns: [] };
    }

    const leftFields = new Set(pinnedColumns.left ?? []);
    const rightFields = new Set(pinnedColumns.right ?? []);

    const left: GridColDef[] = [];
    const center: GridColDef[] = [];
    const right: GridColDef[] = [];

    for (const col of columns) {
      if (leftFields.has(col.field)) left.push(col);
      else if (rightFields.has(col.field)) right.push(col);
      else center.push(col);
    }

    const orderedLeft = (pinnedColumns.left ?? [])
      .map((f) => left.find((c) => c.field === f))
      .filter(Boolean) as GridColDef[];

    const orderedRight = (pinnedColumns.right ?? [])
      .map((f) => right.find((c) => c.field === f))
      .filter(Boolean) as GridColDef[];

    return { leftColumns: orderedLeft, centerColumns: center, rightColumns: orderedRight };
  }, [columns, pinnedColumns]);

  const leftWidth = useMemo(
    () => leftColumns.reduce((sum, col) => sum + (col.width ?? 100), 0),
    [leftColumns],
  );

  const rightWidth = useMemo(
    () => rightColumns.reduce((sum, col) => sum + (col.width ?? 100), 0),
    [rightColumns],
  );

  const getStickyStyles = useMemo(() => {
    const leftOffsets = new Map<string, number>();
    const rightOffsets = new Map<string, number>();

    let offset = 0;
    for (const col of leftColumns) {
      leftOffsets.set(col.field, offset);
      offset += col.width ?? 100;
    }

    offset = 0;
    for (let i = rightColumns.length - 1; i >= 0; i--) {
      const col = rightColumns[i]!;
      rightOffsets.set(col.field, offset);
      offset += col.width ?? 100;
    }

    return (field: string): StickyStyle => {
      if (leftOffsets.has(field)) {
        return {
          position: 'sticky',
          left: leftOffsets.get(field),
          zIndex: 2,
          bgcolor: 'inherit',
        };
      }
      if (rightOffsets.has(field)) {
        return {
          position: 'sticky',
          right: rightOffsets.get(field),
          zIndex: 2,
          bgcolor: 'inherit',
        };
      }
      return {};
    };
  }, [leftColumns, rightColumns]);

  return { leftColumns, centerColumns, rightColumns, leftWidth, rightWidth, getStickyStyles };
}
