---
name: foundation-mantine-datatable
description: Foundation 项目数据表格用法：mantine-datatable 9.4.0（DataTable：columns/records/idAccessor、排序 sortStatus、分页、勾选、行展开、列 pinned、滚动回调、主题色 props）+ 项目自实现的 x-pro DataGridPro / DataGridPremium（DataGridColumn<T>、表头列菜单（排序 / 钉住 / 隐藏 / 管理列）、列宽拖拽、列钉住、行钉住、树形数据、主从明细、懒加载、表头筛选、剪贴板粘贴、列/行拖拽重排、排序、勾选、分页；Premium 追加行分组、聚合页脚、单元格范围选择 + Ctrl+C、工具栏（CSV/Excel 导出经 ExportService 原生「另存为」+ Go 后端 excelize 写真 .xlsx、管理列）），含配色、i18n、禁止 storeColumnsKey、列状态经回调存 PreferencesService 等规则。触发词：表格 / DataTable / mantine-datatable / DataGrid / DataGridPro / DataGridPremium / 列钉住 / 列菜单 / 列宽 / 隐藏列 / 树形表格 / 行分组 / 聚合 / 导出 CSV Excel / ExportService / exportsvc / 单元格选择 / 无限滚动 / x-data-grid 迁移。
---

# Foundation 数据表格（mantine-datatable + x-pro DataGrid）

| 需求 | 选择 |
|---|---|
| 静态小表格、无交互 | Mantine `Table`（见 components skill） |
| 普通数据列表：排序 / 分页 / 勾选 / 行展开 | **`DataTable`**（`mantine-datatable`）直接用 |
| 需要 MUI X Pro/Premium 式能力（列菜单、列宽拖拽、钉住、树形、分组、聚合、表头筛选、拖拽、导出、单元格选择） | **`DataGridPro` / `DataGridPremium`**（`@/components/x-pro/data-grid`） |

旧 `@mui/x-data-grid` 已移除：`field` → `accessor`、`headerName` 保留（DataGrid 列）、`renderCell(params)` → `render(row, index)`、`rows` 保留（DataGrid）/ `records`（DataTable）。样式 `mantine-datatable/styles.css` 已在 `styles/index.ts` 全局引入。

## 规则

- **颜色**：DataTable 的颜色 props（`c` / `backgroundColor` / `borderColor` / `rowBorderColor` / `stripedColor` / `highlightOnHoverColor` / `loaderColor` / `paginationActive*Color`）传 `FOUNDATION_CSS_VARS.*` 或 `'foundation'`；改内部 class 用 module.css `:global(.mantine-datatable-…)` + `--fd-*`。DataGrid 已全部配好，不要再传色。
- **i18n**：`title`（表头）、`noRecordsText`、`loadingText`、`paginationText`、`recordsPerPageLabel` 全部 `t()`；DataGrid 内部文案在 `dataGrid.*` 命名空间（`data-grid/lang/{zh-CN,en-US}.ts`，组件模块加载时 `registerDataGridLocales()` 自动 extend 到公共语言包，新增语言要补一份）。
- **禁止 `storeColumnsKey`（以及给 `useDataTableColumns` 传 `key`）**：传了 key，列顺序 / 显隐 / 宽度 / 钉住状态就经 `@mantine/hooks` 的 `useLocalStorage` 写进 localStorage，违反持久化铁律。DataGrid 自己实现了列拖拽（`columnReordering`）、列宽拖拽、列菜单钉住 / 隐藏、列管理面板，列定义里的 `resizable` / `pinnable` / `toggleable` / `hidden` 由 DataGrid 解释、**不转交** mantine-datatable；用户改动只存在组件内存。需要跨会话记住 → 用 `onColumnOrderChange` / `onColumnWidthChange` / `onColumnVisibilityChange` / `onPinnedColumnsChange` 回调存到 `PreferencesService`，下次通过列定义 `width` / `hidden` 与 `pinnedColumns` 作为初始值还原（见 §2「记住列配置」）。
- **行拖拽**：mantine-datatable 官方方案依赖 `@hello-pangea/dnd`（**未安装**），项目 DataGrid 用 HTML5 DnD 自实现，直接用 `rowReordering`。
- **导出**：一律走 `ExportService`（`@/services/export`）：`NativeDialogs.saveFile` 弹原生「另存为」→ 补齐扩展名 → Go 后端 `internal/services/exportsvc` 用 `filex.WriteAtomic` 落盘。CSV 由前端拼文本、后端写 UTF-8 BOM；XLSX 由后端 `github.com/xuri/excelize/v2` 生成真正的 .xlsx（数字 / 布尔保持类型、表头加粗 + 冻结首行、按内容估列宽）。**不要**用浏览器 Blob / `<a download>` / 前端 `xlsx` 包。后端 service 需在 `internal/app/app.go` 注册 `application.NewService(exportsvc.New())` 并 `wails3 generate bindings`。
- 表格必须有确定高度：父容器给高度（或 `height` prop），DataTable 内部滚动；在 flex 布局中记得 `min-height: 0`。

