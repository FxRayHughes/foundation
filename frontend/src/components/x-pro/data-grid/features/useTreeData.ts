import { useState, useCallback, useMemo } from 'react';
import type { GridRowModel, GridColDef } from '@mui/x-data-grid';
import type { TreeDataConfig } from '../types';
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRounded from '@mui/icons-material/UnfoldLessRounded';
import { createElement } from 'react';
import { Box, IconButton } from '@mui/material';

interface TreeNode {
  row: GridRowModel;
  path: string[];
  depth: number;
  hasChildren: boolean;
  key: string;
}

interface UseTreeDataParams {
  rows: GridRowModel[];
  config?: TreeDataConfig;
}

interface UseTreeDataResult {
  flattenedRows: GridRowModel[];
  groupColumn: GridColDef | null;
  isTreeActive: boolean;
}

export function useTreeData({ rows, config }: UseTreeDataParams): UseTreeDataResult {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const tree = useMemo(() => {
    if (!config) return null;
    const { getTreeDataPath, defaultGroupingExpansionDepth = 0 } = config;
    const nodes: TreeNode[] = [];
    const childrenMap = new Map<string, boolean>();

    for (const row of rows) {
      const path = getTreeDataPath(row);
      const key = path.join('/');
      nodes.push({ row, path, depth: path.length - 1, hasChildren: false, key });
      if (path.length > 1) {
        const parentKey = path.slice(0, -1).join('/');
        childrenMap.set(parentKey, true);
      }
    }

    for (const node of nodes) {
      node.hasChildren = childrenMap.has(node.key);
    }

    if (defaultGroupingExpansionDepth > 0) {
      const autoExpand = new Set<string>();
      for (const node of nodes) {
        if (node.hasChildren && node.depth < defaultGroupingExpansionDepth) {
          autoExpand.add(node.key);
        }
      }
      setExpandedKeys(autoExpand);
    }

    return nodes;
  }, [config, rows]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const flattenedRows = useMemo(() => {
    if (!tree) return rows;
    const result: GridRowModel[] = [];
    for (const node of tree) {
      const parentKey = node.path.slice(0, -1).join('/');
      const isVisible =
        node.depth === 0 ||
        (parentKey && expandedKeys.has(parentKey));
      if (isVisible) {
        result.push({ ...node.row, __treeDepth: node.depth, __treeKey: node.key, __hasChildren: node.hasChildren });
      }
    }
    return result;
  }, [tree, rows, expandedKeys]);

  const groupColumn: GridColDef | null = useMemo(() => {
    if (!config) return null;
    return {
      field: '__tree_group__',
      headerName: config.groupColDef?.headerName ?? '',
      width: config.groupColDef?.width ?? 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const depth = (params.row.__treeDepth as number) ?? 0;
        const hasChildren = params.row.__hasChildren as boolean;
        const key = params.row.__treeKey as string;
        const isExpanded = expandedKeys.has(key);
        const path = config.getTreeDataPath(params.row);
        const label = path[path.length - 1] ?? '';

        return createElement(
          Box,
          { sx: { display: 'flex', alignItems: 'center', pl: depth * 2 } },
          hasChildren
            ? createElement(
                IconButton,
                { size: 'small', onClick: () => toggleExpand(key) },
                createElement(isExpanded ? UnfoldLessRounded : UnfoldMoreRounded, { fontSize: 'small' }),
              )
            : createElement(Box, { sx: { width: 28 } }),
          label,
        );
      },
    };
  }, [config, expandedKeys, toggleExpand]);

  return { flattenedRows, groupColumn, isTreeActive: !!config };
}
