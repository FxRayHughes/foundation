import { useCallback, useMemo } from 'react';
import { IconHome } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { useRouter } from '@/router';
import type { RouteDefinition } from '@/router';
import { usePreferences } from '@/preferences';

// 导航条目（View 用）。ViewModel 不持有翻译后的字符串：
// 只暴露 labelKey + 兜底 label，由 View 经 navLabel(t, item) 翻译。
export interface NavItem {
  id: string;
  labelKey: string | undefined;
  label: string;
  icon: Icon;
  active: boolean;
}

// 全部导航形态（rail / sidebar / bar / dock / 抽屉）共用的 ViewModel：
//  - 条目来自路由表（slot primary / footer），路由表是唯一事实源
//  - showTooltip / showLogo 来自用户偏好
//  - navigate 走 useRouter()，不接收外部 onNavigate
export const useNavigation = () => {
  const { primary, footer, active, navigate } = useRouter();
  const { preferences } = usePreferences();

  const toItem = useCallback(
    (r: RouteDefinition): NavItem => ({
      id: r.id,
      labelKey: r.labelKey,
      label: r.label,
      icon: r.icon ?? IconHome,
      active: r.id === active.id,
    }),
    [active.id],
  );

  const primaryItems = useMemo(() => primary.map(toItem), [primary, toItem]);
  const footerItems = useMemo(() => footer.map(toItem), [footer, toItem]);

  return {
    primary: primaryItems,
    footer: footerItems,
    activeId: active.id,
    navigate,
    showTooltip: preferences.showTooltip,
    showLogo: preferences.showLogo,
  };
};

export type NavigationViewModel = ReturnType<typeof useNavigation>;