---

## 1. mantine-datatable `DataTable`

```tsx
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';

const [sortStatus, setSortStatus] = useState<DataTableSortStatus<User>>({ columnAccessor: 'name', direction: 'asc' });
const [page, setPage] = useState(1);
const [selected, setSelected] = useState<User[]>([]);

<DataTable<User>
  height="100%"
  records={pageRecords}
  idAccessor="id"                                   // 默认 'id'；可传函数
  columns={[
    { accessor: 'name', title: t('users.col.name'), sortable: true, width: 160 },
    { accessor: 'department.name', title: t('users.col.dept') },      // 点号取嵌套
    { accessor: 'salary', title: t('users.col.salary'), textAlign: 'right', render: (u) => fmt(u.salary) },
    { accessor: 'actions', title: '', width: 48, render: (u) => (
        <ActionIcon aria-label={t('actions.delete')} onClick={() => vm.remove(u.id)}><IconTrash size={16} stroke={1.75} /></ActionIcon>) },
  ]}
  sortStatus={sortStatus} onSortStatusChange={setSortStatus}       // 只给状态，排序要自己做
  page={page} onPageChange={setPage} totalRecords={total} recordsPerPage={25}
  paginationText={({ from, to, totalRecords }) => t('users.pagination', { from, to, total: totalRecords })}
  selectedRecords={selected} onSelectedRecordsChange={setSelected}
  rowExpansion={{ content: ({ record }) => <UserDetail user={record} /> }}
  fetching={vm.loading} loaderColor="foundation"
  noRecordsText={t('users.empty')} loadingText={t('common.loading')}
  highlightOnHover striped verticalAlign="center"
  c={FOUNDATION_CSS_VARS.text.primary}
  backgroundColor={FOUNDATION_CSS_VARS.bg.surface}
  borderColor={FOUNDATION_CSS_VARS.divider}
  rowBorderColor={FOUNDATION_CSS_VARS.divider}
  stripedColor={FOUNDATION_CSS_VARS.bg.elevated}
  highlightOnHoverColor={FOUNDATION_CSS_VARS.bg.hover}
  onRowClick={({ record, index }) => vm.open(record.id)}
/>
```

要点（类型见 `references/mantine-datatable.d.ts`）：

