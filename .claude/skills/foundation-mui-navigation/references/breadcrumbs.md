# Breadcrumbs 面包屑

## Import

```tsx
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
```

## 基础用法（Foundation 模式）

```tsx
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useRouter } from '@/shared/hooks/useRouter';
import { useT } from '@/i18n';

export const AppBreadcrumbs = () => {
  const { t } = useT();
  const { navigate, breadcrumbs } = useRouter();

  return (
    <Breadcrumbs
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      aria-label={t('nav.breadcrumb')}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return isLast ? (
          <Typography key={crumb.id} color="text.primary">
            {t(crumb.labelKey)}
          </Typography>
        ) : (
          <Link
            key={crumb.id}
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate(crumb.id)}
          >
            {t(crumb.labelKey)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
```

## 所有 Variants

### 自定义分隔符

```tsx
// 字符串分隔符
<Breadcrumbs separator="›" aria-label={t('nav.breadcrumb')}>

// 图标分隔符（推荐）
<Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
```

### 带图标的面包屑

```tsx
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

<Breadcrumbs aria-label={t('nav.breadcrumb')}>
  <Link
    component="button"
    underline="hover"
    sx={{ display: 'flex', alignItems: 'center' }}
    color="inherit"
    onClick={() => navigate('home')}
  >
    <HomeRoundedIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    {t('nav.home')}
  </Link>
  <Typography color="text.primary">{t('nav.currentPage')}</Typography>
</Breadcrumbs>
```

### 折叠面包屑

```tsx
// 超过 maxItems 时自动折叠中间项
<Breadcrumbs maxItems={3} aria-label={t('nav.breadcrumb')}>
  <Link component="button" underline="hover" color="inherit" onClick={() => navigate('home')}>
    {t('nav.home')}
  </Link>
  <Link component="button" underline="hover" color="inherit" onClick={() => navigate('category')}>
    {t('nav.category')}
  </Link>
  <Link component="button" underline="hover" color="inherit" onClick={() => navigate('subcategory')}>
    {t('nav.subcategory')}
  </Link>
  <Typography color="text.primary">{t('nav.currentPage')}</Typography>
</Breadcrumbs>
```

## Props 完整参考

### Breadcrumbs

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `node` | — | 面包屑项 |
| `separator` | `node` | `'/'` | 分隔符元素 |
| `maxItems` | `number` | `8` | 折叠前最大显示项数 |
| `itemsAfterCollapse` | `number` | `1` | 折叠后尾部保留项数 |
| `itemsBeforeCollapse` | `number` | `1` | 折叠后头部保留项数 |
| `expandText` | `string` | `'Show path'` | 展开按钮的 aria-label |
| `component` | `elementType` | `'nav'` | 根元素类型 |
| `slots` | `{ CollapsedIcon }` | — | 自定义折叠图标 |
| `slotProps` | `object` | — | 传递给 slot 的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

Breadcrumbs 本身无受控状态——它是纯展示组件。面包屑数据来源于路由状态：

```tsx
// 从路由 hook 获取面包屑数据
const { breadcrumbs } = useRouter();
// breadcrumbs: Array<{ id: string; labelKey: string }>
```

## 与 Foundation 路由集成

```tsx
const { navigate, breadcrumbs } = useRouter();

// 点击面包屑项 → navigate(id)
<Link component="button" onClick={() => navigate(crumb.id)}>
  {t(crumb.labelKey)}
</Link>
```

**注意**：使用 `component="button"` 而非 `href`，因为 Foundation 不使用 URL 路由。

## 无障碍 (a11y)

- Breadcrumbs 渲染为 `<nav>` 元素，**必须**提供 `aria-label`
- 内部使用有序列表 `<ol>` 结构化链接集合
- 分隔符通过 `aria-hidden` 对屏幕阅读器隐藏
- 当前页面（最后一项）用 `<Typography>` 而非 `<Link>`，表示不可点击
- 折叠的省略号按钮有 `aria-label="Show path"`（可通过 `expandText` 自定义）

## Foundation 约束

1. **配色**：链接色用 `inherit`（继承父级），当前页用 `text.primary`
2. **圆角**：不适用
3. **图标**：分隔符推荐 `NavigateNextRoundedIcon`，面包屑项图标用 `*Rounded`
4. **i18n**：所有面包屑文字走 `t(crumb.labelKey)`，`aria-label` 也走 `t()`
5. **路由**：点击回调用 `navigate(id)`，使用 `component="button"` 而非 `href`
6. **样式**：简单场景直接用默认样式，复杂定制抽到 `styles.ts`
