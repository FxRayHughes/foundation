import { Switch, Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRef, type KeyboardEvent } from 'react';
import { useT } from '@/i18n';
import type { LayoutPreset } from '@/layouts';
import { useLayout } from './useLayout';
import classes from './Layout.module.css';
import shared from '../SettingsPage.module.css';

// 布局子页面：预设卡片网格（radiogroup，方向键切换）+ 导航选项。
// 文案 namespace：settings.layout.*
export const Layout = () => {
  const vm = useLayout();
  const t = useT();
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // WAI-ARIA radiogroup：Tab 只停在选中项，方向键移动焦点并立即选中
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const total = vm.presets.length;
    let next = -1;
    if (delta !== 0) next = (index + delta + total) % total;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = total - 1;
    if (next < 0) return;
    e.preventDefault();
    vm.select(vm.presets[next]!.id);
    cardRefs.current[next]?.focus();
  };

  const collapsedLabel = t('settings.layout.nav.collapsed.label');

  return (
    <>
      <div className={shared.section}>
        <div className={shared.sectionHeader}>
          <Text className={shared.sectionTitle}>{t('settings.layout.title')}</Text>
          <Text className={shared.sectionHint}>{t('settings.layout.hint')}</Text>
        </div>
        <div className={classes.grid} role="radiogroup" aria-label={t('settings.layout.title')}>
          {vm.presets.map((preset, index) => {
            const active = preset.id === vm.activeId;
            return (
              <UnstyledButton
                key={preset.id}
                ref={(el: HTMLButtonElement | null) => {
                  cardRefs.current[index] = el;
                }}
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => vm.select(preset.id)}
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, index)}
                className={classes.card}
                data-active={active || undefined}
              >
                <LayoutThumbnail preset={preset} />
                <div className={classes.cardTexts}>
                  <Text className={classes.cardLabel}>{t(preset.labelKey)}</Text>
                  <Text className={classes.cardDesc}>{t(preset.descriptionKey)}</Text>
                </div>
                {active && (
                  <span className={classes.check} aria-hidden>
                    <IconCheck size={14} stroke={2.5} />
                  </span>
                )}
              </UnstyledButton>
            );
          })}
        </div>
        <Text className={classes.currentLine}>
          {t('settings.layout.currentLine', { label: t(vm.activeLabelKey) })}
        </Text>
      </div>

      <div className={shared.section}>
        <div className={shared.sectionHeader}>
          <Text className={shared.sectionTitle}>{t('settings.layout.nav.title')}</Text>
          <Text className={shared.sectionHint}>{t('settings.layout.nav.hint')}</Text>
        </div>
        <div className={classes.switchRow}>
          <div className={classes.switchTexts}>
            <Text className={classes.switchLabel}>{collapsedLabel}</Text>
            <Text className={classes.switchDesc}>{t('settings.layout.nav.collapsed.description')}</Text>
            {!vm.sidebarActive && (
              <Text className={classes.switchNote}>{t('settings.layout.nav.collapsedInactive')}</Text>
            )}
          </div>
          <Switch
            checked={vm.navCollapsed}
            onChange={(e) => vm.setNavCollapsed(e.currentTarget.checked)}
            aria-label={collapsedLabel}
          />
        </div>
        <Text className={shared.sectionHint}>{t('settings.layout.nav.moreInPersonalization')}</Text>
      </div>
    </>
  );
};

// 布局示意缩略图：纯 div + CSS，按 nav.variant / nav.placement / frame 摆放。
// 标题条 / 导航块 / 内容区，强调色仅用于导航。装饰性元素，对读屏隐藏。
const LayoutThumbnail = ({ preset }: { preset: LayoutPreset }) => {
  const { variant, placement } = preset.nav;
  const inTitle = placement === 'titlebar';
  const drawer = placement === 'drawer' || variant === 'none';
  const showNavBlock = !inTitle && !drawer && variant !== 'dock';

  return (
    <div
      className={classes.thumb}
      data-variant={variant}
      data-placement={placement}
      data-frame={preset.frame}
      aria-hidden
    >
      <div className={classes.thTitle}>
        <span className={classes.thDots}>
          <i />
          <i />
          <i />
        </span>
        {drawer && (
          <span className={classes.thMenu}>
            <i />
            <i />
            <i />
          </span>
        )}
        {inTitle && (
          <span className={classes.thPills}>
            <i data-on />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className={classes.thBody}>
        {showNavBlock && (
          <div className={classes.thNav}>
            <i data-on />
            <i />
            <i />
          </div>
        )}
        <div className={classes.thMain}>
          <i />
          <i />
          <i />
          {variant === 'dock' && (
            <span className={classes.thDock} data-float={placement === 'float' || undefined}>
              <i data-on />
              <i />
              <i />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
