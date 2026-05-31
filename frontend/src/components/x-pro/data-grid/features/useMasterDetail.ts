import { useState, useCallback, useMemo } from 'react';
import type { GridRowModel, GridColDef } from '@mui/x-data-grid';
import type { ReactNode } from 'react';
import type { MasterDetailConfig } from '../types';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import { createElement } from 'react';
import { IconButton, Box } from '@mui/material';

interface UseMasterDetailParams {
  rows: GridRowModel[];
  config?: MasterDetailConfig;
  getRowId?: (row: GridRowModel) => string | number;
}

interface DetailRow extends GridRowModel {
  __isDetailRow: true;
  __parentId: string | number;
  __detailContent: ReactNode;
  __detailHeight: number | 'auto';
}

interface UseMasterDetailResult {
  processedRows: GridRowModel[];
  expandColumn: GridColDef | null;
  isDetailRow: (row: GridRowModel) => boolean;
}

export function useMasterDetail({
  rows,
  config,
  getRowId = (row) => row.id,
}: UseMasterDetailParams): UseMasterDetailResult {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

  const toggleExpand = useCallback((id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const processedRows = useMemo(() => {
    if (!config) return rows;
    const result: GridRowModel[] = [];
    for (const row of rows) {
      result.push(row);
      const id = getRowId(row);
      if (expandedIds.has(id)) {
        const detailRow: DetailRow = {
          id: `__detail_${id}`,
          __isDetailRow: true,
          __parentId: id,
          __detailContent: config.getDetailPanelContent(row),
          __detailHeight: config.getDetailPanelHeight?.(row) ?? 'auto',
        };
        result.push(detailRow);
      }
    }
    return result;
  }, [rows, config, expandedIds, getRowId]);

  const expandColumn: GridColDef | null = useMemo(() => {
    if (!config) return null;
    return {
      field: '__expand__',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        if (params.row.__isDetailRow) return null;
        const id = getRowId(params.row);
        const isExpanded = expandedIds.has(id);
        return createElement(
          IconButton,
          { size: 'small', onClick: () => toggleExpand(id) },
          createElement(isExpanded ? ExpandLessRounded : ExpandMoreRounded, { fontSize: 'small' }),
        );
      },
    };
  }, [config, expandedIds, getRowId, toggleExpand]);

  const isDetailRow = useCallback(
    (row: GridRowModel) => row.__isDetailRow === true,
    [],
  );

  return { processedRows, expandColumn, isDetailRow };
}

export function DetailPanelCell({ row }: { row: GridRowModel }) {
  if (!row.__isDetailRow) return null;
  return createElement(
    Box,
    { sx: { p: 2, width: '100%' } },
    (row as DetailRow).__detailContent,
  );
}
