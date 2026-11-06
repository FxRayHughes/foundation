---
name: foundation-mantine-components
description: Mantine 9.7.5 核心组件在 Foundation 项目中的实战用法：布局（Box/Stack/Group/Flex/Grid/SimpleGrid/ScrollArea/AppShell/Splitter）、输入（Button/ActionIcon/UnstyledButton/TextInput/NumberInput/Textarea/Select/MultiSelect/Autocomplete/TagsInput/Checkbox/Radio/Switch/Slider/SegmentedControl/Chip/ColorInput）、浮层与反馈（Tooltip/Popover/HoverCard/Menu/Modal/Drawer/Alert/Notification/Loader/LoadingOverlay/Progress/Skeleton/Collapse/Transition）、导航（Tabs/NavLink/Breadcrumbs/Pagination/Stepper/Anchor）、数据展示（Text/Title/Badge/Avatar/Indicator/Divider/Table/Paper/Card/Accordion/Kbd/EmptyState/Tree）与常用 @mantine/hooks，附 78 篇官方文档。写具体组件代码、查 props / Styles API / data 属性时使用。
---

# Mantine 9 组件 × Foundation 实战

前置：先读 `foundation-mantine` 的铁律（`--fd-*` 配色、`*.module.css`、Tabler 图标、`t()`、NativeDialogs、禁 localStorage）。本 SKILL 只讲"在本项目里怎么用"，完整 props / Styles API 查 `references/official/core-<name>.md`，**类型以 `frontend/node_modules/@mantine/core/lib/components/<Name>/*.d.ts` 为准**。

## 0. 通用约定

```tsx
import { Button, Text, TextInput } from '@mantine/core';   // 全部从包根命名导入
import { IconFolderOpen } from '@tabler/icons-react';
import { useT } from '@/i18n';
import classes from './Foo.module.css';
```

- **全局已主题化，不要重复配置**：Button（字重 / 按压）、ActionIcon（默认 `variant="subtle"`）、Paper/Card（surface 底）、Popover/Menu dropdown、所有 Input、Tooltip（`withArrow` + `openDelay 300`）。默认圆角 4px，主色 = 强调色。
- **样式入口三选一**：`className`（作用于 root）、`classNames={{ <selector>: classes.x }}`（内部元素）、全局改 `buildMantineTheme.ts`。selector 名在官方文档末尾 "Styles API" 表。
- **状态 data 属性**：Mantine 组件会打 `data-disabled` / `data-variant` / `data-active` / `data-checked` / `data-hovered` / `data-expanded` / `data-error` 等，CSS 直接选：`.btn[data-disabled] {…}`。自绘组件也用 `data-active={x || undefined}`。
- **尺寸 token**：`size="xs|sm|md|lg|xl"`；字号 token xs 12 / sm 13 / md 14 / lg 16 / xl 18（项目定制）。
- **受控事件签名差异**（最易写错）：

  | 组件 | onChange 参数 |
  |---|---|
  | `TextInput` / `Textarea` / `PasswordInput` | `React.ChangeEvent` → `e.currentTarget.value` |
  | `Checkbox` / `Switch` / `Radio`（单个） | `ChangeEvent` → `e.currentTarget.checked` |
  | `NumberInput` | `number \| string`（输入中间态为字符串，需自行判 `typeof v === 'number'`） |
  | `Select` / `Autocomplete`(string) | `Select`: `(value: string \| null, option)`；`Autocomplete`: `(value: string)` |
  | `MultiSelect` / `TagsInput` / `Checkbox.Group` / `Chip.Group multiple` | `string[]` |
  | `Radio.Group` / `SegmentedControl` / `Chip.Group` | `string` |
  | `Slider` | `number`（拖动中）；`onChangeEnd` 松手 |
  | `Tabs` | `string \| null` |
  | `ColorInput` | `string`（按 `format` 输出） |
  | `Modal` / `Drawer` | 无 onChange，`opened` + `onClose` |

---

## 1. 布局

