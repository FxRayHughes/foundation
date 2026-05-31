import { useState, useCallback, useRef } from 'react';
import type { CellSelectionModel, CellRange, CellSelectionResult } from '../premium-types';

interface UseCellSelectionParams {
  enabled?: boolean;
  onChange?: (model: CellSelectionModel) => void;
}

export function useCellSelection({ enabled, onChange }: UseCellSelectionParams): CellSelectionResult {
  const [cellSelectionModel, setCellSelectionModel] = useState<CellSelectionModel>({ ranges: [] });
  const isDragging = useRef(false);
  const startCell = useRef<{ row: number; col: number } | null>(null);

  const updateModel = useCallback((ranges: CellRange[]) => {
    const model: CellSelectionModel = { ranges };
    setCellSelectionModel(model);
    onChange?.(model);
  }, [onChange]);

  const onMouseDown = useCallback((rowIndex: number, colIndex: number) => {
    if (!enabled) return;
    isDragging.current = true;
    startCell.current = { row: rowIndex, col: colIndex };
    updateModel([{ startRow: rowIndex, startCol: colIndex, endRow: rowIndex, endCol: colIndex }]);
  }, [enabled, updateModel]);

  const onMouseMove = useCallback((rowIndex: number, colIndex: number) => {
    if (!enabled || !isDragging.current || !startCell.current) return;
    const { row: sr, col: sc } = startCell.current;
    updateModel([{
      startRow: Math.min(sr, rowIndex),
      startCol: Math.min(sc, colIndex),
      endRow: Math.max(sr, rowIndex),
      endCol: Math.max(sc, colIndex),
    }]);
  }, [enabled, updateModel]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const isCellSelected = useCallback((rowIndex: number, colIndex: number): boolean => {
    return cellSelectionModel.ranges.some((r) =>
      rowIndex >= r.startRow && rowIndex <= r.endRow &&
      colIndex >= r.startCol && colIndex <= r.endCol
    );
  }, [cellSelectionModel]);

  const clearSelection = useCallback(() => {
    updateModel([]);
  }, [updateModel]);

  return { cellSelectionModel, onMouseDown, onMouseMove, onMouseUp, isCellSelected, clearSelection };
}
