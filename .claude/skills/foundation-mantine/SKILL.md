---
name: foundation-mantine
description: Foundation 前端 Mantine 9 组件库总索引与铁律。汇总配色（--fd-* / FOUNDATION_CSS_VARS / useFoundationPalette）、CSS Modules 作为 MVVM 的 Style 文件、圆角语言、Tabler 图标、i18n、NativeDialogs、禁用 localStorage 等铁律；讲解 buildMantineTheme 如何把调色板编译成 Mantine theme（foundation 10 级色阶 / cssVariablesResolver / 全局组件覆盖）；附 MUI→Mantine 对照表与全部 foundation-mantine-* skill 导航。写任何前端 UI、使用任何 @mantine/* 组件、改 *.module.css、从 MUI 旧代码迁移时首先阅读。触发词：Mantine / @mantine/core / module.css / --fd- / FOUNDATION_CSS_VARS / useFoundationPalette / buildMantineTheme / createTheme / classNames / MUI 迁移 / sx 替换。
---

# Foundation × Mantine 9 总索引

本 SKILL 是 Foundation 前端 UI 开发的**唯一入口**：所有铁律在这里，具体组件 / 图标 / 图表 / 表格用法查子 SKILL（见文末导航）。

> 主题**注册 / 切换 / 自定义预设**的细节在 `foundation-theme`，本 SKILL 只讲"组件层怎么消费主题"与"主题如何编译成 Mantine theme"。

## 已安装依赖（`frontend/package.json`）

| 包 | 版本 | 用途 |
|---|---|---|
| `@mantine/core` | 9.7.5 | 核心组件 |
| `@mantine/hooks` | 9.7.5 | hooks（`useElementSize` / `useDisclosure` …） |
| `@mantine/charts` | 9.7.5 | 图表（基于 `recharts` 3.10.1）→ `foundation-mantine-charts` |
| `mantine-datatable` | 9.4.0 | 数据表格 → `foundation-mantine-datatable` |
| `@tabler/icons-react` | 3.50.0 | **唯一**图标库 → `foundation-mantine-icons` |
| `clsx` | ^2.1.1 | 拼接 className |

**未安装，不要 import**（需要时先征求用户同意再加依赖）：`@mantine/notifications`、`@mantine/modals`、`@mantine/form`、`@mantine/dates`、`@mantine/spotlight`、`@mantine/dropzone`、`@mantine/code-highlight`、`@mantine/tiptap`、`@mantine/carousel`。`@mui/*` / `@emotion/*` 已全部移除，**禁止再引入**。

全局样式入口 `frontend/src/styles/index.ts`（`main.tsx` / `child.tsx` 各 `import '@/styles'` 一次），顺序有意义：

```ts
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import 'mantine-datatable/styles.css';
import './global.css';               // body 背景 / 滚动条 / #root 布局，只用 --fd-*
```

---

## 主题是如何编译的（`frontend/src/styles/themes/buildMantineTheme.ts`）

`<FoundationThemeProvider>`（`ThemeProvider.tsx`）对当前 preset 做两件事，再交给 `<MantineProvider theme cssVariablesResolver forceColorScheme={preset.mode}>`：

1. **`buildCssVariablesResolver(preset)`** —— 把 `FoundationPalette` 写成 `:root` 上的 CSS 变量：

   | 变量 | 槽位 | 变量 | 槽位 |
   |---|---|---|---|
   | `--fd-bg-base` | 标题栏 / 最外层 | `--fd-text-primary` | 主文字 |
   | `--fd-bg-sidebar` | 侧边栏 | `--fd-text-secondary` | 次要文字 |
   | `--fd-bg-content` | 主内容区（页面默认背景） | `--fd-text-muted` | 弱化文字 / 提示 |
   | `--fd-bg-surface` | 卡片 / Paper | `--fd-divider` | 分隔线 / 边框 |
   | `--fd-bg-elevated` | 输入框 / 提升层 / 默认按钮底 | `--fd-accent` | 强调色 |
   | `--fd-bg-hover` | hover 半透明覆盖 | `--fd-accent-hover` | 强调色 hover |
   | `--fd-bg-active` | active / selected 半透明覆盖 | `--fd-danger` / `--fd-success` / `--fd-warning` | 状态色 |

   同时把 **Mantine 自身语义变量映射到 `--fd-*`**，所以没写样式的 Mantine 组件也跟随主题：

   | Mantine 变量 | → |
   |---|---|
   | `--mantine-color-body` | `--fd-bg-content` |
   | `--mantine-color-text` | `--fd-text-primary` |
   | `--mantine-color-dimmed` | `--fd-text-secondary`（即 `c="dimmed"`） |
   | `--mantine-color-placeholder` | `--fd-text-muted` |
   | `--mantine-color-default` / `-default-hover` / `-default-color` / `-default-border` | `--fd-bg-elevated` / `--fd-bg-hover` / `--fd-text-primary` / `--fd-divider`（即 `variant="default"`） |
   | `--mantine-color-error` | `--fd-danger`（输入框 `error`） |
   | `--mantine-color-anchor` | `--fd-accent` |

   light / dark 两套写同样的值；`forceColorScheme` 只会命中其中一套。主题切换 = 换变量值，**组件零重渲染**。

2. **`buildMantineTheme(preset)`** —— `createTheme({...})`：
   - `primaryColor: 'foundation'`、`primaryShade: 6`；`colors.foundation` 由 `accentTuple(accent, accentHover)` 生成 10 级色阶：0–5 向白色混合，**6 = accent**，**7 = accentHover**（Mantine filled-hover 取 primaryShade+1），8–9 向黑色混合。所以 `<Button>` / `<Switch>` / `<Checkbox>` / `<Slider>` / `<Tabs>` / 焦点环**默认就是强调色**，不用传 `color`。accent 不是 3/6 位 hex 时色阶退化为纯 accent（自定义主题取色器因此对 accent 输出 hex）。
   - `fontFamily` = Inter 栈；`fontSizes: xs 12 / sm 13 / md 14 / lg 16 / xl 18`。
   - `radius: xs 2 / sm 4 / md 8 / lg 12 / xl 16`，**`defaultRadius: 'sm'`（4px）**——注意 Mantine 9 官方默认是 md（8px），本项目显式改回 4px。
   - `cursorType: 'pointer'`、`focusRing: 'auto'`、`other: { foundation: palette }`。
   - **全局组件覆盖**（`classNames` 指向 `mantineComponents.module.css`，颜色全是 `--fd-*`）：

     | 组件 | 覆盖 |
     |---|---|
     | `Button` | `root: .button`（字重 500、按下下沉 1px） |
     | `ActionIcon` | **`defaultProps.variant = 'subtle'`**；`.actionIcon[data-variant='subtle']`：透明底 + `--fd-text-secondary`，hover 时 `--fd-bg-hover` + `--fd-text-primary` |
     | `Paper` / `Card` | `.surface`：`--fd-bg-surface` 底 + `--fd-text-primary` |
     | `Popover` / `Menu` | `dropdown: .dropdown`（surface 底 + divider 边）；`Menu.item` hover 为 `--fd-bg-hover` |
     | `Input`（所有输入框共用） | `.input`：`--fd-bg-elevated` 底 + divider 边，hover / focus 边框 `--fd-accent` |
     | `Tooltip` | `defaultProps: { withArrow: true, openDelay: 300 }`；`.tooltip`：`--fd-bg-base` 底 + divider 边 + 12px |

   - preset 可带 `mantineOverrides`，用 `mergeThemeOverrides` 深合并在最后（见 `foundation-theme`）。

> 想给**所有**某类组件改默认值 / 默认样式：改 `buildMantineTheme.ts` 的 `components` + `mantineComponents.module.css`，不要在业务组件里重复写。

---

## 铁律

### 1. 配色：只用主题 token，禁止硬编码颜色

| 场景 | 写法 |
|---|---|
| `*.module.css`（**首选**） | `var(--fd-bg-surface)`、`var(--fd-text-muted)`、`var(--fd-accent)` … |
| 半透明 / 派生色 | `color-mix(in srgb, var(--fd-accent) 20%, transparent)` |
| TS 里需要"引用"颜色（图表 `color`、内联 `style`、mantine-datatable 颜色 props） | `FOUNDATION_CSS_VARS.accent` / `.bg.surface` / `.text.muted` / `.status.danger`（值就是 `'var(--fd-…)'` 字符串）从 `@/styles/themes` 导入 |
| 必须拿**真实色值**（canvas、需要插值计算、只吃具体颜色的三方库） | `useFoundationPalette()` → `FoundationPalette` 对象 |
| Mantine 组件 `color` prop | 默认不传（已是 foundation 强调色）；需要显式时用 `"foundation"`。状态色优先用 CSS class + `--fd-danger` 等，而不是 `color="red"` |

```css
/* ✅ */
.card { background-color: var(--fd-bg-surface); border: 1px solid var(--fd-divider); }
.badge[data-kind='custom'] { background-color: var(--fd-bg-active); color: var(--fd-accent); }

