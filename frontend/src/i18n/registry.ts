import type { Locale, LocaleCode, Messages } from './types';

// 深合并 messages：相同路径上的字符串后者覆盖前者，对象会递归合并。
// 仅对"普通对象"递归；遇到字符串就直接覆盖。
const deepMergeMessages = (target: Messages, patch: Messages): Messages => {
  const out: Messages = { ...target };
  for (const k of Object.keys(patch)) {
    const a = out[k];
    const b = patch[k];
    if (
      typeof a === 'object' && a !== null &&
      typeof b === 'object' && b !== null
    ) {
      out[k] = deepMergeMessages(a as Messages, b as Messages);
    } else if (b !== undefined) {
      out[k] = b;
    }
  }
  return out;
};

// 语言注册中心：单例。运行时所有可用 locale 都从这里取。
// 设计与 themeRegistry 完全对齐：register / get / has / list / subscribe，
// 额外提供 extend —— 让页面级语言包能往已注册 locale 上深合并自己的命名空间。
class LocaleRegistry {
  private locales = new Map<LocaleCode, Locale>();
  private defaultCode: LocaleCode | null = null;
  private listeners = new Set<() => void>();

  register(locale: Locale, options: { default?: boolean } = {}): void {
    const existing = this.locales.get(locale.code);
    // 同 code 二次注册：保留已合并的 messages，仅覆盖元数据
    const merged: Locale = existing
      ? { ...locale, messages: deepMergeMessages(existing.messages, locale.messages) }
      : locale;
    this.locales.set(locale.code, merged);
    if (options.default || this.defaultCode === null) {
      this.defaultCode = locale.code;
    }
    this.listeners.forEach((fn) => fn());
  }

  // 页面级语言包入口：往已注册的 locale 合并一份子树。
  // 找不到 code 时静默忽略（启动顺序错乱时也不挂应用），订阅者照样不通知。
  // 用法：
  //   registerHomePageLocales = () => {
  //     localeRegistry.extend('zh-CN', { home: { hero: '...' } });
  //     localeRegistry.extend('en-US', { home: { hero: '...' } });
  //   };
  extend(code: LocaleCode, patch: Messages): void {
    const existing = this.locales.get(code);
    if (!existing) return;
    this.locales.set(code, {
      ...existing,
      messages: deepMergeMessages(existing.messages, patch),
    });
    this.listeners.forEach((fn) => fn());
  }

  unregister(code: LocaleCode): void {
    if (this.defaultCode === code) {
      throw new Error(`Cannot unregister default locale "${code}"`);
    }
    this.locales.delete(code);
    this.listeners.forEach((fn) => fn());
  }

  get(code: LocaleCode): Locale {
    const locale = this.locales.get(code);
    if (!locale) {
      throw new Error(`Locale "${code}" is not registered`);
    }
    return locale;
  }

  has(code: LocaleCode): boolean {
    return this.locales.has(code);
  }

  list(): Locale[] {
    return [...this.locales.values()];
  }

  defaultLocaleCode(): LocaleCode {
    if (this.defaultCode === null) {
      throw new Error('No default locale has been registered');
    }
    return this.defaultCode;
  }

  // 订阅注册表变更，主要供 I18nProvider 在 hot-reload / 业务方动态注册时刷新
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const localeRegistry = new LocaleRegistry();
