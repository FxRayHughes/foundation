# Table 全家族

## Import

```tsx
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
// 或
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel,
} from '@mui/material';
```

## 基础用法（Foundation 模式）

> 注意：简单表格用 Table，复杂数据（排序/筛选/虚拟滚动/列调整）用 DataGrid。

```tsx
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useT } from '@/i18n';
import { tableStyles } from './DataTable.styles';

function DataTable({ rows }) {
  const theme = useTheme();
  const t = useT();
  const styles = tableStyles(theme);

  return (
    <TableContainer component={Paper} sx={styles.container}>
      <Table sx={styles.table} aria-label={t('table.data.label')}>
        <TableHead>
          <TableRow sx={styles.headRow}>
            <TableCell sx={styles.headCell}>{t('table.col.name')}</TableCell>
            <TableCell sx={styles.headCell}>{t('table.col.size')}</TableCell>
            <TableCell sx={styles.headCell}>{t('table.col.date')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={styles.bodyRow}>
              <TableCell sx={styles.bodyCell}>{row.name}</TableCell>
              <TableCell sx={styles.bodyCell}>{row.size}</TableCell>
              <TableCell sx={styles.bodyCell}>{row.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

样式工厂：

```tsx
// DataTable.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const tableStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    container: {
      bgcolor: fp.bg.surface,
      borderRadius: 2,
      boxShadow: 'none',
      border: `1px solid ${fp.divider}`,
    },
    table: {
      minWidth: 400,
    },
    headRow: {
      bgcolor: fp.bg.elevated,
    },
    headCell: {
      color: fp.text.secondary,
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${fp.divider}`,
      py: 1.5,
    },
    bodyRow: {
      '&:hover': { bgcolor: fp.bg.hover },
      '&:last-child td': { borderBottom: 0 },
    },
    bodyCell: {
      color: fp.text.primary,
      borderBottom: `1px solid ${fp.divider}`,
      py: 1.5,
    },
  };
};
```

## 带排序功能

```tsx
import TableSortLabel from '@mui/material/TableSortLabel';

function SortableTable({ rows }) {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const t = useT();

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <TableHead>
      <TableRow sx={styles.headRow}>
        <TableCell sx={styles.headCell}>
          <TableSortLabel
            active={orderBy === 'name'}
            direction={orderBy === 'name' ? order : 'asc'}
            onClick={() => handleSort('name')}
          >
            {t('table.col.name')}
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
```

## 带分页

```tsx
import TablePagination from '@mui/material/TablePagination';

function PaginatedTable({ rows, total }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const t = useT();

  return (
    <>
      <TableContainer component={Paper} sx={styles.container}>
        <Table aria-label={t('table.paginated.label')}>
          {/* ... TableHead + TableBody ... */}
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage={t('table.rows.per.page')}
        labelDisplayedRows={({ from, to, count }) =>
          t('table.displayed.rows', { from, to, count })
        }
        sx={styles.pagination}
      />
    </>
  );
}
```

分页样式：

```tsx
pagination: {
  color: fp.text.secondary,
  borderTop: `1px solid ${fp.divider}`,
},
```

## Dense 模式

```tsx
<Table size="small" aria-label={t('table.dense.label')}>
  {/* 减少 cell padding */}
</Table>
```

## Sticky Header

```tsx
<TableContainer sx={{ maxHeight: 400, ...styles.container }}>
  <Table stickyHeader aria-label={t('table.sticky.label')}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ ...styles.headCell, bgcolor: fp.bg.elevated }}>
          {t('table.col.name')}
        </TableCell>
      </TableRow>
    </TableHead>
    {/* ... */}
  </Table>
</TableContainer>
```

## Cell 对齐

```tsx
{/* 数字右对齐 */}
<TableCell align="right" sx={styles.bodyCell}>{row.size}</TableCell>

{/* 居中 */}
<TableCell align="center" sx={styles.bodyCell}>{row.status}</TableCell>
```

## Props 完整参考

### Table Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| size | `'small'\|'medium'` | `'medium'` | 紧凑/标准模式 |
| stickyHeader | `boolean` | `false` | 固定表头 |
| padding | `'checkbox'\|'none'\|'normal'` | `'normal'` | Cell padding |
| component | `ElementType` | `'table'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### TableCell Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| align | `'center'\|'inherit'\|'justify'\|'left'\|'right'` | `'inherit'` | 对齐方式 |
| padding | `'checkbox'\|'none'\|'normal'` | — | 单元格 padding |
| size | `'small'\|'medium'` | — | 继承 Table |
| sortDirection | `'asc'\|'desc'\|false` | — | 排序方向（a11y） |
| variant | `'body'\|'footer'\|'head'` | — | 自动由位置决定 |
| component | `ElementType` | — | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### TableContainer Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| component | `ElementType` | `Paper` | 容器组件 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### TablePagination Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| count | `number` | — | 总行数 |
| page | `number` | — | 当前页（0-based） |
| rowsPerPage | `number` | — | 每页行数 |
| onPageChange | `(event, page) => void` | — | 翻页回调 |
| onRowsPerPageChange | `(event) => void` | — | 每页行数变更回调 |
| rowsPerPageOptions | `number[]` | `[10, 25, 50, 100]` | 可选每页行数 |
| labelRowsPerPage | `ReactNode` | `'Rows per page:'` | 标签文本 |
| labelDisplayedRows | `({ from, to, count }) => string` | — | 显示行数文本 |
| component | `ElementType` | `'div'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### TableSortLabel Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| active | `boolean` | `false` | 是否为当前排序列 |
| direction | `'asc'\|'desc'` | `'asc'` | 排序方向 |
| hideSortIcon | `boolean` | `false` | 隐藏排序图标 |
| IconComponent | `ElementType` | `ArrowDownwardIcon` | 排序图标 |
| onClick | `() => void` | — | 点击回调 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 空状态

```tsx
<TableBody>
  {rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} align="center" sx={styles.empty}>
        <Typography variant="body2" color={fp.text.muted}>
          {t('table.empty')}
        </Typography>
      </TableCell>
    </TableRow>
  ) : (
    rows.map(/* ... */)
  )}
</TableBody>
```

## 无障碍 (a11y)

- Table 必须有 `aria-label` 或 `aria-labelledby`
- 排序列的 TableCell 设置 `sortDirection` 属性
- TableSortLabel 自动提供排序状态的屏幕阅读器提示
- TablePagination 的 `labelRowsPerPage` 和 `labelDisplayedRows` 必须国际化

```tsx
<Table aria-label={t('table.users.label')}>
  <TableHead>
    <TableRow>
      <TableCell sortDirection={orderBy === 'name' ? order : false}>
        <TableSortLabel active={orderBy === 'name'} direction={order}>
          {t('table.col.name')}
        </TableSortLabel>
      </TableCell>
    </TableRow>
  </TableHead>
</Table>
```

## Foundation 约束

⚠️ **配色**：表头用 `fp.bg.elevated`，表体用 `fp.bg.surface`，边框用 `fp.divider`。禁止硬编码 hex。

⚠️ **圆角**：TableContainer 设置 `borderRadius: 2`（8px），由主题统一。

⚠️ **i18n**：表头文本、分页标签（`labelRowsPerPage`、`labelDisplayedRows`）、空状态文案全部走 `t('key')`。

⚠️ **复杂数据**：超过 5 列或需要列调整/虚拟滚动/行选择/列筛选时，使用 DataGrid 而非 Table。

⚠️ **对话框**：删除行的确认走 NativeDialogs.confirm()，不用 MUI Dialog。

