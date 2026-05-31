import { useState, useCallback, useMemo } from 'react';
import type { GridColDef } from '@mui/x-data-grid';

interface UseColumnReorderingParams {
  columns: GridColDef[];
  enabled?: boolean;
  onColumnOrderChange?: (fields: string[]) => void;
}

interface DragHandlers {
  onDragStart: (e: React.DragEvent, field: string) => void;
  onDragOver: (e: React.DragEvent, field: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, field: string) => void;
  draggingField: string | null;
  dropTargetField: string | null;
}

interface UseColumnReorderingResult {
  reorderedColumns: GridColDef[];
  dragHandlers: DragHandlers;
}

export function useColumnReordering({
  columns,
  enabled = false,
  onColumnOrderChange,
}: UseColumnReorderingParams): UseColumnReorderingResult {
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.field),
  );
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dropTargetField, setDropTargetField] = useState<string | null>(null);

  const reorderedColumns = useMemo(() => {
    if (!enabled) return columns;
    const colMap = new Map(columns.map((c) => [c.field, c]));
    const validOrder = columnOrder.filter((f) => colMap.has(f));
    const newFields = columns
      .filter((c) => !columnOrder.includes(c.field))
      .map((c) => c.field);
    return [...validOrder, ...newFields]
      .map((f) => colMap.get(f))
      .filter(Boolean) as GridColDef[];
  }, [columns, columnOrder, enabled]);

  const onDragStart = useCallback(
    (e: React.DragEvent, field: string) => {
      if (!enabled) return;
      e.dataTransfer.effectAllowed = 'move';
      setDraggingField(field);
    },
    [enabled],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent, field: string) => {
      if (!enabled || !draggingField) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetField(field);
    },
    [enabled, draggingField],
  );

  const onDrop = useCallback(
    (_e: React.DragEvent, targetField: string) => {
      if (!enabled || !draggingField || draggingField === targetField) {
        setDraggingField(null);
        setDropTargetField(null);
        return;
      }
      setColumnOrder((prev) => {
        const newOrder = [...prev];
        const fromIdx = newOrder.indexOf(draggingField);
        const toIdx = newOrder.indexOf(targetField);
        if (fromIdx === -1 || toIdx === -1) return prev;
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggingField);
        onColumnOrderChange?.(newOrder);
        return newOrder;
      });
      setDraggingField(null);
      setDropTargetField(null);
    },
    [enabled, draggingField, onColumnOrderChange],
  );

  const onDragEnd = useCallback(() => {
    setDraggingField(null);
    setDropTargetField(null);
  }, []);

  return {
    reorderedColumns,
    dragHandlers: { onDragStart, onDragOver, onDragEnd, onDrop, draggingField, dropTargetField },
  };
}
