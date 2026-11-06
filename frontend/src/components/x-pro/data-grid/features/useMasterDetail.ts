import { useCallback, useState } from 'react';
import type { DataGridRow, MasterDetailConfig } from '../types';

// 主从明细：维护展开的记录 key 集合；实际渲染走 mantine-datatable 原生 rowExpansion
// （受控 expanded + trigger 'never'，由展开列里的按钮切换，见 useDataGridPro）。

interface UseMasterDetailParams<T extends DataGridRow> {
  config?: MasterDetailConfig<T>;
}

export interface UseMasterDetailResult {
  isActive: boolean;
  expandedKeys: string[];
  setExpandedKeys: (keys: unknown[]) => void;
  isExpanded: (key: string) => boolean;
  toggleExpand: (key: string) => void;
}

export function useMasterDetail<T extends DataGridRow>({
  config,
}: UseMasterDetailParams<T>): UseMasterDetailResult {
  const [expandedKeys, setKeys] = useState<string[]>([]);

  const toggleExpand = useCallback((key: string) => {
    setKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const isExpanded = useCallback((key: string) => expandedKeys.includes(key), [expandedKeys]);

  const setExpandedKeys = useCallback((keys: unknown[]) => setKeys(keys.map(String)), []);

  return { isActive: !!config, expandedKeys, setExpandedKeys, isExpanded, toggleExpand };
}
