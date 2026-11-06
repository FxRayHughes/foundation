import { Text, Title, UnstyledButton } from '@mantine/core';
import { useT } from '@/i18n';
import classes from './SettingsPage.module.css';
import { useSettingsPage } from './useSettingsPage';
import { Personalization } from './personalization';
import { Layout } from './layout';
import { Language } from './language';
import { Database } from './database';

// 设置页（两列）：
//   左列：选项列表（personalization / layout / language / database）
//   右列：根据 activeItemId 分发到对应子页面组件
//
// 每个子页面是一个独立目录（personalization / language / database），
// 内部包含 View / VM / Style(.module.css) / lang。SettingsPage 仅做"框架 + 分发"，
// 不感知子页面的业务细节。
export const SettingsPage = () => {
  const vm = useSettingsPage();
  const t = useT();

  return (
    <div className={classes.root}>
      {/* 左列：选项列表 */}
      <div className={classes.list} aria-label={t('settings.title')}>
        <div className={classes.listHeader}>
          <Text className={classes.listEyebrow}>{t('settings.eyebrow')}</Text>
          <Text className={classes.listTitle}>{t('settings.title')}</Text>
        </div>
        <div className={classes.listItems}>
          {vm.items.map((item) => {
            const isActive = item.id === vm.activeItemId;
            return (
              <UnstyledButton
                key={item.id}
                onClick={() => vm.setActiveItemId(item.id)}
                className={classes.listItem}
                data-active={isActive || undefined}
                aria-pressed={isActive}
              >
                {isActive && <div className={classes.listItemIndicator} aria-hidden />}
                <Text className={classes.listItemLabel}>{t(item.labelKey)}</Text>
                <Text className={classes.listItemDesc}>{t(item.descriptionKey)}</Text>
              </UnstyledButton>
            );
          })}
        </div>
      </div>

      {/* 右列：详细配置 */}
      <div className={classes.detail}>
        <div className={classes.detailHeader}>
          <Text className={classes.detailEyebrow}>{t(vm.activeItem.labelKey)}</Text>
          <Title order={1} className={classes.detailTitle}>
            {t(vm.activeItem.labelKey)}
          </Title>
          <Text className={classes.detailDesc}>{t(vm.activeItem.descriptionKey)}</Text>
        </div>

        {vm.activeItem.id === 'personalization' && <Personalization />}
        {vm.activeItem.id === 'layout' && <Layout />}
        {vm.activeItem.id === 'language' && <Language />}
        {vm.activeItem.id === 'database' && <Database />}
      </div>
    </div>
  );
};
