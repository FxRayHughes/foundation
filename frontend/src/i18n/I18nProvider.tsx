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
import { localeRegistry } from './registry';
import type {
  I18nContextValue,
  Locale,
  LocaleCode,
  Messages,
  TranslationVars,
} from './types';

const I18nContext = createContext<I18nContextValue | null>(null);

type Choice = 'auto' | LocaleCode;

// 取浏览器语言偏好；按 navigator.languages 顺序匹配已注册 locale。
// 找不到时返回 null（调用方 fallback 到 default）。
const detectBrowserLocale = (): LocaleCode | null => {
  if (typeof window === 'undefined' || !window.navigator) return null;
  const candidates: string[] = [
    ...(window.navigator.languages ?? []),
    window.navigator.language,
  ].filter(Boolean) as string[];

  for (const cand of candidates) {
    if (localeRegistry.has(cand)) return cand;
    // 同语言不同区域兜底：'zh' 命中 'zh-CN' / 'zh-Hans-CN' / 'zh-TW'
    const prefix = cand.split('-')[0];
    if (!prefix) continue;
    const match = localeRegistry.list().find((l) => l.code.toLowerCase().startsWith(`${prefix.toLowerCase()}-`));
    if (match) return match.code;
  }
  return null;
};

// 按点路径取值，返回字符串或 undefined
const lookup = (messages: Messages, key: string): string | undefined => {
  const segs = key.split('.');
  let node: string | Messages | undefined = messages;
  for (const s of segs) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Messages)[s];
  }
  return typeof node === 'string' ? node : undefined;
};

// 模板插值：'Hello {{name}}, you have {{n}} mails' + { name: 'Ada', n: 3 }
const interpolate = (template: string, vars?: TranslationVars): string => {
  if (!vars) return template;
  return template.replace(/\{\{\s*([\w$.]+)\s*\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      const v = vars[key];
      return v === undefined || v === null ? '' : String(v);
    }
    return match; // 找不到变量保留原占位，便于发现遗漏
  });
};

export interface I18nProviderProps {
  children: ReactNode;
  // 可选：注入初始选择（测试 / SSR 场景）
  initialChoice?: Choice;
}

// I18nProvider（异步持久化）：
//
// 时序：
//   1) mount 用 'auto' 初值渲染（首屏自动检测浏览器语言）
//   2) AppSettingsService.get() 异步拉取 localeChoice
//      - 校验通过且非 'auto'：覆盖到 setChoice
//      - 'auto' 或缺失：保持检测结果
//   3) setChoice 同步走后端
export const I18nProvider = ({ children, initialChoice }: I18nProviderProps) => {
  const [choice, setChoiceState] = useState<Choice>(initialChoice ?? 'auto');
  const [version, setVersion] = useState(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    return localeRegistry.subscribe(() => setVersion((v) => v + 1));
  }, []);

  // mount 拉后端
  useEffect(() => {
    let cancelled = false;
    AppSettingsService.get()
      .then((snap) => {
        if (cancelled || !aliveRef.current) return;
        const next = snap.localeChoice;
        if (!next) return;
        if (next === 'auto' || localeRegistry.has(next)) {
          setChoiceState(next as Choice);
        }
      })
      .catch(() => {
        // 后端未就绪 —— 保持 'auto'
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo<Locale>(() => {
    if (choice === 'auto') {
      const detected = detectBrowserLocale();
      const code = detected ?? localeRegistry.defaultLocaleCode();
      return localeRegistry.get(code);
    }
    if (localeRegistry.has(choice)) return localeRegistry.get(choice);
    return localeRegistry.get(localeRegistry.defaultLocaleCode());
    // version 触发：注册表变更后重算
  }, [choice, version]);

  const setChoice = useCallback((next: Choice): void => {
    if (next !== 'auto' && !localeRegistry.has(next)) {
      throw new Error(`Locale "${next}" is not registered`);
    }
    setChoiceState(next);
    void AppSettingsService.setLocaleChoice(next).catch(() => {
      // 写失败：保持 UI
    });
  }, []);

  const t = useCallback(
    (key: string, vars?: TranslationVars): string => {
      const direct = lookup(current.messages, key);
      if (direct !== undefined) return interpolate(direct, vars);

      // 当前 locale 缺失 → 回退默认 locale
      const defaultLocale = localeRegistry.get(localeRegistry.defaultLocaleCode());
      const fallback = lookup(defaultLocale.messages, key);
      if (fallback !== undefined) return interpolate(fallback, vars);

      // 都缺失 → 返回 key 本身（便于发现遗漏）
      return key;
    },
    [current],
  );

  const ctx = useMemo<I18nContextValue>(
    () => ({
      current,
      available: localeRegistry.list(),
      choice,
      setChoice,
      t,
    }),
    [current, choice, setChoice, t, version],
  );

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
};

// 便捷 hook：只取 t 函数；多数组件不需要 setChoice / available
export const useT = (): I18nContextValue['t'] => useI18n().t;
