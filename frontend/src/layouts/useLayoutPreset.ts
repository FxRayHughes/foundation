import { useCallback } from 'react';
import { usePreferences } from '@/preferences';
import { layoutRegistry } from './registry';
import type { LayoutPreset } from './types';

// 当前布局预设：持久化在 preferences 表（键 layout），经 PreferencesProvider 读写。
export const useLayoutPreset = (): {
  preset: LayoutPreset;
  presets: LayoutPreset[];
  setLayout: (id: string) => void;
} => {
  const { preferences, setPreference } = usePreferences();
  const setLayout = useCallback(
    (id: string) => {
      if (layoutRegistry.has(id)) setPreference('layout', id);
    },
    [setPreference],
  );
  return { preset: layoutRegistry.resolve(preferences.layout), presets: layoutRegistry.list(), setLayout };
};