| 组件 | 用途 | 关键 props |
|---|---|---|
| `Box` | 万能容器，`component="nav"` 等改标签 | `component`、`className` |
| `Stack` | 纵向排列 | `gap`、`align`、`justify` |
| `Group` | 横向排列（默认 `align="center"`、`wrap="wrap"`） | `gap`、`justify`、`wrap`、`grow` |
| `Flex` | 需要 direction/wrap 响应式时 | `direction`、`gap`、`align`、`justify`、`wrap` |
| `Grid` + `Grid.Col` | 12 栏 | **`gap`**（9.x 由 gutter 改名）、`Grid.Col span` |
| `SimpleGrid` | 等宽网格 | `cols`、`spacing`、`verticalSpacing`（可传对象做断点） |
| `Center` / `Container` / `Space` / `AspectRatio` | 居中 / 限宽 / 间距 / 比例 | |
| `ScrollArea` / `ScrollArea.Autosize` | 自定义滚动条区域 | `h` / `mah`、`type`、`scrollbars`、`viewportRef`、`onBottomReached` |
| `Splitter` | 可拖拽分栏 | `orientation`、`sizes`、`onSizeChange` |
| `AppShell` | 整页骨架 | 本项目**不用**——主窗口骨架是 `components/AppLayout`（TitleBar + Sidebar + 内容），不要再套 AppShell |

项目惯例：**页面级版式（两列、卡片网格）用 module.css 的 flex/grid**，Mantine 布局组件用于局部对齐。例如设置页：

```css
/* SettingsPage.module.css */
.root   { flex: 1; min-height: 0; display: flex; overflow: hidden; background-color: var(--fd-bg-content); }
.list   { width: 220px; flex-shrink: 0; border-right: 1px solid var(--fd-divider); background-color: var(--fd-bg-sidebar); overflow-y: auto; }
.detail { flex: 1; min-width: 0; overflow-y: auto; padding: 40px 48px; display: flex; flex-direction: column; gap: 32px; }
/* Personalization.module.css */
.grid   { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
```

> 布局容器在 flex 中要能收缩时记得 `min-width: 0` / `min-height: 0`（全局 `#root` 是 `100vh` flex 列）。

标题栏拖拽区：frameless 窗口用 `style={{ '--wails-draggable': 'drag' } as CSSProperties}`，里面的按钮区域用 `'no-drag'`（见 `components/TitleBar`）。

---

## 2. 输入

### Button / ActionIcon / UnstyledButton

```tsx
// 主操作 / 次操作（Database.tsx）
<Button variant="filled" leftSection={<IconFolderOpen size={20} stroke={1.75} />} disabled={busy} onClick={handleChange}>
  {t('settings.database.actions.change')}
</Button>
<Button variant="default" leftSection={<IconRestore size={20} stroke={1.75} />} onClick={handleReset}>
  {t('settings.database.actions.reset')}
</Button>
// 小号描边（HomePage）
<Button variant="outline" size="xs" leftSection={<IconExternalLink size={18} stroke={1.75} />}>…</Button>
// 工具栏文字按钮（DataGridPremium）
<Button size="xs" variant="subtle" leftSection={<IconFileTypeCsv size={16} stroke={1.75} />}>…</Button>
// 加载态
<Button loading={saving}>{t('common.save')}</Button>

// 图标按钮：必须 aria-label；默认 subtle 已主题化
<ActionIcon aria-label={t('dataGrid.expandRow')} onClick={toggle}><IconChevronRight size={16} stroke={1.75} /></ActionIcon>
```

- variants：`filled | light | outline | transparent | white | subtle | default | gradient`。项目常用：`filled`（主）、`default`（中性，底色 `--fd-bg-elevated`）、`outline`、`subtle`。
- `Button.Group` 拼接按钮组；`fullWidth`；`justify`。
- **自绘可点击块**（卡片选择、列表项、工具栏小按钮）用 `UnstyledButton` + module.css，而不是硬改 Button：

```tsx
<UnstyledButton className={classes.card} data-active={active || undefined} aria-pressed={active} onClick={() => vm.setThemeChoice(option.value)}>
  <Text className={classes.cardLabel}>{label}</Text>
  <Text className={classes.cardDesc}>{desc}</Text>
</UnstyledButton>
```

```css
.card { padding: 16px; border-radius: 6px; border: 1px solid var(--fd-divider); background-color: var(--fd-bg-surface); text-align: left; }
.card:hover { background-color: var(--fd-bg-hover); }
.card[data-active], .card[data-active]:hover { border-color: var(--fd-accent); background-color: var(--fd-bg-active); }
```

- 覆盖 filled 按钮禁用态（Mantine 默认禁用为灰）：`.actionPrimary[data-disabled] { background-color: var(--fd-accent); color: var(--mantine-color-white); opacity: .6; }`（Database.module.css）。

### 文本类输入

```tsx
<form onSubmit={(e) => { e.preventDefault(); void greet(); }}>
  <TextInput
    value={name}
    onChange={(e) => setName(e.currentTarget.value)}
    label={t('form.name')}
    description={t('form.nameHint')}
    placeholder={t('home.backendCard.placeholder')}
    error={nameError ? t(nameError) : undefined}
    autoComplete="off"
  />
  <Button type="submit">{t('home.backendCard.submit')}</Button>
</form>
```

