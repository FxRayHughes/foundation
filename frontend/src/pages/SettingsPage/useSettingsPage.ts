import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/router';

// 设置页两列：左列每项对应一个"分类子页面"。
// 业务方加新子页面：
//   1. 在 SettingsPage/<name>/ 下放一套 View / VM / Style / lang
//   2. 在 SettingsPage/<name>/index.ts 导出 register<Name>Locales + 子页面组件
//   3. 在 App.tsx 调用 register<Name>Locales()
//   4. 在 items 追加一项 + 在 SettingsPage.tsx 右列分发处加 case
export interface SettingsItem {
  id: string;
  labelKey: string;
  descriptionKey: string;
}

export interface UseSettingsPageResult {
  items: SettingsItem[];
  activeItemId: string;
  setActiveItemId: (id: string) => void;
  activeItem: SettingsItem;
}

// 设置页"框架" ViewModel：只管左列入口的展示与切换状态。
// 各子页面的具体业务（主题 / 偏好 / 语言 / 数据库）下沉到对应子目录的 useXxx。
export const useSettingsPage = (): UseSettingsPageResult => {
  const items = useMemo<SettingsItem[]>(
    () => [
      {
        id: 'personalization',
        labelKey: 'settings.list.personalization.label',
        descriptionKey: 'settings.list.personalization.description',
      },
      {
        id: 'layout',
        labelKey: 'settings.list.layout.label',
        descriptionKey: 'settings.list.layout.description',
      },
      {
        id: 'language',
        labelKey: 'settings.list.language.label',
        descriptionKey: 'settings.list.language.description',
      },
      {
        id: 'database',
        labelKey: 'settings.list.database.label',
        descriptionKey: 'settings.list.database.description',
      },
    ],
    [],
  );

  // 外部可经 navigate('settings', { section: '<id>' }) 直达某个子项（如首页"当前布局"卡片）
  const { params } = useRouter();
  const requested = params.section && items.some((i) => i.id === params.section) ? params.section : undefined;
  const [activeItemId, setActiveItemId] = useState<string>(requested ?? items[0]!.id);
  useEffect(() => {
    if (requested) setActiveItemId(requested);
  }, [requested, params]);
  const activeItem = useMemo<SettingsItem>(
    () => items.find((i) => i.id === activeItemId) ?? items[0]!,
    [items, activeItemId],
  );

  return { items, activeItemId, setActiveItemId, activeItem };
};