/* ❌ 硬编码 */
.card { background: #fff; border-color: rgba(0,0,0,.1); }
```

```tsx
// ✅ TS 引用变量（主题切换无需重渲染）
<BarChart series={[{ name: 'v', color: FOUNDATION_CSS_VARS.accent }]} gridColor={FOUNDATION_CSS_VARS.divider} />
// ✅ 必须真实色值时
const fp = useFoundationPalette();
<HeatmapChart colorMap={{ min: fp.bg.surface, max: fp.accent }} />
// ❌
<Text c="#3f4a5a">…</Text>
<Button color="blue">…</Button>
```

例外：Mantine 自带的中性变量（如 `var(--mantine-color-white)` 用于 filled 按钮上的文字、`var(--mantine-font-family)`）可用；图表系列色板里的 Mantine 色阶 token（`'violet.5'` 等）只允许出现在 `useChartColors` 里（见 charts skill）。

### 2. 样式：CSS Modules 是 MVVM 的 Style 文件

每个组件 / 页面一个文件夹，三件分离：

```
components/Foo/
├── Foo.tsx            # View：只渲染，classNames 来自 classes.*
├── useFoo.ts          # ViewModel：状态 / 调 service，不产出 JSX
├── Foo.module.css     # Style：全部样式，颜色只用 --fd-*
└── index.ts
```

```tsx
import classes from './Foo.module.css';
<div className={classes.root} data-active={isActive || undefined}>…</div>
```

规则：
- **不要**再写 `<Name>.styles.ts`、`sx`、`styled`、`useTheme`（MUI 时代产物）。
- 不要用 Mantine style props 堆样式（`c` / `fw` / `mt` / `bg` …）——现有代码全部走 CSS Modules；布局组件的 `gap` 等少量结构性 prop 可以用。
- 状态用 **data 属性**而非拼 class：`data-active={x || undefined}` + CSS `.item[data-active]`。Mantine 自己也用 `[data-disabled]`、`[data-variant='subtle']`、`[data-hovered]` 等（各组件的 data 属性见 components skill 的 references/official 里的 Styles API 表）。
- 改 Mantine 组件内部元素：`className`（root）或 `classNames={{ root, input, label, dropdown, … }}`（selector 名见官方 Styles API）。示例：`Personalization.tsx` 的 `<ColorInput classNames={{ root: classes.paletteInputRoot, input: classes.paletteInput }} />`。
- **优先级坑**：Mantine 的 `styles.css` 不在 `@layer` 中，和你的 module class 同优先级时谁后加载谁赢。要压过全局覆盖（如 ActionIcon subtle 的 hover），把选择器写两次提权：`.item.item:hover {…}`（见 `Sidebar.module.css`）。
- 只依赖运行时数值的样式（计算出的宽度、depth 缩进等）可用内联 `style`，值仍用 CSS 变量：`style={{ '--dg-depth': depth } as CSSProperties}`。
- 三方库内部 class 用 `:global(...)` 改写（见 `x-pro/data-grid/DataGrid.module.css`）。
- 子页面可以混用父页面共享样式：`import shared from '../SettingsPage.module.css'`（`shared.section` / `shared.sectionTitle` / `shared.sectionHint`）。

### 3. 圆角语言

| 元素 | 值 | 来源 |
|---|---|---|
| Mantine 组件默认（Button / ActionIcon / Input / Paper / Card / Badge …） | 4px（`defaultRadius: 'sm'`） | theme，**不要逐个覆盖** |
| 项目自绘列表项 / 卡片 / 行（Sidebar item、设置卡片、表行） | 6px | 各 `*.module.css` 现行写法 |
| 容器（DataGrid 外框等大块容器） | 8px（`md`） | `DataGrid.module.css` |
| 小徽标 / 工具栏小按钮 | 3–4px | `Database.module.css` |

需要用 Mantine token 时写 `radius="md"` 或 CSS `var(--mantine-radius-md)`；新组件沿用上表，别随手发明新圆角。

### 4. 图标：只用 `@tabler/icons-react`

`import { IconTrash } from '@tabler/icons-react'`，统一 `stroke={1.75}`，尺寸按场景取 14/16/18/20/24。禁止 emoji、Unicode 符号（✓ ✕ ▶ …）、其他图标包。路由图标类型是 Tabler 的 `Icon`。详见 `foundation-mantine-icons`。

### 5. i18n：所有人类可见字符串走 `t()`

`const t = useT()`（`@/i18n`）。覆盖 JSX 文本、`label` / `description` / `placeholder` / `error`、`aria-label`、`Tooltip label`、`Modal title`、`nothingFoundMessage`、表头 `title` / `headerName`、图表 series `label`、空状态文案。组件库自带的英文默认文案（如 CandlestickChart tooltip 的 open/high/low/close、mantine-datatable 的 noRecordsText）也要传 `t()` 覆盖。详见 `foundation-i18n`。

### 6. 对话框：系统级交互走 `NativeDialogs`

确认 / 提示 / 打开文件 / 保存文件 / 选目录 → `NativeDialogs.confirm / info / warning / error / openFile / openFiles / openDirectory / saveFile`（`@/services`）。**禁止** `alert` / `confirm` / `prompt`、`<input type="file">`、`<FileInput>` / `<FileButton>`（它们底层是浏览器文件选择）。Mantine `Modal` / `Drawer` 只用于自定义内容（复杂表单、预览、多步向导），不要拿来做简单的"确定吗？"。

```tsx
const ok = await NativeDialogs.confirm({
  title: t('settings.database.confirmReset.title'),
  message: t('settings.database.confirmReset.message'),
  okLabel: t('settings.database.confirmReset.ok'),
  cancelLabel: t('settings.database.confirmReset.cancel'),
});
```

### 7. 持久化：禁止浏览器存储

不准用 `localStorage` / `sessionStorage`，也不准用会写它们的 Mantine API：`useLocalStorage` / `useSessionStorage`（`@mantine/hooks`）、`localStorageColorSchemeManager`、mantine-datatable 的 `storeColumnsKey` / `useDataTableColumns`。跨会话状态走 `PreferencesService` / `AppSettingsService` 或业务 service（见 `foundation-persistence`）。

### 8. 配色方案由主题系统决定

`MantineProvider` 用 `forceColorScheme={preset.mode}`。**不要**调用 `useMantineColorScheme().setColorScheme / toggleColorScheme`，也不要用 `light-dark()` 写两套颜色——切换主题走 `useFoundationTheme().setChoice(...)`，颜色差异由 preset 的 palette 承担。

### 9. 调用链

```
View (.tsx) → ViewModel hook (use<Name>.ts) → services/<Domain>Service.ts → @bindings/...
```

View / ViewModel 都不直接 import `@bindings/*`。ViewModel 暴露 i18n key，View 调 `t()`。

---

## 标准示例：`components/Sidebar/`（迁移后的范本）

```tsx
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import classes from './Sidebar.module.css';

const Icon = r.icon ?? IconHome;               // r.icon: Icon（Tabler）
<Tooltip label={label} position="right">       {/* withArrow / openDelay 来自全局默认 */}
  <ActionIcon                                  /* variant 默认 subtle（全局） */
    onClick={() => navigate(r.id)}
    className={classes.item}
    data-active={isActive || undefined}
    aria-label={label}
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon size={24} stroke={1.75} />
  </ActionIcon>