- **列** `DataTableColumn<T>`：`accessor`、`title`（缺省 humanize accessor，项目必须给 `t()`）、`render(record, index)`、`textAlign`、`width`、`sortable` / `sortKey`、`pinned: 'left' | 'right'`（sticky 列，阴影 / 偏移自动测量）、`hidden`、`visibleMediaQuery`、`ellipsis` 或 `noWrap`（二选一）、`filter`（表头弹出筛选内容，过滤逻辑自己写）+ `filtering`、`cellsClassName` / `cellsStyle` / `customCellAttributes`、`titleClassName`、`footer`（任一列有 footer 即渲染 footer 行）、`draggable` / `toggleable` / `resizable` / `pinnable`（用户可改的列状态，官方方案配合 `storeColumnsKey` 持久化到 localStorage——**项目不用这条路**）。
- 列分组表头：`groups={[{ id, title, columns: [...] }]}` 代替 `columns`。
- **排序**：受控 `sortStatus` + `onSortStatusChange`，`sortIcons` 自定义图标（Tabler）。数据排序在 ViewModel 里做。
- **分页**：`page` / `onPageChange` / `totalRecords` / `recordsPerPage` 必须一起给；`recordsPerPageOptions` + `onRecordsPerPageChange` + `recordsPerPageLabel`；`renderPagination` 完全自定义。
- **勾选**：`selectedRecords` / `onSelectedRecordsChange`、`isRecordSelectable`、`selectionTrigger: 'checkbox' | 'cell'`；Shift 连选内置。
- **行展开**：`rowExpansion={{ content, trigger: 'click' | 'always' | 'never', allowMultiple, expandable, expanded: { recordIds, onRecordIdsChange } }}`。
- **事件**：`onRowClick` / `onRowDoubleClick` / `onRowContextMenu` / `onCellClick`…（参数是对象 `{ record, index, event }`）；滚动 `onScrollToBottom`（无限滚动）、`scrollViewportRef`。
- **样式**：`classNames={{ root, table, header, footer, pagination }}`、`rowClassName(record, index)`、`rowStyle`、`customRowAttributes`、`withTableBorder` + `borderRadius`、`withColumnBorders`、`noHeader`、`emptyState` / `noRecordsIcon`、`minHeight` / `maxHeight`。

---

## 2. x-pro `DataGridPro` / `DataGridPremium`

```
data-grid/
├── DataGridPro.tsx / DataGridPremium.tsx   # 入口（Premium = Pro + 工具栏）
├── useDataGridPro.ts                        # ViewModel：数据 / 列管线，Pro 与 Premium 共用
├── DataGridSurface.tsx                      # View：翻译成 mantine-datatable 的 columns/props
├── DataGridCells.tsx                        # 表头标题（含筛选框 / 列菜单 / 列宽手柄）/ 拖拽手柄 / 展开按钮 / 树形单元格 / 聚合值
├── DataGridColumnMenu.tsx                   # 表头列菜单（排序 / 钉住 / 隐藏 / 管理列）+ 列管理面板（Modal）
├── DataGrid.module.css                      # 全部样式（--fd-*，覆盖 mantine-datatable 灰阶）
├── features/use*.ts                         # 每个能力一个 hook
├── types.ts / premium-types.ts / utils.ts / lang/
```

导出链路：`features/useExcelExport.ts` → `frontend/src/services/export/ExportService.ts`（`saveCSV` / `saveXLSX`）→ `@bindings/foundation/internal/services/exportsvc`（`WriteCSV(path, content)` / `WriteXLSX(path, table)`）。

**数据管线（顺序有意义）**：`rows → 剔除钉住行 → 行拖拽顺序 → 表头筛选 → 排序 → 树形 / 行分组 → 分页 → + 钉住行`；列管线：`columns → 列拖拽顺序 → 列钉住（left / center / right）→ 列显隐（剔除隐藏列）`，列宽 = 用户拖拽宽度 ?? 列定义 `width`。全部**客户端**处理。

### 列定义 `DataGridColumn<T>`

`DataTableColumn<T>`（去掉 `render` / `footer`）+：

| 字段 | 说明 |
|---|---|
| `accessor` | 字段名（等价 MUI `field`，支持点号路径） |
| `headerName` | 纯文本表头；无 `title` 时作标题，导出 / aria / 复制也用它 → 传 `t()` |
| `type` | `'string' \| 'number'`；number 默认右对齐、筛选 / 排序按数值 |
| `sortable` | **默认 true**，显式 `false` 关闭 |
| `filterable` | 是否出现在表头筛选行，默认 true |
| `valueGetter(row)` | 自定义取值，排序 / 筛选 / 聚合 / 导出 / 复制都走它 |
| `valueFormatter(value, row)` | 显示格式化（不影响排序 / 导出） |
| `render(row, index)` | 自定义渲染，拿到的是**原始行 T**（分组 / 树形包装对你透明） |
| `width` | 初始列宽；用户拖拽后以内存中的宽度为准，双击列宽手柄恢复为 `width` |
| `minWidth` | 拖拽调整列宽的最小宽度（px），默认 60 |
| `resizable` | `false` → 该列无列宽拖拽手柄 |
| `pinnable` | `false` → 列菜单不出现钉住项 |
| `toggleable` | `false` → 不能在列菜单 / 列管理面板里隐藏 |
| `hidden` | `true` → 初始隐藏（之后由列菜单 / 列管理在内存中切换；始终至少保留一列可见） |

