---
name: foundation-mui-utils
description: Foundation 项目 MUI 9 工具类组件用法文档。覆盖 Modal / Popover / Popper / Portal / ClickAwayListener / CssBaseline / Transitions / useMediaQuery / NoSsr / TextareaAutosize / GlobalStyles。遵循 Foundation 配色、圆角、图标、i18n、样式工厂铁律。
---

# Foundation × MUI 9 工具类组件

本 SKILL 覆盖 MUI 9 中**工具类 / 底层**组件在 Foundation 项目中的规范用法。

## 覆盖组件一览

| 组件 | 用途 | 参考文档 |
|------|------|----------|
| Modal | 底层弹层容器（Dialog/Drawer/Menu 的基础） | [modal.md](references/modal.md) |
| Popover | 锚点定位弹出层（带 backdrop） | [popover.md](references/popover.md) |
| Popper | 轻量锚点定位（无 backdrop，不阻塞滚动） | [popper.md](references/popper.md) |
| Portal | 将子节点渲染到 DOM 树外部 | [portal.md](references/portal.md) |
| ClickAwayListener | 监听外部点击 | [click-away-listener.md](references/click-away-listener.md) |
| CssBaseline / ScopedCssBaseline | 全局 / 局部 CSS 重置 | [css-baseline.md](references/css-baseline.md) |
| Transitions | Collapse / Fade / Grow / Slide / Zoom | [transitions.md](references/transitions.md) |
| useMediaQuery | 响应式断点 hook | [use-media-query.md](references/use-media-query.md) |
| NoSsr | 跳过服务端渲染 | 见下方简述 |
| TextareaAutosize | 自动高度文本域 | 见下方简述 |
| GlobalStyles | 注入全局 CSS | 见下方简述 |

---

## Foundation 铁律速查

| # | 铁律 | 要点 |
|---|------|------|
| 1 | 配色 | 只从 `theme.palette.foundation.*` 取值 |
| 2 | 圆角 | 弹出层容器 `borderRadius: 2`（即 8px） |
| 3 | 图标 | 只用 `*Rounded` 系列 |
| 4 | i18n | 所有文案走 `t('key')` |
| 5 | 样式 | `styles.ts` 工厂函数，禁止内联复杂 sx |
| 6 | 对话框 | 简单确认走 NativeDialogs；Modal 仅用于需要自定义 UI 的复杂弹层 |

---

## 快速选型指南

| 需求 | 推荐组件 |
|------|----------|
| 简单确认/警告 | `NativeDialogs`（**不用 Modal**） |
| 复杂表单弹层 | `Dialog`（基于 Modal） |
| 点击按钮弹出菜单/信息 | `Popover` |
| Tooltip 式轻量提示 | `Popper` + `ClickAwayListener` |
| 下拉选项定位 | `Popper`（不阻塞滚动） |
| 渲染到 body 外 | `Portal` |
| 响应式布局判断 | `useMediaQuery` |
| 进入/退出动画 | `Fade` / `Grow` / `Slide` / `Zoom` / `Collapse` |
| 列表展开收起 | `Collapse` |

---

## 简述组件（无独立参考文档）

### NoSsr

跳过服务端渲染，仅在客户端挂载子节点。Foundation 为纯桌面应用（Wails），**一般不需要此组件**。

```tsx
import NoSsr from '@mui/material/NoSsr';

<NoSsr>
  <HeavyComponent />
</NoSsr>
```

### TextareaAutosize

自动根据内容调整高度的原生 textarea。Foundation 中推荐直接用 `TextField multiline`（内部已集成）。

```tsx
import { TextareaAutosize } from '@mui/material';

<TextareaAutosize
  minRows={3}
  maxRows={10}
  placeholder={t('form.placeholder')}
  style={{ width: '100%' }}
/>
```

### GlobalStyles

向文档注入全局 CSS。Foundation 中**优先使用主题 `styleOverrides`**，仅在无法通过主题覆盖时使用。

```tsx
import GlobalStyles from '@mui/material/GlobalStyles';

<GlobalStyles styles={(theme) => ({
  '#root': {
    backgroundColor: theme.palette.foundation.bg.base,
  },
})} />
```

---

## 参考文档索引

- [Modal](references/modal.md)
- [Popover](references/popover.md)
- [Popper](references/popper.md)
- [Portal](references/portal.md)
- [ClickAwayListener](references/click-away-listener.md)
- [CssBaseline](references/css-baseline.md)
- [Transitions](references/transitions.md)
- [useMediaQuery](references/use-media-query.md)
