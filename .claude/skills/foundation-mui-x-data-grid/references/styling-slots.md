# 样式与 Slots（Styling & Slots）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import { useTheme, styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
```

## 基础用法（Foundation 模式）

### styles.ts 工厂函数

```tsx
// MyTable.styles.ts
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

export const myTableStyles = (theme: Theme) => {
  const fp = theme.palette.foundation;
  return {
    root: {
      borderRadius: 8,
      border: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
      // 列头
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: fp.bg.elevated,
        borderBottom: `1px solid ${fp.divider}`,
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
        color: fp.text.primary,
      },
      // 单元格
      '& .MuiDataGrid-cell': {
        color: fp.text.primary,
        borderColor: fp.divider,
      },
      // 行 hover
      '& .MuiDataGrid-row:hover': {
        backgroundColor: fp.bg.hover,
      },
      // 选中行
      '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: fp.bg.active,
        '&:hover': {
          backgroundColor: fp.bg.active,
        },
      },
      // 页脚
      '& .MuiDataGrid-footerContainer': {
        borderTop: `1px solid ${fp.divider}`,
        backgroundColor: fp.bg.surface,
      },
      // 工具栏
      '& .MuiDataGrid-toolbarContainer': {
        padding: theme.spacing(1, 1.5),
        borderBottom: `1px solid ${fp.divider}`,
      },
    } satisfies SxProps<Theme>,
  };
};
```

### 使用

```tsx
function MyTable() {
  const theme = useTheme();
  const styles = myTableStyles(theme);

  return <DataGrid rows={rows} columns={columns} sx={styles.root} />;
}
```

---

## CSS 类名参考

DataGrid 内部组件的 CSS 类名（用于 sx 覆盖）：

| 类名 | 说明 |
|------|------|
| `.MuiDataGrid-root` | 根容器 |
| `.MuiDataGrid-main` | 主内容区 |
| `.MuiDataGrid-columnHeaders` | 列头容器 |
| `.MuiDataGrid-columnHeader` | 单个列头 |
| `.MuiDataGrid-columnHeaderTitle` | 列头文字 |
| `.MuiDataGrid-columnSeparator` | 列分隔线 |
| `.MuiDataGrid-row` | 行 |
| `.MuiDataGrid-row.Mui-selected` | 选中行 |
| `.MuiDataGrid-cell` | 单元格 |
| `.MuiDataGrid-cell--editable` | 可编辑单元格 |
| `.MuiDataGrid-cell--editing` | 编辑中单元格 |
| `.MuiDataGrid-toolbarContainer` | 工具栏容器 |
| `.MuiDataGrid-footerContainer` | 页脚容器 |
| `.MuiDataGrid-overlay` | 覆盖层（loading/empty） |
| `.MuiDataGrid-virtualScroller` | 虚拟滚动容器 |
| `.MuiDataGrid-scrollbar` | 滚动条 |

## styled 方式覆盖

```tsx
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)(({ theme }) => {
  const fp = theme.palette.foundation;
  return {
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: fp.bg.elevated,
    },
    '& .MuiDataGrid-cell:focus': {
      outline: `2px solid ${fp.accent}`,
      outlineOffset: -2,
    },
    '& .MuiDataGrid-row:nth-of-type(even)': {
      backgroundColor: fp.bg.hover,
    },
  };
});
```

---

## Slots（组件替换）

DataGrid 通过 `slots` prop 替换内部组件：

### 可替换 Slots 列表

| Slot | 说明 | 默认组件 |
|------|------|----------|
| `toolbar` | 工具栏 | 内置 Toolbar |
| `footer` | 页脚 | 内置 Footer |
| `noRowsOverlay` | 无数据覆盖层 | 内置文字提示 |
| `noResultsOverlay` | 筛选无结果覆盖层 | 内置文字提示 |
| `loadingOverlay` | 加载覆盖层 | CircularProgress |
| `columnMenu` | 列菜单 | 内置菜单 |
| `cell` | 单元格 | 内置 Cell |
| `row` | 行 | 内置 Row |
| `baseCheckbox` | Checkbox 组件 | MUI Checkbox |
| `baseTextField` | 输入框组件 | MUI TextField |
| `baseSelect` | 选择框组件 | MUI Select |
| `baseButton` | 按钮组件 | MUI Button |
| `baseIconButton` | 图标按钮 | MUI IconButton |
| `baseTooltip` | Tooltip | MUI Tooltip |
| `basePopper` | Popper | MUI Popper |
| `pagination` | 分页组件 | MUI TablePagination |

### 自定义 Footer 示例

```tsx
import { Box, Typography } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';

