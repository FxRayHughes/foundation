# Menu 菜单

## Import

```tsx
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
```

## 基础用法（Foundation 模式）

```tsx
import { useState, type MouseEvent } from 'react';
import { useTheme } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useT } from '@/i18n';
import { menuStyles } from './ActionMenu.styles';

export const ActionMenu = () => {
  const theme = useTheme();
  const styles = menuStyles(theme);
  const { t } = useT();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} aria-label={t('menu.more')}>
        <MoreVertRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={styles.menu}>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('menu.edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('menu.copy')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose} sx={styles.danger}>
          <ListItemIcon><DeleteRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('menu.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
```

**styles.ts 工厂：**

```tsx
// ActionMenu.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const menuStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    menu: {
      '& .MuiPaper-root': {
        backgroundColor: fp.bg.elevated,
        borderRadius: 2,
        minWidth: 180,
      },
      '& .MuiMenuItem-root': {
        color: fp.text.primary,
        '&:hover': { backgroundColor: fp.bg.hover },
      },
    },
    danger: {
      color: fp.status.danger,
      '& .MuiListItemIcon-root': { color: fp.status.danger },
    },
  };
};
```

## 所有 Variants

### 基本 Menu（锚点定位）

```tsx
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const open = Boolean(anchorEl);

<Button onClick={(e) => setAnchorEl(e.currentTarget)}>{t('menu.open')}</Button>
<Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
  <MenuItem onClick={handleClose}>{t('menu.item1')}</MenuItem>
  <MenuItem onClick={handleClose}>{t('menu.item2')}</MenuItem>
</Menu>
```

### 右键菜单（Context Menu）

```tsx
const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
};

<Box onContextMenu={handleContextMenu} sx={{ cursor: 'context-menu' }}>
  {/* 内容区域 */}
</Box>
<Menu
  open={contextMenu !== null}
  onClose={() => setContextMenu(null)}
  anchorReference="anchorPosition"
  anchorPosition={
    contextMenu !== null
      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
      : undefined
  }
>
  <MenuItem>{t('menu.cut')}</MenuItem>
  <MenuItem>{t('menu.copy')}</MenuItem>
  <MenuItem>{t('menu.paste')}</MenuItem>
</Menu>
```

### 带图标和快捷键的 MenuItem

```tsx
<MenuItem onClick={handleClose}>
  <ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>
  <ListItemText>{t('menu.copy')}</ListItemText>
  <Typography variant="body2" sx={{ color: fp.text.muted, ml: 2 }}>
    Ctrl+C
  </Typography>
</MenuItem>
```

### 嵌套菜单（子菜单）

```tsx
const [subAnchor, setSubAnchor] = useState<null | HTMLElement>(null);

<MenuItem onMouseEnter={(e) => setSubAnchor(e.currentTarget)}>
  <ListItemText>{t('menu.more')}</ListItemText>
  <ChevronRightRoundedIcon fontSize="small" />
</MenuItem>
<Menu
  anchorEl={subAnchor}
  open={Boolean(subAnchor)}
  onClose={() => setSubAnchor(null)}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
>
  <MenuItem>{t('menu.subItem1')}</MenuItem>
  <MenuItem>{t('menu.subItem2')}</MenuItem>
</Menu>
```

### 带 Divider 分组

```tsx
<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
  <MenuItem>{t('menu.profile')}</MenuItem>
  <MenuItem>{t('menu.account')}</MenuItem>
  <Divider />
  <MenuItem>{t('menu.logout')}</MenuItem>
</Menu>
```

### 密集模式

```tsx
<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
  <MenuList dense>
    <MenuItem>{t('menu.item1')}</MenuItem>
    <MenuItem>{t('menu.item2')}</MenuItem>
    <MenuItem>{t('menu.item3')}</MenuItem>
  </MenuList>
</Menu>
```

### 选中状态

