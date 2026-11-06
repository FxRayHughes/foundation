import { useCallback } from 'react';
import { useLayoutPreset, type LayoutPreset } from '@/layouts';
import { usePreferences } from '@/preferences';

export interface UseLayoutResult {
  presets: LayoutPreset[];
  activeId: string;
  activeLabelKey: string;
  select: (id: string) => void;
  navCollapsed: boolean;
  setNavCollapsed: (value: boolean) => void;
  // 当前预设是否使用展开侧栏（navCollapsed 仅对其生效）
  sidebarActive: boolean;
}

// 布局子页面 ViewModel：包装 useLayoutPreset + navCollapsed 偏好。
// 只返回 i18n key，翻译由 View 负责。
export const useLayout = (): UseLayoutResult => {
  const { preset, presets, setLayout } = useLayoutPreset();
  const { preferences, setPreference } = usePreferences();

  const setNavCollapsed = useCallback(
    (value: boolean) => setPreference('navCollapsed', value),
    [setPreference],
  );

  return {
    presets,
    activeId: preset.id,
    activeLabelKey: preset.labelKey,
    select: setLayout,
    navCollapsed: preferences.navCollapsed,
    setNavCollapsed,
    sidebarActive: preset.nav.variant === 'sidebar',
  };
};
