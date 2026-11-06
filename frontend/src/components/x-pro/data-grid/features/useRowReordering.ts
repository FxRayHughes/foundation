import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import type { DataGridRow, DataGridRowId } from '../types';

// 行拖拽重排（HTML5 DnD，无需 @hello-pangea/dnd）。
// 维护一份 id 顺序，作用于"原始行"（筛选 / 排序之前），
// 因此排序后再拖拽 = 调整未排序时的基准顺序，与 MUI Pro 行为一致。

const ROW_DRAG_MIME = 'application/x-foundation-grid-row';

interface UseRowReorderingParams<T extends DataGridRow> {
  rows: T[];
  enabled?: boolean;
  getRowId: (row: T) => DataGridRowId;
  onRowOrderChange?: (params: { oldIndex: number; newIndex: number }) => void;
}

/** 行（tr）上的放置目标属性 */
export interface RowDropProps {
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

/** 拖拽手柄上的属性 */
export interface RowHandleProps {
  draggable: true;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export interface UseRowReorderingResult<T extends DataGridRow> {
  reorderedRows: T[];
  draggingId: DataGridRowId | null;
  dropTargetId: DataGridRowId | null;
  moveRow: (fromId: DataGridRowId, toId: DataGridRowId) => void;
  /** 行（tr）上的放置属性；未启用时返回 null */
  getRowDropProps: (rowId: DataGridRowId) => RowDropProps | null;
  /** 拖拽手柄属性（拖拽影像为整行） */
  getRowHandleProps: (rowId: DataGridRowId) => RowHandleProps;
}

export function useRowReordering<T extends DataGridRow>({
  rows,
  enabled = false,
  getRowId,
  onRowOrderChange,
}: UseRowReorderingParams<T>): UseRowReorderingResult<T> {
  const [rowOrder, setRowOrder] = useState<DataGridRowId[] | null>(null);
  const [draggingId, setDraggingId] = useState<DataGridRowId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<DataGridRowId | null>(null);

  const reorderedRows = useMemo(() => {
    if (!enabled || !rowOrder) return rows;
    const byId = new Map(rows.map((r) => [getRowId(r), r]));
    const ordered = rowOrder.flatMap((id) => {
      const r = byId.get(id);
      return r ? [r] : [];
    });
    const known = new Set(rowOrder);
    // 新增的行追加到末尾
    return [...ordered, ...rows.filter((r) => !known.has(getRowId(r)))];
  }, [rows, rowOrder, enabled, getRowId]);

  const moveRow = useCallback(
    (fromId: DataGridRowId, toId: DataGridRowId) => {
      if (fromId === toId) return;
      const ids = reorderedRows.map(getRowId);
      const oldIndex = ids.indexOf(fromId);
      const newIndex = ids.indexOf(toId);
      if (oldIndex === -1 || newIndex === -1) return;
      ids.splice(oldIndex, 1);
      ids.splice(newIndex, 0, fromId);
      setRowOrder(ids);
      onRowOrderChange?.({ oldIndex, newIndex });
    },
    [reorderedRows, getRowId, onRowOrderChange],
  );

  const reset = useCallback(() => {
    setDraggingId(null);
    setDropTargetId(null);
  }, []);

  const getRowHandleProps = useCallback(
    (rowId: DataGridRowId): RowHandleProps => ({
      draggable: true,
      onDragStart: (e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(ROW_DRAG_MIME, JSON.stringify(rowId));
        const tr = (e.currentTarget as HTMLElement).closest('tr');
        if (tr) e.dataTransfer.setDragImage(tr, 16, tr.offsetHeight / 2);
        setDraggingId(rowId);
      },
      onDragEnd: reset,
    }),
    [reset],
  );

  const getRowDropProps = useCallback(
    (rowId: DataGridRowId): RowDropProps | null => {
      if (!enabled) return null;
      return {
        onDragOver: (e) => {
          if (!e.dataTransfer.types.includes(ROW_DRAG_MIME)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setDropTargetId(rowId);
        },
        onDragLeave: () => setDropTargetId((cur) => (cur === rowId ? null : cur)),
        onDrop: (e) => {
          const raw = e.dataTransfer.getData(ROW_DRAG_MIME);
          if (!raw) return;
          e.preventDefault();
          moveRow(JSON.parse(raw) as DataGridRowId, rowId);
          reset();
        },
      };
    },
    [enabled, moveRow, reset],
  );

  return { reorderedRows, draggingId, dropTargetId, moveRow, getRowDropProps, getRowHandleProps };
}
