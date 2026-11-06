import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import type { DataGridColumn, DataGridRow } from '../types';
import { fieldOf } from '../utils';

// 列拖拽重排（HTML5 DnD）。
// mantine-datatable 自带的列拖拽依赖 storeColumnsKey（localStorage 持久化），
// 违反项目"禁止 localStorage"铁律，所以这里自管顺序状态，表头标题渲染为可拖拽元素。

const COLUMN_DRAG_MIME = 'application/x-foundation-grid-column';

interface UseColumnReorderingParams<T extends DataGridRow> {
  columns: DataGridColumn<T>[];
  enabled?: boolean;
  onColumnOrderChange?: (fields: string[]) => void;
}

export interface ColumnDragProps {
  draggable: true;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export interface UseColumnReorderingResult<T extends DataGridRow> {
  reorderedColumns: DataGridColumn<T>[];
  draggingField: string | null;
  dropTargetField: string | null;
  /** 将 from 列移动到 to 列的位置 */
  moveColumn: (from: string, to: string) => void;
  /** 表头拖拽属性；未启用时返回 null */
  getColumnDragProps: (field: string) => ColumnDragProps | null;
}

export function useColumnReordering<T extends DataGridRow>({
  columns,
  enabled = false,
  onColumnOrderChange,
}: UseColumnReorderingParams<T>): UseColumnReorderingResult<T> {
  const [columnOrder, setColumnOrder] = useState<string[] | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dropTargetField, setDropTargetField] = useState<string | null>(null);

  const reorderedColumns = useMemo(() => {
    if (!enabled || !columnOrder) return columns;
    const colMap = new Map(columns.map((c) => [fieldOf(c), c]));
    const ordered = columnOrder.flatMap((f) => {
      const c = colMap.get(f);
      return c ? [c] : [];
    });
    const added = columns.filter((c) => !columnOrder.includes(fieldOf(c)));
    return [...ordered, ...added];
  }, [columns, columnOrder, enabled]);

  const moveColumn = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      const fields = reorderedColumns.map(fieldOf);
      const fromIdx = fields.indexOf(from);
      const toIdx = fields.indexOf(to);
      if (fromIdx === -1 || toIdx === -1) return;
      fields.splice(fromIdx, 1);
      fields.splice(toIdx, 0, from);
      setColumnOrder(fields);
      onColumnOrderChange?.(fields);
    },
    [reorderedColumns, onColumnOrderChange],
  );

  const reset = useCallback(() => {
    setDraggingField(null);
    setDropTargetField(null);
  }, []);

  const getColumnDragProps = useCallback(
    (field: string): ColumnDragProps | null => {
      if (!enabled) return null;
      return {
        draggable: true,
        onDragStart: (e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData(COLUMN_DRAG_MIME, field);
          setDraggingField(field);
        },
        onDragOver: (e) => {
          if (!e.dataTransfer.types.includes(COLUMN_DRAG_MIME)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setDropTargetField(field);
        },
        onDragLeave: () => {
          setDropTargetField((cur) => (cur === field ? null : cur));
        },
        onDrop: (e) => {
          const from = e.dataTransfer.getData(COLUMN_DRAG_MIME);
          if (!from) return;
          e.preventDefault();
          e.stopPropagation();
          moveColumn(from, field);
          reset();
        },
        onDragEnd: reset,
      };
    },
    [enabled, moveColumn, reset],
  );

  return { reorderedColumns, draggingField, dropTargetField, moveColumn, getColumnDragProps };
}
