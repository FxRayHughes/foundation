// 主题系统对外出口。
//  - registerFoundationThemes()：把内置预设挂到 themeRegistry。App 启动时调用一次。
//  - 类型 / Provider / Hook 全部从这里导出，组件层不要直接引用子文件。
import { themeRegistry } from './registry';
import { lightPreset } from './presets/light';
import { darkPreset } from './presets/dark';
import { obsidianPreset } from './presets/obsidian';

let registered = false;

export const registerFoundationThemes = (): void => {
  if (registered) return;
  themeRegistry.register(lightPreset, { default: true });
  themeRegistry.register(darkPreset);
  themeRegistry.register(obsidianPreset);
  // 自定义主题不在这里注册：它由 ThemeProvider 在 mount 时
  // 通过 AppSettingsService 从数据库异步加载，再 hydrate 到 registry。
  registered = true;
};

export { themeRegistry } from './registry';
export { buildMuiTheme } from './buildMuiTheme';
export type { FoundationPalette, FoundationThemePreset } from './types';
export { lightPreset } from './presets/light';
export { darkPreset } from './presets/dark';
export { obsidianPreset } from './presets/obsidian';
export {
  CUSTOM_THEME_NAME,
  CUSTOM_THEME_LABEL,
  seedFromPreset,
  previewCustomTheme,
  hydrateCustomTheme,
  unregisterCustomTheme,
  parseStoredCustomTheme,
  type StoredCustomTheme,
} from './customTheme';
export {
  FoundationThemeProvider,
  useFoundationTheme,
  type ThemeChoice,
} from './ThemeProvider';
