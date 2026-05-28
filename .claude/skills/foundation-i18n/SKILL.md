---
name: foundation-i18n
description: Foundation 脚手架的国际化（i18n）系统使用指南。说明语言注册、文案查找、模板插值、页面级语言包、运行时切换；以及"任何人类可见字符串都必须走 i18n"的铁律。
---

# Foundation i18n 系统

Foundation 脚手架内置一套**注册式 + 页面级语言包**的轻量 i18n 系统：

- 全局公用文案（标题栏、侧边栏、路由 label、common.* 通用术语）放在 `src/i18n/locales/<code>.ts`；
- 页面级文案下沉到 `src/pages/<Name>/lang/<code>.ts`，由该 page 自注册到 `localeRegistry`；
- 文案以**点路径**取值（`t('home.hero')`），支持模板插值（`{{var}}`）；
- 切换语言走 `useI18n().setChoice(code | 'auto')`，写入 localStorage 持久化；
- `'auto'` 跟随浏览器语言，根据 `navigator.languages` 命中已注册 locale。

> 默认注册了 `zh-CN`（默认）与 `en-US`。

---

## 1. 文件结构

```
src/i18n/
├── types.ts             # Locale / Messages / I18nContextValue
├── registry.ts          # localeRegistry 单例（register / extend / list / subscribe）
├── I18nProvider.tsx     # <I18nProvider> + useI18n() / useT()
├── locales/
│   ├── zh-CN.ts         # 公用中文（app / sidebar / titleBar / route / common）
│   └── en-US.ts         # 公用英文
└── index.ts             # 出口（含 registerFoundationLocales 启动函数）

src/pages/<Name>/lang/    ← 页面级语言包
├── zh-CN.ts             # export const xxxZhCN: Messages = { home: { ... } }
├── en-US.ts
└── index.ts             # export const register<Name>Locales = () => { ... }
```

---

## 2. 启动注册

`App.tsx` 顶部按顺序调用：

```tsx
import { I18nProvider, registerFoundationLocales } from '@/i18n';
import { registerHomePageLocales } from '@/pages/HomePage';
import { registerSettingsPageLocales } from '@/pages/SettingsPage';

// 1) 公用 locale 必须先就位（页面级 extend 的目标）
registerFoundationLocales();
// 2) 各页面把自己的命名空间合并上去
registerHomePageLocales();
registerSettingsPageLocales();

export const App = () => (
  <I18nProvider>
    {/* ... 其他 Provider ... */}
  </I18nProvider>
);
```

注册顺序若反了：`extend` 找不到目标 locale 会**静默忽略**，应用不会崩，但页面文案会回落到 key 字面量。开发期发现 UI 上出现 `home.hero` 这种字符串时，第一反应是检查注册顺序与 key 拼写。

---

## 3. 在组件里消费文案（铁律）

**铁律：** 任何人类可见的字符串必须经 `t()` 输出。React 组件、`aria-label`、`placeholder`、Tooltip 标题、表单按钮文字——**禁止硬编码**中文 / 英文字面量。

```tsx
import { useT } from '@/i18n';

export const HomePage = () => {
  const t = useT();
  return (
    <>
      <h1>{t('home.hero')}</h1>
      <p>{t('home.subtitle', { file: 'internal/services/greet/greet.go' })}</p>
      <button aria-label={t('home.backendCard.submit')}>
        {t('home.backendCard.submit')}
      </button>
    </>
  );
};
```

需要全部 i18n 上下文（切语言、列出可用语言）时用 `useI18n()`；只翻译用 `useT()` 就够。

### 模板插值

```ts
// zh-CN.ts
{ home: { footer: { backendTick: '后端心跳：{{time}}' } } }

// 调用
t('home.footer.backendTick', { time: '2026-05-28 13:09:44' })
// → '后端心跳：2026-05-28 13:09:44'
```

变量未提供时占位符**保留**（如 `{{time}}`），便于发现遗漏。

---

## 4. 写一份页面级语言包

新建 `src/pages/AccountPage/lang/`：

```ts
// zh-CN.ts
import type { Messages } from '@/i18n';

export const accountPageZhCN: Messages = {
  account: {
    title: '账户',
    profile: { displayName: '昵称', email: '邮箱' },
  },
};

// en-US.ts —— keys 必须与 zh-CN 完全对齐，否则该 key 会回落到默认 locale
import type { Messages } from '@/i18n';

export const accountPageEnUS: Messages = {
  account: {
    title: 'Account',
    profile: { displayName: 'Display name', email: 'Email' },
  },
};

// index.ts
import { localeRegistry } from '@/i18n';
import { accountPageZhCN } from './zh-CN';
import { accountPageEnUS } from './en-US';

let registered = false;
export const registerAccountPageLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', accountPageZhCN);
  localeRegistry.extend('en-US', accountPageEnUS);
  registered = true;
};
```

最后在页面 `index.ts` 出口处补一行：

```ts
export { AccountPage } from './AccountPage';
export { registerAccountPageLocales } from './lang';
```

