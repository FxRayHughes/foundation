# DataGrid Pro 功能参考

> **Foundation 自实现**：这些功能由项目自行实现，位于 `src/components/x-pro/data-grid/`。
> **禁止使用** `@mui/x-data-grid-pro` 官方付费包。
> Import 路径：`import { DataGridPro } from '@/components/x-pro'`

---

## 列钉住 (Column Pinning)

将列固定在表格左侧或右侧，水平滚动时始终可见。

### Import

```tsx
import { DataGridPro } from '@/components/x-pro';
import type { GridColDef } from '@mui/x-data-grid';
```

### 基础用法

```tsx
import { DataGridPro } from '@/components/x-pro';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { myStyles } from './MyPage.styles';

export function PinnedColumnsDemo() {
  const theme = useTheme();
  const styles = myStyles(theme);
  const t = useT();

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('col.name'), width: 160 },
    { field: 'email', headerName: t('col.email'), width: 200 },
    { field: 'age', headerName: t('col.age'), type: 'number' },
    { field: 'actions', type: 'actions', width: 100 },
  ];

  return (
    <Box sx={styles.root}>
      <DataGridPro
        rows={rows}
        columns={columns}
        pinnedColumns={{ left: ['name'], right: ['actions'] }}
      />
    </Box>
  );
}
```

### Props 参考表

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pinnedColumns` | `{ left?: string[]; right?: string[] }` | — | 钉住列配置 |
| `onPinnedColumnsChange` | `(model) => void` | — | 变更回调 |
| `disableColumnPinning` | `boolean` | `false` | 全局禁用 |

## 列排序拖拽 (Column Reordering)

用户可拖拽列头改变列的显示顺序。DataGridPro 默认启用。

```tsx
<DataGridPro rows={rows} columns={columns} />
// 默认已启用，禁用特定列：colDef.disableReorder = true
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disableColumnReorder` | `boolean` | `false` | 全局禁用 |
| `onColumnOrderChange` | `(params) => void` | — | 顺序变更回调 |

## 行排序拖拽 (Row Reordering)

```tsx
<DataGridPro rows={rows} columns={columns} rowReordering onRowOrderChange={handleChange} />
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rowReordering` | `boolean` | `false` | 启用行拖拽 |
| `onRowOrderChange` | `(params) => void` | — | 行顺序变更回调 |

## 树形数据 (Tree Data)

```tsx
<DataGridPro
  rows={rows}
  columns={columns}
  treeData
  getTreeDataPath={(row) => row.path}
  defaultGroupingExpansionDepth={-1}
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `treeData` | `boolean` | `false` | 启用树形 |
| `getTreeDataPath` | `(row) => string[]` | — | 层级路径 |
| `defaultGroupingExpansionDepth` | `number` | `0` | 默认展开层级（-1=全部） |

## 主从表 (Master-Detail)

```tsx
<DataGridPro
  rows={rows}
  columns={columns}
  getDetailPanelContent={({ row }) => <DetailPanel row={row} />}
  getDetailPanelHeight={() => 300}
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `getDetailPanelContent` | `(params) => ReactNode` | — | 详情面板 |
| `getDetailPanelHeight` | `(params) => number \| 'auto'` | — | 面板高度 |

## 行钉住 (Row Pinning)

```tsx
<DataGridPro rows={rows} columns={columns} pinnedRows={{ top: [summaryRow], bottom: [avgRow] }} />
```

## 懒加载 (Lazy Loading)

```tsx
<DataGridPro rows={rows} columns={columns} rowCount={10000} onFetchRows={handleFetch} lazyLoading />
```

## 列头筛选器行 (Header Filters)

```tsx
<DataGridPro rows={rows} columns={columns} headerFilters />
```

## 剪贴板粘贴 (Clipboard Paste)

```tsx
<DataGridPro rows={rows} columns={columns} clipboardPaste processRowUpdate={handleUpdate} />
```

---

## Foundation 约束（全局）

- 所有 import 从 `@/components/x-pro`，**禁止** `@mui/x-data-grid-pro`
- 配色从 `theme.palette.foundation.*` 取
- 图标用 `*Rounded` 系列
- 列头文案走 `t('key')`
- 数据操作通过 ViewModel → services 层