function CustomFooter() {
  const t = useT();
  const theme = useTheme();
  const apiRef = useGridApiContext();
  const rowCount = apiRef.current.getRowsCount();

  return (
    <Box
      sx={{
        p: 1,
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: `1px solid ${theme.palette.foundation.divider}`,
      }}
    >
      <Typography variant="body2" color={theme.palette.foundation.text.secondary}>
        {t('table.totalRows', { count: rowCount })}
      </Typography>
    </Box>
  );
}

<DataGrid slots={{ footer: CustomFooter }} />
```

### 自定义 noRowsOverlay 示例

```tsx
import { Box, Typography } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';

function EmptyState() {
  const t = useT();
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <InboxRounded
        sx={{ fontSize: 48, color: theme.palette.foundation.text.muted }}
      />
      <Typography sx={{ mt: 1, color: theme.palette.foundation.text.secondary }}>
        {t('table.empty')}
      </Typography>
    </Box>
  );
}

<DataGrid slots={{ noRowsOverlay: EmptyState }} />
```

### slotProps 传递参数

```tsx
<DataGrid
  slots={{
    toolbar: CustomToolbar,
    loadingOverlay: LinearProgress,
  }}
  slotProps={{
    toolbar: { showQuickFilter: true },
    loadingOverlay: { color: 'primary' },
    baseCheckbox: { size: 'small' },
    baseTextField: { size: 'small', variant: 'outlined' },
    cell: { tabIndex: -1 },
  }}
/>
```

---

## 主题级别覆盖（Theme overrides）

在 Foundation theme 中全局覆盖 DataGrid 样式：

```tsx
// theme.ts（片段）
components: {
  MuiDataGrid: {
    defaultProps: {
      density: 'compact',
      disableRowSelectionOnClick: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        border: 'none',
        borderRadius: 8,
      }),
      columnHeaders: ({ theme }) => ({
        backgroundColor: theme.palette.foundation.bg.elevated,
      }),
      cell: ({ theme }) => ({
        borderColor: theme.palette.foundation.divider,
      }),
    },
  },
}
```

---

## Props 参考表

| 属性 | 类型 | 说明 |
|------|------|------|
| `sx` | `SxProps<Theme>` | 根元素样式 |
| `slots` | `Partial<GridSlots>` | 替换内部组件 |
| `slotProps` | `Partial<GridSlotProps>` | 传递给 slot 的 props |
| `getRowClassName` | `(params) => string` | 动态行 class |
| `getCellClassName` | `(params) => string` | 动态单元格 class |

---

## Foundation 约束

1. **样式写 `.styles.ts` 工厂函数** —— 不在 JSX 内联大块 sx
2. **颜色只从 `theme.palette.foundation.*` 取** —— 禁止硬编码 hex
3. **slots 中的自定义组件文案走 `t()`** —— 包括 overlay/footer
4. **slots 图标只用 `*Rounded` 系列** —— 保持全局图标风格一致
5. **容器 borderRadius 使用 8** —— 已由主题统一，sx 中勿覆盖
6. **styled 方式只用于需要复用的表格组件** —— 一次性样式用 sx + styles.ts
