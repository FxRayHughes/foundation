# 单元格编辑（Editing）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowModel,
  GridRenderEditCellParams,
  GridPreProcessEditCellProps,
} from '@mui/x-data-grid';
import { useGridApiRef } from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { useT } from '@/i18n';

function EditableTable() {
  const t = useT();
  const apiRef = useGridApiRef();

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: t('col.name'), flex: 1, editable: true },
    { field: 'email', headerName: t('col.email'), flex: 1, editable: true },
    {
      field: 'role',
      headerName: t('col.role'),
      type: 'singleSelect',
      valueOptions: ['admin', 'user', 'guest'],
      editable: true,
      width: 120,
    },
  ], [t]);

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      await saveToBackend(newRow);
      return newRow; // 返回最终行数据
    },
    []
  );

  return (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={(err) => console.error(err)}
    />
  );
}
```

## 详细配置

### 启用编辑

在 `GridColDef` 上设置 `editable: true`：

```tsx
{ field: 'name', editable: true }
```

### 编辑模式

| 模式 | prop | 说明 |
|------|------|------|
| 单元格编辑 | `editMode="cell"`（默认） | 同时只能编辑一个单元格 |
| 行编辑 | `editMode="row"` | 同时编辑整行所有 editable 列 |

```tsx
<DataGrid editMode="row" columns={columns} rows={rows} />
```

### 触发编辑

用户操作：
- 双击单元格
- 按 Enter / Backspace / Delete
- 输入任意可打印字符

API 方式：
```tsx
// 单元格模式
apiRef.current.startCellEditMode({ id: 1, field: 'name' });

// 行模式
apiRef.current.startRowEditMode({ id: 1 });
```

### 停止编辑

用户操作：
- Escape —— 撤销更改
- Tab —— 保存并移到下一格
- Enter —— 保存并移到下一行
- 点击外部 —— 保存

API 方式：
```tsx
// 保存
apiRef.current.stopCellEditMode({ id: 1, field: 'name' });

// 撤销
apiRef.current.stopCellEditMode({
  id: 1,
  field: 'name',
  ignoreModifications: true,
});

// 行模式
apiRef.current.stopRowEditMode({ id: 1 });
apiRef.current.stopRowEditMode({ id: 1, ignoreModifications: true });
```

### processRowUpdate — 保存逻辑

编辑完成时调用，**必须返回最终行数据**（或 throw 错误）：

```tsx
const processRowUpdate = async (
  newRow: GridRowModel,
  oldRow: GridRowModel
) => {
  // 调用后端 service 保存
  const saved = await MyService.update(newRow.id, newRow);
  return saved; // 返回后端确认的数据
};

const handleError = (error: Error) => {
  // 保存失败时的处理（toast 提示等）
  console.error('Update failed:', error);
};

<DataGrid
  processRowUpdate={processRowUpdate}
  onProcessRowUpdateError={handleError}
/>
```

### isCellEditable — 条件性禁用

```tsx
<DataGrid
  isCellEditable={(params) => {
    // 只有偶数 age 的行才能编辑
    if (params.field === 'name') {
      return params.row.age % 2 === 0;
    }
    return true;
  }}
/>
```

### valueParser — 输入解析

用户输入值 → 保存到行数据前的转换：

```tsx
{
  field: 'price',
  editable: true,
  valueParser: (value, row, column, apiRef) => {
    // 用户输入 "100元" → 解析为 100
    return Number(String(value).replace(/[^0-9.]/g, ''));
  },
}
```

### valueSetter — 嵌套对象写入

```tsx
{
  field: 'fullName',
  editable: true,
  valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
  valueSetter: (value, row) => {
    const [firstName = '', lastName = ''] = String(value).split(' ');
    return { ...row, firstName, lastName };
  },
}
```

### preProcessEditCellProps — 编辑时验证

```tsx
{
  field: 'email',
  editable: true,
  preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.props.value);
    return { ...params.props, error: !isValid };
  },
}
```

验证失败时单元格显示错误样式，且无法保存。

### renderEditCell — 自定义编辑组件

```tsx
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

function CustomEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, api } = props;

  return (
    <Autocomplete
      value={value}
      options={['option1', 'option2', 'option3']}
      onChange={(_, newValue) => {
        api.setEditCellValue({ id, field, value: newValue });
      }}
      renderInput={(params) => <TextField {...params} size="small" />}
      sx={{ width: '100%' }}
    />
  );
}

// 列定义
{
  field: 'category',
  editable: true,
  renderEditCell: (params) => <CustomEditCell {...params} />,
}
```

---

## Props/Options 参考表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `editMode` | `'cell' \| 'row'` | `'cell'` | 编辑模式 |
| `processRowUpdate` | `(newRow, oldRow) => Promise<Row> \| Row` | — | 保存回调 |
| `onProcessRowUpdateError` | `(error: Error) => void` | — | 保存失败回调 |
| `isCellEditable` | `(params: GridCellParams) => boolean` | — | 条件可编辑 |
| `onCellEditStart` | `GridEventListener<'cellEditStart'>` | — | 开始编辑事件 |
| `onCellEditStop` | `GridEventListener<'cellEditStop'>` | — | 停止编辑事件 |
| `onRowEditStart` | `GridEventListener<'rowEditStart'>` | — | 行编辑开始 |
| `onRowEditStop` | `GridEventListener<'rowEditStop'>` | — | 行编辑停止 |

### GridColDef 编辑相关属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `editable` | `boolean` | 是否可编辑 |
| `valueParser` | `(value, row, column, apiRef) => any` | 输入解析 |
| `valueSetter` | `(value, row) => GridRowModel` | 嵌套对象写入 |
| `preProcessEditCellProps` | `(params) => GridEditCellProps` | 编辑验证 |
| `renderEditCell` | `(params: GridRenderEditCellParams) => ReactNode` | 自定义编辑器 |

---

## TypeScript 类型

```tsx
interface GridPreProcessEditCellProps {
  id: GridRowId;
  row: GridRowModel;
  props: GridEditCellProps;
  hasChanged: boolean;
}

interface GridEditCellProps {
  value: any;
  error?: boolean;
  isProcessingProps?: boolean;
  [key: string]: any;
}

interface GridRenderEditCellParams {
  id: GridRowId;
  field: string;
  value: any;
  row: GridRowModel;
  api: GridApi;
  hasFocus: boolean;
  error?: boolean;
}
```

---

## Foundation 约束

1. **`processRowUpdate` 必须调用后端 service** —— 不允许只更新前端 state
2. **验证错误文案走 `t()`** —— 如果有 toast 提示失败原因
3. **`renderEditCell` 中的组件样式取 palette** —— 不硬编码色值
4. **行编辑模式下仍需每列单独设 `editable: true`** —— `editMode="row"` 不会自动启用所有列
