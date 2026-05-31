# 分页与行选择（Pagination & Selection）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridPaginationModel,
  GridRowSelectionModel,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useT } from '@/i18n';

function PaginatedTable() {
  const t = useT();
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 25,
  });
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={setSelectionModel}
      checkboxSelection
      disableRowSelectionOnClick
      localeText={{
        MuiTablePagination: {
          labelRowsPerPage: t('dataGrid.pagination.rowsPerPage'),
          labelDisplayedRows: ({ from, to, count }) =>
            t('dataGrid.pagination.displayed', { from, to, count }),
        },
        footerRowSelected: (count) =>
          t('dataGrid.footer.selected', { count }),
      }}
    />
  );
}
```

---

## 分页（Pagination）

### 社区版特性

- 分页默认开启且**不可关闭**
- 页大小上限 **100 行**（超过需 Pro）
- 默认 `{ page: 0, pageSize: 100 }`

### pageSizeOptions

```tsx
// 数字数组
<DataGrid pageSizeOptions={[5, 10, 25, 50]} />

// 对象形式（自定义 label）
<DataGrid pageSizeOptions={[
  10,
  25,
  { value: 50, label: '50' },
  { value: 100, label: t('pagination.all') },
]} />
```

### 初始化分页

```tsx
<DataGrid
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 25 },
    },
  }}
  pageSizeOptions={[10, 25, 50]}
/>
```

### 受控分页

```tsx
const [paginationModel, setPaginationModel] = React.useState({
  page: 0,
  pageSize: 25,
});

<DataGrid
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  pageSizeOptions={[10, 25, 50]}
/>
```

### 自动页大小

根据容器高度自动计算每页行数：

```tsx
<DataGrid autoPageSize />
```

**注意**：不能与 `autoHeight` 同时使用。

### 服务端分页

```tsx
<DataGrid
  paginationMode="server"
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  rowCount={totalRows}  // 必须提供总行数
  rows={currentPageRows}
  loading={isLoading}
/>
```

---

## 行选择（Row Selection）

### 社区版特性

- 默认启用**单行选择**
- 点击行即选中，再次点击取消
- 多行选择需要 Pro 版

### 禁用选择

```tsx
// 完全禁用
<DataGrid disableRowSelectionOnClick />

// 条件禁用
<DataGrid
  isRowSelectable={(params: GridRowParams) => params.row.status !== 'locked'}
/>
```

### Checkbox 选择

```tsx
<DataGrid
  checkboxSelection
  disableRowSelectionOnClick  // 推荐配合使用，避免点击行也触发选择
/>
```

### 受控选择

v9 的选择模型结构：

```tsx
const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
  type: 'include',  // 'include' | 'exclude'
  ids: new Set<GridRowId>(),
});

<DataGrid
  rowSelectionModel={selectionModel}
  onRowSelectionModelChange={(newModel) => setSelectionModel(newModel)}
/>
```

- `type: 'include'` —— 只有 `ids` 中的行被选中
- `type: 'exclude'` —— 除了 `ids` 中的行，其余全选

### 初始化选择

```tsx
<DataGrid
  initialState={{
    rowSelection: {
      type: 'include',
      ids: new Set([1, 3, 5]),
    },
  }}
/>
```

### 筛选后保留选择

默认筛选后会清除不可见行的选择。保留它们：

```tsx
<DataGrid keepNonExistentRowsSelected />
```

---

## Props/Options 参考表

### 分页

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `paginationModel` | `{ page: number; pageSize: number }` | `{ page: 0, pageSize: 100 }` | 受控分页 |
| `onPaginationModelChange` | `(model) => void` | — | 分页变更回调 |
| `pageSizeOptions` | `(number \| { value; label })[]` | `[25, 50, 100]` | 页大小选项 |
| `paginationMode` | `'client' \| 'server'` | `'client'` | 分页模式 |
| `rowCount` | `number` | — | 服务端分页总行数 |
| `autoPageSize` | `boolean` | `false` | 自动计算页大小 |

### 行选择

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checkboxSelection` | `boolean` | `false` | 显示 checkbox 列 |
| `rowSelectionModel` | `GridRowSelectionModel` | — | 受控选择 |
| `onRowSelectionModelChange` | `(model) => void` | — | 选择变更回调 |
| `disableRowSelectionOnClick` | `boolean` | `false` | 禁用点击选择 |
| `isRowSelectable` | `(params: GridRowParams) => boolean` | — | 条件可选 |
| `keepNonExistentRowsSelected` | `boolean` | `false` | 筛选后保留选择 |

---

## TypeScript 类型

```tsx
// 分页模型
interface GridPaginationModel {
  page: number;
  pageSize: number;
}

// 行选择模型（v9 新结构）
interface GridRowSelectionModel {
  type: 'include' | 'exclude';
  ids: Set<GridRowId>;
}

type GridRowId = string | number;
```

---

## Foundation 约束

1. **分页文案走 `localeText.MuiTablePagination`** —— `labelRowsPerPage` / `labelDisplayedRows` 必须 `t()`
2. **页大小上限 100** —— 社区版硬限制，不要设置超过 100 的选项
3. **`pageSizeOptions` 的 label 走 `t()`** —— 如果用对象形式
4. **选择后的操作按钮文案走 `t()`** —— 如批量删除/导出按钮
5. **`disableRowSelectionOnClick` 推荐开启** —— 避免用户误触选择