`resizable` / `pinnable` / `toggleable` / `hidden`（以及 `draggable` / `defaultToggle`）由 DataGrid 自己解释或丢弃，不会转交 mantine-datatable。

行类型 `T extends DataGridRow = Record<string, unknown>`；行 id 默认取 `row.id`，否则传 `getRowId`。

### DataGridPro props

```tsx
import { DataGridPro, type DataGridColumn } from '@/components/x-pro/data-grid';

const columns: DataGridColumn<DemoRow>[] = [
  { accessor: 'name', headerName: t('xpro.col.name'), width: 140 },
  { accessor: 'department', headerName: t('xpro.col.department'), width: 140 },
  { accessor: 'salary', headerName: t('xpro.col.salary'), type: 'number', width: 120 },
];

<div className={classes.gridContainer}>          {/* 给定高度 */}
  <DataGridPro<DemoRow> rows={rows} columns={columns} pinnedColumns={{ left: ['name'] }} rowReordering />
</div>
```

| prop | 类型 | 行为 |
|---|---|---|
| `rows` / `columns` / `getRowId?` | | |
| `pinnedColumns` | `{ left?: string[]; right?: string[] }` | **初始**钉住模型（列定义里的 `pinned` 也合并进来，配置优先），映射到 mantine-datatable `column.pinned`；用户经列菜单钉住 / 取消后改用内存模型（之后 prop 变化不再生效）；左侧有钉住列时，工具列（拖拽 / 展开 / 树 / 分组）也一起钉左 |
| `pinnedRows` | `{ top?: T[]; bottom?: T[] }` | 按 id 从主数据剔除，以 sticky 行显示在表头下 / 表尾（聚合 footer）上；sticky 偏移由 `usePinnedRowOffsets` 实测每行 `<tr>` 高度累加（ResizeObserver 跟踪，内容换行变高不会重叠），行高不固定 |
| `treeData` | `{ getTreeDataPath: (row) => string[]; defaultGroupingExpansionDepth?: number; groupColDef?: { headerName?; width? } }` | 层级列（默认 200px），父节点被筛掉时子节点作为根显示；**启用时忽略 Premium 的 rowGroupingModel** |
| `masterDetail` | `{ getDetailPanelContent: (row) => ReactNode; getDetailPanelHeight?: (row) => number \| 'auto' }` | 加展开按钮列，可多行同时展开（底层 `rowExpansion`） |
| `lazyLoading` | `{ onFetchRows({ startIndex, endIndex }); rowCount; loading?; hasMore?(默认 true); pageSize?(50) }` | 滚到底 / 首屏不满一屏时触发，200ms 节流；**启用时分页失效** |
| `headerFilters` | `{ enabled; filterModel?; onFilterModelChange? }` | 每列表头下一个输入框；UI 输入产生 `contains` 条件；受控 `filterModel.items[]` 可用 `contains \| equals \| startsWith \| endsWith \| gt \| gte \| lt \| lte` |
| `clipboardPaste` | `{ enabled; onPaste?(data: string[][], startRow, startCol, { rowIds, fields }) }` | 解析 TSV / CSV；起点 = 聚焦单元格 → 单元格选区左上角 → (0,0)。**表格不改数据**，在 onPaste 里用 `rowIds` / `fields` 回写数据源 |
| `columnReordering` + `onColumnOrderChange?(fields)` | | 表头拖拽（HTML5 DnD），顺序存组件内部 |
| `rowReordering` + `onRowOrderChange?({ oldIndex, newIndex })` | | 拖拽手柄列；顺序作用于**原始行**（筛选 / 排序之前），组件内部维护 |
| `sortModel` / `onSortModelChange` | `{ field; direction: 'asc' \| 'desc' } \| null` | 单列排序（点击表头或列菜单「升序 / 降序 / 取消排序」）；不传则内部维护 |
| `disableColumnMenu` | `boolean` | 关闭表头列菜单（排序 / 钉住 / 隐藏 / 管理列）及列管理面板，默认开启 |
| `disableColumnPinning` | `boolean` | 只去掉列菜单里的钉住项（`pinnedColumns` 仍生效） |
| `disableColumnResize` | `boolean` | 关闭表头右边缘拖拽调整列宽，默认开启 |
| `onColumnWidthChange?(field, width)` / `onColumnVisibilityChange?(hiddenFields)` / `onPinnedColumnsChange?(model)` | | 用户改列宽（松手时）/ 显隐 / 钉住后回调；状态只在内存，持久化由调用方存 `PreferencesService` |
| `checkboxSelection` / `rowSelectionModel` / `onRowSelectionModelChange` | `DataGridRowId[]` | 分组行 / 钉住行不可勾选 |
| `pagination` | `true`（pageSize 25）或 `{ pageSize?; pageSizeOptions? }` | 客户端分页，分页文案走 `dataGrid.paginationText` |
| `loading` / `onRowClick(row, index)` / `striped` / `height`（默认 100%）/ `className` | | |

