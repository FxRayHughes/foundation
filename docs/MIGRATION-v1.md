# Foundation v0.0.3 → v1.0.0 迁移指南

> 适用对象：基于 **v0.0.3**（Wails v3.0.0-beta.9 + React 19 + MUI 9）fork 出去、并且已经在 MUI 上写了自己页面的项目。
>
> 本文所有 API / 文件名都来自 `git diff v0.0.3` 与当前代码，可以直接对照仓库核实。

---

## 目录

1. [概览](#1-概览)
2. [升级步骤（按顺序打勾）](#2-升级步骤按顺序打勾)
3. [前端迁移](#3-前端迁移)
4. [后端变化](#4-后端变化)
5. [新功能一览](#5-新功能一览)
6. [破坏性变更速查表](#6-破坏性变更速查表)
7. [常见问题](#7-常见问题)
8. [Skill 变化](#8-skill-变化)

---

## 1. 概览

### 1.1 变了什么

v1.0.0 主要做了三件事：

1. **底座升级**：Wails `v3.0.0-beta.9` → `v3.1.0`，Go `1.25` → `1.26`。项目用到的 Go API 一个都没改；`build/` 下的构建资产按 v3.1.0 模板重新同步了一遍。
2. **UI 库整体替换**：去掉所有 `@mui/*` 和 `@emotion/*`，换成 **Mantine 9.7.5**。图标换成 `@tabler/icons-react`，图表换成 `@mantine/charts`（底层 recharts 3），表格换成 `mantine-datatable`。样式写法从 `sx` 工厂改为 **CSS Modules**，取色从 `theme.palette.foundation.*` 改为 **CSS 变量 `--fd-*`**。
3. **新功能**：
   - 系统托盘可以从头到尾跑通
   - 表格导出走原生「另存为」，并由后端生成真正的 `.xlsx`
   - 主题和语言在主窗口、子窗口、托盘面板之间实时同步
   - DataGrid 增加列菜单和列宽拖拽
   - 漏斗图支持横向
   - 图表文案接入 i18n
   - 修正了分包规则

### 1.2 谁需要做什么

| 你的情况 | 要做的事 | 估算工作量 |
|---|---|---|
| 只改过后端（`internal/services/<你的域>`），前端没动或只改了文案 | 第 2 节升级步骤 + 第 4 节 | 0.5 天 |
| 写了几个 MUI 页面或组件（每个页面有 View / VM / `.styles.ts`） | 第 2 节 + 第 3 节。每个页面要把 `.styles.ts` 改成 `.module.css`，并替换组件和图标 | 每个中等页面约 1–2 小时 |
| 直接用了 `@mui/x-data-grid` / `@mui/x-charts`，或用了 x-pro 的 `DataGridPro` / `DataGridPremium` / 图表 | 另外看 3.7 / 3.8（列定义要改写） | 每张表 / 每个图约 0.5–1 小时 |
| 自定义过主题预设（`muiOverrides`） | 3.1 节：`muiOverrides` 改为 `mantineOverrides` | 视覆盖多少而定，通常 < 1 小时 |
| 改过 `build/` 下的平台资产（Info.plist、nsis、Android、iOS 等） | 2.6 节：手工把你的改动重新合到新模板上 | 0.5–1 天 |

> 以上工作量是经验估算，不是测量值。主要工作在前端：v0.0.3 → v1.0.0 一共改了 245 个文件，新增 8305 行、删除 26852 行，删除的大头是 11 个 `foundation-mui*` skill 文档。

### 1.3 版本对照

| 项 | v0.0.3 | v1.0.0 |
|---|---|---|
| Wails（`go.mod`） | `github.com/wailsapp/wails/v3 v3.0.0-beta.9` | `github.com/wailsapp/wails/v3 v3.1.0` |
| Go（`go.mod` 的 `go` 指令） | `1.25.0` | `1.26.0` |
| `@wailsio/runtime` | `3.0.0-beta.9` | `3.1.0`（锁死版本） |
| UI 库 | `@mui/material ^9.0.1` + `@mui/system ^7.3.11` + `@emotion/react` / `@emotion/styled` | `@mantine/core 9.7.5` + `@mantine/hooks 9.7.5` |
| 图表 | `@mui/x-charts ^9.3.0` | `@mantine/charts 9.7.5` + `recharts 3.10.1` |
| 表格 | `@mui/x-data-grid ^9.3.0` | `mantine-datatable 9.4.0` |
| 图标 | `@mui/icons-material ^9.0.1` | `@tabler/icons-react 3.50.0` |
| className 拼接 | — | `clsx ^2.1.1` |
| xlsx 生成 | 前端尝试动态 `import('xlsx')`（依赖里没有，实际不可用） | 后端 `github.com/xuri/excelize/v2 v2.11.1` |
| 应用版本（`build/config.yml` 的 `info.version`） | `0.0.3` | `1.0.0` |

React（`^19.2.6`）、TypeScript（`^6.0.3`）、Vite（`^8.0.14`）、GORM（`v1.31.1`）、`glebarez/sqlite`（`v1.11.0`）的版本都没变。

---

## 2. 升级步骤（按顺序打勾）

### 2.1 拉取与合并策略（fork 项目）

v1.0.0 把每个脚手架自带的前端文件都重写了。直接 `git merge` 的话，凡是你改过的脚手架文件都会冲突，所以建议在一个独立分支上做：

```sh
git remote add upstream <foundation 仓库地址>   # 已经加过就跳过
git fetch upstream --tags
git switch -c upgrade/v1.0.0
git merge upstream/master        # 发布 tag 后也可以 merge v1.0.0
```

冲突按下面的原则处理：

| 文件类别 | 处理方式 |
|---|---|
| 你**没改过**的脚手架文件（`components/*`、`styles/themes/*`、`x-pro/*`、`childwindows/*`、`systray/*`、`build/*`） | 直接取上游版本：`git checkout --theirs <path>` |
| 被上游删除的 `*.styles.ts`、`styles/themes/buildMuiTheme.ts`、`src/settings.ts`、`x-pro/charts/shared/{ChartContainer,Legend,Tooltip,hooks,useChartDimensions,useChartTooltip}.ts(x)`、`x-pro/data-grid/DataGridPro.styles.ts` | 接受删除：`git rm <path>` |
| `frontend/pnpm-lock.yaml` | 不要手工合并。取上游版本后重新执行 `pnpm install` |
| `frontend/tsconfig.tsbuildinfo` | 这是被跟踪的构建缓存，取上游版本即可 |
| `go.sum` | 取上游版本后执行 `go mod tidy` |
| **你自己的页面 / 组件** | 留在你的版本上，再按第 3 节手工迁移到 Mantine |
| `routes.tsx`、`App.tsx`、`i18n/locales/*.ts` | 两边都有改动，需要手工合并：保留你注册的页面和语言包，同时带上上游新增的 `registerDataGridLocales()` / `registerXProChartsLocales()` 和 Tabler 图标 |

### 2.2 Go 1.26 + go.mod + wails3 CLI

```sh
go version                # 需要 ≥ go1.26
go mod tidy               # go.mod 已是 wails v3.1.0 + excelize v2.11.1
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.1.0
wails3 version            # 确认 CLI 也是 v3.1.0
```

`go.mod` 的变化：

- `wails/v3` 升到 `v3.1.0`
- 新增 `github.com/xuri/excelize/v2 v2.11.1`
- `golang.org/x/sys` 升到 `v0.49.0`
- 间接依赖中去掉了 `adrg/xdg`、`jchv/go-winloader`、`mattn/go-colorable`
- 新增了 `ebitengine/purego`、excelize 系列依赖、`x/crypto`、`x/net`、`x/term` 等间接依赖

> **可选**：如果 `proxy.golang.org` 连不上（`go get` / `go install` 卡在 `i/o timeout`），给命令加上 `GOPROXY="https://goproxy.cn,direct" GOSUMDB="sum.golang.google.cn"`。网络正常就不需要。

### 2.3 前端依赖（pnpm）

`frontend/package.json` 的 `dependencies` 精确 diff 如下：

**移除**

```
@emotion/react        ^11.14.0
@emotion/styled       ^11.14.1
@mui/icons-material   ^9.0.1
@mui/material         ^9.0.1
@mui/system           ^7.3.11
@mui/x-charts         ^9.3.0
@mui/x-data-grid      ^9.3.0
```

**新增 / 变更**

```
@mantine/charts       9.7.5
@mantine/core         9.7.5
@mantine/hooks        9.7.5
@tabler/icons-react   3.50.0
@wailsio/runtime      3.0.0-beta.9 → 3.1.0
clsx                  ^2.1.1
mantine-datatable     9.4.0
recharts              3.10.1
```

`devDependencies` 没有变化。

```sh
cd frontend
pnpm install
```

如果你自己的页面还额外引用了 `@mui/lab`、`@mui/x-date-pickers` 之类的包，迁移完成后也一并删掉：`pnpm remove <pkg>`。

> **`frontend/pnpm-workspace.yaml`**：这个文件在 v1.0.0 没有改动，内容仍然只有 `minimumReleaseAgeExclude: ['@wailsio/runtime@3.0.0-beta.9']`。那一条已经过时，但留着没有害处。如果你的 pnpm 开启了 `minimumReleaseAge`，而某个新版本（例如 `@wailsio/runtime@3.1.0` 或 Mantine 9.7.5）还没过冷却期，安装就会报 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`。这时把对应的 `<pkg>@<version>` 加进这个列表，并把文件提交进仓库，它会影响安装结果，不能当作临时产物删掉。见 7.1。

### 2.4 重新生成 bindings

```sh
wails3 generate bindings
```

v1.0.0 前端依赖的 bindings 有两处新增：

- `@bindings/foundation/internal/services/exportsvc`（新增的 `exportsvc.Service`）
- `@bindings/foundation/internal/app/systrayservice`：`SystrayService` 在 v0.0.3 时还没有注册，现在已注册；前端改为**静态** import，并且多了 `SetMenuLabels`

`frontend/bindings/` 被 `.gitignore` 忽略，所以每个开发者 clone 后、每次改动 service 后都要重新生成。改过模块名的话，`@bindings/foundation/...` 中的 `foundation` 换成你的模块名，包括 `services/export/ExportService.ts` 和 `services/systray/SystrayService.ts` 这两个新文件。

### 2.5 build/ 资产

- **`build/config.yml` 的 `info.*` 现在是应用元数据的唯一来源，应用版本号也在这里。** `frontend/vite.config.ts` 会读取 `info.version`，并以编译期常量 `__APP_VERSION__` 注入前端（声明在 `src/vite-env.d.ts`；托盘的 AppStatus 模块用它显示版本）。不要在前端硬编码版本号。
- 上游把 `info.*` 改成了 `productIdentifier: "com.example.foundation"`、`version: "1.0.0"` 等值。**fork 合并时要保留你自己的 `companyName` / `productName` / `productIdentifier` / `copyright` / `version`**。macOS bundle id、Windows 安装包信息都由这里生成，`productIdentifier` 被覆盖会让系统把它当成另一个应用。
- 改完 `info.*` 后执行：

  ```sh
  wails3 task common:update:build-assets
  ```

  这个任务会执行 `wails3 update build-assets -name "{{.APP_NAME}}" -binaryname "{{.APP_NAME}}" -config config.yml -dir .`，**会覆盖** `build/` 下的 plist、nsis、`info.json` 等生成文件。
- 静态 Taskfile 已经按 v3.1.0 模板同步，主要变化：
  - 根 `Taskfile.yml` 新增 `GOOS` 变量，`build` / `package` / `run` 改为分发到 `{{.GOOS}}:*`；新增 `install:msix:tools`
  - `build/Taskfile.yml` 的 `go:mod:tidy`、`install:frontend:deps`、`build:frontend`、`generate:bindings`、`generate:icons` 加了 `run: once`，避免 universal 构建时并发冲突；`build:server` 默认改为 production 构建，支持 `DEV` / `OBFUSCATED` / `EXTRA_TAGS`
  - `build/darwin/Taskfile.yml` 新增 `package:dmg` / `create:dmg`，附带新资源 `build/darwin/dmg-background.png`、`dmg-file-icon.icns`、`dmg-file-icon.png`；签名任务改为通过 `{{.CLI_ARGS}}` 传参
  - `build/windows/Taskfile.yml` 中 NSIS 的 `--name` 改为 `"{{.APP_NAME}}.exe"`，修正了 exe 命名
  - Android / iOS / Docker / Linux（nfpm、desktop）资产整体更新；Android 新增 `WailsForegroundService.java` 和 `res/xml/`
- 如果你改过 `build/` 下的资产，先取上游版本，再把自己的改动逐个补回去。

### 2.6 验证

```sh
# 后端
go build ./... && go vet ./...
go test ./internal/services/exportsvc/     # 新增的导出服务单测（CSV BOM / XLSX / 路径校验）

# 前端
cd frontend
pnpm typecheck
pnpm build
grep -rn "@mui\|@emotion" src || echo "MUI 已清干净"

# 全链路
cd .. && wails3 dev          # 或 task dev
```

在 `wails3 dev` 里手动验证：

- [ ] 切换主题（设置 → 个性化），主窗口、子窗口、托盘面板一起变化
- [ ] 切换语言，托盘右键菜单文案也跟着变
- [ ] 首页开关系统托盘，重启应用后开关状态保持
- [ ] X-Pro 演示页：DataGridPremium 工具栏导出 CSV / Excel，弹出原生「另存为」，生成的 `.xlsx` 能用 Excel 打开
- [ ] 设置 → 数据存储：环形图和条形图正常显示

---

## 3. 前端迁移

### 3.1 主题：`buildMuiTheme` → `buildMantineTheme`

`FoundationPalette` 的结构**一个字段都没变**（`bg.{base,sidebar,content,surface,elevated,hover,active}` / `text.{primary,secondary,muted}` / `divider` / `accent` / `accentHover` / `status.{danger,success,warning}`），所以 `presets/*.ts` 里的颜色值和自定义主题的存储格式可以原样沿用。变的是这些颜色怎么交给 UI 库使用：

| v0.0.3 | v1.0.0 |
|---|---|
| `styles/themes/buildMuiTheme.ts`：`buildMuiTheme(preset): Theme`，通过 module augmentation 把调色板挂到 `theme.palette.foundation` | `styles/themes/buildMantineTheme.ts`：`buildMantineTheme(preset): MantineThemeOverride` + `buildCssVariablesResolver(preset)`：调色板编译为 `:root` 上的 CSS 变量 `--fd-*` |
| `<MuiThemeProvider theme>` + `<CssBaseline />` | `<MantineProvider theme cssVariablesResolver forceColorScheme={preset.mode}>`（都在 `FoundationThemeProvider` 内部完成） |
| `FoundationThemePreset.muiOverrides?: ThemeOptions` | `FoundationThemePreset.mantineOverrides?: MantineThemeOverride`，用 `mergeThemeOverrides` 深合并 |
| `primary.main = accent` | `accent` 生成 10 级色阶 `colors.foundation`，`primaryColor: 'foundation'`，`primaryShade: 6`（shade 7 = `accentHover`） |
| `export { buildMuiTheme }` | `export { buildMantineTheme, buildCssVariablesResolver, FOUNDATION_CSS_VARS, useFoundationPalette }` |

`buildMantineTheme` 还把 Mantine 自己的语义变量映射到了 `--fd-*`：`--mantine-color-body` → `--fd-bg-content`，`-text` → `--fd-text-primary`，`-dimmed` → `--fd-text-secondary`，`-placeholder` → `--fd-text-muted`，`-default` → `--fd-bg-elevated`，`-default-hover` → `--fd-bg-hover`，`-default-border` → `--fd-divider`，`-error` → `--fd-danger`，`-anchor` → `--fd-accent`。所以没写任何样式的 Mantine 组件也会跟随三套预设。

此外，`Button` / `ActionIcon` / `Paper` / `Card` / `Popover` / `Menu` / `Input` / `Tooltip` 的全局样式集中在 `styles/themes/mantineComponents.module.css`。`ActionIcon` 默认 `variant: 'subtle'`，`Tooltip` 默认 `withArrow` + `openDelay: 300`。

**迁移你的自定义预设**：

```ts
// before
export const myPreset: FoundationThemePreset = {
  name: 'my', label: 'My', mode: 'dark', palette: { /* … */ },
  muiOverrides: { components: { MuiButton: { styleOverrides: { root: { … } } } } },
};

// after
import { Button } from '@mantine/core';
export const myPreset: FoundationThemePreset = {
  name: 'my', label: 'My', mode: 'dark', palette: { /* 原样 */ },
  mantineOverrides: {
    components: { Button: Button.extend({ defaultProps: { radius: 'md' } }) },
  },
};
```

**组件里取色有三种方式**，按优先级从高到低：

1. `*.module.css` 中写 `var(--fd-xxx)`：覆盖绝大多数场景，切换主题时不需要重渲染
2. JS 侧只需要引用颜色时（图表的 `color`、内联 `style`），用 `FOUNDATION_CSS_VARS.xxx`：它的值就是字符串 `'var(--fd-xxx)'`
3. 必须拿到真实色值时（canvas、颜色计算），用 `useFoundationPalette()`，返回当前 preset 的 `FoundationPalette`

`theme.palette.foundation` 到 CSS 变量的完整对照：

| v0.0.3 `theme.palette.foundation.` | CSS 变量 | `FOUNDATION_CSS_VARS.` | `useFoundationPalette().` |
|---|---|---|---|
| `bg.base` | `--fd-bg-base` | `bg.base` | `bg.base` |
| `bg.sidebar` | `--fd-bg-sidebar` | `bg.sidebar` | `bg.sidebar` |
| `bg.content` | `--fd-bg-content` | `bg.content` | `bg.content` |
| `bg.surface` | `--fd-bg-surface` | `bg.surface` | `bg.surface` |
| `bg.elevated` | `--fd-bg-elevated` | `bg.elevated` | `bg.elevated` |
| `bg.hover` | `--fd-bg-hover` | `bg.hover` | `bg.hover` |
| `bg.active` | `--fd-bg-active` | `bg.active` | `bg.active` |
| `text.primary` | `--fd-text-primary` | `text.primary` | `text.primary` |
| `text.secondary` | `--fd-text-secondary` | `text.secondary` | `text.secondary` |
| `text.muted` | `--fd-text-muted` | `text.muted` | `text.muted` |
| `divider` | `--fd-divider` | `divider` | `divider` |
| `accent` | `--fd-accent` | `accent` | `accent` |
| `accentHover` | `--fd-accent-hover` | `accentHover` | `accentHover` |
| `status.danger` | `--fd-danger` | `status.danger` | `status.danger` |
| `status.success` | `--fd-success` | `status.success` | `status.success` |
| `status.warning` | `--fd-warning` | `status.warning` | `status.warning` |

> 注意：状态色的 CSS 变量**没有** `status-` 前缀（`--fd-danger`，不是 `--fd-status-danger`）。

`useFoundationTheme()`（`choice` / `setChoice` / `current` 等）的用法不变，仍然从 `@/styles/themes` 导出。

### 3.2 样式文件：`<Name>.styles.ts` → `<Name>.module.css`

MVVM 的「Style」这一层，从 `sx` 工厂函数改成了 CSS Modules：

| v0.0.3 | v1.0.0 |
|---|---|
| `Foo.styles.ts` 导出 `fooStyles(theme): Record<string, SxProps<Theme>>` | `Foo.module.css`，每个 key 对应一个 class |
| View 中 `const theme = useTheme(); const styles = fooStyles(theme);` | `import classes from './Foo.module.css';` |
| `<Box sx={styles.root}>` | `<div className={classes.root}>` 或 `<Box className={classes.root}>` |
| 根据状态切换两个 sx：`sx={isActive ? styles.itemActive : styles.item}` | 用一个 class 加 data 属性：`className={classes.item} data-active={isActive \|\| undefined}`，CSS 里写 `.item[data-active]` |
| 合并多个 sx 数组 | `clsx(classes.a, cond && classes.b, className)` |
| 改 MUI 子元素用 `'& .MuiXxx-root'` | `classNames={{ root, input, label, dropdown, … }}`（见 Mantine Styles API） |

**真实示例：`components/Sidebar`**

Before：`git show v0.0.3:frontend/src/components/Sidebar/Sidebar.styles.ts`（节选）

```ts
import type { SxProps, Theme } from '@mui/material';

export const sidebarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      width: 64,
      flexShrink: 0,
      backgroundColor: fp.bg.sidebar,
      borderRight: `1px solid ${fp.divider}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 1.5, // 12px
      gap: 1, // 8px
    },
    brand: {
      width: 40,
      height: 40,
      borderRadius: 2.5, // 10px
      /* … */
      color: fp.accent,
      mb: 0.5,
    },
    item: {
      width: 48,
      height: 48,
      borderRadius: 1.5,
      color: fp.text.secondary,
      backgroundColor: 'transparent',
      transition: 'background-color 160ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { backgroundColor: fp.bg.hover, color: fp.text.primary },
    },
    itemActive: {
      /* 与 item 重复一遍，只改颜色 */
      color: fp.accent,
      backgroundColor: fp.bg.active,
      '&:hover': { backgroundColor: fp.bg.active, color: fp.accent },
    },
  };
};
```

After：`frontend/src/components/Sidebar/Sidebar.module.css`（节选）

```css
.root {
  width: 64px;
  flex-shrink: 0;
  background-color: var(--fd-bg-sidebar);
  border-right: 1px solid var(--fd-divider);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: 12px;   /* py: 1.5 → 1.5 × 8 */
  gap: 8px;              /* gap: 1  → 1 × 8 */
}

.brand {
  width: 40px;
  height: 40px;
  border-radius: 10px;   /* borderRadius: 2.5 → 2.5 × 4 */
  /* … */
  color: var(--fd-accent);
  margin-bottom: 4px;    /* mb: 0.5 → 0.5 × 8 */
}

/* ActionIcon 的 subtle 变体已有全局 hover 样式；这里提高选择器权重覆盖尺寸与选中态 */
.item.item {
  width: 48px;
  height: 48px;
  border-radius: 6px;    /* borderRadius: 1.5 → 1.5 × 4 */
  color: var(--fd-text-secondary);
  transition:
    background-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
    color 160ms cubic-bezier(0.4, 0, 0.2, 1);
}
.item.item:hover {
  background-color: var(--fd-bg-hover);
  color: var(--fd-text-primary);
}
.item.item[data-active],
.item.item[data-active]:hover {
  color: var(--fd-accent);
  background-color: var(--fd-bg-active);
}
```

View 侧的变化：

```tsx
// before
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { sidebarStyles } from './Sidebar.styles';
// …
const theme = useTheme();
const styles = sidebarStyles(theme);
<Tooltip title={label} placement="right" arrow>
  <IconButton sx={isActive ? styles.itemActive : styles.item} aria-label={label}>
    <Icon fontSize="medium" />
  </IconButton>
</Tooltip>

// after
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import classes from './Sidebar.module.css';
// …
<Tooltip label={label} position="right">
  <ActionIcon className={classes.item} data-active={isActive || undefined} aria-label={label}>
    <Icon size={24} stroke={1.75} />
  </ActionIcon>
</Tooltip>
```

**内联 sx 的迁移**（例：`systray/modules/QuickActions`）

```tsx
// before
<Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${fp.divider}` }}>
<Button size="small" startIcon={<VisibilityRoundedIcon />}
  sx={{ justifyContent: 'flex-start', textTransform: 'none', color: fp.text.primary,
        borderRadius: 1.5, '&:hover': { backgroundColor: fp.bg.hover } }}>

// after（QuickActions.module.css: .root { padding: 12px 16px; border-top: 1px solid var(--fd-divider); }
//                               .action.action { color: var(--fd-text-primary); border-radius: 6px; … }）
<div className={classes.root}>
<Button variant="subtle" size="xs" justify="flex-start"
  leftSection={<IconEye size={18} stroke={1.75} />} className={classes.action}>
```

**本仓库已经迁移完的文件**可以直接当模板：`components/{AppLayout,ChildTitleBar,Sidebar,Skeleton,TitleBar}`、`pages/{HomePage,SettingsPage,XProDemoPage}`、`pages/SettingsPage/{database,language,personalization}`、`childwindows/{BlankWindow,ConfirmWindow,MessageWindow}`、`systray/SystrayPanel` 与 `systray/modules/*`。

### 3.3 sx 单位换算规则

MUI 的 `sx` 会把数字按主题自动换算，CSS 里要写成显式 `px`：

| sx 写法 | 规则（v0.0.3 主题：`spacing = 8px`，`shape.borderRadius = 4`） | 例 |
|---|---|---|
| `p / px / py / pt / m / mx / mb / gap …`（数字） | **× 8px** | `py: 1.5` → `padding-block: 12px`；`gap: 0.5` → `gap: 4px` |
| `borderRadius`（数字） | **× 4px** | `borderRadius: 2.5` → `10px`；`borderRadius: 1.5` → `6px` |
| `borderRadius`（字符串） | 原样 | `'0 2px 2px 0'` → `0 2px 2px 0` |
| `width / height / fontSize / top / left …`（数字） | 直接加 `px` | `width: 64` → `64px` |
| `width / height`（0–1 的小数） | 百分比 | `width: 0.5` → `50%` |
| `letterSpacing: 0.5` | 加 `px` | `0.5px` |
| `fontWeight / lineHeight / flex / opacity / zIndex` | 不加单位 | `flex: 1` |
| `'&:hover'` / `'&.Mui-selected'` / `'@media …'` | 写成独立的 CSS 规则；选中态改用 `[data-active]` 之类的 data 属性 | 见上面 Sidebar |
| `color: 'text.secondary'` 这类主题路径字符串 | `var(--fd-text-secondary)` | |
| `theme.transitions.create(...)` | 手写 `transition` | |

> 小心旧注释写错：v0.0.3 的 `Sidebar.styles.ts` 里 `borderRadius: 1.5, // 12px` 的注释是错的，实际渲染是 1.5 × 4 = **6px**，迁移后的 CSS 也是 6px。按上表换算，不要照抄注释。

圆角约定：Mantine `radius` 档位为 `xs 2px / sm 4px / md 8px / lg 12px / xl 16px`，`defaultRadius: 'sm'`。按钮用 4–6px，容器用 8px（`radius="md"`），不用圆形按钮。

### 3.4 组件映射：MUI → Mantine（覆盖 v0.0.3 仓库实际用到的组件）

通过 `git grep "from '@mui" v0.0.3 -- frontend/src` 统计（含多行 import），v0.0.3 用到的 MUI 符号只有下面这些：

| v0.0.3（`@mui/material`） | v1.0.0（`@mantine/core` / 项目） | 关键差异（仓库里的实际改法） |
|---|---|---|
| `Box` | `Box` 或普通 `div` | `sx` → `className`；需要 `component="nav"` 等多态时保留 `Box` |
| `Typography` | `Text` / `Title`，或原生 `h1` / `span` | `variant="subtitle2"` → `<Text className={classes.cardTitle}>`；`Typography component="h1"` → `<h1 className>`；Mantine 9 的 `Text` 没有 `color`，要用 `c`，项目里一般直接用 class |
| `Button` | `Button` | `variant="contained/outlined/text"` → `filled/outline/subtle`，中性按钮用 `default`；`startIcon/endIcon` → `leftSection/rightSection`；`size="small"` → `size="xs"`/`"sm"`；`sx={{justifyContent}}` → `justify="flex-start"`；不再需要 `textTransform: 'none'` |
| `IconButton` | `ActionIcon` | 全局默认 `variant="subtle"`；必须带 `aria-label={t(...)}` |
| `ButtonBase` | `UnstyledButton` | 设置页的卡片 / 列表项就是这么改的 |
| `Paper` | `Paper` | 全局已应用 surface 样式（`mantineComponents.module.css`） |
| `Switch` | `Switch` | `onChange(e)` 里用 `e.currentTarget.checked` |
| `TextField` | `TextInput`（多行用 `Textarea`，数字用 `NumberInput`） | `helperText` → `description`；`error` 直接传文案 |
| `Tooltip title=` | `Tooltip label=` | `placement` → `position`；`arrow` 已全局默认开启 |
| `CircularProgress` | `Loader` | `size={24}` 可以沿用 |
| `ThemeProvider` + `CssBaseline` | `FoundationThemeProvider`（内部是 `MantineProvider`）+ `import '@/styles'` | 见 3.1 / 3.11 |
| `useTheme()`（`@mui/material` / `@mui/material/styles`） | 基本不再需要 | 取色看 3.1；要 Mantine theme 用 `useMantineTheme()`，要项目主题用 `useFoundationTheme()` |
| `SxProps` / `Theme` / `ThemeOptions` 类型 | 删除；预设覆盖类型用 `MantineThemeOverride`；内联样式类型用 `MantineStyleProp` | |
| `keyframes`（`@emotion/react`） | CSS 里的 `@keyframes` | 见 `components/Skeleton/Skeleton.module.css` |
| `DataGrid`（`@mui/x-data-grid`） | 项目 `DataGridPro` / `DataGridPremium`，或直接用 `mantine-datatable` 的 `DataTable` | 见 3.8 |
| `PieChart`（`@mui/x-charts/PieChart`） | `DonutChart`（`@mantine/charts`） | 见 3.7 |
| `BarChart`（`@mui/x-charts/BarChart`） | `BarChart`（`@mantine/charts`） | **方向含义相反**，见 3.7 |

仓库里没用到的 MUI 组件（`Select`、`Dialog`、`Menu`、`Tabs`、`Grid`、`Stack`、`Snackbar`、`Collapse` 等）的对照表，见 `.claude/skills/foundation-mantine/SKILL.md` 的「MUI → Mantine 对照表」。几个容易踩的点：Mantine 9 的 `Grid gutter` 改成了 `gap`，`Collapse in` 改成了 `expanded`；项目**没有安装** `@mantine/notifications`。

### 3.5 图标：`@mui/icons-material` → `@tabler/icons-react`

统一写法：`<IconXxx size={…} stroke={1.75} />`，尺寸只用 14 / 16 / 18 / 20 / 24 这几档。MUI 的 `fontSize="small"`（20px）对应 `size={20}`，`"medium"`（24px）对应 `size={24}`（Sidebar 用的就是 24）。颜色用 `currentColor`，由 class 上的 `color: var(--fd-*)` 控制。

v0.0.3 用到的全部图标及其替换（每一项都能在当前代码里找到对应文件）：

| MUI | Tabler | 所在文件 |
|---|---|---|
| `HomeRounded` | `IconHome` | `routes.tsx`、`Sidebar.tsx`（缺省图标） |
| `SettingsRounded` | `IconSettings` | `routes.tsx`、`systray/modules/QuickActions` |
| `WidgetsRounded` | `IconLayoutGrid` | `routes.tsx`（X-Pro 演示页） |
| `Close` | `IconX` | `TitleBar/WindowControls.tsx`、`ChildTitleBar.tsx` |
| `Remove`（最小化） | `IconMinus` | `WindowControls.tsx` |
| `CropSquare`（最大化） | `IconSquare` | `WindowControls.tsx` |
| `HelpOutlineRounded` | `IconHelpCircle` | `childwindows/ConfirmWindow` |
| `InfoOutlined` | `IconInfoCircle` | `childwindows/MessageWindow/useMessageWindow.ts` |
| `WarningAmberRounded` | `IconAlertTriangle` | 同上 |
| `ErrorOutlineRounded` | `IconAlertCircle` | 同上 |
| `OpenInNewRounded` | `IconExternalLink` | `pages/HomePage` |
| `NotificationsActiveRounded`（v0.0.3 中为注释） | `IconBellRinging` | `pages/HomePage` |
| `StorageRounded` | `IconDatabase` | `pages/SettingsPage/database` |
| `FolderOpenRounded` | `IconFolderOpen` | 同上 |
| `RestartAltRounded` | `IconRestore` | 同上 |
| `DeleteOutlineRounded` | `IconTrash` | 同上 |
| `LockRounded` | `IconLock` | 同上 |
| `PowerSettingsNewRounded` | `IconPower` | `systray/modules/ExitButton` |
| `VisibilityRounded` | `IconEye` | `systray/modules/QuickActions` |
| `ExpandMoreRounded` / `ExpandLessRounded`（主从明细） | `IconChevronDown` / `IconChevronRight` | `x-pro/data-grid/DataGridCells.tsx` |
| `UnfoldMoreRounded` / `UnfoldLessRounded`（树形） | `IconChevronDown` / `IconChevronRight` | 同上 |
| `DragIndicatorRounded` | `IconGripVertical` | 同上 |

**路由图标类型变了**（`frontend/src/router/types.ts`）：

```ts
// before
icon?: ComponentType<{ fontSize?: 'small' | 'medium' | 'large' | 'inherit' }>;
// after
import type { Icon } from '@tabler/icons-react';
icon?: Icon;   // 如 IconHome
```

`routes.tsx` 里的写法改为 `icon: IconHome`。如果你自己的组件把图标当 prop 传递，类型也改成 `Icon`（参考 `useMessageWindow.ts` 的 `Record<MessageVariant, Icon>`）。

要查找图标名，可以到 https://tabler.io/icons 搜索，或者在 `node_modules/@tabler/icons-react` 里 grep。

### 3.6 Skeleton：`sx` prop 已移除

`@/components/Skeleton` 的 `Skeleton` 和 `SkeletonText` **都不再接受 `sx`**：

- `Skeleton`：`variant` / `width` / `height` / `style` / `className` / `ariaLabel`
- `SkeletonText`：`lines` / `gap` / `lastLineWidth` / `width` / `style` / `className`（`style` 与 `className` 是新增的）

```tsx
// before
<Skeleton sx={{ flex: 1, borderRadius: 1, mt: 0.5 }} />
// after
<Skeleton style={{ flex: 1, borderRadius: 4, marginTop: 4 }} />
```

不要用 `style` 去改 `background`，那样会破坏主题适配。

### 3.7 图表：`@mui/x-charts` → `@mantine/charts`；x-pro 图表 API 变化

#### 直接使用 `@mui/x-charts` 的代码

参考 `pages/SettingsPage/database/Database.tsx` 的改法：

```tsx
// before：PieChart
<PieChart series={[{ data: tables.map((tb, idx) => ({ id, value, label, color: colorOf(idx) })),
                     innerRadius: 48, paddingAngle: 1, cornerRadius: 2,
                     valueFormatter: (item) => formatBytes(item.value) }]} />
// after：DonutChart
<DonutChart data={donutData} size={200} thickness={52} paddingAngle={1} strokeWidth={0}
  pieProps={{ cornerRadius: 2 }} withTooltip tooltipDataSource="segment"
  valueFormatter={formatBytes} />
```

```tsx
// before：水平条形图
<BarChart layout="horizontal" yAxis={[{ scaleType: 'band', data: labels }]}
          xAxis={[{ valueFormatter: … }]} … />
// after：注意 orientation="vertical" 才是"类目在 Y 轴的水平条形"
<BarChart h={220} data={barData} dataKey={BAR_LABEL_KEY} orientation="vertical"
  series={[{ name: BAR_VALUE_KEY, label: t('…'), color: FOUNDATION_CSS_VARS.accent }]}
  valueFormatter={formatBytes} />
```

> **方向陷阱**：MUI 的 `layout="horizontal"` 对应 Mantine 的 `orientation="vertical"`。

数据格式也不一样。MUI 是 `series[].data` 数组配合 `xAxis` / `yAxis`；Mantine 是「`data` 行数组 + `dataKey` + `series[{ name, label?, color }]`」，颜色用 `FOUNDATION_CSS_VARS.*` 或 `useChartColors()`。

#### x-pro 图表（`@/components/x-pro/charts`）

8 个组件的名字不变，内部改为封装 `@mantine/charts`：

| 组件 | v1.0.0 底层 |
|---|---|
| `HeatmapChart` | `MatrixChart`（中间色用 `color-mix` 插值） |
| `FunnelChart` | 纵向用 `FunnelChart`；横向用纯 SVG 自绘（Recharts Funnel 不支持横向），Tooltip 都用 `ChartTooltip` |
| `RadarChart` | `RadarChart` |
| `CandlestickChart` | `CandlestickChart` |
| `SankeyChart` | `SankeyChart` |
| `TreemapChart` | `Treemap` |
| `ZoomableChart` | `LineChart` / `AreaChart` + Brush（模式二）；或沿用 CSS transform 包裹（模式一） |
| `GanttChart` | 仍是 SVG 自绘 |

**删除的导出**：v0.0.3 时 `@/components/x-pro` 和 `x-pro/charts` 导出了自绘图表用的公共件，现在**全部删除**：

- 组件 / hook：`useChartDimensions`、`useChartTooltip`、`ChartContainer`、`Tooltip`、`Legend`
- 类型：`ChartDimensions`、`TooltipData`、`LegendItem`、`ChartContainerProps`、`TooltipState`

对应文件 `shared/{ChartContainer,Legend,Tooltip}.tsx`、`shared/{hooks,useChartDimensions,useChartTooltip}.ts` 已删除。保留的只有 `useChartColors` 和 `ChartMargin`。如果你基于这些公共件自绘了图表，请改用 `@mantine/charts`：尺寸测量用 `@mantine/hooks` 的 `useElementSize`，Tooltip 用 `ChartTooltip`。

**新增的导出**：`HeatmapChartProps`、`ZoomableSeries`、`registerXProChartsLocales`；`HeatmapChart` 现在也能从 `@/components/x-pro` 顶层导入。

**`useChartColors(count?)` 的返回值变了**：v0.0.3 返回具体的十六进制颜色（主题色 + 10 个 fallback 十六进制）；现在返回 `MantineColor[]`，前 7 个是 `FOUNDATION_CSS_VARS` 里的 `var(--fd-*)`，后面是 Mantine 色阶 token（`'violet.5'`、`'pink.5'` 等）。可以直接作为 `@mantine/charts` 的 `color`。**自绘 SVG 时**需要先用 `getThemeColor(color, useMantineTheme())` 转换（参考 `GanttChart.tsx`）。如果你对返回值做过十六进制运算（比如拼接透明度），需要改用 `useFoundationPalette()`，或在 CSS 里用 `color-mix()`。

**新增的 props**（全部可选，向后兼容）：

| 组件 | 新增 |
|---|---|
| 全部 8 个 | `ariaLabel?: string`（缺省取 `xproCharts.<chart>.ariaLabel`） |
| `FunnelChart` | `withLabels?: boolean`（每层内显示数值）、`valueFormatter?: (value: number) => string`；`orientation: 'horizontal'` 现在走 SVG 自绘 |
| `CandlestickChart` | `labels?: Partial<CandlestickChartLabels>`（Tooltip 中 open / high / low / close 的文案，缺省取语言包）；`margin` 改为透传给 Recharts |
| `ZoomableChart` | 模式二：`data` / `dataKey` / `series: ZoomableSeries[]` / `type: 'line' \| 'area'` / `width` / `height` / `startIndex` / `endIndex` / `onRangeChange`。传了 `data` 时会忽略 `children`；`children` 改为可选 |

**图表 i18n**：图表内置文案（无数据、K 线的 OHLC、aria-label 等）放在 `xproCharts.*` 命名空间，语言包位于 `components/x-pro/charts/lang/{zh-CN,en-US}.ts`。注册方式：

```ts
// App.tsx（已加）
import { registerXProChartsLocales } from '@/components/x-pro/charts/lang';
registerXProChartsLocales();
```

这个函数是幂等的。图表模块被 import 时也会自动注册一次（`shared/useChartsT.ts`），所以通过深路径只 import 单个图表时文案也存在。

### 3.8 数据表格：`GridColDef` → `DataGridColumn<T>`

`DataGridPro` / `DataGridPremium` 改为基于 `mantine-datatable` 重写，**不再继承 MUI 的 `DataGridProps`**，变成带泛型 `T extends DataGridRow` 的独立 props。

#### 列定义字段对照

`DataGridColumn<T>` = `mantine-datatable` 的 `DataTableColumn<T>`（去掉 `render` / `footer`）再加上项目扩展字段：

| MUI `GridColDef` | `DataGridColumn<T>` | 说明 |
|---|---|---|
| `field` | **`accessor`** | 字段名 |
| `headerName` | `headerName` | 纯文本表头，导出和 aria 也用它 |
| `renderHeader` | `title`（ReactNode） | 没有 `title` 时用 `headerName` |
| `width` | `width`（`number \| string`） | |
| `minWidth` | `minWidth` | 同时也是列宽拖拽的下限，默认 60 |
| `flex` | 没有对应字段 | 改用 `width` 字符串（如 `'30%'`），或不设宽度 |
| `type: 'number'` | `type: 'number'` | 默认右对齐，筛选 / 排序按数值比较。**只支持 `'string' \| 'number'`**，MUI 的 `date` / `boolean` / `singleSelect` / `actions` 要改用 `render` 自绘 |
| `align` / `headerAlign` | `textAlign` | |
| `sortable` | `sortable` | 默认 `true` |
| `filterable` | `filterable` | 是否出现在表头筛选行，默认 `true` |
| `valueGetter(value, row)` | **`valueGetter(row)`** | 签名变了：只接收行对象。排序 / 筛选 / 聚合 / 导出 / 复制都会走它 |
| `valueFormatter(value, row)` | `valueFormatter(value, row)` | 返回 ReactNode；导出 CSV 时只采用返回的字符串 / 数字 |
| `renderCell(params)` | **`render(row, index)`** | 接收原始行 `T`（分组 / 树形的内部包装对调用方不可见） |
| `hideable: false` | `toggleable: false` | 不能在列菜单或「管理列」里隐藏 |
| `columnVisibilityModel` 中设 `{ x: false }` | `hidden: true` | 初始隐藏 |
| `resizable: false` | `resizable: false` | 不显示列宽拖拽手柄 |
| — | `pinnable: false` | 列菜单中不显示「钉住」项 |

```ts
// before
import type { GridColDef } from '@mui/x-data-grid';
const columns: GridColDef[] = [
  { field: 'name', headerName: t('xpro.col.name'), width: 140 },
  { field: 'salary', headerName: t('xpro.col.salary'), type: 'number', width: 120 },
];
<DataGridPro rows={demoRows} columns={columns} pinnedColumns={{ left: ['name'] }} rowReordering />

// after
import type { DataGridColumn } from '@/components/x-pro/data-grid';
const columns: DataGridColumn<DemoRow>[] = [
  { accessor: 'name', headerName: t('xpro.col.name'), width: 140 },
  { accessor: 'salary', headerName: t('xpro.col.salary'), type: 'number', width: 120 },
];
<DataGridPro<DemoRow> rows={demoRows} columns={columns} pinnedColumns={{ left: ['name'] }} rowReordering />
```

#### Props 变化

不再透传 MUI 的 `DataGridProps`，所以 `initialState`、`paginationModel`、`pageSizeOptions`（顶层）、`slots`、`autoHeight`、`density`、`disableRowSelectionOnClick` 等全部失效（TypeScript 会直接报错）。`DataGridProProps<T>` 当前支持的完整集合是：

- 数据：`rows: T[]`、`columns: DataGridColumn<T>[]`、`getRowId?: (row: T) => DataGridRowId`
- Pro 功能（名称和 v0.0.3 相同）：`pinnedColumns`、`pinnedRows`、`treeData`、`masterDetail`、`lazyLoading`、`headerFilters`、`clipboardPaste`、`columnReordering`、`rowReordering`、`onColumnOrderChange`、`onRowOrderChange`
- **新增：列菜单 / 列宽**：`disableColumnMenu`、`disableColumnPinning`、`disableColumnResize`、`onColumnWidthChange(field, width)`、`onColumnVisibilityChange(hiddenFields)`、`onPinnedColumnsChange(model)`
- **新增：排序**：`sortModel?: { field, direction: 'asc' \| 'desc' } \| null`、`onSortModelChange`
- 勾选：`checkboxSelection`、`rowSelectionModel?: DataGridRowId[]`（**普通 id 数组**）、`onRowSelectionModelChange(ids)`
- 分页：`pagination?: boolean \| { pageSize?, pageSizeOptions? }`（`true` 时 pageSize 为 25）
- 其它：`loading`、`onRowClick(row, index)`（MUI 是 `(params: GridRowParams)`）、`striped`、`height`（默认 `100%`）、`className`

配置类型的细节变化：

| 类型 | 变化 |
|---|---|
| `PinnedRows<T>` / `TreeDataConfig<T>` / `MasterDetailConfig<T>` | 改为泛型，回调参数从 `GridRowModel` 变成 `T` |
| `TreeDataConfig.groupColDef` | `Partial<GridColDef>` → `{ headerName?: string; width?: number }` |
| `LazyLoadingConfig` | 新增 `hasMore?`（默认 `true`）、`pageSize?`（默认 50） |
| `HeaderFilterConfig.filterModel` | MUI `GridFilterModel` → `DataGridFilterModel { items: { field, operator, value: string }[] }`，`operator` 是 `DataGridFilterOperator`：`contains \| equals \| startsWith \| endsWith \| gt \| gte \| lt \| lte` |
| `ClipboardPasteConfig.onPaste` | 多了第 4 个参数 `context: { rowIds, fields }`，方便直接写回数据源 |
| `DataGridPremiumProps<T>` | 新增 `showToolbar?`（工具栏：CSV / Excel 导出 + 管理列，默认 `false`）、`excelExportOptions?` |
| `ExcelExportOptions` | 新增 `dialogTitle?`、`filterLabel?`（工具栏已经内置，并经过 `t()`）；`filename` 的扩展名会按导出格式自动替换 |

新导出的类型：`DataGridColumn`、`DataGridRow`、`DataGridRowId`、`DataGridFilterModel`、`DataGridFilterItem`、`DataGridFilterOperator`、`DataGridSortModel`、`ClipboardPasteContext`、`DataGridRecord`。

#### 列菜单与列宽（新）

表头的列菜单默认开启，包含：升序 / 降序 / 取消排序、固定到左侧 / 右侧 / 取消固定、隐藏此列、管理列（全部显示 / 全部隐藏）。拖拽表头边缘可以调整列宽。这些状态**只保存在内存中**。如果需要记住，就在 `onColumnWidthChange` / `onColumnVisibilityChange` / `onPinnedColumnsChange` 回调里自己存到 `PreferencesService`。**不要**使用 mantine-datatable 的 `storeColumnsKey`，因为它内部用的是 localStorage，违反持久化规则。

#### 导出：经 `ExportService`

`useExcelExport({ rows, columns })` 的签名不变（改为泛型），但行为变了：

- v0.0.3：`exportDataAsCsv` 是同步的，用 blob + `<a download>` 下载；`exportDataAsExcel` 动态 `import('xlsx')`，而依赖里并没有这个包
- v1.0.0：两个函数都返回 `Promise<string | null>`（保存路径；用户取消时为 `null`；失败时 reject）。内部调用 `ExportService.saveCSV` / `saveXLSX`：先用 `NativeDialogs.saveFile` 弹出原生「另存为」，再由后端 `exportsvc` 写文件。CSV 单元格用显示值，XLSX 用原始值，数字和布尔保持原类型

自己调用导出的代码要加上 `await`，并处理 `null` 和异常。也可以绕过表格直接用 `ExportService`：

```ts
import { ExportService } from '@/services';
const path = await ExportService.saveXLSX({
  defaultFilename: 'report',
  table: { sheetName: 'Sheet1', headers: ['名称', '数量'], rows: [['苹果', 12]] },
  title: t('…'),          // 对话框标题必须经过 t()
});
```

#### 表格 i18n

表格文案放在 `dataGrid.*` 命名空间（`components/x-pro/data-grid/lang`）。`App.tsx` 中已调用 `registerDataGridLocales()`，`DataGridSurface.tsx` 加载时也会自动注册一次，这个函数是幂等的。

### 3.9 子窗口跟随主题

v0.0.3 的 `child.tsx` 固定使用 `buildMuiTheme(lightPreset)`，所以子窗口永远是亮色。v1.0.0 的子窗口改为 `registerFoundationThemes()` + `<FoundationThemeProvider>`，启动时从 SQLite 读取主题选择，并订阅 `appsettings:changed`，主窗口切换主题时会同步刷新。托盘面板（`systrayEntry.tsx`）也是同样的处理。如果你新增了独立入口的窗口，照着这两个文件写。

### 3.10 跨窗口设置同步（前端侧）

`AppSettingsService` 新增：

```ts
export type AppSettingsField = 'themeChoice' | 'customTheme' | 'localeChoice';
AppSettingsService.onChanged(callback: (field: AppSettingsField) => void): () => void;
```

`FoundationThemeProvider` 收到 `themeChoice` / `customTheme` 变更后，防抖 200ms 再重新拉取；`I18nProvider` 收到 `localeChoice` 后重新拉取。业务代码一般不需要直接订阅。

### 3.11 全局样式：`import '@/styles'`

`CssBaseline` 被 `frontend/src/styles/index.ts` + `global.css` 取代。每个入口（`main.tsx` / `child.tsx` / `systrayEntry.tsx`）都要在**第一个业务 import 之前** import 一次：

```ts
import '@/styles';   // 顺序：@mantine/core/styles.css → @mantine/charts/styles.css → mantine-datatable/styles.css → ./global.css
import { App } from './App';
```

`global.css` 负责 `html / body / #root / #child-root` 的高度和溢出、背景和文字色（`--fd-*`）、`user-select: none`、滚动条样式。

### 3.12 其它前端变化

- **`src/settings.ts` 已删除**（v0.0.3 中的 `settings.systray.enabled` 开关）。托盘开关改由后端持久化，见 4.2。
- **`SystrayService`（前端）** 从 dynamic import 改为静态 import bindings；`enable` / `disable` / `isEnabled` 去掉了 `async` 包装（返回值仍是 Promise）；新增 `setMenuLabels({ showWindow, quit })`。
- **`AppLayout` 新增 ViewModel `useAppLayout.ts`**：在语言变化时把托盘菜单文案（`app.trayMenu.showWindow` / `app.trayMenu.quit`）推给后端，并监听 `child:broadcast` 中的 `app:open-settings` 来跳转设置页。
- **设置页语言包注册改从 `<sub>/lang` 导入**：`pages/SettingsPage/lang/index.ts` 从 `'../personalization'` 改为 `'../personalization/lang'`（`language`、`database` 同理）。原因见 7.3。
- **`vite.config.ts`**：`build.rollupOptions` 改为 `build.rolldownOptions`；`systray.html` 入口恢复；新增 `define: { __APP_VERSION__ }`。

---

## 4. 后端变化

### 4.1 新增 `internal/services/exportsvc`

- `exportsvc.New() *Service`，在 `internal/app/app.go` 中通过 `application.NewService(exportsvc.New())` 注册。
- `WriteCSV(path string, content string) error`：写入 UTF-8 并加 BOM（内容已有 BOM 时不重复加），方便 Excel 双击直接打开中文。
- `WriteXLSX(path string, table Table) error`：`Table{ SheetName, Headers []string, Rows [][]any }`，用 excelize 生成，表头加粗、冻结首行、按内容估算列宽，数字保持数值类型。
- 路径校验：必须是绝对路径、扩展名与格式一致、父目录已存在。
- 统一通过 `filex.WriteAtomic` 落盘，用 `logx.For("export")` 记录日志。
- 单元测试在 `exportsvc_test.go`。

### 4.2 `SystrayService`（`internal/app/systray.go`）

v0.0.3 只有一个没被调用的 `setupSystray()`（`app.go` 里是注释掉的），但前端已经在调用不存在的 `Enable` / `Disable` / `IsEnabled`。v1.0.0 提供了完整实现：

- `NewSystrayService(prefs *preferences.Service, icon []byte) *SystrayService`，注册为 Wails service。它也是前端 bindings `internal/app/systrayservice` 的来源。
- 对前端暴露：
  - `Enable(ctx) error`：创建托盘图标和隐藏的面板窗口，并持久化开关
  - `Disable(ctx) error`：销毁托盘和面板，并持久化开关
  - `IsEnabled() bool`
  - `SetMenuLabels(labels TrayMenuLabels)`：`TrayMenuLabels{ ShowWindow, Quit }`，JSON 字段为 `showWindow` / `quit`，空值时退回英文
  - 以上都是幂等的，并用互斥锁保证并发安全
- 小写的内部方法 `attach(app, mainWindow)`、`restore(ctx)` 不会出现在 bindings 中。`app.go` 在 `application.New` 之后依次调用这两个方法。
- **持久化键**：preferences 表的 `systray.enabled`，值为 `"true"` / `"false"`。启动时由 `restore` 读取，值为 `"true"` 才创建托盘。
- 面板窗口选项新增 `HideOnFocusLost: true`、`HideOnEscape: true`（三个平台都加了）；用户按 Cmd+W / Alt+F4 关闭面板时，会被 `WindowClosing` hook 拦截并改为隐藏，应用退出时才放行。
- 托盘图标的平台差异拆到 `systray_<os>.go` 里的 `applyTrayIcon`（macOS 用 `SetTemplateIcon`，Windows / Linux 用 `SetIcon` + `SetDarkModeIcon`），`systray.go` 里不再判断 `runtime.GOOS`。
- 托盘面板的 `child:broadcast` 消息 `app:show-window` / `app:open-settings` 由后端统一处理：隐藏面板后显示并聚焦主窗口。v0.0.3 的 Go 代码会 `app.Event.Emit("app:show-window", nil)`，**现在不再发这个事件**。如果你在前端监听过它，改为依赖后端直接显示窗口，或者监听 `child:broadcast`。

### 4.3 事件：`AppSettingsChanged`

`internal/events/events.go` 新增：

```go
AppSettingsChanged = "appsettings:changed"
application.RegisterEvent[string](AppSettingsChanged)
```

payload 是变更的字段名：`"themeChoice" | "customTheme" | "localeChoice"`。

### 4.4 `appsettings` 写入后广播

`internal/services/appsettings` 的 `SetThemeChoice` / `SetCustomTheme` / `SetLocaleChoice`（以及调用 `SetCustomTheme` 的 `ResetCustomTheme`）统一经过新的私有方法 `update(ctx, column, field, value)`：写库成功后通过 `application.Get()` 调用 `app.Event.Emit(events.AppSettingsChanged, field)`。如果你给 `app_settings` 加了自己的字段，setter 也走 `update`，前端就能自动跨窗口同步。

### 4.5 GORM 日志

`internal/storage/db.go`：`logger.Default.LogMode(logger.Warn)` 改为 `logger.New(stdlog.New(os.Stderr, …), logger.Config{ SlowThreshold: 200ms, LogLevel: logger.Warn, IgnoreRecordNotFoundError: true, Colorful: true })`。`First()` 查不到记录（比如 preferences 里缺省的键）不再打印错误日志。

### 4.6 应用描述

`internal/app/app.go` 中 `application.Options.Description` 从 `"Wails v3 + React 19 + MUI scaffold"` 改为 `"Wails v3 + React 19 + Mantine scaffold"`。按改名指南，这里应该填你自己的描述。

`app.go` 里的其它变化：`preferences.New(holder)` 先存进变量 `prefsSvc`，再同时传给 preferences service 和 `NewSystrayService`；`app.Window.NewWithOptions(...)` 的返回值存进 `mainWindow`，供托盘使用。**如果你在 `app.go` 里注册了自己的 service，合并时注意保留。**

---

## 5. 新功能一览

| 功能 | 说明 | 入口 |
|---|---|---|
| 系统托盘完整可用 | 首页开关，运行时创建 / 销毁；开关持久化到 `systray.enabled`，启动时恢复；面板失焦或按 Esc 隐藏；右键菜单文案走 i18n；面板上的「打开设置」会显示主窗口并跳转到设置页 | `internal/app/systray.go`、`pages/HomePage/useHomePage.ts`、`systray/` |
| 原生对话框导出 + 真正的 xlsx | DataGridPremium 工具栏（`showToolbar`）提供 CSV / Excel 导出：弹出原生「另存为」，后端用 excelize 写 `.xlsx`，CSV 带 BOM | `services/export`、`internal/services/exportsvc` |
| 跨窗口主题 / 语言同步 | 主窗口、子窗口、托盘面板一起变化（子窗口不再固定亮色） | `appsettings:changed` |
| DataGrid 列菜单 / 列宽拖拽 | 排序、钉住、隐藏、管理列；拖拽表头边缘调整列宽；钉住行按实测行高定位（`usePinnedRowOffsets`） | `x-pro/data-grid/DataGridColumnMenu.tsx`、`features/useColumnResizing.ts` |
| 横向漏斗 | `<FunnelChart orientation="horizontal" withLabels />` | `x-pro/charts/FunnelChart` |
| 图表 i18n | `xproCharts.*` 语言包、`registerXProChartsLocales()`；演示页的数据也全部走 i18n | `x-pro/charts/lang` |
| 表格 i18n | `dataGrid.*` 语言包、`registerDataGridLocales()` | `x-pro/data-grid/lang` |
| 应用版本单一来源 | `build/config.yml` 的 `info.version` → 前端 `__APP_VERSION__` | `vite.config.ts` |
| 分包规则 | 用 Vite 8 的 `rolldownOptions`；懒加载页面的骨架使用独立的 `*.skeleton.module.css`；语言包从 `<sub>/lang` 导入。首屏不再预加载 recharts / mantine-datatable | 见 7.3 |
| macOS 样式化 dmg | `task darwin:package:dmg` | `build/darwin/Taskfile.yml` |

---

## 6. 破坏性变更速查表

| 旧（v0.0.3） | 新（v1.0.0） | 怎么改 |
|---|---|---|
| `@mui/*`、`@emotion/*` 依赖 | 已移除 | `pnpm install` 跟随上游；自己的代码按第 3 节改写 |
| `buildMuiTheme(preset)` | `buildMantineTheme(preset)` + `buildCssVariablesResolver(preset)` | 一般不需要直接调用，`FoundationThemeProvider` 内部已经处理 |
| `FoundationThemePreset.muiOverrides` | `mantineOverrides: MantineThemeOverride` | 按 Mantine theme 结构重写（`components: { X: X.extend({...}) }`） |
| `theme.palette.foundation.x.y` | `var(--fd-x-y)` / `FOUNDATION_CSS_VARS.x.y` / `useFoundationPalette().x.y` | 见 3.1 的对照表；状态色是 `--fd-danger`，没有 `status-` 前缀 |
| `<Name>.styles.ts` + `sx` | `<Name>.module.css` + `className` / `classNames` | 见 3.2 / 3.3（spacing × 8px，borderRadius × 4px） |
| `useTheme()` | 删除；改用 `useMantineTheme()` / `useFoundationTheme()` | |
| `<ThemeProvider>` + `<CssBaseline />` | `<FoundationThemeProvider>` + `import '@/styles'` | 每个入口文件都要 import |
| `@mui/icons-material/*` | `@tabler/icons-react` 的 `IconXxx` | 见 3.5；`fontSize` → `size` + `stroke={1.75}` |
| `RouteDefinition.icon: ComponentType<{fontSize}>` | `icon?: Icon` | `routes.tsx` 改为 `icon: IconHome` |
| `Skeleton` / `SkeletonText` 的 `sx` | 已移除 | 改用 `style` / `className` |
| `Tooltip title=` | `Tooltip label=` | `placement` → `position` |
| `Button startIcon` | `leftSection` | `variant` 映射：contained → filled，outlined → outline，text → subtle |
| `@mui/x-charts` `PieChart` / `BarChart` | `@mantine/charts` `DonutChart` / `BarChart` | 数据改成 `data` + `dataKey` + `series`；`layout="horizontal"` → `orientation="vertical"` |
| x-pro `useChartDimensions` / `useChartTooltip` / `ChartContainer` / `Tooltip` / `Legend` 及类型 `ChartDimensions` / `TooltipData` / `LegendItem` / `ChartContainerProps` / `TooltipState` | 已删除 | 改用 `@mantine/charts` + `useElementSize` + `ChartTooltip` |
| `useChartColors()` 返回十六进制 | 返回 `var(--fd-*)` / `'violet.5'` 这类 token | 自绘 SVG 用 `getThemeColor(c, theme)` 转换；需要计算颜色时用 `useFoundationPalette()` |
| `GridColDef[]` | `DataGridColumn<T>[]` | `field` → `accessor`、`renderCell` → `render(row, i)`、`valueGetter(v, row)` → `valueGetter(row)`、`hideable` → `toggleable`、`align` → `textAlign` |
| `DataGridProProps extends DataGridProps` | 独立的 `DataGridProProps<T>` | 删掉 MUI 专有 props；分页用 `pagination`，勾选模型用 `DataGridRowId[]` |
| `onRowClick(params)` | `onRowClick(row, index)` | |
| `HeaderFilterConfig.filterModel: GridFilterModel` | `DataGridFilterModel` | `items[].operator` 限定为 8 种 |
| `ClipboardPasteConfig.onPaste(data, r, c)` | `onPaste(data, r, c, context)` | 第 4 个参数可选，旧回调照样能用 |
| `TreeDataConfig.groupColDef: Partial<GridColDef>` | `{ headerName?, width? }` | |
| `useExcelExport().exportDataAsCsv()` 同步 + blob 下载 | `Promise<string \| null>`，走原生「另存为」 | 加 `await`，处理用户取消（`null`）和异常 |
| `exportDataAsExcel` 依赖 `xlsx` 包 | 后端 `exportsvc.WriteXLSX`（excelize） | 先重新生成 bindings |
| `src/settings.ts`（`settings.systray.enabled`） | 已删除 | 改用 `SystrayService.enable/disable/isEnabled`，开关自动持久化 |
| Go 发出 `app:show-window` 事件 | 不再发出 | 后端直接显示主窗口；前端不要再依赖这个事件 |
| `child.tsx` 固定 `lightPreset` | 跟随主题 | 自定义的子窗口入口改用 `FoundationThemeProvider` |
| `build.rollupOptions` | `build.rolldownOptions` | 同时存在时 `rollupOptions` 会被忽略 |
| `SettingsPage/lang` 从 `'../<sub>'` 导入 | 从 `'../<sub>/lang'` 导入 | 你自己的懒加载页面也照此处理 |
| Go 1.25 / Wails beta.9 / `@wailsio/runtime` beta.9 | Go 1.26 / Wails v3.1.0 / `3.1.0` | 见 2.2 / 2.3 |
| `config.yml` 中 `info.version: "0.0.3"` | `"1.0.0"`，同时也是前端版本号的来源 | 改成你自己的版本号后执行 `wails3 task common:update:build-assets` |

---

## 7. 常见问题

### 7.1 `pnpm install` 报 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`

原因是你的 pnpm 开启了 `minimumReleaseAge` 这条供应链策略，而某个包的版本发布时间还在冷却期内。处理方法：把它加进 `frontend/pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude`：

```yaml
minimumReleaseAgeExclude:
  - '@wailsio/runtime@3.0.0-beta.9'   # 上游遗留，可以保留也可以删
  - '@wailsio/runtime@3.1.0'          # 按报错信息加
```

或者用 `pnpm add <pkg>@<version>`，pnpm 会自动写进去。**这个文件要提交进仓库。**

### 7.2 改了 `vite.config.ts` 的 `build.rollupOptions` 却不生效

Vite 8 底层是 rolldown，构建选项要写在 `build.rolldownOptions`。`rollupOptions` 只是兼容别名，**两者同时存在时 `rollupOptions` 会被忽略**。多入口（`main` / `child` / `systray`）也在 `rolldownOptions.input` 里。

### 7.3 懒加载页面的 chunk 被首屏预加载了（首屏 JS 变大）

通常是静态 import 链把懒加载页面带进了首屏：

- **骨架和页面共用了同一个 CSS Module。** `<Name>.skeleton.tsx` 会随 `routes.tsx` 静态加载，如果它 import 了 `<Name>.module.css`，懒加载页面的 chunk 就会被拉进首屏预加载。解决方法是给骨架单独建 `<Name>.skeleton.module.css`（参考 `SettingsPage.skeleton.module.css` / `XProDemoPage.skeleton.module.css`）。同步加载的页面（如 `HomePage`）可以复用页面自己的样式。
- **语言包注册从 `'<sub>'` 导入。** `<sub>/index.ts` 会连带导出 View，应该从 `'<sub>/lang'` 导入。

### 7.4 运行时报 `Could not resolve "@bindings/foundation/internal/services/exportsvc"`，或导出按钮没有反应

bindings 没有重新生成。执行 `wails3 generate bindings`。`ExportService` 对 bindings 用的是 dynamic import，缺少时只在点击导出时 reject；`SystrayService` 用的是静态 import，缺少 `internal/app/systrayservice` 时 `pnpm typecheck` / `pnpm build` 会直接失败。改过模块名的话，记得同步修改这两个文件里的 `@bindings/<模块名>/...`。

### 7.5 样式顺序不对：Mantine 默认样式盖住了自己写的样式，或者 global.css 不生效

- `import '@/styles'` 必须放在入口文件里、`App` / 业务组件的 import **之前**（参考 `main.tsx`）。`styles/index.ts` 内部的顺序（core → charts → datatable → global）不要改。
- 覆盖 Mantine 组件默认样式时，如果选择器权重不够，用双类选择器（`.item.item`，参考 `Sidebar.module.css`、`QuickActions.module.css`），或者用 `classNames={{ root, … }}` 指定具体元素，**不要**用 `!important`。
- Mantine 默认会给 subtle 按钮设置 primary 文字色。想要中性色时，在 class 里覆盖 `color: var(--fd-text-primary)`。

### 7.6 图表颜色不对，或自绘 SVG 的 `fill="violet.5"` 不生效

`useChartColors()` 现在返回的是 Mantine token。`@mantine/charts` 会自动解析，但原生 SVG 属性不会。先 `getThemeColor(color, useMantineTheme())`，参考 `GanttChart.tsx`。

### 7.7 托盘开关打开后，重启又没了 / 托盘菜单还是英文

开关存在 preferences 表的 `systray.enabled` 里，会跟随当前数据库路径（「设置 → 数据存储」可以切换）。切换数据库路径后看到的是新库里的值。菜单文案由主窗口的 `useAppLayout` 在语言变化时推给后端，推送之前是英文兜底（`Show Window` / `Quit`）。如果你重写了 `AppLayout`，记得保留 `useAppLayout()`。

### 7.8 TypeScript 报 `DataGridProProps` 上没有 `initialState` / `pageSizeOptions` / `slots`

新表格不再继承 MUI props。分页改用 `pagination={{ pageSize, pageSizeOptions }}`，其它能力对照 3.8 的 props 列表；确实没有对应功能的，可以直接使用 `mantine-datatable` 的 `DataTable`。

### 7.9 mantine-datatable 的 `storeColumnsKey` 能用吗？

不能用。它把列状态写进 localStorage，违反「跨会话状态只能走 SQLite」的规则。请在 `onColumnWidthChange` 等回调里自己存到 `PreferencesService`。

---

## 8. Skill 变化

`.claude/skills/` 下删除了 11 个 MUI 相关 skill，换成 5 个 Mantine skill：

| 删除（v0.0.3） | 替换为（v1.0.0） |
|---|---|
| `foundation-mui`（总索引） | `foundation-mantine`（总索引 + 规则 + `buildMantineTheme` 讲解 + MUI→Mantine 对照表） |
| `foundation-mui-layout`、`foundation-mui-inputs`、`foundation-mui-feedback`、`foundation-mui-navigation`、`foundation-mui-surfaces`、`foundation-mui-data-display`、`foundation-mui-utils` | `foundation-mantine-components`（布局 / 输入 / 浮层与反馈 / 导航 / 数据展示 / hooks，附官方文档） |
| `foundation-mui-icons` | `foundation-mantine-icons`（Tabler 图标规范 + MUI 图标对照） |
| `foundation-mui-x-charts` | `foundation-mantine-charts`（`@mantine/charts` + x-pro 图表） |
| `foundation-mui-x-data-grid` | `foundation-mantine-datatable`（mantine-datatable + x-pro DataGridPro / Premium + ExportService） |

内容有更新的已有 skill：`foundation-theme`（改为 Mantine 版：`mantineOverrides` / `--fd-*`）、`foundation-systray`（`SystrayService` + 持久化 + 面板）、`foundation-i18n`（跨窗口同步 `appsettings:changed`）、`foundation-childwindow`、`foundation-persistence`、`foundation-utils`、`wails-upgrade-sop`；`wails-*` 系列已同步到 v3.1.0 文档。

如果你的 fork 改过这些 skill，或者在自己的 `CLAUDE.md` / skill 里引用了 `foundation-mui*`，请把引用改成上表右列的名字。
