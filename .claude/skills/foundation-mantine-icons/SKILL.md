---
name: foundation-mantine-icons
description: Foundation 项目图标规范（@tabler/icons-react 3.50）。Icon 铁律：UI 图标只用 Tabler 的 React 组件，禁止 emoji / Unicode 符号 / 其他图标包；统一 stroke={1.75} 与尺寸档（14/16/18/20/24）；颜色用 currentColor + --fd-* class；如何在 node_modules 里查图标名；路由图标的 Icon 类型；MUI *Rounded 图标 → Tabler 对照表。触发词：图标 / icon / Tabler / IconXxx / @tabler/icons-react / 换图标 / MUI 图标迁移。
---

# Foundation 图标规范（Tabler Icons）

## 铁律

1. **只用 `@tabler/icons-react`**（3.50.0，约 5200 个描边图标 + 1054 个 `*Filled` 实心图标）。
2. **禁止**：emoji（🗑️ ⚙️）、Unicode 符号当图标（✓ ✕ ▶ ★ …）、`@mui/icons-material`、`react-icons`、手写 `<svg>` 图标、icon font。
3. **命名导入**：`import { IconTrash, IconFolderOpen } from '@tabler/icons-react'`（ESM 按需打包，不要 `import * as`，不要 `dynamic-imports`）。
4. **统一 `stroke={1.75}`**（库默认 2，项目全部显式传 1.75，视觉更轻）。
5. **颜色继承 `currentColor`**：不要给图标传 `color="#…"`；在父元素或图标 `className` 上用 `color: var(--fd-…)`。
6. **可访问性**：纯图标按钮由按钮承担 `aria-label={t('…')}`；装饰性图标（旁边已有文字）不需要额外标注；需要时用 `aria-hidden`。

## 尺寸档（取自现有代码）

| size | 场景 | 示例 |
|---|---|---|
| 13–14 | 表格内小控件、拖拽手柄、紧凑按钮 | `DataGridCells` 的 `IconGripVertical size={14}` |
| 16 | `size="xs"` 按钮 leftSection、Menu.Item、Tabs.Tab、表格工具栏 | `DataGridPremium` 的 `IconFileTypeCsv size={16}` |
| 18 | `size="xs"/"sm"` 按钮、标题栏窗口控制 | `HomePage` 的 `IconExternalLink size={18}` |
| 20 | 默认尺寸按钮 leftSection、行内图标 | `Database` 的 `IconFolderOpen size={20}` |
| 24 | 主导航（Sidebar 48px 按钮） | `Sidebar` 的 `<Icon size={24} />` |
| 36 | 子窗口 / 空状态的大插画式图标 | `ConfirmWindow` 的 `IconHelpCircle size={36}` |

（MUI 迁移换算：fontSize small = 20、medium = 24。）

## 用法

```tsx
import { IconDatabase, IconTrash } from '@tabler/icons-react';

<Button leftSection={<IconTrash size={20} stroke={1.75} />}>{t('…clear')}</Button>

<ActionIcon aria-label={t('actions.delete')}>
  <IconTrash size={18} stroke={1.75} />
</ActionIcon>

// 着色：class 控制颜色，图标描边跟随 currentColor
<IconDatabase size={20} stroke={1.75} className={classes.tableRowIcon} />
```

```css
.tableRowIcon { flex-shrink: 0; color: var(--fd-text-muted); }
.dangerAction { color: var(--fd-danger); }   /* 按钮里的图标自动变红 */
```

`IconProps`（`dist/tabler-icons-react.d.ts`）= SVG props（除 `stroke`）+ `size?: string | number`、`stroke?: string | number`、`title?: string`。实心变体 `IconXxxFilled` 由 `fill: currentColor` 绘制，`stroke` 对它无效——仅在需要"选中 / 已收藏"等实心态时成对使用（如 `IconStar` / `IconStarFilled`）。

### 作为数据传递：`Icon` 类型

路由表等配置里传**组件本身**，不要传 JSX 元素：