**列菜单 / 列宽**：每个数据列表头右侧有菜单按钮（`IconDotsVertical`）（升序 / 降序 / 取消排序 → 固定到左 / 右 / 取消固定 → 隐藏此列 → 管理列）；`sortable: false` 无排序项、`pinnable: false` 无钉住项、`toggleable: false` 或仅剩一列可见时「隐藏」禁用。「管理列」打开 Modal，逐列勾选显隐 + 全部显示 / 全部隐藏。表头右边缘手柄拖拽改列宽（Pointer 事件 + rAF，松手后吞掉误触的排序 click），双击恢复默认宽度。

**记住列配置**（示意；读写都在 ViewModel 里经 `PreferencesService`）：

```tsx
const [widths, setWidths] = useState<Record<string, number>>({});   // 启动时 PreferencesService.get 回填
const columns = useMemo(() => baseColumns.map((c) => ({ ...c, width: widths[String(c.accessor)] ?? c.width })), [widths]);

<DataGridPro
  rows={rows}
  columns={columns}
  onColumnWidthChange={(field, width) => {
    const next = { ...widths, [field]: width };
    setWidths(next);
    void PreferencesService.set('users.grid.widths', next);
  }}
  onColumnVisibilityChange={(hidden) => void PreferencesService.set('users.grid.hidden', hidden)}   // 还原：列定义 hidden
  onPinnedColumnsChange={(m) => void PreferencesService.set('users.grid.pinned', m)}               // 还原：pinnedColumns
/>
```

显隐（列定义 `hidden`）/ 钉住（`pinnedColumns`）在用户**首次**经列菜单 / 列管理改动之前跟随 props；一旦改动，组件改用内存模型，之后 prop 变化不再生效——所以异步读到的偏好要在用户操作前回填，需要强制按 props 重置时用 `key` 重挂表格。

### DataGridPremium 额外 props

```tsx
import { DataGridPremium } from '@/components/x-pro/data-grid';

<DataGridPremium<Employee>
  rows={rows}
  columns={columns}
  rowGroupingModel={{ fields: ['department', 'level'], defaultExpansionDepth: 1 }}
  aggregationModel={{ salary: 'sum', age: 'avg', bonus: (values) => Math.max(...values.map(Number)) }}
  cellSelection
  onCellSelectionChange={(m) => vm.setSelection(m)}
  showToolbar
  excelExportOptions={{ filename: 'employees', sheetName: 'Employees', includeHeaders: true }}
/>
```