并在 `App.tsx` 调用注册函数。**完成。**

### 命名空间约定

- 页面文案使用页面 id 作为顶层命名空间：`home.*` / `settings.*` / `account.*`；
- 跨页面共享的小术语放公用 `common.*`（保存 / 取消 / 是 / 否 / 加载中 / 跟随系统 / 自动）；
- 框架级（标题栏 / 侧边栏 / 路由）保留在公用 locale，**不要**重复在页面级注册。

---

## 5. 注册新语言

业务方需要日语、法语等：

```ts
// src/i18n/locales/ja-JP.ts
import type { Locale } from '../types';

export const jaJP: Locale = {
  code: 'ja-JP',
  englishName: 'Japanese',
  nativeName: '日本語',
  messages: { /* keys 与 zh-CN 对齐 */ },
};

// 在 registerFoundationLocales 之外注册（不要改这个函数）
import { localeRegistry, jaJP } from '@/i18n';
localeRegistry.register(jaJP);
// 各页面也要补 ja-JP.ts 并 extend
```

设置页的「语言」入口会自动列出所有已注册 locale，用 `nativeName` 渲染（"日本語"在所有语言里都正确显示）。

---

## 6. 路由 label 走 i18n

`RouteDefinition.labelKey` 是 i18n 路径，约定 `route.<id>`。`label` 字段保留作兜底（labelKey 未配置或翻译失败时显示）：

```ts
{
  id: 'account',
  labelKey: 'route.account', // ← Sidebar tooltip / 设置页等会读这个 key
  label: 'Account',           // ← 兜底字面量
  icon: PersonRoundedIcon,
  element: <AccountPage />,
}
```

并在公用 locale 加：

```ts
// zh-CN.ts
{ route: { home: '首页', settings: '设置', account: '账户' } }
```

---

## 7. ViewModel 不持有"翻译后字符串"

ViewModel hook（`use<Page>`）**不要** import `useT()` 或返回最终的 `string`。它应该返回**数据 + 文案 key**，让 View 层用 `t()` 解析。

❌ 错：

```ts
// useHomePage.ts
const t = useT();
return { greeting: t('home.hero') }; // ← VM 与 i18n context 强耦合
```

✅ 对：

```ts
// useHomePage.ts —— 不引 i18n
return { greetingKey: 'home.hero' };

// HomePage.tsx
const t = useT();
return <h1>{t(vm.greetingKey)}</h1>;
```

例外：当 hook 必须基于"当前语言"派生（如 `Intl.DateTimeFormat` 格式化日期），那时引 `useI18n().current.code` 取语言码，但仍**不返回翻译字符串**。

---

## 8. 反例

❌ 在 JSX 里硬编码人类可见字符串：

```tsx
<Button>问候</Button>
<input placeholder="请输入名字" />
<IconButton aria-label="Close" />
```

❌ 在常量文件里写中文 / 英文用户文案：

```ts
const DEFAULT_RESULT = 'Please enter your name and tap Greet 👇'; // ← 应该走 t()
```

❌ 跨过 `t()` 直接拼接：

```tsx
<p>错误：{error}</p>  // ← '错误：' 必须来自 t('common.error') 或类似 key
```

❌ 重复在多个页面定义同义文案（应该提到 `common.*`）：

```ts
// home/lang/zh-CN.ts: { home: { common: { save: '保存' } } }
// account/lang/zh-CN.ts: { account: { common: { save: '保存' } } }
```

✅ 永远走 `useT()` + 命名空间分明的 key。

---

## 9. 与主题系统的关系

i18n 与主题（`src/styles/themes/`）**互不依赖**：

- `<I18nProvider>` 在最外层（任何子树都可能用到 `t`）；
- `<FoundationThemeProvider>` 紧随其后；
- 主题切换不影响文案；语言切换不影响配色。

设置页的「主题」section 卡片名（"明亮" / "黑暗" / "黑曜"）走 `settings.themes.<key>.label`，由 SettingsPage 的语言包提供，与主题系统的 `preset.label` 解耦。

---

## 10. localStorage key 一览（便于排查）

| key | 作用 |
|------|------|
| `foundation:locale` | 用户语言选择（'auto' / 'zh-CN' / 'en-US' ...） |
| `foundation:theme-choice` | 用户主题选择 |
| `foundation:custom-theme` | 自定义主题数据 |
| `foundation:preferences` | 显示偏好（showLogo / showTooltip） |

清掉以上 key 即可恢复出厂状态。

---

## 11. 设计约束摘要

- 公用 locale 文件保持精简：只放跨页面 key；
- 页面级语言包文件名固定为 `<code>.ts`（与全局 locale code 对齐）；
- key 用 camelCase / kebab 都可以，但**全局保持一致**；
- 所有 `Messages` 都是 `{ [k]: string | Messages }` 的纯对象（可序列化），不要塞函数 / JSX；
- 复数 / 性别 / 日期格式化等高级形态目前**不内置**，业务方需要时按需引 `Intl.PluralRules` 等原生 API，不必上 ICU。
