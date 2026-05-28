import { Box, ButtonBase, Switch, Typography, useTheme } from '@mui/material';
import { useMemo, type ChangeEvent } from 'react';
import { useT } from '@/i18n';
import { CUSTOM_THEME_NAME } from '@/styles/themes';
import type { Preferences } from '@/preferences';
import {
  getPaletteValue,
  usePersonalization,
  type PaletteField,
} from './usePersonalization';
import { personalizationStyles } from './Personalization.styles';
import { settingsPageStyles } from '../SettingsPage.styles';

// 个性化子页面：主题 + 偏好 + 自定义主题。
// 文案 namespace：settings.personalization.*（顶层 settings.themes.* 仍由本页消费）。
export const Personalization = () => {
  const theme = useTheme();
  const shared = settingsPageStyles(theme);
  const styles = personalizationStyles(theme);
  const vm = usePersonalization();
  const t = useT();

  return (
    <>
      <ThemeSection vm={vm} shared={shared} styles={styles} />
      <PreferencesSection vm={vm} shared={shared} styles={styles} />
      <CustomThemeSection vm={vm} shared={shared} styles={styles} t={t} />
    </>
  );
};

type Vm = ReturnType<typeof usePersonalization>;
type Shared = ReturnType<typeof settingsPageStyles>;
type Styles = ReturnType<typeof personalizationStyles>;

const ThemeSection = ({ vm, shared, styles }: { vm: Vm; shared: Shared; styles: Styles }) => {
  const t = useT();
  const currentLabel = vm.currentThemeLabelKey
    ? t(vm.currentThemeLabelKey)
    : vm.currentThemeFallbackLabel;

  return (
    <Box sx={shared.section}>
      <Box sx={shared.sectionHeader}>
        <Typography sx={shared.sectionTitle}>{t('settings.personalization.theme.title')}</Typography>
        <Typography sx={shared.sectionHint}>{t('settings.personalization.theme.hint')}</Typography>
      </Box>
      <Box sx={styles.grid}>
        {vm.themeOptions.map((option) => {
          const active = option.value === vm.themeChoice;
          const label = option.labelKey ? t(option.labelKey) : option.fallbackLabel;
          const desc = option.descriptionKey
            ? t(option.descriptionKey)
            : option.fallbackDescription;
          return (
            <ButtonBase
              key={option.value}
              onClick={() => vm.setThemeChoice(option.value)}
              sx={active ? styles.cardActive : styles.card}
              aria-pressed={active}
            >
              <Typography sx={styles.cardLabel}>{label}</Typography>
              <Typography sx={styles.cardDesc}>{desc}</Typography>
            </ButtonBase>
          );
        })}
      </Box>
      <Typography sx={styles.currentLine}>
        {t('settings.personalization.theme.currentLine', { label: currentLabel })}
        {vm.themeChoice === 'system' ? t('settings.personalization.theme.followingSystem') : ''}
      </Typography>
    </Box>
  );
};

