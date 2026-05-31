# DataGrid 列定义（Columns）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridValueGetter } from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { dataGridStyles } from './MyTable.styles';

function MyTable() {
  const theme = useTheme();
  const t = useT();
  const styles = dataGridStyles(theme);

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('table.id'), width: 70 },
    { field: 'name', headerName: t('table.name'), flex: 1 },
    { field: 'age', headerName: t('table.age'), type: 'number', width: 90 },
    { field: 'email', headerName: t('table.email'), flex: 1.5 },
  ];

  const rows = [
    { id: 1, name: 'Alice', age: 28, email: 'alice@example.com' },
    { id: 2, name: 'Bob', age: 35, email: 'bob@example.com' },
  ];

  return <DataGrid rows={rows} columns={columns} sx={styles.root} />;
}
```

## 列类型（Column Types）

社区版支持的内置列类型：

| type | 说明 | 默认对齐 |
|------|------|----------|
| `'string'` | 字符串（默认） | left |
| `'number'` | 数字，支持数字排序/筛选 | right |
| `'date'` | 日期对象 | left |
| `'dateTime'` | 日期时间对象 | left |
| `'boolean'` | 布尔值，渲染为 checkbox 图标 | center |
| `'singleSelect'` | 下拉选择，需配合 valueOptions | left |
| `'actions'` | 操作列，渲染按钮/菜单 | center |

```tsx
const columns: GridColDef[] = [
  { field: 'name', headerName: t('col.name'), type: 'string' },
  { field: 'score', headerName: t('col.score'), type: 'number' },
  { field: 'birthday', headerName: t('col.birthday'), type: 'date' },
  { field: 'active', headerName: t('col.active'), type: 'boolean' },
  {
    field: 'role',
    headerName: t('col.role'),
    type: 'singleSelect',
    valueOptions: ['admin', 'user', 'guest'],
  },
];
```

## 自定义渲染（renderCell / renderHeader）

```tsx
import { ChipRounded, CheckCircleRounded, CancelRounded } from '@mui/icons-material';
import { Chip, Box } from '@mui/material';
import type { GridRenderCellParams } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  {
    field: 'status',
    headerName: t('col.status'),
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <Chip
        icon={params.value === 'active' ? <CheckCircleRounded /> : <CancelRounded />}
        label={t(`status.${params.value}`)}
        size="small"
        color={params.value === 'active' ? 'success' : 'default'}
      />
    ),
  },
  {
    field: 'progress',
    headerName: t('col.progress'),
    width: 150,
    renderCell: (params: GridRenderCellParams<number>) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: (theme) => theme.palette.foundation.bg.hover,
          }}
        >
          <Box
            sx={{
              width: `${params.value}%`,
              height: '100%',
              borderRadius: 3,
              bgcolor: (theme) => theme.palette.foundation.accent,
            }}
          />
        </Box>
        <span>{params.value}%</span>
      </Box>
    ),
  },
];
```

## 操作列（Actions Column）

```tsx
import { GridActionsCellItem } from '@mui/x-data-grid';
import type { GridRowParams } from '@mui/x-data-grid';
import { EditRounded, DeleteRounded, VisibilityRounded } from '@mui/icons-material';

