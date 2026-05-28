import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PreferencesService } from '@/services';
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  type PreferencesContextValue,
} from './types';

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

// 偏好持久化层（SQLite 后端）：
//
// 启动期 fallback 链：
//   1. mount 时立即用 DEFAULT_PREFERENCES 渲染（避免首屏阻塞）
//   2. 异步 PreferencesService.list() 拉取后端值，与默认值合并后再次提交
//   3. setPreference 走后端写入；写失败时 UI 不回滚（业务方可加 toast）
//
// 设计选择：不引入 loading 状态对外暴露。原因——
//   - 默认值就是合理的初值，UI 用默认值不会出错
//   - 加 loading 反而让所有消费者都要写"loading 中显示骨架"的样板代码
//   - 真正需要"等到后端值就位"的页面，可以用骨架屏盖住整段（已有机制）
export interface PreferencesProviderProps {
  children: ReactNode;
  // 可选：注入初始值（测试场景）
  initial?: Partial<Preferences>;
}

const isPreferenceKey = (key: string): key is keyof Preferences =>
  Object.prototype.hasOwnProperty.call(DEFAULT_PREFERENCES, key);

const mergeWithDefaults = (incoming: Record<string, unknown>): Preferences => {
  const next: Preferences = { ...DEFAULT_PREFERENCES };
  const target = next as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(incoming)) {
    if (!isPreferenceKey(k)) continue;
    // 类型校验：不接受与默认值类型不一致的值
    if (typeof v !== typeof DEFAULT_PREFERENCES[k]) continue;
    target[k] = v;
  }
  return next;
};

export const PreferencesProvider = ({ children, initial }: PreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...DEFAULT_PREFERENCES,
    ...initial,
  }));
  // 防止已 unmount 后再 setState
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // mount 拉取一次后端值
  useEffect(() => {
    let cancelled = false;
    PreferencesService.list()
      .then((data) => {
        if (cancelled || !aliveRef.current) return;
        setPreferences(mergeWithDefaults(data));
      })
      .catch(() => {
        // 后端未就绪 / 网络异常 —— 保持默认值，不阻断 UI
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]): void => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      void PreferencesService.set(key, value).catch(() => {
        // 写失败：不回滚 UI，避免视觉抖动；上层可以监听异常加 toast
      });
    },
    [],
  );

  const reset = useCallback((): void => {
    setPreferences(DEFAULT_PREFERENCES);
    void PreferencesService.reset().catch(() => {
      // 同上
    });
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, setPreference, reset }),
    [preferences, setPreference, reset],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used inside <PreferencesProvider>');
  }
  return ctx;
};
