import { AppLayout } from '@/components/AppLayout';
import { I18nProvider, registerFoundationLocales } from '@/i18n';
import { registerHomePageLocales } from '@/pages/HomePage/lang';
import { registerXProDemoPageLocales } from '@/pages/XProDemoPage/lang';
import { registerSettingsPageLocales } from '@/pages/SettingsPage/lang';
import { PreferencesProvider } from '@/preferences';
import { RouterProvider } from '@/router';
import { routes } from '@/routes';
import { FoundationThemeProvider, registerFoundationThemes } from '@/styles/themes';

// 启动时注册：
//  1. 内置主题预设（light / dark / obsidian + 已保存的 custom）
//  2. 内置 locale 公用文案（zh-CN / en-US）
//  3. 各页面的语言包（深合并到对应 locale 上）
// 所有 register* 都是幂等，模块多次求值不会重复注册。
// 注意：页面 locale 必须在 registerFoundationLocales() 之后注册，
// 否则 extend 会因目标 locale 不存在而静默丢失（这里顺序已对）。
registerFoundationThemes();
registerFoundationLocales();
registerHomePageLocales();
registerXProDemoPageLocales();
registerSettingsPageLocales();

// Provider 嵌套顺序（自外向内）：
//  ① I18nProvider —— 文案是任何子组件都可能用到的最基础上下文
//  ② FoundationThemeProvider —— CssBaseline 在这里注入；与 i18n 互不依赖
//  ③ PreferencesProvider —— 行为偏好
//  ④ RouterProvider —— 路由切换时上面三个都已就绪
export const App = () => {
  return (
    <I18nProvider>
      <FoundationThemeProvider>
        <PreferencesProvider>
          <RouterProvider routes={routes}>
            <AppLayout />
          </RouterProvider>
        </PreferencesProvider>
      </FoundationThemeProvider>
    </I18nProvider>
  );
};
