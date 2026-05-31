# API 与事件（useGridApiRef & Events）

## Import

```tsx
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type {
  GridApi,
  GridEventListener,
  GridRowId,
  GridCellParams,
  GridRowParams,
} from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type { GridApi } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';

function ApiTable() {
  const theme = useTheme();
  const t = useT();
  const apiRef = useGridApiRef();

  const handleScrollToRow = (id: number) => {
    apiRef.current.scrollToIndexes({ rowIndex: id });
  };

  const handleGetSelectedRows = () => {
    const selected = apiRef.current.getSelectedRows();
    console.log('Selected:', [...selected.values()]);
  };

  return (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
    />
  );
}
```

---

## useGridApiRef

获取 DataGrid 的命令式 API 引用：

```tsx
const apiRef = useGridApiRef();

// 传给 DataGrid
<DataGrid apiRef={apiRef} ... />

// 之后通过 apiRef.current 调用方法
apiRef.current.setPage(2);
```

### useGridApiContext（在 slot 组件内部使用）

```tsx
import { useGridApiContext } from '@mui/x-data-grid';

function CustomFooter() {
  const apiRef = useGridApiContext();
  const rowCount = apiRef.current.getRowsCount();
  return <span>{rowCount} rows</span>;
}
```

---

## 常用 API 方法

### 行操作

| 方法 | 签名 | 说明 |
|------|------|------|
| `getRow` | `(id: GridRowId) => GridRowModel \| null` | 获取行数据 |
| `getRowsCount` | `() => number` | 获取总行数 |
| `getAllRowIds` | `() => GridRowId[]` | 获取所有行 ID |
| `getSelectedRows` | `() => Map<GridRowId, GridRowModel>` | 获取选中行 |
| `setRows` | `(rows: GridRowModel[]) => void` | 替换所有行 |
| `updateRows` | `(updates: GridRowModelUpdate[]) => void` | 增量更新行 |

### 分页

| 方法 | 签名 | 说明 |
|------|------|------|
| `setPage` | `(page: number) => void` | 跳转到指定页 |
| `setPageSize` | `(pageSize: number) => void` | 设置页大小 |

### 排序 & 筛选

| 方法 | 签名 | 说明 |
|------|------|------|
| `setSortModel` | `(model: GridSortModel) => void` | 设置排序 |
| `setFilterModel` | `(model: GridFilterModel) => void` | 设置筛选 |
| `getFilteredRows` | `() => Map<GridRowId, GridRowModel>` | 获取筛选后的行 |
| `getSortedRows` | `() => Map<GridRowId, GridRowModel>` | 获取排序后的行 |

### 编辑

| 方法 | 签名 | 说明 |
|------|------|------|
| `startCellEditMode` | `(params: { id, field }) => void` | 开始编辑单元格 |
| `stopCellEditMode` | `(params: { id, field, ignoreModifications? }) => void` | 停止编辑 |
| `startRowEditMode` | `(params: { id }) => void` | 开始编辑行 |
| `stopRowEditMode` | `(params: { id, ignoreModifications? }) => void` | 停止行编辑 |
| `setEditCellValue` | `(params: { id, field, value }) => void` | 设置编辑值 |

### 导出

| 方法 | 签名 | 说明 |
|------|------|------|
| `exportDataAsCsv` | `(options?: GridCsvExportOptions) => void` | CSV 导出 |
| `exportDataAsPrint` | `(options?: GridPrintExportOptions) => void` | 打印导出 |

### 滚动 & 焦点

| 方法 | 签名 | 说明 |
|------|------|------|
| `scrollToIndexes` | `(params: { rowIndex?, colIndex? }) => void` | 滚动到指定位置 |
| `setCellFocus` | `(id: GridRowId, field: string) => void` | 设置单元格焦点 |

### 列

| 方法 | 签名 | 说明 |
|------|------|------|
| `setColumnVisibilityModel` | `(model) => void` | 设置列可见性 |
| `getColumn` | `(field: string) => GridColDef` | 获取列定义 |
| `getAllColumns` | `() => GridColDef[]` | 获取所有列 |
| `setColumnWidth` | `(field, width) => void` | 设置列宽 |

---

## 增量更新行（updateRows）

高效更新部分行数据，无需替换整个 rows 数组：

```tsx
// 更新已有行
apiRef.current.updateRows([
  { id: 1, name: 'Alice Updated' },
  { id: 2, email: 'new@email.com' },
]);

// 添加新行
apiRef.current.updateRows([
  { id: 99, name: 'New User', email: 'new@test.com', isNew: true },
]);

// 删除行（设置 _action: 'delete'）
apiRef.current.updateRows([
  { id: 1, _action: 'delete' },
]);
```

---

## 事件系统

### 通过 props 监听事件

```tsx
<DataGrid
  onCellClick={(params, event) => {
    console.log('Cell clicked:', params.field, params.row);
  }}
  onRowClick={(params) => {
    console.log('Row clicked:', params.id);
  }}
  onCellDoubleClick={(params) => {
    console.log('Double click:', params.field);
  }}
  onColumnHeaderClick={(params) => {
    console.log('Header clicked:', params.field);
  }}
/>
```

