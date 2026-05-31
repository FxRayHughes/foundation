import { useState, useMemo, useCallback } from 'react';
import type { GridRowModel, GridColDef } from '@mui/x-data-grid';
import type { RowGroupingModel, RowGroupingResult } from '../premium-types';

interface UseRowGroupingParams {
  rows: GridRowModel[];
  rowGroupingModel?: RowGroupingModel;
}

const GROUP_ROW_PREFIX = '__group__';

export function useRowGrouping({ rows, rowGroupingModel }: UseRowGroupingParams): RowGroupingResult {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const { groupedRows, groupColumn } = useMemo(() => {
    if (!rowGroupingModel || rowGroupingModel.fields.length === 0) {
      return { groupedRows: rows, groupColumn: null };
    }

    const fields = rowGroupingModel.fields;
    const defaultDepth = rowGroupingModel.defaultExpansionDepth ?? 0;
    const groups = new Map<string, GridRowModel[]>();

    for (const row of rows) {
      const key = fields.map((f) => String(row[f] ?? '')).join(' / ');
      const existing = groups.get(key);
      if (existing) {
        existing.push(row);
      } else {
        groups.set(key, [row]);
      }
    }

    const result: GridRowModel[] = [];
    for (const [key, groupRows] of groups) {
      const groupId = `${GROUP_ROW_PREFIX}${key}`;
      const isExpanded = expandedGroups.has(groupId) || defaultDepth > 0;

      result.push({
        id: groupId,
        __isGroupRow: true,
        __groupKey: key,
        __groupCount: groupRows.length,
        __isExpanded: isExpanded,
      });

      if (isExpanded) {
        result.push(...groupRows);
      }
    }

    const col: GridColDef = {
      field: '__group__',
      headerName: 'Group',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        if (!row.__isGroupRow) return null;
        const icon = row.__isExpanded ? '▼' : '▶';
        return `${icon} ${row.__groupKey} (${row.__groupCount})`;
      },
    };

    return { groupedRows: result, groupColumn: col };
  }, [rows, rowGroupingModel, expandedGroups]);

  return { groupedRows, groupColumn, toggleGroup };
}
