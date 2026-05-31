# ImageList / ImageListItem / ImageListItemBar

## Import

```typescript
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
// 或
import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
```

## 基础用法（Foundation 模式）

ImageList 用于以有组织的网格形式展示图片集合。Foundation 项目中适用于资源浏览器、图片选择器、缩略图预览等场景。

```tsx
import { Box, ImageList, ImageListItem, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { galleryStyles } from './Gallery.styles';

const Gallery = () => {
  const theme = useTheme();
  const styles = galleryStyles(theme);
  const { t } = useT();

  return (
    <Box sx={styles.root}>
      <ImageList cols={3} gap={8} sx={styles.imageList}>
        {images.map((img) => (
          <ImageListItem key={img.id}>
            <img
              src={img.url}
              alt={t(img.altKey)}
              loading="lazy"
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};
```

对应 styles.ts：

```typescript
import type { SxProps, Theme } from '@mui/material';

export const galleryStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      p: 3,
      backgroundColor: fp.bg.content,
      overflowY: 'auto',
    },
    imageList: {
      borderRadius: 1,
      overflow: 'hidden',
    },
  };
};
```

## 所有 Variants（布局变体）

### Standard（标准网格，默认）

所有图片等高等宽，按固定列数排列：

```tsx
<ImageList variant="standard" cols={4} gap={8}>
  {items.map((item) => (
    <ImageListItem key={item.id}>
      <img src={item.url} alt={t(item.altKey)} loading="lazy" />
    </ImageListItem>
  ))}
</ImageList>
```

### Quilted（拼接网格）

允许单个图片跨多行/多列，创建不规则但有节奏的布局：

```tsx
<ImageList variant="quilted" cols={4} rowHeight={121} gap={4}>
  {items.map((item) => (
    <ImageListItem key={item.id} cols={item.cols || 1} rows={item.rows || 1}>
      <img
        src={`${item.url}?w=${121 * (item.cols || 1)}&h=${121 * (item.rows || 1)}&fit=crop`}
        alt={t(item.altKey)}
        loading="lazy"
      />
    </ImageListItem>
  ))}
</ImageList>
```

### Woven（编织网格）

交替行偏移半列，创建编织效果：

```tsx
<ImageList variant="woven" cols={3} gap={8}>
  {items.map((item) => (
    <ImageListItem key={item.id}>
      <img src={item.url} alt={t(item.altKey)} loading="lazy" />
    </ImageListItem>
  ))}
</ImageList>
```

### Masonry（瀑布流）

图片保持原始宽高比，按列排列，高度不等：

```tsx
import { ImageList, ImageListItem } from '@mui/material';

<ImageList variant="masonry" cols={3} gap={8}>
  {items.map((item) => (
    <ImageListItem key={item.id}>
      <img src={item.url} alt={t(item.altKey)} loading="lazy" />
    </ImageListItem>
  ))}
</ImageList>
```

## ImageListItemBar（信息栏）

在图片上方或下方叠加标题/副标题/操作按钮：

### 底部信息栏（默认）

```tsx
import { ImageListItemBar } from '@mui/material';
import InfoRounded from '@mui/icons-material/InfoRounded';
import IconButton from '@mui/material/IconButton';

<ImageListItem>
  <img src={item.url} alt={t(item.altKey)} loading="lazy" />
  <ImageListItemBar
    title={t(item.titleKey)}
    subtitle={t(item.authorKey)}
    actionIcon={
      <IconButton
        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
        aria-label={t('gallery.info')}
      >
        <InfoRounded />
      </IconButton>
    }
  />
</ImageListItem>
```

### 顶部信息栏

```tsx
<ImageListItemBar
  position="top"
  title={t(item.titleKey)}
  sx={{
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
  }}
/>
```

### 底部信息栏（标题下方）

```tsx
<ImageListItemBar
  position="below"
  title={t(item.titleKey)}
/>
```

## Props 完整参考

### ImageList Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'standard' \| 'quilted' \| 'woven' \| 'masonry'` | `'standard'` | 布局变体 |
| `cols` | `number` | `2` | 列数 |
| `gap` | `number` | `4` | 图片间距（px） |
| `rowHeight` | `number \| 'auto'` | `'auto'` | 行高（px），`'auto'` 时由图片决定 |
| `sx` | `SxProps<Theme>` | — | 额外样式 |
| `component` | `ElementType` | `'ul'` | 渲染的 HTML 元素 |

### ImageListItem Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cols` | `number` | `1` | 跨越列数（仅 quilted 变体有效） |
| `rows` | `number` | `1` | 跨越行数（仅 quilted 变体有效） |
| `sx` | `SxProps<Theme>` | — | 额外样式 |
| `component` | `ElementType` | `'li'` | 渲染的 HTML 元素 |