const columns: GridColDef[] = [
  // ...其他列
  {
    field: 'actions',
    type: 'actions',
    headerName: t('col.actions'),
    width: 120,
    getActions: (params: GridRowParams) => [
      <GridActionsCellItem
        icon={<VisibilityRounded />}
        label={t('action.view')}
        onClick={() => handleView(params.id)}
      />,
      <GridActionsCellItem
        icon={<EditRounded />}
        label={t('action.edit')}
        onClick={() => handleEdit(params.id)}
      />,
      <GridActionsCellItem
        icon={<DeleteRounded />}
        label={t('action.delete')}
        onClick={() => handleDelete(params.id)}
        showInMenu
      />,
    ],
  },
];
```

## valueGetter 与 valueFormatter

```tsx
const columns: GridColDef[] = [
  {
    field: 'fullName',
    headerName: t('col.fullName'),
    flex: 1,
    valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
  },
  {
    field: 'price',
    headerName: t('col.price'),
    type: 'number',
    valueFormatter: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    field: 'createdAt',
    headerName: t('col.createdAt'),
    type: 'dateTime',
    width: 180,
    valueGetter: (value: string) => new Date(value),
    valueFormatter: (value: Date) =>
      value.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' }),
  },
];
```

## 列宽控制

```tsx
const columns: GridColDef[] = [
  // 固定宽度
  { field: 'id', headerName: 'ID', width: 70 },
  // 弹性宽度（按比例分配剩余空间）
  { field: 'name', headerName: t('col.name'), flex: 1 },
  { field: 'description', headerName: t('col.desc'), flex: 2 },
  // 最小/最大宽度
  { field: 'email', headerName: t('col.email'), flex: 1, minWidth: 150, maxWidth: 300 },
  // 可调整大小（默认 true）
  { field: 'fixed', headerName: t('col.fixed'), width: 100, resizable: false },
];
```

## 列可见性

```tsx
import { useState } from 'react';
import type { GridColumnVisibilityModel } from '@mui/x-data-grid';

function MyTable() {
  const [columnVisibility, setColumnVisibility] = useState<GridColumnVisibilityModel>({
    id: false,        // 默认隐藏 ID 列
    email: true,
  });

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      columnVisibilityModel={columnVisibility}
      onColumnVisibilityModelChange={setColumnVisibility}
    />
  );
}
```

## GridColDef Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `field` | `string` | 必填 | 行数据中对应的字段名 |
| `headerName` | `string` | field | 列头显示文本（走 t()） |
| `type` | `GridColType` | `'string'` | 列类型 |
| `width` | `number` | 100 | 固定列宽（px） |
| `flex` | `number` | - | 弹性宽度比例 |
| `minWidth` | `number` | 50 | 最小列宽 |
| `maxWidth` | `number` | Infinity | 最大列宽 |
| `resizable` | `boolean` | true | 是否可拖拽调整宽度 |
| `sortable` | `boolean` | true | 是否可排序 |
| `filterable` | `boolean` | true | 是否可筛选 |
| `hideable` | `boolean` | true | 是否可在列可见性面板中隐藏 |
| `disableColumnMenu` | `boolean` | false | 禁用列菜单 |
| `editable` | `boolean` | false | 是否可编辑 |
| `align` | `'left'\|'center'\|'right'` | 按 type | 单元格对齐 |
| `headerAlign` | `'left'\|'center'\|'right'` | align | 列头对齐 |
| `description` | `string` | - | 列头 tooltip 文本 |
| `renderCell` | `(params) => ReactNode` | - | 自定义单元格渲染 |
| `renderHeader` | `(params) => ReactNode` | - | 自定义列头渲染 |
| `renderEditCell` | `(params) => ReactNode` | - | 自定义编辑态渲染 |
| `valueGetter` | `(value, row) => any` | - | 计算派生值 |
| `valueSetter` | `(value, row) => row` | - | 编辑时设置值 |
| `valueFormatter` | `(value) => string` | - | 格式化显示值 |
| `valueOptions` | `any[]` | - | singleSelect 类型的选项 |
| `getActions` | `(params) => ReactElement[]` | - | actions 类型的操作按钮 |
| `colSpan` | `number\|(params) => number` | 1 | 单元格合并列数 |
| `display` | `'text'\|'flex'` | `'text'` | 单元格内容布局模式 |

## 无障碍 (a11y)

- `headerName` 会自动作为列的 aria-label
- `description` 会渲染为列头的 tooltip，辅助屏幕阅读器
- actions 列的每个 `GridActionsCellItem` 必须设置 `label` prop
- 使用 `aria-label` 属性为自定义 renderCell 中的交互元素添加描述

## Foundation 约束

- headerName 必须使用 `t('key')` 国际化，禁止硬编码中文/英文
- renderCell 中的图标只用 `@mui/icons-material` 的 `*Rounded` 系列
- renderCell 中的颜色只从 `theme.palette.foundation.*` 取
- valueOptions 如果是用户可见文本，也需要走 `t()` 翻译
- 操作列按钮的 label 必须走 `t()` 翻译（用于 a11y 和菜单显示）
