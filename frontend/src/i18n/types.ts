// 国际化（i18n）类型定义。
//
// 设计要点：
// - 与主题系统对齐："registry" 单例 + Provider 注入，业务方注册新 locale 不必改本模块
// - messages 是嵌套对象（任意层），消费时用点路径取（'settings.theme.title'）
// - TS 不强约束 key 形态：脚手架阶段保持灵活，业务方可在自己仓库做更严的字面量类型

// 区域代码遵循 BCP 47：'zh-CN' / 'en-US' / 'ja-JP' / 'fr-FR' ...
export type LocaleCode = string;

// 嵌套消息字典：
//   {
//     app: { title: 'Foundation' },
//     settings: { theme: { title: '主题' } },
//   }
// 节点既可以是 string，也可以是 { [k]: Messages | string }，递归。
export type Messages = { [key: string]: string | Messages };

// 语言注册项：编码 + 显示名（英文）+ 原生显示名 + 文案字典
export interface Locale {
  code: LocaleCode;
  // 用于英文 UI 的展示名（如 "Chinese (Simplified)"）
  englishName: string;
  // 用于该语言自己的展示名（如 "简体中文"）—— 渲染语言选择器时用
  nativeName: string;
  messages: Messages;
}

// 模板插值变量；只允许字符串/数字/布尔，避免渲染对象
export type TranslationVars = Record<string, string | number | boolean>;

export interface I18nContextValue {
  // 当前生效的 locale 整体
  current: Locale;
  // 已注册的全部 locale（顺序 = 注册顺序）
  available: Locale[];
  // 选择 —— 'auto' 跟随浏览器，否则是具体 locale code
  choice: 'auto' | LocaleCode;
  setChoice: (choice: 'auto' | LocaleCode) => void;
  // 翻译入口；找不到 key 会回退默认 locale，再找不到就回 key 本身
  t: (key: string, vars?: TranslationVars) => string;
}
