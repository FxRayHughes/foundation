import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CUSTOM_THEME_NAME,
  previewCustomTheme,
  seedFromPreset,
  themeRegistry,
  unregisterCustomTheme,
  useFoundationTheme,
  type FoundationPalette,
  type StoredCustomTheme,
  type ThemeChoice,
} from '@/styles/themes';
import { usePreferences, type Preferences } from '@/preferences';
import { AppSettingsService } from '@/services';

// 主题选项（仅元数据，文案 key）—— View 层用 t() 解析为最终字符串
export interface ThemeOption {
  value: ThemeChoice;          // 'system' | preset name
  labelKey: string;            // 例：'settings.themes.light.label'
  descriptionKey: string;      // 例：'settings.themes.light.description'
  // 当上述 key 缺失时使用（如业务方注册了未声明文案的预设）
  fallbackLabel: string;
  fallbackDescription: string;
}

// 调色板编辑字段：每个字段挂 i18n key（标签 / 描述）
export interface PaletteField {
  group: 'background' | 'text' | 'border' | 'accent' | 'status';
  path: string;
  // i18n keys，文案在 settings.personalization.customTheme.fields.<path>.{label,description}
  labelKey: string;
  descriptionKey: string;
}

// 字段顺序：按"层"分组（背景 / 文本 / 边框 / 强调 / 状态）
export const PALETTE_FIELDS: PaletteField[] = (() => {
  const make = (group: PaletteField['group'], path: string): PaletteField => ({
    group,
    path,
    labelKey: `settings.personalization.customTheme.fields.${path}.label`,
    descriptionKey: `settings.personalization.customTheme.fields.${path}.description`,
  });
  return [
    make('background', 'bg.base'),
    make('background', 'bg.sidebar'),
    make('background', 'bg.content'),
    make('background', 'bg.surface'),
    make('background', 'bg.elevated'),
    make('background', 'bg.hover'),
    make('background', 'bg.active'),

    make('text', 'text.primary'),
    make('text', 'text.secondary'),
    make('text', 'text.muted'),

    make('border', 'divider'),

    make('accent', 'accent'),
    make('accent', 'accentHover'),

    make('status', 'status.danger'),
    make('status', 'status.success'),
    make('status', 'status.warning'),
  ];
})();

// 主题 name → i18n key 映射。业务方注册新预设要让设置页显示，
// 在 settings.themes.<key> 下加文案；这里加一行即可。
const THEME_NAME_TO_KEY: Record<string, string> = {
  system: 'system',
  'foundation-light': 'light',
  'foundation-dark': 'dark',
  'foundation-obsidian': 'obsidian',
  'foundation-custom': 'custom',
};

const themeOptionFor = (
  value: ThemeChoice,
  fallbackLabel: string,
  fallbackDescription: string,
): ThemeOption => {
  const k = THEME_NAME_TO_KEY[value as string] ?? null;
  if (!k) {
    return {
      value,
      labelKey: '',
      descriptionKey: '',
      fallbackLabel,
      fallbackDescription,
    };
  }
  return {
    value,
    labelKey: `settings.themes.${k}.label`,
    descriptionKey: `settings.themes.${k}.description`,
    fallbackLabel,
    fallbackDescription,
  };
};

// 按点路径取/写 palette 字段（不可变更新）。
const getByPath = (palette: FoundationPalette, path: string): string => {
  const segs = path.split('.');
  let v: unknown = palette;
  for (const s of segs) {
    if (v && typeof v === 'object' && s in (v as Record<string, unknown>)) {
      v = (v as Record<string, unknown>)[s];
    } else {
      return '';
    }
  }
  return typeof v === 'string' ? v : '';
};

const setByPath = (palette: FoundationPalette, path: string, value: string): FoundationPalette => {
  const segs = path.split('.');
  if (segs.length === 1) {
    return { ...palette, [segs[0]!]: value } as FoundationPalette;
  }
  if (segs.length === 2) {
    const [g, k] = segs as [string, string];
    const group = (palette as unknown as Record<string, Record<string, string> | string>)[g];
    if (typeof group === 'object' && group !== null) {
      return {
        ...palette,
        [g]: { ...group, [k]: value },
      } as FoundationPalette;
    }
  }
  return palette;
};

export interface UsePersonalizationResult {
  // 主题选择
  themeOptions: ThemeOption[];
  themeChoice: ThemeChoice;
  setThemeChoice: (value: ThemeChoice) => void;
  currentThemeLabelKey: string;
  currentThemeFallbackLabel: string;

  // 偏好开关
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;

