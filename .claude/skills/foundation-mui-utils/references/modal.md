# Modal

底层弹层容器，为 Dialog / Drawer / Menu / Popover 提供基础能力。Foundation 中**简单确认走 NativeDialogs**，Modal 仅用于需要自定义 UI 的复杂弹层。

## Import

```tsx
import Modal from '@mui/material/Modal';
```

## 基础用法（Foundation 模式）

```tsx
// CustomModal.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const customModalStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: fp.bg.surface,
      borderRadius: 2, // 8px
      p: 4,
      outline: 0,
      minWidth: 400,
    },
    title: { color: fp.text.primary, fontWeight: 600, mb: 2 },
    body: { color: fp.text.secondary },
  };
};
```

```tsx
// CustomModal.tsx
import { Modal, Box, Typography, useTheme } from '@mui/material';
import { customModalStyles } from './CustomModal.styles';
import { useT } from '@/i18n';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
}

export const CustomModal = ({ open, onClose }: CustomModalProps) => {
  const theme = useTheme();
  const styles = customModalStyles(theme);
  const { t } = useT();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box sx={styles.content}>
        <Typography id="custom-modal-title" variant="h6" sx={styles.title}>
          {t('modal.title')}
        </Typography>
        <Typography id="custom-modal-description" sx={styles.body}>
          {t('modal.description')}
        </Typography>
      </Box>
    </Modal>
  );
};
```

## 所有 Props / 变体

### 基础 Modal

最简用法，`open` + `onClose` + 子节点：

```tsx
<Modal open={open} onClose={handleClose}>
  <Box sx={styles.content}>{/* 内容 */}</Box>
</Modal>
```

### 保持挂载（keepMounted）

用于需要 SEO 或避免重复初始化的场景：

```tsx
<Modal open={open} onClose={handleClose} keepMounted>
  <Box sx={styles.content}>{/* 昂贵的组件树 */}</Box>
</Modal>
```

### 嵌套 Modal

支持嵌套，但建议最多两层。嵌套时内层用 `hideBackdrop`：

```tsx
<Modal open={outerOpen} onClose={handleOuterClose}>
  <Box sx={styles.content}>
    <Modal open={innerOpen} onClose={handleInnerClose} hideBackdrop>
      <Box sx={styles.content}>{/* 内层内容 */}</Box>
    </Modal>
  </Box>
</Modal>
```

### 带过渡动画

配合 Fade / Grow / Slide 使用：

```tsx
import Fade from '@mui/material/Fade';

<Modal open={open} onClose={handleClose} closeAfterTransition>
  <Fade in={open}>
    <Box sx={styles.content}>{t('modal.animated')}</Box>
  </Fade>
</Modal>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | — | **必填**。控制 Modal 是否可见 |
| `children` | `ReactElement` | — | **必填**。单个子元素 |
| `onClose` | `(event, reason) => void` | — | 关闭回调。reason: `'backdropClick'` \| `'escapeKeyDown'` |
| `keepMounted` | `boolean` | `false` | 关闭后保持子节点在 DOM 中 |
| `hideBackdrop` | `boolean` | `false` | 隐藏背景遮罩 |
| `disableEscapeKeyDown` | `boolean` | `false` | 禁用 Escape 键关闭 |
| `disableAutoFocus` | `boolean` | `false` | 禁止打开时自动聚焦 |
| `disableEnforceFocus` | `boolean` | `false` | 禁止强制焦点陷阱 |
| `disableRestoreFocus` | `boolean` | `false` | 关闭后不恢复之前的焦点 |
| `disablePortal` | `boolean` | `false` | 不使用 Portal |
| `disableScrollLock` | `boolean` | `false` | 不锁定页面滚动 |
| `closeAfterTransition` | `boolean` | `false` | 等待过渡动画结束后再关闭 |
| `container` | `HTMLElement \| (() => HTMLElement)` | `document.body` | Portal 挂载容器 |
| `slots.backdrop` | `elementType` | `Backdrop` | 自定义 Backdrop 组件 |
| `slotProps.backdrop` | `object` | `{}` | 传给 Backdrop 的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- **必须**添加 `aria-labelledby` 指向 Modal 标题元素的 id
- **建议**添加 `aria-describedby` 指向描述内容的 id
- Modal 自动添加 `role="presentation"` 到根元素
- 焦点陷阱：打开后焦点自动移入，关闭后恢复原位

```tsx
<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <Box sx={styles.content}>
    <h2 id="modal-title">{t('modal.title')}</h2>
    <p id="modal-desc">{t('modal.description')}</p>
  </Box>
</Modal>
```

## Foundation 约束

1. **简单确认/警告** → `NativeDialogs.confirm()` / `.error()`，**禁止**用 Modal
2. **复杂自定义弹层**（表单、预览、多步向导）→ 可用 Modal 或 Dialog
3. 弹层容器 `borderRadius: 2`（8px）
4. 背景色 `fp.bg.surface`，文字 `fp.text.primary` / `fp.text.secondary`
5. 所有文案走 `t('key')`
6. 样式抽到 `styles.ts` 工厂函数
7. `outline: 0` 仅在 Modal 内容根节点使用
