# DataGrid Premium 功能参考

> **Foundation 自实现**：这些功能由项目自行实现，位于 `src/components/x-pro/data-grid/`。
> **禁止使用** `@mui/x-data-grid-premium` 官方付费包。
> Import 路径：`import { DataGridPremium } from '@/components/x-pro'`

---

## 行分组 (Row Grouping)

基于列值将行自动分组，形成可展开/折叠的层级结构。

### Import

```tsx
import { DataGridPremium } from '@/components/x-pro';
import type { GridColDef } from '@mui/x-data-grid';
```

### 基础用法

```tsx
<DataGridPremium
  rows={rows}
  columns={columns}
  rowGroupingModel={['company', 'director']}
  defaultGroupingExpansionDepth={1}
/>
```

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `rowGroupingModel` | `string[]` | 分组列字段列表 |
| `onRowGroupingModelChange` | `(model) => void` | 变更回调 |
| `defaultGroupingExpansionDepth` | `number` | 默认展开层级（-1=全部） |
| `disableRowGrouping` | `boolean` | 禁用分组 |

---

## 聚合 (Aggregation)

底部 footer 行显示聚合值（sum/avg/min/max/count）。

```tsx
<DataGridPremium
  rows={rows}
  columns={columns}
  aggregationModel={{ quantity: 'sum', price: 'avg', total: 'sum' }}
/>
```

### 内置聚合函数

| 函数 | 说明 |
|------|------|
| `sum` | 求和 |
| `avg` | 平均值 |
| `min` | 最小值 |
| `max` | 最大值 |
| `count` | 计数 |

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `aggregationModel` | `Record<string, string>` | 字段→聚合函数映射 |
| `onAggregationModelChange` | `(model) => void` | 变更回调 |
| `aggregationFunctions` | `Record<string, AggFn>` | 自定义聚合函数 |

---

## Excel 导出

将表格数据导出为 `.xlsx` 格式（使用 SheetJS）。

```tsx
import { DataGridPremium, useGridApiRef } from '@/components/x-pro';

const apiRef = useGridApiRef();
// 触发导出
apiRef.current.exportDataAsExcel({ fileName: t('export.fileName') });
```

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `excelExportOptions.fileName` | `string` | 文件名 |
| `excelExportOptions.allColumns` | `boolean` | 含隐藏列 |
| `excelExportOptions.includeHeaders` | `boolean` | 含列头 |

---

## 单元格选择 (Cell Selection)

类似 Excel 的范围选择。

```tsx
<DataGridPremium rows={rows} columns={columns} cellSelection />
```

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `cellSelection` | `boolean` | 启用 |
| `cellSelectionModel` | `GridCellSelectionModel` | 受控模型 |
| `onCellSelectionModelChange` | `(model) => void` | 变更回调 |

---

## Foundation 约束（全局）

- 所有 import 从 `@/components/x-pro`，**禁止** `@mui/x-data-grid-premium`
- 配色从 `theme.palette.foundation.*` 取
- 图标用 `*Rounded` 系列
- 文案走 `t('key')`
- 数据操作通过 ViewModel → services 层
