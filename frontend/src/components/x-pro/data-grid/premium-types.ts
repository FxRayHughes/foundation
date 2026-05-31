import type { DataGridProProps } from './types';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

export type CustomAggregationFn = (values: unknown[]) => unknown;

export type AggregationModel = Record<string, AggregationFunction | CustomAggregationFn>;

export interface RowGroupingModel {
  fields: string[];
  defaultExpansionDepth?: number;
}

export interface CellSelectionModel {
  ranges: CellRange[];
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
}

export interface RowGroupingResult {
  groupedRows: GridRowModel[];
  groupColumn: GridColDef | null;
  toggleGroup: (groupId: string) => void;
}

export interface AggregationResult {
  footerRow: GridRowModel | null;
}

export interface CellSelectionResult {
  cellSelectionModel: CellSelectionModel;
  onMouseDown: (rowIndex: number, colIndex: number) => void;
  onMouseMove: (rowIndex: number, colIndex: number) => void;
  onMouseUp: () => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  clearSelection: () => void;
}

export interface DataGridPremiumProps extends DataGridProProps {
  rowGroupingModel?: RowGroupingModel;
  aggregationModel?: AggregationModel;
  cellSelection?: boolean;
  onCellSelectionChange?: (model: CellSelectionModel) => void;
}