- 公共 props（`__BaseInputProps`）：`label`、`description`、`error`、`required`、`withAsterisk`、`leftSection`、`rightSection`、`size`、`radius`、`disabled`、`readOnly`。
- `NumberInput`：`min` / `max` / `step` / `decimalScale` / `prefix` / `suffix` / `thousandSeparator` / `hideControls` / `clampBehavior`。
- `Textarea autosize minRows maxRows`；`PasswordInput`；`PinInput`；`JsonInput`；`MaskInput`。
- 所有输入框的底色 / 边框 / focus 色由全局 `.input` 覆盖统一，不要再在页面里改 border-color。

### 选择类

```tsx
<Select
  label={t('form.department')}
  data={vm.departments.map((d) => ({ value: d.id, label: t(d.labelKey) }))}
  value={vm.department}
  onChange={(v) => vm.setDepartment(v)}     // string | null
  searchable
  clearable
  nothingFoundMessage={t('common.nothingFound')}
  allowDeselect={false}
/>
<MultiSelect data={…} value={vm.tags} onChange={vm.setTags} />
<SegmentedControl data={[{ value: 'day', label: t('gantt.day') }, { value: 'week', label: t('gantt.week') }]} value={mode} onChange={setMode} />
<Radio.Group value={v} onChange={setV} label={t('…')}><Group gap="md"><Radio value="a" label={t('…a')} /><Radio value="b" label={t('…b')} /></Group></Radio.Group>
```

- `Select` vs `Autocomplete`：Select 值必须来自 data；Autocomplete 是自由文本 + 建议。多值用 `MultiSelect` / `TagsInput`。
- 完全自定义下拉用 `Combobox`（见 `core-combobox.md`），一般不需要。
- `NativeSelect` 是原生 `<select>`，样式受限，少用。

### 开关 / 勾选 / 滑块 / 取色

```tsx
// 设置页开关行（Personalization.tsx）：文字在左、Switch 在右，开关本身不带 label 时必须 aria-label
<div className={classes.switchRow}>
  <div className={classes.switchTexts}>
    <Text className={classes.switchLabel}>{label}</Text>
    <Text className={classes.switchDesc}>{t(descriptionKey)}</Text>
  </div>
  <Switch checked={vm.preferences[key]} onChange={(e) => vm.setPreference(key, e.currentTarget.checked)} aria-label={label} />
</div>

<Checkbox checked={v} indeterminate={partial} onChange={(e) => setV(e.currentTarget.checked)} label={t('…')} />
<Slider min={0} max={100} value={v} onChange={setV} onChangeEnd={commit} label={(n) => `${n}%`} />

// 取色（Personalization.tsx）：format 跟随当前值，accent 必须 hex
<ColorInput size="xs" value={value} onChange={onChange} format={formatOf(value)} withEyeDropper={false}
  aria-label={t('settings.personalization.customTheme.a11y.colorValueFor', { label })}
  classNames={{ root: classes.paletteInputRoot, input: classes.paletteInput }}
  popoverProps={{ position: 'bottom-end' }} />
```

其它：`Chip` / `Chip.Group`、`Rating`、`RangeSlider`、`AngleSlider`、`ColorPicker`、`ColorSwatch`、`Toggle`。

**禁止**：`FileInput` / `FileButton`（浏览器文件选择）→ 用 `NativeDialogs.openFile/openFiles/openDirectory/saveFile`。

---

## 3. 浮层与反馈

### Tooltip

```tsx
<Tooltip label={t('actions.delete')} position="right">   {/* withArrow / openDelay 全局默认 */}
  <ActionIcon aria-label={t('actions.delete')}><IconTrash size={18} stroke={1.75} /></ActionIcon>
</Tooltip>
```

子元素必须能接 ref（Mantine 组件 / 原生元素都可以）。Sidebar 示例：偏好 `showTooltip` 关闭时不包 Tooltip，但 `aria-label` 保留。禁用按钮外要包一层 `<span>` 或用 `Tooltip` 的 `events` 处理（见 `core-button.md` "Disabled button with Tooltip"）。

### Popover / HoverCard / Menu

