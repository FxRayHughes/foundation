# Pagination 分页器

## Import

```tsx
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useT } from '@/i18n';
import { paginationStyles } from './DataPagination.styles';

export const DataPagination = ({ totalPages }: { totalPages: number }) => {
  const theme = useTheme();
  const styles = paginationStyles(theme);
  const { t } = useT();
  const [page, setPage] = useState(1);

  return (
    <Pagination
      count={totalPages}
      page={page}
      onChange={(_, value) => setPage(value)}
      shape="rounded"
      color="primary"
      sx={styles.root}
      getItemAriaLabel={(type, page, selected) => {
        if (type === 'page') return t('pagination.goToPage', { page });
        if (type === 'first') return t('pagination.firstPage');
        if (type === 'last') return t('pagination.lastPage');
        if (type === 'next') return t('pagination.nextPage');
        return t('pagination.previousPage');
      }}
    />
  );
};
```

**styles.ts 工厂：**

```tsx
// DataPagination.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const paginationStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      '& .MuiPaginationItem-root': {
        color: fp.text.secondary,
        borderRadius: 1.5,
        '&.Mui-selected': {
          backgroundColor: fp.accent,
          color: '#fff',
          '&:hover': { backgroundColor: fp.accentHover },
        },
        '&:hover': { backgroundColor: fp.bg.hover },
      },
    },
  };
};
```

## 所有 Variants

### shape 变体

```tsx
// 圆角矩形（推荐，匹配 Foundation 方圆设计）
<Pagination count={10} shape="rounded" />

// 圆形
<Pagination count={10} shape="circular" />
```

### variant 变体

```tsx
// 默认（无边框）
<Pagination count={10} />

// 描边
<Pagination count={10} variant="outlined" />

// 文字
<Pagination count={10} variant="text" />
```

### color 变体

```tsx
<Pagination count={10} color="primary" />
<Pagination count={10} color="secondary" />
<Pagination count={10} color="standard" />
```

### size 变体

```tsx
<Pagination count={10} size="small" />
<Pagination count={10} size="medium" />  // 默认
<Pagination count={10} size="large" />
```

### 显示首尾页按钮

```tsx
<Pagination count={10} showFirstButton showLastButton />
```

### 隐藏上一页/下一页按钮

```tsx
<Pagination count={10} hidePrevButton hideNextButton />
```

### 自定义范围

```tsx
// siblingCount: 当前页两侧显示的页码数
// boundaryCount: 首尾显示的页码数
<Pagination count={20} siblingCount={2} boundaryCount={2} />
```

### 自定义图标

```tsx
import PaginationItem from '@mui/material/PaginationItem';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

<Pagination
  count={10}
  renderItem={(item) => (
    <PaginationItem
      slots={{ previous: ArrowBackRoundedIcon, next: ArrowForwardRoundedIcon }}
      {...item}
    />
  )}
/>
```

## Props 完整参考

### Pagination

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | `number` | `1` | 总页数 |
| `page` | `number` | — | 当前页（受控） |
| `defaultPage` | `number` | `1` | 默认页（非受控） |
| `onChange` | `(event, page) => void` | — | 页码变化回调 |
| `color` | `'primary' \| 'secondary' \| 'standard'` | `'standard'` | 颜色 |
| `variant` | `'text' \| 'outlined'` | `'text'` | 样式变体 |
| `shape` | `'circular' \| 'rounded'` | `'circular'` | 形状 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `showFirstButton` | `boolean` | `false` | 显示首页按钮 |
| `showLastButton` | `boolean` | `false` | 显示末页按钮 |
| `hidePrevButton` | `boolean` | `false` | 隐藏上一页按钮 |
| `hideNextButton` | `boolean` | `false` | 隐藏下一页按钮 |
| `siblingCount` | `number` | `1` | 当前页两侧页码数 |
| `boundaryCount` | `number` | `1` | 首尾页码数 |
| `renderItem` | `(params) => ReactNode` | — | 自定义渲染每个分页项 |
| `getItemAriaLabel` | `(type, page, selected) => string` | — | 自定义 aria-label |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### PaginationItem

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'page' \| 'first' \| 'last' \| 'next' \| 'previous' \| 'start-ellipsis' \| 'end-ellipsis'` | `'page'` | 项类型 |
| `page` | `number` | — | 页码 |
| `selected` | `boolean` | `false` | 是否选中 |
| `disabled` | `boolean` | `false` | 禁用 |
| `color` | `string` | `'standard'` | 颜色 |
| `variant` | `string` | `'text'` | 变体 |
| `shape` | `string` | `'circular'` | 形状 |
| `size` | `string` | `'medium'` | 尺寸 |
| `slots` | `{ previous, next, first, last }` | — | 自定义图标组件 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

**受控模式（推荐）**：

```tsx
const [page, setPage] = useState(1);
<Pagination page={page} onChange={(_, v) => setPage(v)} count={10} />
```

**非受控模式**：

```tsx
<Pagination defaultPage={1} count={10} onChange={(_, v) => fetchData(v)} />
```

## 与 Foundation 路由集成

Pagination 通常不直接与路由集成（它控制数据分页而非页面导航）。但如果需要 URL 参数同步：

```tsx
// 数据分页 —— 不走路由，走本地状态 + 数据请求
const [page, setPage] = useState(1);

const handlePageChange = (_: unknown, value: number) => {
  setPage(value);
  fetchPageData(value); // 调用后端 service 获取分页数据
};
```

## 无障碍 (a11y)

- 根节点自动获得 `role="navigation"` + `aria-label="pagination navigation"`
- 每个分页项有描述性 `aria-label`（如"go to page 3"）
- 通过 `getItemAriaLabel` 自定义 aria-label（**必须 i18n 化**）
- 分页项可通过 Tab 键聚焦，tabindex="0"
- 选中项有 `aria-current="true"`

## Foundation 约束

1. **配色**：选中态 `fp.accent`（白色文字），未选中 `fp.text.secondary`，hover 态 `fp.bg.hover`
2. **圆角**：推荐 `shape="rounded"`，匹配方圆设计语言
3. **图标**：自定义翻页图标用 `*Rounded` 系列
4. **i18n**：`getItemAriaLabel` 必须返回 `t()` 翻译后的字符串
5. **样式**：复杂样式抽到 `styles.ts` 工厂函数
6. **数据分页**：不走路由，走本地状态 + service 调用