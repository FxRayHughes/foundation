// AppSettingsService：单行表 app_settings 的前端封装。
//
// 后端字段：themeChoice / customTheme(JSON 字符串) / localeChoice。
// customTheme 在前端 stringify / parse；其余按字符串透传。
import { Service as Binding } from '@bindings/foundation/internal/services/appsettings';

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
} as const;
