import { useCallback, useMemo, useState } from 'react';
import type { DataGridRecord } from '../premium-types';
import type { DataGridRow, DataGridRowId, TreeDataConfig } from '../types';

// 树形数据：按 getTreeDataPath 构建层级，深度优先展开为显示记录。
// 展开状态 = "默认展开深度" XOR "用户切换过"，避免在 render 中 setState。
// 父节点被筛掉时，子节点作为根节点显示（保持缩进），不会丢数据。

interface UseTreeDataParams<T extends DataGridRow> {
  rows: T[];
  config?: TreeDataConfig<T>;
  getRowId: (row: T) => DataGridRowId;
}

export interface UseTreeDataResult<T extends DataGridRow> {
  isTreeActive: boolean;
  /** 已按层级展开的显示记录（未启用时为 null） */
  treeRecords: DataGridRecord<T>[] | null;
  toggleExpand: (treeKey: string) => void;
}

interface TreeNode<T> {
  row: T;
  path: string[];
  key: string;
  children: TreeNode<T>[];
}

export function useTreeData<T extends DataGridRow>({
  rows,
  config,
  getRowId,
}: UseTreeDataParams<T>): UseTreeDataResult<T> {
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());

  const toggleExpand = useCallback((key: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const roots = useMemo(() => {
    if (!config) return null;
    const nodes = new Map<string, TreeNode<T>>();
    const ordered: TreeNode<T>[] = [];
    for (const row of rows) {
      const path = config.getTreeDataPath(row);
      const node: TreeNode<T> = { row, path, key: path.join('/'), children: [] };
      nodes.set(node.key, node);
      ordered.push(node);
    }
    const result: TreeNode<T>[] = [];
    for (const node of ordered) {
      const parent = node.path.length > 1 ? nodes.get(node.path.slice(0, -1).join('/')) : undefined;
      if (parent) parent.children.push(node);
      else result.push(node);
    }
    return result;
  }, [rows, config]);

  const treeRecords = useMemo(() => {
    if (!config || !roots) return null;
    const defaultDepth = config.defaultGroupingExpansionDepth ?? 0;
    const out: DataGridRecord<T>[] = [];
    const walk = (node: TreeNode<T>) => {
      const depth = node.path.length - 1;
      const hasChildren = node.children.length > 0;
      const expanded = hasChildren && (depth < defaultDepth) !== toggled.has(node.key);
      const rowId = getRowId(node.row);
      out.push({
        key: `row:${String(rowId)}`,
        kind: 'row',
        row: node.row,
        rowId,
        depth,
        treeKey: node.key,
        treeLabel: node.path[node.path.length - 1] ?? '',
        hasChildren,
        expanded,
      });
      if (expanded) node.children.forEach(walk);
    };
    roots.forEach(walk);
    return out;
  }, [config, roots, toggled, getRowId]);

  return { isTreeActive: !!config, treeRecords, toggleExpand };
}
