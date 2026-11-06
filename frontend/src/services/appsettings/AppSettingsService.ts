// AppSettingsService：单行表 app_settings 的前端封装。
//
// 后端字段：themeChoice / customTheme(JSON 字符串) / localeChoice。
// customTheme 在前端 stringify / parse；其余按字符串透传。
import { Events } from '@wailsio/runtime';
import { Service as Binding } from '@bindings/foundation/internal/services/appsettings';

export type AppSettingsField = 'themeChoice' | 'customTheme' | 'localeChoice';

export interface AppSettingsSnapshot {
  themeChoice: string;
  customTheme: string; // JSON: { mode, palette }；空字符串=未设置
  localeChoice: string;
}

export const AppSettingsService = {
  async get(): Promise<AppSettingsSnapshot> {
    const snap = await Binding.Get();
    return {
      themeChoice: snap.themeChoice ?? '',
      customTheme: snap.customTheme ?? '',
      localeChoice: snap.localeChoice ?? '',
    };
  },

  async setThemeChoice(choice: string): Promise<void> {
    await Binding.SetThemeChoice(choice);
  },

  // value 传 null/undefined 等价于清空。
  async setCustomTheme(value: unknown): Promise<void> {
    if (value === null || value === undefined) {
      await Binding.SetCustomTheme('');
      return;
    }
    await Binding.SetCustomTheme(JSON.stringify(value));
  },

  async resetCustomTheme(): Promise<void> {
    await Binding.ResetCustomTheme();
  },

  async setLocaleChoice(choice: string): Promise<void> {
    await Binding.SetLocaleChoice(choice);
  },

  // 订阅"设置已变更"广播（后端任一 setter 写成功后对所有窗口 Emit appsettings:changed）。
  // 托盘面板 / 子窗口 / 主窗口据此重新 get()，实现主题、语言跨窗口实时同步。返回取消订阅函数。
  onChanged(callback: (field: AppSettingsField) => void): () => void {
    return Events.On('appsettings:changed', (event) => {
      callback(event.data as AppSettingsField);
    });
  },
} as const;