</Tooltip>
```

```css
/* 提权压过全局 .actionIcon[data-variant='subtle'] */
.item.item { width: 48px; height: 48px; border-radius: 6px; color: var(--fd-text-secondary); }
.item.item:hover { background-color: var(--fd-bg-hover); color: var(--fd-text-primary); }
.item.item[data-active],
.item.item[data-active]:hover { color: var(--fd-accent); background-color: var(--fd-bg-active); }
```

其它可参考：`pages/SettingsPage/`（`UnstyledButton` 卡片选择、`Switch` 开关行、`ColorInput` 取色、`Button` filled/default）、`pages/HomePage/`（`TextInput` + `Button` 表单）、`childwindows/ConfirmWindow/`。

---

## MUI → Mantine 对照表（老代码迁移 / 习惯 MUI 的人）

| MUI | Mantine 9 / 本项目 | 备注 |
|---|---|---|
| `sx` / `styled` / `*.styles.ts` 工厂 | `*.module.css` + `className` / `classNames` | 换算：MUI spacing `n` → `n*8px`；`borderRadius: n`（数字）→ `n*4px` |
| `theme.palette.foundation.x` | CSS `var(--fd-x)` / TS `FOUNDATION_CSS_VARS.x` / `useFoundationPalette().x` | |
| `useTheme()` | 基本不需要；Mantine theme 用 `useMantineTheme()`，项目主题用 `useFoundationTheme()` | |
| `CssBaseline` | `@mantine/core/styles.css` + `styles/global.css` | |
| `Box` | `Box`（或普通 `div`） | |
| `Stack direction="row"` | `Group`（横向）/ `Stack`（纵向）/ `Flex` | `spacing` → `gap` |
| `Grid container/item xs` | `Grid` + `Grid.Col span` / `SimpleGrid cols` | Mantine 9：`gutter` 改名 **`gap`** |
| `Container` | `Container` | |
| `Typography` | `Text` / `Title order` | `color` 已移除，用 `c`；项目里一般用 class |
| `Button variant="contained/outlined/text"` | `Button variant="filled/outline/subtle"`；中性按钮 `variant="default"` | `startIcon/endIcon` → `leftSection/rightSection` |
| `IconButton` | `ActionIcon`（默认 subtle） | 必须带 `aria-label={t(...)}` |
| `TextField` | `TextInput` / `Textarea` / `NumberInput` / `PasswordInput` | `helperText` → `description`；`error` 传文案 |
| `Select` | `Select`（`data=[{value,label}]`） | `onChange(value: string \| null, option)` |
| `Autocomplete` | `Autocomplete`（自由输入）/ `Select searchable` / `MultiSelect` / `TagsInput` | |
| `Checkbox` / `Switch` | `Checkbox` / `Switch` | `onChange(e)` → `e.currentTarget.checked` |
| `RadioGroup` | `Radio.Group` + `Radio` | `onChange(value)` |
| `Slider` | `Slider` / `RangeSlider` | |
| `ToggleButtonGroup` | `SegmentedControl` / `Chip.Group` | |
| `Rating` | `Rating` | |
| `Tooltip title=` | `Tooltip label=` | |
| `Dialog` | `Modal`（`opened` / `onClose` / `title`） | 简单确认走 NativeDialogs |
| `Drawer` | `Drawer` | |
| `Menu` + `MenuItem` | `Menu` + `Menu.Target` + `Menu.Dropdown` + `Menu.Item` | |
| `Popover` / `Popper` | `Popover`（`Popover.Target` / `Popover.Dropdown`）/ `HoverCard` | |
| `ClickAwayListener` | `useClickOutside`（`@mantine/hooks`） | |
| `Portal` / `Modal`(base) | `Portal` / `Overlay` | |
| `Paper` / `Card` | `Paper` / `Card`（已全局 surface 化） | |
| `Accordion` | `Accordion` + `.Item value` / `.Control` / `.Panel` | |
| `AppBar` | 项目 `TitleBar` 组件 / `AppShell` | |
| `Divider` | `Divider` | |
| `Chip` | `Badge`（展示）/ `Chip`（可选） | |
| `Avatar` / `Badge`(角标) | `Avatar` / `Indicator` | |
| `List` / `ListItemButton` | `NavLink` 或 `UnstyledButton` + module.css | 设置页左列就是 UnstyledButton |
| `Table` | `Table`（`Table.Thead/Tbody/Tr/Th/Td`）；数据表格用 mantine-datatable | |
| `DataGrid`（`@mui/x-data-grid`） | `DataTable`（mantine-datatable）/ 项目 `DataGridPro` / `DataGridPremium` | 见 datatable skill |
| `@mui/x-charts` | `@mantine/charts` / 项目 `x-pro/charts` | 见 charts skill |
| `Tabs` / `Tab` | `Tabs` + `Tabs.List` / `Tabs.Tab value` / `Tabs.Panel value` | `onChange(value: string \| null)` |
| `Breadcrumbs` / `Pagination` / `Stepper` | `Breadcrumbs` / `Pagination` / `Stepper` | |
| `Link` | `Anchor` | |
| `Alert` | `Alert`（`title` / `icon` / `color`） | |
| `Snackbar` | 内联 `Alert` / `Notification`（静态组件） | `@mantine/notifications` 未安装 |
| `LinearProgress` / `CircularProgress` | `Progress` / `Loader`（`RingProgress` 环形） | |
| `Backdrop` | `Overlay` / `LoadingOverlay` | |
| `Skeleton` | 项目 `@/components/Skeleton`（优先，已主题化）/ Mantine `Skeleton` | |
| `Collapse in=` / `Fade` / `Grow` | `Collapse expanded=`（Mantine 9 改名）/ `Transition` | |
| `useMediaQuery` | `useMediaQuery`（`@mantine/hooks`） | |
| `TextareaAutosize` | `Textarea autosize` | |
| `GlobalStyles` | `styles/global.css` | |
| `@mui/icons-material/XxxRounded` | `@tabler/icons-react` `IconXxx` | 见 icons skill |

Mantine 9 相对 7/8 的破坏性变更（AI 训练数据里常见旧写法）：`Text`/`Anchor` 的 `color` → `c`；`Collapse in` → `expanded`；`Grid gutter` → `gap`；`Spoiler initialState` → `defaultExpanded`；`light` 变体改为实色；默认圆角 sm → md（本项目已改回 sm）。完整列表见 `references/official/guides-8x-to-9x.md`。

---

## Skill 导航

| Skill | 内容 |
|---|---|
| [foundation-mantine-components](../foundation-mantine-components/SKILL.md) | 布局 / 输入 / 浮层与反馈 / 导航 / 数据展示 / 常用 hooks 的项目式用法 + 78 篇官方文档（9.7.5） |
| [foundation-mantine-icons](../foundation-mantine-icons/SKILL.md) | Tabler 图标规范：尺寸 / stroke、查找名称、`Icon` 类型、MUI 图标对照 |
| [foundation-mantine-charts](../foundation-mantine-charts/SKILL.md) | `@mantine/charts` + 项目 x-pro 图表（Heatmap/Funnel/Radar/Candlestick/Sankey/Gantt/Treemap/Zoomable）+ 配色规则 |
| [foundation-mantine-datatable](../foundation-mantine-datatable/SKILL.md) | `mantine-datatable` + 项目 `DataGridPro` / `DataGridPremium` |
| `foundation-theme` | 主题预设注册 / 切换 / 自定义主题 / `mantineOverrides` |
| `foundation-i18n` | `useT()`、页面级语言包、组件级语言包注册 |
| `foundation-persistence` | 前端跨会话状态的唯一出路 |

## references

- `references/official/`：Mantine 官方 LLM 文档（https://mantine.dev/llms/*.md，对应 9.7.5，2026-11-06 拉取）—— 主题对象 `theming-theme-object.md`、颜色 `theming-colors.md`、组件默认值 `theming-default-props.md`、`MantineProvider`、CSS Modules `styles-css-modules.md`、Styles API `styles-styles-api.md`、CSS 变量 `styles-css-variables.md`、data 属性 `styles-data-attributes.md`、style props、variants & sizes、多态组件 `guides-polymorphic.md`、迁移 `guides-8x-to-9x.md`。
  官方示例里的 `color="blue"`、十六进制、`light-dark()`、`localStorageColorSchemeManager` 等写法**不适用于本项目**，套用前按上面的铁律改写。
- 类型以 `frontend/node_modules/@mantine/core/lib/components/<Name>/<Name>.d.ts` 为准，文档与类型不一致时信类型。