```tsx
<Menu position="bottom-end" withinPortal>
  <Menu.Target>
    <ActionIcon aria-label={t('common.more')}><IconDots size={18} stroke={1.75} /></ActionIcon>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Label>{t('menu.section')}</Menu.Label>
    <Menu.Item leftSection={<IconEdit size={16} stroke={1.75} />} onClick={onEdit}>{t('actions.edit')}</Menu.Item>
    <Menu.Divider />
    <Menu.Item className={classes.dangerItem} leftSection={<IconTrash size={16} stroke={1.75} />} onClick={onDelete}>{t('actions.delete')}</Menu.Item>
  </Menu.Dropdown>
</Menu>
```

- dropdown 底色 / 边框 / item hover 已全局覆盖；危险项用 class（`color: var(--fd-danger)`）而非 `color="red"`。
- Menu 还有 `Menu.Sub`、`Menu.CheckboxItem`、`Menu.RadioItem`、`Menu.ContextMenu`（右键菜单）、`Menu.Search`。
- `Popover`：`Popover.Target` + `Popover.Dropdown`，`opened` / `onChange` 受控，`trapFocus`、`width="target"`。
- 点击外部关闭自绘浮层：`useClickOutside(() => close())`。

### Modal / Drawer

```tsx
const [opened, { open, close }] = useDisclosure(false);   // @mantine/hooks
<Modal opened={opened} onClose={close} title={t('editor.title')} centered size="lg">
  <Stack gap="md">…表单…</Stack>
  <Group justify="flex-end" className={classes.modalActions}>
    <Button variant="default" onClick={close}>{t('common.cancel')}</Button>
    <Button onClick={submit}>{t('common.save')}</Button>
  </Group>
</Modal>
<Drawer opened={opened} onClose={close} position="right" title={t('…')}>…</Drawer>
```

- 只用于**自定义内容**；"确定删除？/ 提示 / 报错"一律 `NativeDialogs.confirm / info / warning / error`。
- 需要独立窗口（可拖出主窗口）的对话 → 子窗口系统（`foundation-childwindow`），不是 Modal。
- `@mantine/modals`（`modals.openConfirmModal`）**未安装**。

### Alert / Notification（无 toast 系统）

```tsx
<Alert icon={<IconAlertCircle size={18} stroke={1.75} />} title={t('…title')} className={classes.alertDanger}>{t('…message')}</Alert>
```

- `@mantine/notifications`（`notifications.show`）**未安装**。轻量反馈用：页面内状态行（`Database.tsx` 的 `StatusLine`：`.status` 用 `--fd-text-muted`、`.statusError` 用 `--fd-danger`）、内联 `Alert`、或静态 `Notification` 组件自行定位。
- 状态色：Alert 的 `color` 会走 Mantine 色板，项目内建议用 class 设 `--alert-bg` / `--alert-color` / `--alert-bd` 为 `color-mix(in srgb, var(--fd-danger) 12%, transparent)` 等。

### 加载 / 进度 / 骨架

| 需求 | 用 |
|---|---|
| 行内 / 按钮加载 | `<Button loading>`、`<Loader size="sm" />`（颜色默认强调色） |
| 区块遮罩 | `<LoadingOverlay visible={loading} />`（父级需 `position: relative`） |
| 进度条 / 环 | `Progress value`、`RingProgress`、`SemiCircleProgress` |
| 首屏 / 路由占位 | **项目 `@/components/Skeleton`**（`Skeleton` / `SkeletonText`，已主题化 + reduced-motion），每个页面配 `<Page>.skeleton.tsx` 作为 `RouteDefinition.fallback` |

### 过渡

`Collapse expanded={open}`（**9.x：`in` 改名 `expanded`**，默认 `keepMounted` 用 React 19 Activity 保留状态）；`Transition mounted transition="fade" duration`。

---

## 4. 导航

```tsx
<Tabs value={tab} onChange={(v) => v && setTab(v)}>
  <Tabs.List>
    <Tabs.Tab value="general" leftSection={<IconSettings size={16} stroke={1.75} />}>{t('tabs.general')}</Tabs.Tab>
    <Tabs.Tab value="advanced">{t('tabs.advanced')}</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="general">…</Tabs.Panel>
  <Tabs.Panel value="advanced">…</Tabs.Panel>
</Tabs>
```

- 全局导航不要自己造：**主导航 = `routes.tsx` 路由表 + Sidebar**，`useRouter().navigate(id)` 跳转。
- 侧栏式列表：设置页左列是 `UnstyledButton` + `data-active` + 3px indicator（`SettingsPage.module.css` 的 `.listItem` / `.listItemIndicator`）；也可用 `NavLink`（`label` / `description` / `leftSection` / `active` / 嵌套 children）。
- `Breadcrumbs`、`Pagination total value onChange`、`Stepper active onStepClick` + `Stepper.Step`、`Anchor`（链接，外链请走 Wails `Browser.OpenURL`）。