  // 自定义主题
  customTheme: StoredCustomTheme;
  hasCustomTheme: boolean;
  paletteFields: PaletteField[];
  updatePaletteField: (path: string, value: string) => void;
  setCustomMode: (mode: 'light' | 'dark') => void;
  resetCustomFromPreset: (sourceName?: string) => void;
  removeCustomTheme: () => void;
}

// 个性化子页面 ViewModel：主题 + 偏好 + 自定义主题。
export const usePersonalization = (): UsePersonalizationResult => {
  const { choice, available, setChoice, current } = useFoundationTheme();
  const { preferences, setPreference } = usePreferences();

  const themeOptions = useMemo<ThemeOption[]>(() => {
    const system = themeOptionFor('system', 'System', 'Follow OS preference');
    const presets = available.map<ThemeOption>((preset) =>
      themeOptionFor(
        preset.name,
        preset.label,
        `${preset.mode === 'dark' ? 'Dark' : 'Light'} preset`,
      ),
    );
    return [system, ...presets];
  }, [available]);

  const setThemeChoice = useCallback(
    (value: ThemeChoice): void => {
      setChoice(value);
    },
    [setChoice],
  );

  const currentThemeKey = THEME_NAME_TO_KEY[current.name] ?? null;
  const currentThemeLabelKey = currentThemeKey ? `settings.themes.${currentThemeKey}.label` : '';
  const currentThemeFallbackLabel = current.label;

  // —— 自定义主题 ——
  // 异步：customTheme 数据由 ThemeProvider 在 mount 时从 AppSettingsService 拉取
  // 并 hydrate 到 themeRegistry。这里订阅 registry 变化，把已注册的 custom 数据
  // 反向取出作为编辑器初值；未注册时用当前主题派生。
  const customFromRegistry = useMemo<StoredCustomTheme | null>(() => {
    if (!themeRegistry.has(CUSTOM_THEME_NAME)) return null;
    const preset = themeRegistry.get(CUSTOM_THEME_NAME);
    return { mode: preset.mode, palette: preset.palette };
    // available 触发：registry 注册新预设时重算
  }, [available]);

  const [customTheme, setCustomTheme] = useState<StoredCustomTheme>(
    () => customFromRegistry ?? seedFromPreset(current.name),
  );
  const [hasCustomTheme, setHasCustomTheme] = useState<boolean>(() => customFromRegistry !== null);

  // 后端异步 hydrate 后，把 registry 里的数据同步到本地编辑状态
  useEffect(() => {
    if (customFromRegistry && !hasCustomTheme) {
      setCustomTheme(customFromRegistry);
      setHasCustomTheme(true);
    }
  }, [customFromRegistry, hasCustomTheme]);

  const commitCustom = useCallback(
    (next: StoredCustomTheme): void => {
      setCustomTheme(next);
      previewCustomTheme(next);
      void AppSettingsService.setCustomTheme(next).catch(() => {});
      setHasCustomTheme(true);
      if (choice !== CUSTOM_THEME_NAME) {
        setChoice(CUSTOM_THEME_NAME);
      }
    },
    [choice, setChoice],
  );

  const updatePaletteField = useCallback(
    (path: string, value: string): void => {
      const next: StoredCustomTheme = {
        mode: customTheme.mode,
        palette: setByPath(customTheme.palette, path, value),
      };
      commitCustom(next);
    },
    [customTheme, commitCustom],
  );

  const setCustomMode = useCallback(
    (mode: 'light' | 'dark'): void => {
      commitCustom({ mode, palette: customTheme.palette });
    },
    [customTheme, commitCustom],
  );

  const resetCustomFromPreset = useCallback(
    (sourceName?: string): void => {
      const seed = seedFromPreset(sourceName ?? current.name);
      commitCustom(seed);
    },
    [current.name, commitCustom],
  );

  const removeCustomTheme = useCallback((): void => {
    unregisterCustomTheme();
    void AppSettingsService.resetCustomTheme().catch(() => {});
    setHasCustomTheme(false);
    setChoice('foundation-light');
    setCustomTheme(seedFromPreset('foundation-light'));
  }, [setChoice]);

  return {
    themeOptions,
    themeChoice: choice,
    setThemeChoice,
    currentThemeLabelKey,
    currentThemeFallbackLabel,

    preferences,
    setPreference,

    customTheme,
    hasCustomTheme,
    paletteFields: PALETTE_FIELDS,
    updatePaletteField,
    setCustomMode,
    resetCustomFromPreset,
    removeCustomTheme,
  };
};

// 暴露给 View 层做色块取值
export { getByPath as getPaletteValue };