const PreferencesSection = ({ vm, shared, styles }: { vm: Vm; shared: Shared; styles: Styles }) => {
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
    <Box sx={shared.section}>
      <Box sx={shared.sectionHeader}>
        <Typography sx={shared.sectionTitle}>
          {t('settings.personalization.preferences.title')}
        </Typography>
        <Typography sx={shared.sectionHint}>
          {t('settings.personalization.preferences.hint')}
        </Typography>
      </Box>
      {switches.map(({ key, labelKey, descriptionKey }) => {
        const label = t(labelKey);
        return (
          <Box key={key} sx={styles.switchRow}>
            <Box sx={styles.switchTexts}>
              <Typography sx={styles.switchLabel}>{label}</Typography>
              <Typography sx={styles.switchDesc}>{t(descriptionKey)}</Typography>
            </Box>
            <Switch
              checked={vm.preferences[key]}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                vm.setPreference<keyof Preferences>(
                  key,
                  e.target.checked as Preferences[typeof key],
                )
              }
              slotProps={{ input: { 'aria-label': label } }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

interface CustomThemeSectionProps {
  vm: Vm;
  shared: Shared;
  styles: Styles;
  t: ReturnType<typeof useT>;
}

const CustomThemeSection = ({ vm, shared, styles, t }: CustomThemeSectionProps) => {
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
    <Box sx={shared.section}>
      <Box sx={shared.sectionHeader}>
        <Typography sx={shared.sectionTitle}>
          {t('settings.personalization.customTheme.title')}
        </Typography>
        <Typography sx={shared.sectionHint}>
          {t('settings.personalization.customTheme.hint')}
        </Typography>
      </Box>

      <Box sx={styles.paletteToolbar}>
        <Box
          component="button"
          type="button"
          sx={styles.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-light')}
        >
          {t('settings.personalization.customTheme.toolbar.seedLight')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={styles.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-dark')}
        >
          {t('settings.personalization.customTheme.toolbar.seedDark')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={styles.paletteToolbarBtn}
          onClick={() => vm.resetCustomFromPreset('foundation-obsidian')}
        >
          {t('settings.personalization.customTheme.toolbar.seedObsidian')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={styles.paletteToolbarBtn}
          onClick={() => vm.setCustomMode(vm.customTheme.mode === 'dark' ? 'light' : 'dark')}
        >
          {vm.customTheme.mode === 'dark'
            ? t('settings.personalization.customTheme.toolbar.modeDark')
            : t('settings.personalization.customTheme.toolbar.modeLight')}
        </Box>
        {vm.hasCustomTheme && (
          <Box
            component="button"
            type="button"
            sx={styles.paletteToolbarBtn}
            onClick={() => vm.removeCustomTheme()}
          >
            {t('settings.personalization.customTheme.toolbar.remove')}
          </Box>
        )}
      </Box>

      {!usingCustom && (
        <Typography sx={styles.currentLine}>
          {t('settings.personalization.customTheme.notUsingHint', { label: currentLabel })}
        </Typography>
      )}

      {grouped.map(([group, fields]) => (
        <Box key={group}>
          <Typography sx={styles.paletteGroupTitle}>
            {t(`settings.personalization.customTheme.groups.${group}`)}
          </Typography>
          <Box sx={styles.paletteGrid}>
            {fields.map((field) => {
              const value = getPaletteValue(vm.customTheme.palette, field.path);
              return (
                <ColorRow
                  key={field.path}
                  field={field}
                  value={value}
                  onChange={(v) => vm.updatePaletteField(field.path, v)}
                  styles={styles}
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

interface ColorRowProps {
  field: PaletteField;
  value: string;
  onChange: (value: string) => void;
  styles: Styles;
}

// 单行：色块（点击呼出取色器） + label/描述 + 文本输入（接受 rgba 等任意 CSS 颜色）。
const ColorRow = ({ field, value, onChange, styles }: ColorRowProps) => {
  const t = useT();
  const colorInputValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  const label = t(field.labelKey);
  const descRaw = t(field.descriptionKey);
  const desc = descRaw === field.descriptionKey ? field.path : descRaw;

  return (
    <Box sx={styles.paletteRow}>
      <Box sx={{ ...styles.paletteSwatch, backgroundColor: value || '#000000' }}>
        <Box
          component="input"
          type="color"
          value={colorInputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={styles.paletteSwatchInput}
          aria-label={t('settings.personalization.customTheme.a11y.colorPickerFor', { label })}
        />
      </Box>
      <Box sx={styles.paletteRowTexts}>
        <Typography sx={styles.paletteFieldLabel}>{label}</Typography>
        <Typography sx={styles.paletteFieldDesc}>{desc}</Typography>
      </Box>
      <Box
        component="input"
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={styles.paletteFieldValue}
        spellCheck={false}
        aria-label={t('settings.personalization.customTheme.a11y.colorValueFor', { label })}
      />
    </Box>
  );
};
