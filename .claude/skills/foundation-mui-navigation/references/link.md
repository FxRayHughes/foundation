# Link 链接

## Import

```tsx
import Link from '@mui/material/Link';
```

## 基础用法（Foundation 模式）

在 Foundation 桌面应用中，Link 主要用于**外部链接**（用 Wails runtime 打开系统浏览器）。
内部导航使用 `useRouter().navigate(id)`，不使用 Link 组件。

```tsx
import { useTheme } from '@mui/material';
import Link from '@mui/material/Link';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useT } from '@/i18n';
import { BrowserOpenURL } from '@wailsio/runtime';
import { linkStyles } from './ExternalLink.styles';

interface ExternalLinkProps {
  href: string;
  labelKey: string;
}

export const ExternalLink = ({ href, labelKey }: ExternalLinkProps) => {
  const theme = useTheme();
  const styles = linkStyles(theme);
  const { t } = useT();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    BrowserOpenURL(href);
  };

  return (
    <Link
      component="button"
      onClick={handleClick}
      underline="hover"
      sx={styles.link}
    >
      {t(labelKey)}
      <OpenInNewRoundedIcon sx={styles.icon} />
    </Link>
  );
};
```

**styles.ts 工厂：**

```tsx
// ExternalLink.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const linkStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    link: {
      color: fp.accent,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      cursor: 'pointer',
      '&:hover': { color: fp.accentHover },
    },
    icon: { fontSize: 14 },
  };
};
```

## 所有 Variants

### underline 变体

```tsx
// 悬停时显示下划线（推荐）
<Link underline="hover">{t('link.docs')}</Link>

// 始终显示下划线
<Link underline="always">{t('link.docs')}</Link>

// 永不显示下划线
<Link underline="none">{t('link.docs')}</Link>
```

### color 变体

```tsx
<Link color="primary">{t('link.primary')}</Link>
<Link color="secondary">{t('link.secondary')}</Link>
<Link color="inherit">{t('link.inherit')}</Link>
<Link color="error">{t('link.error')}</Link>
```

### 按钮形态 Link（Foundation 推荐）

由于桌面应用不使用 URL，Link 应渲染为按钮而非 `<a>`：

```tsx
// component="button" —— 无 href，纯点击行为
<Link component="button" underline="hover" onClick={handleClick}>
  {t('link.openExternal')}
</Link>
```

### Typography 变体

```tsx
<Link variant="body1">{t('link.body1')}</Link>
<Link variant="body2">{t('link.body2')}</Link>
<Link variant="caption">{t('link.caption')}</Link>
<Link variant="h6">{t('link.heading')}</Link>
```

### 带图标的外部链接

```tsx
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

<Link
  component="button"
  underline="hover"
  onClick={() => BrowserOpenURL('https://example.com')}
  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
>
  {t('link.visitDocs')}
  <OpenInNewRoundedIcon fontSize="inherit" />
</Link>
```

### 在段落中使用

```tsx
<Typography>
  {t('about.license')}
  <Link component="button" underline="hover" onClick={() => BrowserOpenURL(licenseUrl)}>
    {t('about.viewLicense')}
  </Link>
</Typography>
```

## Props 完整参考

### Link（继承 Typography 所有 props）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `underline` | `'always' \| 'hover' \| 'none'` | `'always'` | 下划线行为 |
| `color` | `string` | `'primary'` | 颜色 |
| `variant` | `string` | `'inherit'` | Typography 变体 |
| `component` | `elementType` | `'a'` | 根元素（Foundation 推荐 `'button'`） |
| `href` | `string` | — | 链接地址（桌面应用中通常不用） |
| `onClick` | `(event) => void` | — | 点击回调 |
| `TypographyClasses` | `object` | — | Typography 的 classes |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

Link 是无状态展示组件，没有受控 / 非受控之分。行为通过 `onClick` 回调处理。

## 与 Wails Runtime 集成

**外部链接**必须通过 Wails runtime 打开浏览器：

```tsx
import { BrowserOpenURL } from '@wailsio/runtime';

const handleExternalLink = (url: string) => {
  BrowserOpenURL(url);
};

<Link component="button" onClick={() => handleExternalLink('https://docs.example.com')}>
  {t('link.documentation')}
</Link>
```

**内部导航**不使用 Link，使用路由系统：

```tsx
// 错误 —— 不要用 Link 做内部导航
<Link onClick={() => navigate('settings')}>{t('nav.settings')}</Link>

// 正确 —— 内部导航用专门的导航组件（Sidebar / Tabs / Menu 等）
navigate('settings');
```

## 无障碍 (a11y)

- `component="button"` 时自动获得按钮语义，可键盘聚焦
- 外部链接建议在 `aria-label` 中说明"在新窗口打开"
- 不要在 Link 文字中使用"点击这里"等无意义文案
- 使用描述性文字（如"查看文档"而非"链接"）
- 颜色不应是区分链接的唯一方式（配合下划线）

```tsx
<Link
  component="button"
  onClick={() => BrowserOpenURL(url)}
  aria-label={t('link.openDocsInBrowser')}
>
  {t('link.documentation')}
</Link>
```

## Foundation 约束

⚠️ **本项目特有约束：**

1. **配色**：链接色用 `fp.accent`，悬停用 `fp.accentHover`
2. **圆角**：不适用
3. **图标**：外部链接加 `OpenInNewRoundedIcon`，内部用 `*Rounded`
4. **i18n**：链接文字走 `t('key')`
5. **component**：始终用 `component="button"`，不要用 `href`（桌面应用无 URL 导航）
6. **外部链接**：必须用 `BrowserOpenURL()` 打开系统浏览器
7. **内部导航**：不要用 Link 做路由跳转，用 Sidebar / Tabs / Menu 等导航组件
8. **underline**：推荐 `underline="hover"`
