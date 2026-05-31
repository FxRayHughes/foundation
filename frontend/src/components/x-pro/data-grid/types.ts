import type { DataGridProps, GridColDef, GridRowModel, GridFilterModel } from '@mui/x-data-grid';
import type { ReactNode } from 'react';

export interface PinnedColumns {
  left?: string[];
  right?: string[];
}

export interface PinnedRows {
  top?: GridRowModel[];
  bottom?: GridRowModel[];
}

export interface TreeDataConfig {
  getTreeDataPath: (row: GridRowModel) => string[];
  defaultGroupingExpansionDepth?: number;
  groupColDef?: Partial<GridColDef>;
}

export interface MasterDetailConfig {
  getDetailPanelContent: (row: GridRowModel) => ReactNode;
  getDetailPanelHeight?: (row: GridRowModel) => number | 'auto';
}

export interface LazyLoadingConfig {
  onFetchRows: (params: { startIndex: number; endIndex: number }) => void;
  rowCount: number;
  loading?: boolean;
}

export interface HeaderFilterConfig {
  enabled: boolean;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
}

export interface ClipboardPasteConfig {
  enabled: boolean;
  onPaste?: (data: string[][], startRow: number, startCol: number) => void;
}

export interface DataGridProProps extends Omit<DataGridProps, 'rows' | 'onColumnOrderChange'> {
  rows: GridRowModel[];
  pinnedColumns?: PinnedColumns;
  pinnedRows?: PinnedRows;
  treeData?: TreeDataConfig;
  masterDetail?: MasterDetailConfig;
  lazyLoading?: LazyLoadingConfig;
  headerFilters?: HeaderFilterConfig;
  clipboardPaste?: ClipboardPasteConfig;
  columnReordering?: boolean;
  rowReordering?: boolean;
  onColumnOrderChange?: (columns: string[]) => void;
  onRowOrderChange?: (params: { oldIndex: number; newIndex: number }) => void;
}
