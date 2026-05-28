import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
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
import { AppSettingsService } from '@/services';
import { buildMuiTheme } from './buildMuiTheme';
import {
  hydrateCustomTheme,
  parseStoredCustomTheme,
  unregisterCustomTheme,
} from './customTheme';
import { themeRegistry } from './registry';
import type { FoundationThemePreset } from './types';

// 用户对主题的"选择"：
// - 'system'：跟随操作系统（prefers-color-scheme）
// - 其它：具体的 preset name（如 'foundation-light'）
export type ThemeChoice = 'system' | (string & {});

interface ThemeContextValue {
  current: FoundationThemePreset;     // 当前实际生效的预设
  choice: ThemeChoice;                // 用户的选择（含 'system'）
  available: FoundationThemePreset[]; // 已注册的全部预设
  setChoice: (choice: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 跟随系统时使用的 light/dark 预设名。
// 注册名固定，业务方不应改这两个 id；如要改默认跟随结果，注册新预设并在这里替换。
const SYSTEM_LIGHT_NAME = 'foundation-light';
const SYSTEM_DARK_NAME = 'foundation-dark';

const matchPrefersDark = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export interface FoundationThemeProviderProps {
  children: ReactNode;
  // 初始选择；默认 'system'，启动后会被 AppSettingsService 读到的值覆盖
  initialChoice?: ThemeChoice;
}

// ThemeProvider（异步持久化）：
//
// 时序：
//   1) mount 用 'system' 初值渲染（不阻塞首屏）
//   2) AppSettingsService.get() 异步拉取
//      - customTheme JSON 校验通过 → hydrate 到 registry
//      - themeChoice 校验通过 → setChoice
//   3) 后续 setChoice 同步走后端，写失败不回滚 UI
export const FoundationThemeProvider = ({ children, initialChoice }: FoundationThemeProviderProps) => {
  const [choice, setChoiceState] = useState<ThemeChoice>(initialChoice ?? 'system');
  const [systemDark, setSystemDark] = useState<boolean>(matchPrefersDark);
  const [version, setVersion] = useState(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // 订阅 themeRegistry：注册新预设时刷新可选列表
  useEffect(() => {
    return themeRegistry.subscribe(() => setVersion((v) => v + 1));
  }, []);

  // 订阅系统配色变化（用户切系统主题时实时跟随）
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // mount 拉后端：先 hydrate 自定义主题（保证 setChoice 时它已注册），再切 choice
  useEffect(() => {
    let cancelled = false;
    AppSettingsService.get()
      .then((snap) => {
        if (cancelled || !aliveRef.current) return;
        // 1) hydrate custom theme
        const custom = parseStoredCustomTheme(snap.customTheme);
        if (custom) {
          hydrateCustomTheme(custom);
        }
        // 2) 应用 themeChoice：必须是 'system' 或已注册的预设
        const next = snap.themeChoice;
        if (next === 'system' || (next && themeRegistry.has(next))) {
          setChoiceState(next);
        }
      })
      .catch(() => {
        // 后端未就绪 / 网络异常 —— 保持 'system' 默认
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const preset = useMemo<FoundationThemePreset>(() => {
    if (choice === 'system') {
      const target = systemDark ? SYSTEM_DARK_NAME : SYSTEM_LIGHT_NAME;
      return themeRegistry.has(target)
        ? themeRegistry.get(target)
        : themeRegistry.get(themeRegistry.defaultPresetName());
    }
    return themeRegistry.has(choice)
      ? themeRegistry.get(choice)
      : themeRegistry.get(themeRegistry.defaultPresetName());
    // version 触发：注册表变更后重算
  }, [choice, systemDark, version]);

  const muiTheme = useMemo(() => buildMuiTheme(preset), [preset]);

  const setChoice = useCallback((next: ThemeChoice) => {
    if (next !== 'system' && !themeRegistry.has(next)) {
      throw new Error(`Theme "${next}" is not registered`);
    }
    setChoiceState(next);
    void AppSettingsService.setThemeChoice(next).catch(() => {
      // 写失败：保持 UI，业务方可加 toast
    });
  }, []);

  const ctx = useMemo<ThemeContextValue>(
    () => ({
      current: preset,
      choice,
      available: themeRegistry.list(),
      setChoice,
    }),
    [preset, choice, setChoice, version],
  );

  return (
    <ThemeContext.Provider value={ctx}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useFoundationTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useFoundationTheme must be used inside <FoundationThemeProvider>');
  }
  return ctx;
};

// 暴露给 useSettingsPage 在删除自定义主题时同步清理 registry。
// 仅 Provider 内 / 设置页 ViewModel 使用，业务组件不要调。
export { unregisterCustomTheme };
