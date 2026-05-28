import { useCallback, useMemo } from 'react';
import { useI18n, type LocaleCode } from '@/i18n';

export interface LanguageOption {
  value: 'auto' | LocaleCode;
  // auto 项的文案走 i18n key；具体语言项直接显示 nativeName
  labelKey?: string;
  descriptionKey?: string;
  fallbackLabel: string;
  fallbackDescription: string;
}

export interface UseLanguageResult {
  options: LanguageOption[];
  choice: 'auto' | LocaleCode;
  setChoice: (value: 'auto' | LocaleCode) => void;
  currentLabel: string;
}

// 语言子页面 ViewModel：仅包装 I18nProvider 的接口，
// 把 'auto' 文案 key 注入到 options 第一项里。
export const useLanguage = (): UseLanguageResult => {
  const i18n = useI18n();

  const options = useMemo<LanguageOption[]>(() => {
    const auto: LanguageOption = {
      value: 'auto',
      labelKey: 'settings.language.auto.label',
      descriptionKey: 'settings.language.auto.description',
      fallbackLabel: 'Auto',
      fallbackDescription: 'Use the browser / OS language setting',
    };
    const list = i18n.available.map<LanguageOption>((l) => ({
      value: l.code,
      // 语言名直接用 nativeName（同一字符串在所有 locale 下都正确，不需 i18n key）
      fallbackLabel: l.nativeName,
      fallbackDescription: l.englishName,
    }));
    return [auto, ...list];
  }, [i18n.available]);

  const setChoice = useCallback(
    (value: 'auto' | LocaleCode): void => {
      i18n.setChoice(value);
    },
    [i18n],
  );

  return {
    options,
    choice: i18n.choice,
    setChoice,
    currentLabel: i18n.current.nativeName,
  };
};
