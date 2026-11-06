import { useCallback, useEffect, useState } from 'react';
import { GreetService } from '@/services';
import { useTimeEvent } from '@/shared/hooks/useTimeEvent';
import { onChildResult, onChildClosed } from '@/services/childwindow';
import { ChildWindowService } from '@/services/childwindow/ChildWindowService';
import { SystrayService } from '@/services/systray';

export interface UseHomePageResult {
  name: string;
  setName: (value: string) => void;
  result: string | null;
  time: string;
  loading: boolean;
  error: string | null;
  greet: () => Promise<void>;
  openConfirm: () => Promise<void>;
  openMessage: () => Promise<void>;
  openBlank: () => Promise<void>;
  childResult: string | null;
  // 托盘开关：状态以后端为准（后端持久化到 SQLite，并在启动时恢复）
  systrayEnabled: boolean;
  systrayBusy: boolean;
  systrayError: string | null;
  toggleSystray: () => Promise<void>;
}

// HomePage ViewModel：
// - 不在这里持有"显示文案"，文案是 View 的责任（避免 hook 依赖 i18n context）
// - result 用 null 表示"还没调过后端"，View 据此选用本地化的默认提示
export const useHomePage = (): UseHomePageResult => {
  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [childResult, setChildResult] = useState<string | null>(null);
  const [systrayEnabled, setSystrayEnabled] = useState<boolean>(false);
  const [systrayBusy, setSystrayBusy] = useState<boolean>(false);
  const [systrayError, setSystrayError] = useState<string | null>(null);
  const time = useTimeEvent();

  const greet = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const value = await GreetService.greet(name.trim());
      setResult(value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [name]);

  const openConfirm = useCallback(async (): Promise<void> => {
    const id = await ChildWindowService.open({ type: 'confirm', title: 'Confirm', message: 'Are you sure you want to proceed?', width: 0, height: 0 });
    const cancelResult = onChildResult(id, (r) => {
      setChildResult(`confirm → ${r.action}`);
      cancelResult();
    });
    onChildClosed(id, () => cancelResult());
  }, []);

  const openMessage = useCallback(async (): Promise<void> => {
    const id = await ChildWindowService.open({ type: 'message', title: 'Info', message: 'Operation completed successfully.', width: 0, height: 0 });
    const cancelResult = onChildResult(id, (r) => {
      setChildResult(`message → ${r.action}`);
      cancelResult();
    });
    onChildClosed(id, () => cancelResult());
  }, []);

  const openBlank = useCallback(async (): Promise<void> => {
    await ChildWindowService.open({ type: 'blank', title: 'Blank Window', message: '', width: 500, height: 350 });
    setChildResult('blank → opened');
  }, []);

  // mount 时同步后端真实状态（上次会话启用过的托盘会被后端自动恢复）
  useEffect(() => {
    let cancelled = false;
    SystrayService.isEnabled()
      .then((enabled) => {
        if (!cancelled) setSystrayEnabled(enabled);
      })
      .catch(() => {
        // 后端未就绪：保持默认"未启用"
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSystray = useCallback(async (): Promise<void> => {
    setSystrayBusy(true);
    setSystrayError(null);
    try {
      if (systrayEnabled) {
        await SystrayService.disable();
      } else {
        await SystrayService.enable();
      }
    } catch (e: unknown) {
      setSystrayError(e instanceof Error ? e.message : String(e));
    } finally {
      // 无论成功与否都以后端状态为准（持久化失败时托盘可能已生效）
      try {
        setSystrayEnabled(await SystrayService.isEnabled());
      } catch {
        // ignore
      }
      setSystrayBusy(false);
    }
  }, [systrayEnabled]);

  return {
    name, setName, result, time, loading, error, greet,
    openConfirm, openMessage, openBlank, childResult,
    systrayEnabled, systrayBusy, systrayError, toggleSystray,
  };
};
