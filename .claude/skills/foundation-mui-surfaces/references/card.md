# Card

Card 是基于 Paper 的高层容器，用于展示结构化内容。Foundation 中用于信息卡片、设置项面板、内容摘要等场景。

## Import

```tsx
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
```

## 基础用法（Foundation 模式）

```tsx
// ProjectCard.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const projectCardStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      // borderRadius 由主题统一为 8
    },
    header: { pb: 0 },
    title: { color: fp.text.primary, fontWeight: 600 },
    subheader: { color: fp.text.secondary },
    content: { color: fp.text.secondary },
    actions: { justifyContent: 'flex-end', px: 2, pb: 2 },
  };
};
```

```tsx
// ProjectCard.tsx
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { projectCardStyles } from './ProjectCard.styles';

export const ProjectCard = ({ name, description }: { name: string; description: string }) => {
  const theme = useTheme();
  const styles = projectCardStyles(theme);
  const { t } = useT();

  return (
    <Card sx={styles.root} elevation={0}>
      <CardHeader
        sx={styles.header}
        avatar={<Avatar sx={{ bgcolor: theme.palette.foundation.accent }}><FolderRoundedIcon /></Avatar>}
        title={name}
        subheader={description}
        titleTypographyProps={{ sx: styles.title }}
        subheaderTypographyProps={{ sx: styles.subheader }}
      />
      <CardContent>
        <Typography sx={styles.content}>{t('project.lastUpdated')}: 2026-05-31</Typography>
      </CardContent>
      <CardActions sx={styles.actions}>
        <Button size="small">{t('project.open')}</Button>
        <Button size="small" color="error">{t('project.delete')}</Button>
      </CardActions>
    </Card>
  );
};
```

## 所有 Variants

### raised（默认 elevation）

```tsx
<Card raised>{/* elevation=8 的 Paper */}</Card>
```

### outlined

```tsx
<Card variant="outlined">{/* elevation=0 + 1px border，Foundation 推荐 */}</Card>
```

### elevation 控制

```tsx
<Card elevation={0}>{/* 无阴影，配合自定义 border */}</Card>
<Card elevation={2}>{/* 轻微阴影 */}</Card>
```

## 子组件组合

### 完整结构（Header + Media + Content + Actions）

```tsx
// FullCard.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const fullCardStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: { backgroundColor: fp.bg.surface, border: `1px solid ${fp.divider}` },
    media: { height: 194 },
    content: { color: fp.text.secondary },
    actions: { justifyContent: 'space-between', px: 2, pb: 2 },
  };
};
```

```tsx
// FullCard.tsx
<Card sx={styles.root} elevation={0}>
  <CardMedia
    sx={styles.media}
    component="img"
    image="/assets/cover.jpg"
    alt={t('card.coverAlt')}
  />
  <CardHeader
    title={t('card.title')}
    subheader={t('card.subtitle')}
  />
  <CardContent>
    <Typography sx={styles.content}>{t('card.body')}</Typography>
  </CardContent>
  <CardActions sx={styles.actions}>
    <Button size="small">{t('actions.share')}</Button>
    <Button size="small">{t('actions.learnMore')}</Button>
  </CardActions>
</Card>
```

### CardActionArea（整卡可点击）

```tsx
<Card sx={styles.root} elevation={0}>
  <CardActionArea onClick={handleClick}>
    <CardMedia sx={styles.media} component="img" image="/assets/thumb.jpg" alt={t('card.thumbAlt')} />
    <CardContent>
      <Typography sx={styles.content}>{t('card.clickableBody')}</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

### 仅 Header + Content（简洁卡片）

```tsx
<Card variant="outlined">
  <CardContent>
    <Typography variant="h6" sx={styles.title}>{t('card.simpleTitle')}</Typography>
    <Typography sx={styles.content}>{t('card.simpleBody')}</Typography>
  </CardContent>
</Card>
```

## Props 完整参考

### Card

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 内容（通常是子组件组合） |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `elevation` | `number` (0-24) | `1` | 阴影深度 |
| `raised` | `bool` | `false` | `true` 时 elevation=8 |
| `square` | `bool` | `false` | 移除圆角 |
| `sx` | `SxProps<Theme>` | — | MUI system 样式 |
| `variant` | `'elevation' \| 'outlined'` | `'elevation'` | 外观模式 |

### CardHeader

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `action` | `ReactNode` | — | 右侧操作区（如 IconButton） |
| `avatar` | `ReactNode` | — | 左侧头像 |
| `disableTypography` | `bool` | `false` | 禁用内置 Typography 包裹 |
| `subheader` | `ReactNode` | — | 副标题 |
| `subheaderTypographyProps` | `object` | — | 副标题 Typography props |
| `sx` | `SxProps<Theme>` | — | 样式 |
| `title` | `ReactNode` | — | 主标题 |
| `titleTypographyProps` | `object` | — | 主标题 Typography props |

### CardContent

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 内容 |
| `component` | `elementType` | `'div'` | 根元素 |
| `sx` | `SxProps<Theme>` | — | 样式 |

### CardActions

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 操作按钮 |
| `disableSpacing` | `bool` | `false` | 禁用子元素间距 |
| `sx` | `SxProps<Theme>` | — | 样式 |

### CardMedia

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `alt` | `string` | — | 图片替代文本（a11y 必填） |
| `component` | `elementType` | 自动推断 | 根元素（`'img'` / `'video'` / `'picture'`） |
| `height` | `string \| number` | — | 高度（也可通过 sx 设置） |
| `image` | `string` | — | 图片 URL |
| `src` | `string` | — | 同 image（component="img" 时） |
| `sx` | `SxProps<Theme>` | — | 样式 |

### CardActionArea

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 可点击区域内容 |
| `onClick` | `func` | — | 点击回调 |
| `sx` | `SxProps<Theme>` | — | 样式 |

## 无障碍 (a11y)

- `CardMedia` 的 `alt` 属性**必填**，为图片提供替代文本。
- `CardActionArea` 自动获得 `role="button"` 和键盘焦点，无需额外处理。
- 如果 Card 整体代表一个独立内容块，可添加 `component="article"`：

```tsx
<Card component="article" sx={styles.root} elevation={0}>
  <CardHeader title={t('news.title')} />
  <CardContent>...</CardContent>
</Card>
```

- CardHeader 的 `action` 区域中的 IconButton 必须有 `aria-label`：

```tsx
<CardHeader
  title={t('card.title')}
  action={
    <IconButton aria-label={t('actions.more')}>
      <MoreVertRoundedIcon />
    </IconButton>
  }
/>
```

## Foundation 约束

| 约束 | 说明 |
|------|------|
| 推荐模式 | `elevation={0}` + `border: 1px solid ${fp.divider}`，或 `variant="outlined"` |
| 背景色 | `fp.bg.surface` |
| 圆角 | 主题统一 8px，勿覆盖 |
| 标题色 | `fp.text.primary`（主标题）、`fp.text.secondary`（副标题） |
| 图标 | CardHeader avatar / action 中只用 `*Rounded` 系列 |
| 文案 | 所有 title / subheader / body 走 `t('key')` |
| 禁止 | 硬编码色值、使用 `raised` prop（阴影过重不符合设计语言） |
