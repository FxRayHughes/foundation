import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StorageService,
  type StorageStats,
  type TableInfo,
  type TableStats,
} from '@/services';

export type DatabaseStatus =
  | { kind: 'idle' }
  | { kind: 'changing' }
  | { kind: 'resetting' }
  | { kind: 'clearing'; tableName: string }
  | { kind: 'changed' }
  | { kind: 'reset' }
  | { kind: 'cleared'; tableName: string }
  | { kind: 'failed'; message: string };

export interface UseDatabaseResult {
  stats: StorageStats | null;
  tableStats: TableStats | null;
  status: DatabaseStatus;
  refresh: () => Promise<void>;
  changePath: (newPath: string) => Promise<void>;
  resetPath: () => Promise<void>;
  clearTable: (table: TableInfo) => Promise<void>;
}

// 数据库子页面 ViewModel：
//   - mount 同时拉 stats 与 tableStats
//   - changePath / resetPath / clearTable 走后端，期间 status 标当前操作
//   - 完成后再次刷新（路径变会让 tableStats 重算；清表只重算 tableStats 即可）
//   - 失败时把错误消息透给视图（业务方决定怎么展示）
export const useDatabase = (): UseDatabaseResult => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [tableStats, setTableStats] = useState<TableStats | null>(null);
  const [status, setStatus] = useState<DatabaseStatus>({ kind: 'idle' });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      // 并发拉两份；其中一份失败不影响另一份展示
      const [s, ts] = await Promise.allSettled([
        StorageService.getStats(),
        StorageService.getTableStats(),
      ]);
      if (!aliveRef.current) return;
      if (s.status === 'fulfilled') setStats(s.value);
      if (ts.status === 'fulfilled') setTableStats(ts.value);
    } catch {
      // 静默：保留上次成功值
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const changePath = useCallback(
    async (newPath: string): Promise<void> => {
      setStatus({ kind: 'changing' });
      try {
        await StorageService.setCustomPath(newPath);
        await refresh();
        if (!aliveRef.current) return;
        setStatus({ kind: 'changed' });
      } catch (err) {
        if (!aliveRef.current) return;
        setStatus({ kind: 'failed', message: getErrorMessage(err) });
      }
    },
    [refresh],
  );

  const resetPath = useCallback(async (): Promise<void> => {
    setStatus({ kind: 'resetting' });
    try {
      await StorageService.resetPath();
      await refresh();
      if (!aliveRef.current) return;
      setStatus({ kind: 'reset' });
    } catch (err) {
      if (!aliveRef.current) return;
      setStatus({ kind: 'failed', message: getErrorMessage(err) });
    }
  }, [refresh]);

  const clearTable = useCallback(
    async (table: TableInfo): Promise<void> => {
      if (!table.clearable) return;
      setStatus({ kind: 'clearing', tableName: table.name });
      try {
        await StorageService.clearTable(table.name);
        // 清表只刷 tableStats，path / 总文件大小由 SQLite 自己回收（非阻塞）
        await refresh();
        if (!aliveRef.current) return;
        setStatus({ kind: 'cleared', tableName: table.name });
      } catch (err) {
        if (!aliveRef.current) return;
        setStatus({ kind: 'failed', message: getErrorMessage(err) });
      }
    },
    [refresh],
  );

  return { stats, tableStats, status, refresh, changePath, resetPath, clearTable };
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};
