---
name: foundation-mui-inputs
description: MUI 9 输入类组件在 Foundation 项目中的详尽用法。当使用 Button/TextField/Select/Checkbox/Switch/Slider/Radio/Rating/Autocomplete/ToggleButton/FAB 时参考。
---

# Foundation MUI 9 输入类组件 SKILL

## 何时使用

当你需要在 Foundation 项目中使用以下任何输入类组件时，参考本 SKILL：

- Button / IconButton / ButtonGroup / LoadingButton（MUI 9 已合并为 Button 的 `loading` prop）
- TextField（默认 size="small" variant="outlined"）
- Select / NativeSelect
- Checkbox / Switch / Radio / RadioGroup
- Slider / Rating
- Autocomplete
- ToggleButton / ToggleButtonGroup
- FAB (Floating Action Button)

## Foundation 铁律摘要

| # | 规则 | 要点 |
|---|------|------|
| 1 | 配色 | 只用 `theme.palette.foundation.*`，禁止硬编码 hex |
| 2 | 圆角 | 按钮/IconButton 6px，容器 8px（主题已统一） |
| 3 | 图标 | 只用 `@mui/icons-material` 的 `*Rounded` 系列 |
| 4 | i18n | 所有人类可见字符串走 `t('key')` |
| 5 | 样式 | 写在 `<Name>.styles.ts`，使用工厂函数 |
| 6 | 对话框 | 简单确认走 NativeDialogs，复杂表单用 MUI Dialog |
| 7 | 调用链 | View → ViewModel → services/ → @bindings/ |
| 8 | 路由 | 用 `useRouter().navigate(id)`，不用 react-router |

## MUI 9 重要变更

- `LoadingButton` 不再需要从 `@mui/lab` 导入，直接用 `<Button loading>` 即可
- `Button` 默认 `disableElevation: true`（主题已配置）
- `TextField` 默认 `size="small"` `variant="outlined"`（主题已配置）

## References 索引

| 文件 | 覆盖组件 |
|------|----------|
| [button.md](./references/button.md) | Button, IconButton, ButtonGroup, LoadingButton |
| [text-field.md](./references/text-field.md) | TextField |
| [select.md](./references/select.md) | Select, NativeSelect |
| [checkbox.md](./references/checkbox.md) | Checkbox, FormControlLabel |
| [radio.md](./references/radio.md) | Radio, RadioGroup |
| [switch.md](./references/switch.md) | Switch |
| [slider.md](./references/slider.md) | Slider |
| [rating.md](./references/rating.md) | Rating |
| [autocomplete.md](./references/autocomplete.md) | Autocomplete |
| [toggle-button.md](./references/toggle-button.md) | ToggleButton, ToggleButtonGroup |
| [fab.md](./references/fab.md) | Fab (Floating Action Button) |