| prop | 类型 | 行为 |
|---|---|---|
| `rowGroupingModel` | `{ fields: string[]; defaultExpansionDepth?: number }` | 多级分组（0 全折叠，`Infinity` 全展开），分组列 220px，显示组值 + 计数 |
| `aggregationModel` | `Record<field, 'sum' \| 'avg' \| 'min' \| 'max' \| 'count' \| (values: unknown[]) => unknown>` | 对筛选后全部数据算聚合 → footer 行（sticky）；分组行内显示组内聚合 |
| `cellSelection` / `onCellSelectionChange` | `CellSelectionModel = { ranges: CellRange[] }` | 按下拖动框选、Shift+点击扩展；容器内 **Ctrl/Cmd+C 复制为 TSV**（焦点在输入框时不拦截）；工具栏显示已选数量 |
| `showToolbar` | `boolean` | 顶部工具栏：导出 CSV / 导出 Excel /（列菜单开启时）管理列 / 已选单元格数。导出时按钮 loading、另一按钮禁用；对话框标题用 `dataGrid.export.csvDialogTitle` / `excelDialogTitle`；失败弹 `NativeDialogs.error(t('dataGrid.export.errorTitle'), message)`；用户取消无提示 |
| `excelExportOptions` | `{ filename?; sheetName?; includeHeaders?; dialogTitle? }` | `filename` 为默认文件名，扩展名按格式自动替换（`employees.xlsx` 导出 CSV → `employees.csv`，缺省 `export`）；`sheetName` 缺省 `Sheet1`（后端再按 Excel 规则清洗、截断 31 字符）；`includeHeaders` 默认 true；`dialogTitle` 工具栏会用 `t()` 覆盖 |

导出内容 = 当前筛选 + 排序后的全部数据行（不受分页影响，不含分组行 / 钉住行 / 工具列 / 隐藏列），列顺序同显示。CSV 单元格用**显示值**（`valueFormatter` 返回字符串 / 数字时用它，否则默认格式化），`\r\n` 分行，BOM 由后端加；XLSX 单元格用**原始值**（`valueGetter` / accessor），数字 / 布尔保持类型，`Date` → ISO 字符串，对象 → JSON，NaN / Infinity → 空。

单独复用的 hook（从 `@/components/x-pro/data-grid` 导出）：`useRowGrouping`、`useAggregation`、`useExcelExport`、`useCellSelection`——给自定义表格 / 非表格场景（如导出按钮放在页面工具栏）使用。

```ts
const { exportDataAsCsv, exportDataAsExcel } = useExcelExport({ rows, columns });
// (options?: ExcelExportOptions) => Promise<string | null>：返回保存路径；用户取消 → null；写入失败 → reject
const path = await exportDataAsExcel({ filename: 'report', dialogTitle: t('report.exportTitle') });
```

调用方自己负责 `try/catch` + `NativeDialogs.error` 提示，且 `dialogTitle` 要传 `t()` 结果（hook 不含文案）。非表格数据也可直接调 `ExportService.saveCSV({ defaultFilename, content, title })` / `ExportService.saveXLSX({ defaultFilename, table: { sheetName, headers, rows }, title })`。

### 扩展 DataGrid 的约定

- 新能力写成 `features/use<Feature>.ts`（只产出数据 / 回调），在 `useDataGridPro.ts` 的管线里按顺序接入，在 `DataGridSurface.tsx` 翻译成 mantine-datatable 属性；DataTableColumn 上 mantine-datatable 会走 localStorage 的字段（`resizable` / `toggleable` / `draggable` / `pinnable` 等）必须在 Surface 里剥掉自行实现；工具列 accessor 用 `utils.ts` 的 `__dg_` 前缀（自动排除在筛选 / 排序 / 导出 / 单元格选择之外）。
- 新文案加到 `lang/zh-CN.ts` + `lang/en-US.ts` 的 `dataGrid.*`（列菜单 `dataGrid.columnMenu.*`、导出 `dataGrid.export.*`、工具栏 `dataGrid.toolbar.*`）。
- 样式只改 `DataGrid.module.css`；z-index 阶梯：钉住列单元格 1 < 钉住行 2 < 交叉格 3 < 表头 4。

## references

- `references/mantine-datatable.d.ts`：mantine-datatable 9.4.0 完整类型声明（权威 API，含全部 JSDoc）。
- `references/mantine-datatable-README.md`：官方 README（完整示例站点 https://icflorescu.github.io/mantine-datatable/ ，需联网）。README 中 `@layer` 引入方式不适用：本项目引入的是非 layer 版 `styles.css`（见 `frontend/src/styles/index.ts`）。
- 项目源码：`frontend/src/components/x-pro/data-grid/`（`types.ts` / `premium-types.ts` 为 props 权威）、`frontend/src/services/export/ExportService.ts`、`internal/services/exportsvc/exportsvc.go`、演示 `frontend/src/pages/XProDemoPage/XProDemoPage.tsx`。
