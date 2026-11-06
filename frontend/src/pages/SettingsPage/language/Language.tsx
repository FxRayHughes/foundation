import { Text, UnstyledButton } from '@mantine/core';
import { useT } from '@/i18n';
import { useLanguage } from './useLanguage';
import classes from './Language.module.css';
import shared from '../SettingsPage.module.css';

// 语言子页面：选项卡片切换 + 当前语言展示。
// 文案 namespace：settings.language.*
export const Language = () => {
  const vm = useLanguage();
  const t = useT();

  return (
    <div className={shared.section}>
      <div className={shared.sectionHeader}>
        <Text className={shared.sectionTitle}>{t('settings.language.title')}</Text>
        <Text className={shared.sectionHint}>{t('settings.language.hint')}</Text>
      </div>
      <div className={classes.grid}>
        {vm.options.map((option) => {
          const active = option.value === vm.choice;
          const label = option.labelKey ? t(option.labelKey) : option.fallbackLabel;
          const desc = option.descriptionKey
            ? t(option.descriptionKey)
            : option.fallbackDescription;
          return (
            <UnstyledButton
              key={option.value}
              onClick={() => vm.setChoice(option.value)}
              className={classes.card}
              data-active={active || undefined}
              aria-pressed={active}
            >
              <Text className={classes.cardLabel}>{label}</Text>
              <Text className={classes.cardDesc}>{desc}</Text>
            </UnstyledButton>
          );
        })}
      </div>
      <Text className={classes.currentLine}>
        {t('settings.language.currentLine', { label: vm.currentLabel })}
      </Text>
    </div>
  );
};