```tsx
<MenuItem selected={currentItem === 'option1'} onClick={() => handleSelect('option1')}>
  {t('menu.option1')}
</MenuItem>
```

## Props 完整参考

### Menu（继承 Popover 所有 props）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `anchorEl` | `HTMLElement \| null` | — | 锚点元素 |
| `open` | `boolean` | `false` | 是否打开 |
| `onClose` | `(event, reason) => void` | — | 关闭回调 |
| `anchorOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | 锚点对齐原点 |
| `transformOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | 弹出层变换原点 |
| `anchorReference` | `'anchorEl' \| 'anchorPosition' \| 'none'` | `'anchorEl'` | 定位参考 |
| `anchorPosition` | `{ top: number, left: number }` | — | 绝对定位坐标 |
| `autoFocus` | `boolean` | `true` | 打开时自动聚焦 |
| `disableAutoFocusItem` | `boolean` | `false` | 禁用自动聚焦第一项 |
| `MenuListProps` | `object` | — | 传递给 MenuList 的 props |
| `variant` | `'menu' \| 'selectedMenu'` | `'selectedMenu'` | 菜单变体 |
| `transitionDuration` | `number \| { enter, exit } \| 'auto'` | `'auto'` | 过渡时长 |
| `slots` | `{ paper, transition }` | — | 自定义 slot 组件 |
| `slotProps` | `object` | — | 传递给 slot 的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### MenuItem（继承 ListItemButton）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `selected` | `boolean` | `false` | 选中状态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `dense` | `boolean` | `false` | 紧凑模式 |
| `disableGutters` | `boolean` | `false` | 移除左右内边距 |
| `divider` | `boolean` | `false` | 底部分割线 |
| `component` | `elementType` | `'li'` | 根元素类型 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### MenuList（继承 List）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoFocus` | `boolean` | `false` | 自动聚焦 |
| `autoFocusItem` | `boolean` | `false` | 自动聚焦第一项 |
| `dense` | `boolean` | `false` | 紧凑模式 |
| `disableListWrap` | `boolean` | `false` | 禁用键盘循环 |
| `variant` | `'menu' \| 'selectedMenu'` | `'selectedMenu'` | 变体 |

## 受控 / 非受控

Menu **始终是受控组件**——必须通过 `open` + `anchorEl` 控制：

```tsx
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const open = Boolean(anchorEl);

// 打开
const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
// 关闭
const handleClose = () => setAnchorEl(null);
```

## 无障碍 (a11y)

- Menu 内部使用 `role="menu"`，MenuItem 使用 `role="menuitem"`
- 打开时焦点自动移入菜单，关闭时焦点返回触发元素
- 方向键上下移动焦点，Enter/Space 选中，Esc 关闭
- 触发按钮应设置 `aria-haspopup="true"` + `aria-expanded={open}`
- 触发按钮需要 `aria-label` 或可见文字

```tsx
<IconButton
  onClick={handleOpen}
  aria-label={t('menu.openActions')}
  aria-haspopup="true"
  aria-expanded={open}
>
  <MoreVertRoundedIcon />
</IconButton>
```

## Foundation 约束

⚠️ **本项目特有约束：**

1. **配色**：Paper 背景用 `fp.bg.elevated`，文字用 `fp.text.primary`，悬停用 `fp.bg.hover`，危险操作用 `fp.status.danger`
2. **圆角**：Menu Paper 用 `borderRadius: 2`（8px）
3. **图标**：MenuItem 图标只用 `*Rounded` 系列，`fontSize="small"`
4. **i18n**：所有 MenuItem 文字、`aria-label` 走 `t('key')`
5. **分组**：用 `<Divider />` 分隔不同操作组（如编辑组 / 危险操作组）
6. **危险操作**：删除等破坏性操作放最后，用 `fp.status.danger` 标红
7. **样式**：复杂菜单样式抽到 `styles.ts` 工厂函数
