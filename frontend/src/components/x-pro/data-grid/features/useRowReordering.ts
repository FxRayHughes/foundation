import { useState, useCallback, useMemo } from 'react';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import { createElement } from 'react';

interface UseRowReorderingParams {
  rows: GridRowModel[];
  enabled?: boolean;
  onRowOrderChange?: (params: { oldIndex: number; newIndex: number }) => void;
}

interface UseRowReorderingResult {
  reorderedRows: GridRowModel[];
  reorderColumn: GridColDef | null;
  dragRowHandlers: {
    onDragStart: (rowIndex: number) => void;
    onDragOver: (e: React.DragEvent, rowIndex: number) => void;
    onDrop: (rowIndex: number) => void;
    onDragEnd: () => void;
    draggingIndex: number | null;
  };
}

export function useRowReordering({
  rows,
  enabled = false,
  onRowOrderChange,
}: UseRowReorderingParams): UseRowReorderingResult {
  const [rowOrder, setRowOrder] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const reorderedRows = useMemo(() => {
    if (!enabled || rowOrder.length === 0) return rows;
    return rowOrder
      .filter((i) => i < rows.length)
      .map((i) => rows[i]!);
  }, [rows, rowOrder, enabled]);

  const reorderColumn: GridColDef | null = useMemo(() => {
    if (!enabled) return null;
    return {
      field: '__reorder__',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () =>
        createElement(DragIndicatorRounded, {
          fontSize: 'small',
          sx: { cursor: 'grab', opacity: 0.5, '&:hover': { opacity: 1 } },
        }),
    };
  }, [enabled]);

  const onDragStart = useCallback(
    (rowIndex: number) => {
      if (!enabled) return;
      setDraggingIndex(rowIndex);
    },
    [enabled],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent, _rowIndex: number) => {
      if (!enabled) return;
      e.preventDefault();
    },
    [enabled],
  );

  const onDrop = useCallback(
    (targetIndex: number) => {
      if (!enabled || draggingIndex === null || draggingIndex === targetIndex) {
        setDraggingIndex(null);
        return;
      }
      setRowOrder((prev) => {
        const current = prev.length > 0 ? [...prev] : rows.map((_, i) => i);
        const [moved] = current.splice(draggingIndex, 1);
        if (moved !== undefined) current.splice(targetIndex, 0, moved);
        return current;
      });
      onRowOrderChange?.({ oldIndex: draggingIndex, newIndex: targetIndex });
      setDraggingIndex(null);
    },
    [enabled, draggingIndex, rows, onRowOrderChange],
  );

  const onDragEnd = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  return {
    reorderedRows,
    reorderColumn,
    dragRowHandlers: { onDragStart, onDragOver, onDrop, onDragEnd, draggingIndex },
  };
}