### ImageListItemBar Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | — | 标题文本 |
| `subtitle` | `ReactNode` | — | 副标题文本 |
| `position` | `'top' \| 'bottom' \| 'below'` | `'bottom'` | 信息栏位置 |
| `actionIcon` | `ReactNode` | — | 右侧操作按钮 |
| `actionPosition` | `'left' \| 'right'` | `'right'` | 操作按钮位置 |
| `sx` | `SxProps<Theme>` | — | 额外样式 |

## 响应式用法

ImageList 的 `cols` 不直接支持断点对象，需通过 sx 或 JavaScript 实现响应式：

```tsx
import { useMediaQuery, useTheme } from '@mui/material';

const Gallery = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const cols = isSmall ? 2 : isMedium ? 3 : 4;

  return (
    <ImageList cols={cols} gap={8}>
      {items.map((item) => (
        <ImageListItem key={item.id}>
          <img src={item.url} alt={t(item.altKey)} loading="lazy" />
        </ImageListItem>
      ))}
    </ImageList>
  );
};
```

## 与 Foundation styles.ts 配合

```typescript
// AssetBrowser.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const assetBrowserStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.content,
      overflow: 'hidden',
    },
    imageList: {
      flex: 1,
      overflowY: 'auto',
      p: 2,
    },
    itemBar: {
      background: `linear-gradient(to top, ${fp.bg.base}CC 0%, transparent 100%)`,
    },
    selectedItem: {
      outline: `2px solid ${fp.accent}`,
      borderRadius: 1,
      overflow: 'hidden',
    },
  };
};
```

```tsx
import { Box, ImageList, ImageListItem, ImageListItemBar, useTheme } from '@mui/material';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { assetBrowserStyles } from './AssetBrowser.styles';

const AssetBrowser = () => {
  const theme = useTheme();
  const styles = assetBrowserStyles(theme);
  const { t } = useT();

  return (
    <Box sx={styles.root}>
      <ImageList cols={4} gap={8} sx={styles.imageList}>
        {assets.map((asset) => (
          <ImageListItem
            key={asset.id}
            sx={asset.selected ? styles.selectedItem : undefined}
          >
            <img src={asset.thumbnail} alt={t(asset.nameKey)} loading="lazy" />
            <ImageListItemBar
              title={t(asset.nameKey)}
              subtitle={asset.size}
              sx={styles.itemBar}
              actionIcon={
                asset.selected ? <CheckCircleRounded sx={{ color: fp.accent }} /> : undefined
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};
```

## 无障碍 (a11y)

1. **img 必须有 alt 属性**：所有 `<img>` 标签必须提供有意义的 `alt` 文本（走 `t()` 国际化）
2. **装饰性图片**：纯装饰图片使用 `alt=""`（空字符串，非省略）
3. **ImageList 语义**：默认渲染为 `<ul>` + `<li>`，屏幕阅读器可识别为列表
4. **操作按钮**：`actionIcon` 中的 IconButton 必须有 `aria-label`

```tsx
<ImageListItem>
  <img src={url} alt={t('gallery.photo.alt', { name: photo.name })} />
  <ImageListItemBar
    title={t(photo.titleKey)}
    actionIcon={
      <IconButton aria-label={t('gallery.action.details')}>
        <InfoRounded />
      </IconButton>
    }
  />
</ImageListItem>
```

## Foundation 约束

1. **图片 alt 必须走 i18n**：
   ```tsx
   // 错误
   <img alt="用户头像" />

   // 正确
   <img alt={t('avatar.alt')} />
   ```

2. **图标只用 *Rounded 系列**：
   ```tsx
   // 错误
   import Info from '@mui/icons-material/Info';

   // 正确
   import InfoRounded from '@mui/icons-material/InfoRounded';
   ```

3. **颜色取值**：ImageListItemBar 的渐变/背景色从 `theme.palette.foundation.*` 取：
   ```tsx
   // 错误
   sx={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}

   // 正确
   sx={{ background: `linear-gradient(to top, ${fp.bg.base}CC 0%, transparent 100%)` }}
   ```

4. **loading="lazy"**：所有非首屏图片必须加 `loading="lazy"` 延迟加载

5. **桌面应用场景**：Foundation 是桌面应用，ImageList 主要用于：
   - 本地文件/资源浏览器
   - 图片选择器（配合 NativeDialogs 打开文件）
   - 缩略图预览面板
   - 主题/壁纸选择网格

6. **不要用 ImageList 做通用网格布局**：如果内容不是图片，应使用 Grid 组件

7. **quilted 变体数据结构**：使用 quilted 时，数据项需包含 `cols` 和 `rows` 字段：
   ```typescript
   interface QuilledItem {
     id: string;
     url: string;
     altKey: string;
     cols: number; // 跨列数
     rows: number; // 跨行数
   }
   ```
