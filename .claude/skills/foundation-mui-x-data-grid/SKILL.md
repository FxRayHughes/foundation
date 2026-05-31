---
name: foundation-mui-x-data-grid
description: "@mui/x-data-grid v9.3 在 Foundation 项目中的详尽用法。社区版全功能 + 项目自实现的 Pro/Premium 功能（列钉住/树形数据/行分组/聚合/Excel导出等）。"
---

# MUI X DataGrid v9.3 — Foundation 用法指南

## 何时使用此 Skill

- 需要展示表格数据（列表、管理面板、数据浏览）
- 需要可排序/可筛选/可分页的数据表
- 需要行内编辑功能
- 需要 CSV/Excel 导出或打印
- 需要自定义列渲染（按钮、图标、进度条等）
- 需要 Pro/Premium 功能（列钉住、树形数据、行分组、聚合等）

## 社区版功能（@mui/x-data-grid）

| 功能 | 说明 |
|------|------|
| 列定义 & 列类型 | string/number/date/dateTime/boolean/singleSelect/actions |
| 自定义渲染 | renderCell / renderHeader / renderEditCell |
| 列宽调整 | resizable prop |
| 列可见性 | columnVisibilityModel |
| 排序 | 单列/多列排序 |
| 筛选 | 单列/多列筛选，自定义 operator |
| 分页 | 客户端分页，paginationModel |
| 行选择 | 单选/多选 checkbox |
| 密度 | compact/standard/comfortable |
| CSV 导出 | GridToolbar 内置 |
| 打印 | GridToolbar 内置 |
| 虚拟化 | 行/列虚拟化，支持大数据量 |
| 行高 | rowHeight / getRowHeight 动态行高 |
| 单元格编辑 | cell editing mode |

## 自实现 Pro/Premium 功能（@/components/x-pro）

以下功能由项目自行实现，位于 `src/components/x-pro/data-grid/`。
**禁止**使用 `@mui/x-data-grid-pro` / `@mui/x-data-grid-premium` 官方付费包。

| 功能 | 组件/Prop | 说明 |
|------|-----------|------|
| 列钉住 | `DataGridPro` + `pinnedColumns` | 左右固定列 |
| 列排序拖拽 | `columnReordering` | 拖拽列头改变顺序 |
| 行排序拖拽 | `rowReordering` + `onRowOrderChange` | 拖拽行改变顺序 |
| 树形数据 | `treeData: TreeDataConfig` | 层级展开/折叠 |
| 主从表 | `masterDetail: MasterDetailConfig` | 展开行详情面板 |
| 行钉住 | `pinnedRows` | 顶部/底部固定行 |
| 懒加载 | `lazyLoading: LazyLoadingConfig` | 滚动按需加载 |
| 列头筛选 | `headerFilters: HeaderFilterConfig` | 列头下方筛选输入 |
| 剪贴板粘贴 | `clipboardPaste: ClipboardPasteConfig` | 从 Excel 粘贴数据 |
| 行分组 | `DataGridPremium` + `rowGroupingModel` | 按字段自动分组 |
| 聚合 | `aggregationModel` | sum/avg/min/max/count |
| Excel 导出 | `useExcelExport` hook | .xlsx 导出（xlsx 可选） |
| 单元格选择 | `cellSelection` | 类 Excel 范围选择 |

```tsx
// Pro/Premium 功能统一 import
import { DataGridPro, DataGridPremium } from '@/components/x-pro';
```

## Foundation 铁律摘要

1. **配色**：sx 中只用 `theme.palette.foundation.*`，禁止硬编码 hex
2. **圆角**：容器 borderRadius 8（主题已统一）
3. **图标**：只用 `@mui/icons-material` 的 `*Rounded` 系列
4. **i18n**：表头 headerName、空状态、Toolbar 文案全部走 `t('key')`
5. **样式工厂**：样式写 `<Name>.styles.ts`，工厂函数接收 Theme 返回 SxProps
6. **调用链**：View → ViewModel → services/ → @bindings/
7. **localeText**：DataGrid 内部文案通过 `localeText` prop 注入翻译

## References 索引

| 文件 | 内容 |
|------|------|
| [columns.md](./references/columns.md) | 列定义、列类型、自定义渲染、列宽、列可见性 |
| [rows.md](./references/rows.md) | 行模型、行高、行样式、行 ID、动态行 |
| [editing.md](./references/editing.md) | 单元格编辑、行编辑、校验、自定义编辑组件 |
| [sorting-filtering.md](./references/sorting-filtering.md) | 排序模型、筛选模型、自定义 operator |
| [pagination-selection.md](./references/pagination-selection.md) | 分页、行选择、密度控制 |
| [toolbar-export.md](./references/toolbar-export.md) | 工具栏、CSV 导出、打印、列可见性面板 |
| [styling-slots.md](./references/styling-slots.md) | sx 样式、styled 覆盖、slots 替换 |
| [api-events.md](./references/api-events.md) | useGridApiRef、事件系统、命令式 API |
| [pro-features.md](./references/pro-features.md) | **自实现 Pro 功能**：列钉住/列拖拽/行拖拽/树形数据/主从表/行钉住/懒加载/列头筛选/剪贴板粘贴 |
| [premium-features.md](./references/premium-features.md) | **自实现 Premium 功能**：行分组/聚合/Excel 导出/单元格选择 |
