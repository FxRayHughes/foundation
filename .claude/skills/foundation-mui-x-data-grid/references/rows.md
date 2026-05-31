# DataGrid 行（Rows）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type { GridRowModel, GridRowId, GridRowsProp, GridRowClassNameParams } from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { tableStyles } from './UserTable.styles';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

function UserTable() {
  const theme = useTheme();
  const t = useT();
  const styles = tableStyles(theme);

  const rows: UserRow[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@test.com', role: 'user' },
  ];

  const columns: GridColDef<UserRow>[] = [
    { field: 'id', headerName: t('col.id'), width: 70 },
    { field: 'name', headerName: t('col.name'), flex: 1 },
    { field: 'email', headerName: t('col.email'), flex: 1.5 },
    { field: 'role', headerName: t('col.role'), width: 100 },
  ];

  return <DataGrid rows={rows} columns={columns} sx={styles.root} />;
}
```

## 行 ID（getRowId）

默认使用 `row.id` 作为唯一标识。如果数据没有 `id` 字段，用 `getRowId`：

```tsx
interface Product {
  sku: string;
  name: string;
  price: number;
}

<DataGrid
  rows={products}
  columns={columns}
  getRowId={(row: Product) => row.sku}
/>
```

## 行高（rowHeight / getRowHeight）

```tsx
// 固定行高（默认 52px）
<DataGrid rows={rows} columns={columns} rowHeight={40} />

// 动态行高（根据内容）
<DataGrid
  rows={rows}
  columns={columns}
  getRowHeight={({ model }) => {
    // 长描述行给更多高度
    if (model.description && model.description.length > 100) {
      return 80;
    }
    return null; // 使用默认行高
  }}
/>

// 自动行高（根据内容自适应，需配合 renderCell 的 whiteSpace）
<DataGrid
  rows={rows}
  columns={columns}
  getRowHeight={() => 'auto'}
  sx={{
    '& .MuiDataGrid-cell': {
      py: 1, // 自动行高时需要设置 padding
    },
  }}
/>
```

## 行样式（getRowClassName / getRowSx）

```tsx
import type { GridRowClassNameParams } from '@mui/x-data-grid';

<DataGrid
  rows={rows}
  columns={columns}
  getRowClassName={(params: GridRowClassNameParams) => {
    if (params.row.status === 'error') return 'row-error';
    if (params.row.status === 'warning') return 'row-warning';
    return '';
  }}
  sx={(theme) => ({
    '& .row-error': {
      bgcolor: theme.palette.foundation.status.danger + '1A', // 10% 透明度
    },
    '& .row-warning': {
      bgcolor: theme.palette.foundation.status.warning + '1A',
    },
  })}
/>
```

## 动态行更新

```tsx
import { useState } from 'react';

function DynamicTable() {
  const [rows, setRows] = useState<UserRow[]>(initialRows);

  const handleAddRow = () => {
    const newRow: UserRow = {
      id: Date.now(),
      name: '',
      email: '',
      role: 'user',
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (id: GridRowId) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return <DataGrid rows={rows} columns={columns} />;
}
```

## loading 状态

```tsx
function AsyncTable() {
  const { rows, loading } = useMyData();

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      slotProps={{
        loadingOverlay: {
          variant: 'skeleton', // v9 支持骨架屏加载
          noRowsVariant: 'skeleton',
        },
      }}
    />
  );
}
```

## 空状态（noRowsOverlay）

```tsx
import { Box, Typography } from '@mui/material';
import { SearchOffRounded } from '@mui/icons-material';

function CustomNoRows() {
  const t = useT();
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 1,
      }}
    >
      <SearchOffRounded
        sx={{ fontSize: 48, color: theme.palette.foundation.text.muted }}
      />
      <Typography color={theme.palette.foundation.text.secondary}>
        {t('table.noData')}
      </Typography>
    </Box>
  );
}

<DataGrid
  rows={[]}
  columns={columns}
  slots={{ noRowsOverlay: CustomNoRows }}
/>
```

## DataGrid 行相关 Props 参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `rows` | `GridRowsProp` | 必填 | 行数据数组 |
| `getRowId` | `(row) => GridRowId` | `(row) => row.id` | 自定义行 ID 提取 |
| `rowHeight` | `number` | 52 | 固定行高（px） |
| `getRowHeight` | `(params) => number\|null\|'auto'` | - | 动态行高 |
| `getRowClassName` | `(params) => string` | - | 动态行 CSS 类名 |
| `getRowSpacing` | `(params) => GridRowSpacing` | - | 行间距 |
| `loading` | `boolean` | false | 显示加载状态 |
| `rowCount` | `number` | rows.length | 总行数（服务端分页时用） |
| `rowBuffer` | `number` | 3 | 虚拟化缓冲行数 |
| `rowThreshold` | `number` | 3 | 触发新行渲染的阈值 |
| `getEstimatedRowHeight` | `(params) => number` | - | 预估行高（优化虚拟化） |

## 无障碍 (a11y)

- DataGrid 自动为表格添加 `role="grid"` 和 `aria-rowcount`
- 每行自动添加 `role="row"` 和 `aria-rowindex`
- loading 状态会添加 `aria-busy="true"`
- 空状态 overlay 应包含描述性文本

## Foundation 约束

- 行数据类型建议用 TypeScript interface 明确定义
- 空状态文案必须走 `t()` 翻译
- 行样式颜色只从 `theme.palette.foundation.*` 取
- loading overlay 推荐使用 `variant: 'skeleton'`（与项目骨架屏风格一致）
- 禁止在 getRowClassName 中使用硬编码颜色，必须通过 sx + theme 取色
