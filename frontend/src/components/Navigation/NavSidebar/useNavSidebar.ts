import { useCallback } from 'react';
import { usePreferences } from '@/preferences';
import { useNavigation } from '../useNavigation';

export interface UseNavSidebarOptions {
  // 抽屉模式：始终展开、无折叠开关；点击条目后调用 onClose
  inDrawer: boolean;
  onClose: (() => void) | undefined;
}

// 展开侧栏 ViewModel：共享导航 VM + 折叠状态（持久化到偏好 navCollapsed）
export const useNavSidebar = ({ inDrawer, onClose }: UseNavSidebarOptions) => {
  const nav = useNavigation();
  const { navigate } = nav;
  const { preferences, setPreference } = usePreferences();
  const collapsed = !inDrawer && preferences.navCollapsed;

  const toggleCollapsed = useCallback(() => {
    setPreference('navCollapsed', !preferences.navCollapsed);
  }, [preferences.navCollapsed, setPreference]);

  const select = useCallback(
    (id: string) => {
      navigate(id);
      onClose?.();
    },
    [navigate, onClose],
  );

  return {
    ...nav,
    collapsed,
    toggleCollapsed,
    select,
    // 折叠时文字隐藏，Tooltip 才有意义；展开时文字可见，不再弹 Tooltip
    tooltipsEnabled: collapsed && nav.showTooltip,
  };
};