```ts
// frontend/src/router/types.ts
import type { Icon } from '@tabler/icons-react';
export interface RouteDefinition { icon?: Icon; /* … */ }

// frontend/src/routes.tsx
import { IconHome, IconLayoutGrid, IconSettings } from '@tabler/icons-react';
{ id: 'home', icon: IconHome, … }

// 消费方（Sidebar.tsx）
const Icon = r.icon ?? IconHome;
<Icon size={24} stroke={1.75} />
```

`Icon` = `FunctionComponent<IconProps>`；`TablerIcon` = 带 ref 的 `ForwardRefExoticComponent`。自定义配置对象（菜单项、托盘模块、设置项）同样用 `icon: Icon` 字段。

## 查找图标名

```sh
# 列出 / 模糊搜索（文件名 = 导出名）
ls frontend/node_modules/@tabler/icons-react/dist/esm/icons/ | grep -i folder
# 精确确认某个名字存在
ls frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconDeviceFloppy.mjs
# 看图标预览（d.ts 的 JSDoc 里有 base64 SVG 预览 + tabler.io 链接）
grep -n "declare const IconFolderOpen:" -B4 frontend/node_modules/@tabler/icons-react/dist/tabler-icons-react.d.ts
```

命名规律：kebab-case 官网名 → `Icon` + PascalCase（`device-floppy` → `IconDeviceFloppy`，`a-b-2` → `IconAB2`）。在线检索：https://tabler.io/icons （选好后回 node_modules 确认存在，3.50 之后新增的图标不可用）。

## MUI → Tabler 对照（项目已用的 + 常见）

| MUI `*Rounded` | Tabler | MUI `*Rounded` | Tabler |
|---|---|---|---|
| Home | `IconHome` | Settings | `IconSettings` |
| Dashboard / GridView | `IconLayoutGrid` | Storage | `IconDatabase` |
| Delete | `IconTrash` | FolderOpen | `IconFolderOpen` |
| Restore | `IconRestore` | Lock | `IconLock` |
| Close | `IconX` | Remove（最小化） | `IconMinus` |
| CropSquare（最大化） | `IconSquare` | CloseFullscreen | `IconArrowsMinimize` |
| ExpandMore | `IconChevronDown` | ChevronRight | `IconChevronRight` |
| UnfoldMore | `IconSelector` | DragIndicator | `IconGripVertical` |
| Info | `IconInfoCircle` | Warning | `IconAlertTriangle` |
| Error | `IconAlertCircle` | HelpOutline | `IconHelpCircle` |
| CheckCircle | `IconCircleCheck` | Cancel | `IconCircleX` |
| Visibility / VisibilityOff | `IconEye` / `IconEyeOff` | OpenInNew | `IconExternalLink` |
| Notifications / NotificationsActive | `IconBell` / `IconBellRinging` | PowerSettingsNew | `IconPower` |
| Add | `IconPlus` | Check | `IconCheck` |
| Edit | `IconPencil` / `IconEdit` | Save | `IconDeviceFloppy` |
| Search | `IconSearch` | Refresh | `IconRefresh` |
| ContentCopy | `IconCopy` | Download / Upload | `IconDownload` / `IconUpload` |
| MoreHoriz / MoreVert | `IconDots` / `IconDotsVertical` | Menu | `IconMenu2` |
| FilterList | `IconFilter` | ArrowBack / ArrowForward | `IconArrowLeft` / `IconArrowRight` |
| DarkMode / LightMode | `IconMoon` / `IconSun` | Palette | `IconPalette` |
| Language | `IconLanguage` | Logout | `IconLogout` |
| Star | `IconStar` / `IconStarFilled` | TableView（CSV/Excel 导出） | `IconFileTypeCsv` / `IconFileSpreadsheet` |

## references

- `references/official/guides-icons.md`：Mantine 官方"图标库集成"指南（Tabler 是 Mantine 文档的默认图标库；尺寸与 Mantine 组件 size 的搭配建议）。
