import { useCallback, useEffect, useRef, useState } from 'react';
import type { CellRange, CellSelectionModel, CellSelectionResult } from '../premium-types';

// 单元格范围选择：按下开始、拖动扩展、松开结束；Shift+点击从锚点扩展。
// 行 / 列索引均为"当前显示顺序"中的数据行 / 数据列索引。

interface UseCellSelectionParams {
  enabled?: boolean;
  onChange?: (model: CellSelectionModel) => void;
}

export function useCellSelection({ enabled, onChange }: UseCellSelectionParams): CellSelectionResult {
  const [cellSelectionModel, setCellSelectionModel] = useState<CellSelectionModel>({ ranges: [] });
  const isDragging = useRef(false);
  const startCell = useRef<{ row: number; col: number } | null>(null);

  const updateModel = useCallback(
    (ranges: CellRange[]) => {
      const model: CellSelectionModel = { ranges };
      setCellSelectionModel(model);
      onChange?.(model);
    },
    [onChange],
  );

  const rangeFrom = (a: { row: number; col: number }, rowIndex: number, colIndex: number): CellRange => ({
    startRow: Math.min(a.row, rowIndex),
    startCol: Math.min(a.col, colIndex),
    endRow: Math.max(a.row, rowIndex),
    endCol: Math.max(a.col, colIndex),
  });

  const onMouseDown = useCallback(
    (rowIndex: number, colIndex: number, extend = false) => {
      if (!enabled) return;
      isDragging.current = true;
      if (extend && startCell.current) {
        updateModel([rangeFrom(startCell.current, rowIndex, colIndex)]);
        return;
      }
      startCell.current = { row: rowIndex, col: colIndex };
      updateModel([{ startRow: rowIndex, startCol: colIndex, endRow: rowIndex, endCol: colIndex }]);
    },
    [enabled, updateModel],
  );

  const onMouseMove = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!enabled || !isDragging.current || !startCell.current) return;
      updateModel([rangeFrom(startCell.current, rowIndex, colIndex)]);
    },
    [enabled, updateModel],
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // 鼠标在表格外松开也要结束拖选
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [enabled, onMouseUp]);

  const isCellSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean =>
      cellSelectionModel.ranges.some(
        (r) => rowIndex >= r.startRow && rowIndex <= r.endRow && colIndex >= r.startCol && colIndex <= r.endCol,
      ),
    [cellSelectionModel],
  );

  const clearSelection = useCallback(() => {
    startCell.current = null;
    updateModel([]);
  }, [updateModel]);

  return { cellSelectionModel, onMouseDown, onMouseMove, onMouseUp, isCellSelected, clearSelection };
}
