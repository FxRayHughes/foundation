import { themeRegistry } from './registry';
import { lightPreset } from './presets/light';
import type { FoundationPalette, FoundationThemePreset } from './types';

// 自定义主题：name 固定，业务方不要再用同名注册其它预设。
export const CUSTOM_THEME_NAME = 'foundation-custom';
export const CUSTOM_THEME_LABEL = '自定义';

// 持久化结构：mode 决定 MUI 的 contrast 计算方向，palette 全字段独立保存。
//
// 存储后端从 localStorage 切到了 SQLite（appsettings.custom_theme JSON 字段）；
// 写入流程改为：UI → ThemeProvider → AppSettingsService.setCustomTheme()，
// 这里只负责"内存中的 registry 同步 + 形状校验"。
export interface StoredCustomTheme {
  mode: 'light' | 'dark';
  palette: FoundationPalette;
}

// 深拷贝 palette（FoundationPalette 是固定形状，JSON 拷贝足够）
const clonePalette = (p: FoundationPalette): FoundationPalette =>
  JSON.parse(JSON.stringify(p)) as FoundationPalette;

const buildPreset = (data: StoredCustomTheme): FoundationThemePreset => ({
  name: CUSTOM_THEME_NAME,
  label: CUSTOM_THEME_LABEL,
  mode: data.mode,
  palette: data.palette,
});

// 校验外部传入的 JSON 是否符合 StoredCustomTheme 形状。
// SQLite 里存的是 JSON 字符串，前端读出后必须验型再用。
export const parseStoredCustomTheme = (raw: string): StoredCustomTheme | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCustomTheme>;
    if (parsed?.mode !== 'light' && parsed?.mode !== 'dark') return null;
    if (!parsed.palette || typeof parsed.palette !== 'object') return null;
    return { mode: parsed.mode, palette: parsed.palette as FoundationPalette };
  } catch {
    return null;
  }
};

// 异步拉到自定义主题数据后注入 registry。返回构建好的 preset，便于 Provider 立即用。
export const hydrateCustomTheme = (data: StoredCustomTheme): FoundationThemePreset => {
  const preset = buildPreset(data);
  themeRegistry.register(preset);
  return preset;
};

// 从某个已有预设派生一份初始 palette；用户首次进入"自定义"时调用。
// 拷贝避免改动用户当前看到的内置预设。
export const seedFromPreset = (sourceName?: string): StoredCustomTheme => {
  const source =
    sourceName && themeRegistry.has(sourceName)
      ? themeRegistry.get(sourceName)
      : lightPreset;
  return {
    mode: source.mode,
    palette: clonePalette(source.palette),
  };
};

// 仅更新 registry（实时预览用）；由调用方负责持久化（AppSettingsService.setCustomTheme）。
// 用法：用户在调色时，每次改色 → previewCustomTheme（视图立即反映）+ AppSettingsService.setCustomTheme（落库）。
export const previewCustomTheme = (data: StoredCustomTheme): FoundationThemePreset => {
  const preset = buildPreset(data);
  themeRegistry.register(preset);
  return preset;
};

// 从 registry 卸载（用户"删除自定义主题"时调用）。
// 持久化由调用方负责（AppSettingsService.resetCustomTheme）。
export const unregisterCustomTheme = (): void => {
  if (themeRegistry.has(CUSTOM_THEME_NAME)) {
    themeRegistry.unregister(CUSTOM_THEME_NAME);
  }
};
