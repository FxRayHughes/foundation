import { ColorInput, Switch, Text, UnstyledButton, type ColorInputProps } from '@mantine/core';
import { useMemo } from 'react';
import { useT } from '@/i18n';
import { CUSTOM_THEME_NAME } from '@/styles/themes';
import type { Preferences } from '@/preferences';
import {
  getPaletteValue,
  usePersonalization,
  type PaletteField,
} from './usePersonalization';
import classes from './Personalization.module.css';
import shared from '../SettingsPage.module.css';

// 个性化子页面：主题 + 偏好 + 自定义主题。
// 文案 namespace：settings.personalization.*（顶层 settings.themes.* 仍由本页消费）。
export const Personalization = () => {
  const vm = usePersonalization();
  const t = useT();

  return (
    <>
      <ThemeSection vm={vm} />
      <PreferencesSection vm={vm} />
      <CustomThemeSection vm={vm} t={t} />
    </>
  );
};

type Vm = ReturnType<typeof usePersonalization>;

const ThemeSection = ({ vm }: { vm: Vm }) => {
  const t = useT();
  const currentLabel = vm.currentThemeLabelKey
    ? t(vm.currentThemeLabelKey)
    : vm.currentThemeFallbackLabel;

  return (
    <div className={shared.section}>
      <div className={shared.sectionHeader}>
        <Text className={shared.sectionTitle}>{t('settings.personalization.theme.title')}</Text>
        <Text className={shared.sectionHint}>{t('settings.personalization.theme.hint')}</Text>
      </div>
      <div className={classes.grid}>
        {vm.themeOptions.map((option) => {
          const active = option.value === vm.themeChoice;
          const label = option.labelKey ? t(option.labelKey) : option.fallbackLabel;
          const desc = option.descriptionKey
            ? t(option.descriptionKey)
            : option.fallbackDescription;
          return (
            <UnstyledButton
              key={option.value}
              onClick={() => vm.setThemeChoice(option.value)}
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
        {t('settings.personalization.theme.currentLine', { label: currentLabel })}
        {vm.themeChoice === 'system' ? t('settings.personalization.theme.followingSystem') : ''}
      </Text>
    </div>
  );
};

const PreferencesSection = ({ vm }: { vm: Vm }) => {
  const t = useT();

  const switches: Array<{
    key: keyof Preferences;
    labelKey: string;
    descriptionKey: string;
  }> = [
    {
      key: 'showLogo',
      labelKey: 'settings.personalization.preferences.showLogo.label',
      descriptionKey: 'settings.personalization.preferences.showLogo.description',
    },
    {
      key: 'showTooltip',
      labelKey: 'settings.personalization.preferences.showTooltip.label',
      descriptionKey: 'settings.personalization.preferences.showTooltip.description',
    },
  ];

  return (
    <div className={shared.section}>
      <div className={shared.sectionHeader}>
        <Text className={shared.sectionTitle}>
          {t('settings.personalization.preferences.title')}
        </Text>
        <Text className={shared.sectionHint}>
          {t('settings.personalization.preferences.hint')}
        </Text>
      </div>
      {switches.map(({ key, labelKey, descriptionKey }) => {
        const label = t(labelKey);
        return (
          <div key={key} className={classes.switchRow}>
            <div className={classes.switchTexts}>
              <Text className={classes.switchLabel}>{label}</Text>
              <Text className={classes.switchDesc}>{t(descriptionKey)}</Text>
            </div>
            <Switch
              checked={vm.preferences[key]}
              onChange={(e) =>
                vm.setPreference<keyof Preferences>(
                  key,
                  e.currentTarget.checked as Preferences[typeof key],
                )
              }
              aria-label={label}
            />
          </div>
        );
      })}
    </div>
  );
};

interface CustomThemeSectionProps {
  vm: Vm;
  t: ReturnType<typeof useT>;
}

const CustomThemeSection = ({ vm, t }: CustomThemeSectionProps) => {
  const grouped = useMemo<Array<[PaletteField['group'], PaletteField[]]>>(() => {
    const map = new Map<PaletteField['group'], PaletteField[]>();
    for (const f of vm.paletteFields) {
      const arr = map.get(f.group) ?? [];
      arr.push(f);
      map.set(f.group, arr);
    }
    return [...map.entries()];
  }, [vm.paletteFields]);

  const usingCustom = vm.themeChoice === CUSTOM_THEME_NAME;
  const currentLabel = vm.currentThemeLabelKey
    ? t(vm.currentThemeLabelKey)
    : vm.currentThemeFallbackLabel;

  return (
    <div className={shared.section}>
      <div className={shared.sectionHeader}>
        <Text className={shared.sectionTitle}>
          {t('settings.personalization.customTheme.title')}
        </Text>
        <Text className={shared.sectionHint}>
          {t('settings.personalization.customTheme.hint')}
        </Text>
      </div>

      <div className={classes.paletteToolbar}>
        <UnstyledButton
          className={classes.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-light')}
        >
          {t('settings.personalization.customTheme.toolbar.seedLight')}
        </UnstyledButton>
        <UnstyledButton
          className={classes.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-dark')}
        >
          {t('settings.personalization.customTheme.toolbar.seedDark')}
        </UnstyledButton>
        <UnstyledButton
          className={classes.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-obsidian')}
        >
          {t('settings.personalization.customTheme.toolbar.seedObsidian')}
        </UnstyledButton>
        <UnstyledButton
          className={classes.paletteToolbarBtn}
          onClick={() => vm.setCustomMode(vm.customTheme.mode === 'dark' ? 'light' : 'dark')}
        >
          {vm.customTheme.mode === 'dark'
            ? t('settings.personalization.customTheme.toolbar.modeDark')
            : t('settings.personalization.customTheme.toolbar.modeLight')}
        </UnstyledButton>
        {vm.hasCustomTheme && (
          <UnstyledButton
            className={classes.paletteToolbarBtn}
            onClick={() => vm.removeCustomTheme()}
          >
            {t('settings.personalization.customTheme.toolbar.remove')}
          </UnstyledButton>
        )}
      </div>

      {!usingCustom && (
        <Text className={classes.currentLine}>
          {t('settings.personalization.customTheme.notUsingHint', { label: currentLabel })}
        </Text>
      )}

      {grouped.map(([group, fields]) => (
        <div key={group}>
          <Text className={classes.paletteGroupTitle}>
            {t(`settings.personalization.customTheme.groups.${group}`)}
          </Text>
          <div className={classes.paletteGrid}>
            {fields.map((field) => {
              const value = getPaletteValue(vm.customTheme.palette, field.path);
              return (
                <ColorRow
                  key={field.path}
                  field={field}
                  value={value}
                  onChange={(v) => vm.updatePaletteField(field.path, v)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ColorRowProps {
  field: PaletteField;
  value: string;
  onChange: (value: string) => void;
}

// 取色器输出格式跟随当前值：rgba / hsla 值保留透明度通道，其余输出 6 位 hex
// （accent 需要 6 位 hex 才能派生 Mantine 10 级色阶，见 buildMantineTheme.accentTuple）。
const formatOf = (value: string): NonNullable<ColorInputProps['format']> => {
  const v = value.trim().toLowerCase();
  if (v.startsWith('rgba(')) return 'rgba';
  if (v.startsWith('rgb(')) return 'rgb';
  if (v.startsWith('hsla(')) return 'hsla';
  if (v.startsWith('hsl(')) return 'hsl';
  if (/^#[0-9a-f]{8}$/.test(v)) return 'hexa';
  return 'hex';
};

// 单行：label/描述 + ColorInput（左侧色块预览，点击呼出取色器；文本框接受 rgba 等任意 CSS 颜色）。
// 每次输入都会回调 onChange → VM 实时 previewCustomTheme + 持久化；
// 非法值失焦后由 ColorInput（fixOnBlur）回退到上一个合法值。
const ColorRow = ({ field, value, onChange }: ColorRowProps) => {
  const t = useT();
  const label = t(field.labelKey);
  const descRaw = t(field.descriptionKey);
  const desc = descRaw === field.descriptionKey ? field.path : descRaw;

  return (
    <div className={classes.paletteRow}>
      <div className={classes.paletteRowTexts}>
        <Text className={classes.paletteFieldLabel}>{label}</Text>
        <Text className={classes.paletteFieldDesc}>{desc}</Text>
      </div>
      <ColorInput
        size="xs"
        value={value}
        onChange={onChange}
        format={formatOf(value)}
        withEyeDropper={false}
        spellCheck={false}
        aria-label={t('settings.personalization.customTheme.a11y.colorValueFor', { label })}
        classNames={{ root: classes.paletteInputRoot, input: classes.paletteInput }}
        popoverProps={{ position: 'bottom-end' }}
      />
    </div>
  );
};