---

## 5. 数据展示

| 组件 | 项目用法 |
|---|---|
| `Text` | 文字基本单元，样式走 class：`<Text className={shared.sectionTitle}>`。Mantine 9 无 `color` prop（用 `c`，但项目偏好 class） |
| `Title order={1..6}` | 页面主标题（SettingsPage 详情标题 `order={1}` + class） |
| `Badge` | 标签 / 状态胶囊；或像 Database 页用 `<span className={classes.badge} data-kind="custom">` 自绘 |
| `Avatar` / `Indicator` / `ThemeIcon` / `Kbd` / `Code` / `Mark` / `Highlight` | 头像 / 角标 / 图标底块 / 快捷键 / 代码 / 高亮 |
| `Divider` | 分隔线（颜色走 `--mantine-color-default-border` = `--fd-divider`）；Sidebar 里的短分隔线是自绘 div |
| `Paper` / `Card` | 卡片（已 surface 化）：`<Paper className={classes.card}>` 再在 class 里补 padding / 边框 / 圆角 |
| `Accordion` | `Accordion.Item value` / `.Control` / `.Panel`，`multiple` |
| `Table` | 简单静态表格：`Table.Thead/Tbody/Tr/Th/Td` 或 `data={{ head, body }}`；要排序 / 分页 / 选择 → mantine-datatable |
| `List` / `Timeline` / `Tree` / `DataList` / `EmptyState` / `Spoiler` / `NumberFormatter` | 列表 / 时间线 / 树 / 键值列表 / 空状态 / 折叠长文 / 数字格式化 |

空状态：项目现有写法是居中的 muted 文字（`Database.module.css .emptyChart`），也可用 `EmptyState`（`icon` / `title` / `description`），文案走 `t()`。

---

## 6. 常用 hooks（`@mantine/hooks`）

| hook | 用途 / 项目示例 |
|---|---|
| `useElementSize()` | `{ ref, width, height }` 自适应尺寸（`HeatmapChart`、`GanttChart`） |
| `useDisclosure(initial)` | `[opened, { open, close, toggle }]`，Modal/Drawer/Popover |
| `useClickOutside(handler)` | 自绘浮层外点关闭 |
| `useHotkeys([['mod+K', fn]])` | 窗口内快捷键（系统级快捷键走 Wails `GlobalShortcut`） |
| `useMediaQuery('(max-width: 48em)')` | 响应式 |
| `useDebouncedValue(v, 300)` / `useDebouncedCallback` | 搜索输入防抖 |
| `useClipboard()` | 复制到剪贴板（读写系统剪贴板也可走 Wails `Clipboard`） |
| `useMergedRef`、`useId`、`useUncontrolled`、`useListState`、`useInterval`、`useTimeout` … | 见 `references/official/hooks-*.md` |

**禁止**：`useLocalStorage` / `useSessionStorage`（违反持久化铁律，文档已从 references 剔除）。`useColorScheme` 只读系统偏好可以，但切换主题走 `useFoundationTheme()`。

---

## 7. 新组件检查清单

- [ ] 文件夹 `Foo/` 内 `Foo.tsx` + `Foo.module.css`（+ `useFoo.ts`、`index.ts`），无 `.styles.ts` / `sx`
- [ ] CSS 只出现 `var(--fd-*)` / `color-mix(…var(--fd-*)…)`，无十六进制 / rgb 字面量
- [ ] 所有文案、`aria-label`、`placeholder`、`Tooltip label` 走 `t()`
- [ ] 图标来自 `@tabler/icons-react`，`stroke={1.75}`
- [ ] 无 `alert/confirm/prompt`、`FileInput`、`localStorage`
- [ ] `cd frontend && pnpm typecheck` 通过

## references

`references/official/`：Mantine 官方 LLM 文档（https://mantine.dev/llms/*.md，9.7.5，2026-11-06 拉取），每篇含用法示例 + Props 表 + Styles API（selector / CSS 变量 / data 属性）。文件名即组件：`core-button.md`、`core-select.md`、`core-modal.md`、`core-menu.md`、`core-tabs.md`、`core-table.md`、`core-combobox.md`、`hooks-use-disclosure.md`、`hooks-use-element-size.md` …（`ls references/official`）。官方示例中的 `color="blue"`、硬编码颜色、`useLocalStorage`、`notifications.show`、`modals.*` 不适用于本项目。