### 通过 apiRef 订阅事件

```tsx
import { useEffect } from 'react';

function MyTable() {
  const apiRef = useGridApiRef();

  useEffect(() => {
    const unsubscribe = apiRef.current.subscribeEvent(
      'cellClick',
      (params, event, details) => {
        console.log('Cell:', params.field, params.value);
      }
    );
    return unsubscribe;
  }, [apiRef]);

  return <DataGrid apiRef={apiRef} rows={rows} columns={columns} />;
}
```

### 常用事件列表

| 事件名 | 触发时机 | params 类型 |
|--------|----------|-------------|
| `cellClick` | 单元格点击 | `GridCellParams` |
| `cellDoubleClick` | 单元格双击 | `GridCellParams` |
| `cellKeyDown` | 单元格键盘事件 | `GridCellParams` |
| `rowClick` | 行点击 | `GridRowParams` |
| `rowDoubleClick` | 行双击 | `GridRowParams` |
| `columnHeaderClick` | 列头点击 | `GridColumnHeaderParams` |
| `rowSelectionChange` | 选择变更 | `GridRowSelectionModel` |
| `sortModelChange` | 排序变更 | `GridSortModel` |
| `filterModelChange` | 筛选变更 | `GridFilterModel` |
| `paginationModelChange` | 分页变更 | `GridPaginationModel` |
| `cellEditStart` | 开始编辑 | `GridCellEditStartParams` |
| `cellEditStop` | 停止编辑 | `GridCellEditStopParams` |
| `rowEditStart` | 行编辑开始 | `GridRowEditStartParams` |
| `rowEditStop` | 行编辑停止 | `GridRowEditStopParams` |
| `columnResize` | 列宽调整 | `GridColumnResizeParams` |
| `stateChange` | 任何状态变更 | `GridState` |

### 阻止默认行为

```tsx
<DataGrid
  onCellClick={(params, event) => {
    // 阻止默认的行选择行为
    event.defaultMuiPrevented = true;
  }}
/>
```

---

## 状态管理（State）

### 获取当前状态

```tsx
const state = apiRef.current.state;
// 或使用 selector
import { gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid';
const filteredIds = gridFilteredSortedRowIdsSelector(apiRef);
```

### 常用 Selectors

```tsx
import {
  gridRowCountSelector,
  gridFilteredRowCountSelector,
  gridPageSizeSelector,
  gridPageSelector,
  gridSortModelSelector,
  gridFilterModelSelector,
  gridExpandedSortedRowIdsSelector,
} from '@mui/x-data-grid';

// 在组件中使用
const rowCount = gridRowCountSelector(apiRef);
const filteredCount = gridFilteredRowCountSelector(apiRef);
const pageSize = gridPageSizeSelector(apiRef);
```

### 恢复状态（持久化）

```tsx
// 保存状态
const saveState = () => {
  const state = apiRef.current.exportState();
  localStorage.setItem('gridState', JSON.stringify(state));
};

// 恢复状态
const savedState = JSON.parse(localStorage.getItem('gridState') || '{}');

<DataGrid
  apiRef={apiRef}
  initialState={savedState}
/>
```

---

## 完整示例：带 API 的 CRUD 表格

```tsx
import { DataGrid, useGridApiRef, GridActionsCellItem } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import { EditRounded, DeleteRounded, AddRounded } from '@mui/icons-material';
import { useT } from '@/i18n';
import { IconButton, Box } from '@mui/material';

function CrudTable() {
  const theme = useTheme();
  const t = useT();
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState(initialRows);

  const handleAdd = () => {
    const newId = Date.now();
    setRows((prev) => [...prev, { id: newId, name: '', email: '' }]);
    // 自动进入编辑模式
    setTimeout(() => {
      apiRef.current.startCellEditMode({ id: newId, field: 'name' });
    }, 100);
  };

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const columns = React.useMemo(() => [
    { field: 'name', headerName: t('col.name'), flex: 1, editable: true },
    { field: 'email', headerName: t('col.email'), flex: 1, editable: true },
    {
      field: 'actions',
      type: 'actions' as const,
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteRounded />}
          label={t('action.delete')}
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ], [t]);

  return (
    <Box>
      <IconButton onClick={handleAdd} aria-label={t('action.add')}>
        <AddRounded />
      </IconButton>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        processRowUpdate={async (newRow) => {
          await saveToBackend(newRow);
          return newRow;
        }}
      />
    </Box>
  );
}
```

---

## Foundation 约束

1. **apiRef 不要在 ViewModel 外暴露** —— 保持在 View 层或 ViewModel hook 内
2. **事件回调中的用户提示走 `t()`** —— 如 toast 消息
3. **状态持久化用 SQLite（PreferencesService）** —— 不用 localStorage
4. **updateRows 优于 setRows** —— 大数据量时性能更好
5. **subscribeEvent 必须在 useEffect 中清理** —— 返回的 unsubscribe 必须调用
