# Dialog / DialogTitle / DialogContent / DialogActions

## Import

```tsx
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
```

或命名导入：

```tsx
import {
  Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
```

## ⚠️ 场景分界（最重要）

```
简单确认 "确定要删除吗？"        → NativeDialogs.confirm(...)
错误提示 "操作失败"              → NativeDialogs.error(...)
警告提示 "数据将丢失"            → NativeDialogs.warning(...)
信息提示 "操作完成"              → NativeDialogs.info(...)

复杂表单（多字段输入）            → MUI Dialog ✓
多步向导（步骤切换）              → MUI Dialog ✓
内容预览（富文本/图片/代码）      → MUI Dialog ✓
自定义 UI（进度/列表/树形选择）   → MUI Dialog ✓
```

## 基础用法（Foundation 模式 — 表单对话框）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useT } from '@/i18n';
import { dialogStyles } from './CreateProject.styles';

function CreateProjectDialog({ open, onClose }) {
  const theme = useTheme();
  const t = useT();
  const styles = dialogStyles(theme);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // 提交逻辑
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('project.create.title')}</DialogTitle>
      <DialogContent sx={styles.content}>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label={t('project.create.nameLabel')}
          placeholder={t('project.create.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

样式工厂：

```tsx
// CreateProject.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const dialogStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    content: {
      backgroundColor: fp.bg.surface,
      pt: 2,
    },
  };
};
```

## 所有尺寸 (maxWidth)

| maxWidth | 宽度 | 适用场景 |
|----------|------|----------|
| `'xs'` | 444px | 简短确认（但 Foundation 优先用 NativeDialogs） |
| `'sm'` | 600px | 单字段表单、简单选择 |
| `'md'` | 900px | 多字段表单、内容预览 |
| `'lg'` | 1200px | 复杂向导、大表格 |
| `'xl'` | 1536px | 全屏级内容 |
| `false` | 自适应 | 内容决定宽度 |

```tsx
<Dialog open={open} maxWidth="md" fullWidth>
  {/* 900px 宽的对话框 */}
</Dialog>
```

## 全屏对话框

```tsx
import useMediaQuery from '@mui/material/useMediaQuery';

function ResponsiveDialog({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const t = useT();

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen}>
      <DialogTitle>{t('dialog.preview.title')}</DialogTitle>
      <DialogContent>
        {/* 内容 */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
```

## 多步向导对话框

```tsx
function WizardDialog({ open, onClose }) {
  const [step, setStep] = useState(0);
  const t = useT();

  const steps = [
    t('wizard.step1'),
    t('wizard.step2'),
    t('wizard.step3'),
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{steps[step]}</DialogTitle>
      <DialogContent>
        {step === 0 && <StepOne />}
        {step === 1 && <StepTwo />}
        {step === 2 && <StepThree />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        {step > 0 && (
          <Button onClick={() => setStep(s => s - 1)}>
            {t('common.back')}
          </Button>
        )}
        {step < 2 ? (
          <Button variant="contained" onClick={() => setStep(s => s + 1)}>
            {t('common.next')}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleFinish}>
            {t('common.finish')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

## 可滚动内容

`DialogContent` 默认支持滚动。当内容较长时自动出现滚动条：

```tsx
<Dialog open={open} maxWidth="sm" fullWidth scroll="paper">
  <DialogTitle>{t('dialog.longContent.title')}</DialogTitle>
  <DialogContent dividers>
    {/* 长内容自动滚动，dividers 添加上下分割线 */}
    <DialogContentText>{t('dialog.longContent.body')}</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>{t('common.ok')}</Button>
  </DialogActions>
</Dialog>
```

`scroll` prop：
- `'paper'`（默认）：Dialog 纸片内滚动，标题和操作固定
- `'body'`：整个 Dialog 随 body 滚动

## 过渡动画

```tsx
import Slide from '@mui/material/Slide';
import { forwardRef } from 'react';

const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

<Dialog open={open} TransitionComponent={SlideTransition}>
  {/* ... */}
</Dialog>
```

## Props 完整参考

### Dialog

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| open | `boolean` | — | **必填**，是否显示 |
| onClose | `(event, reason) => void` | — | 关闭回调，reason: 'backdropClick' \| 'escapeKeyDown' |
| maxWidth | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|false` | `'sm'` | 最大宽度 |
| fullWidth | `boolean` | `false` | 是否撑满 maxWidth |
| fullScreen | `boolean` | `false` | 全屏模式 |
| scroll | `'body' \| 'paper'` | `'paper'` | 滚动行为 |
| TransitionComponent | `Component` | `Fade` | 过渡动画 |
| transitionDuration | `number \| { enter, exit }` | — | 过渡时长 |
| disableEscapeKeyDown | `boolean` | `false` | 禁用 Esc 关闭 |
| keepMounted | `boolean` | `false` | 关闭时保留 DOM |
| PaperComponent | `Component` | `Paper` | 对话框容器组件 |
| PaperProps | `object` | — | Paper 的 props |
| slots | `{ backdrop, paper, transition }` | — | 自定义插槽 |
| slotProps | `{ backdrop, paper, transition }` | — | 插槽 props |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### DialogTitle

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| children | `ReactNode` | — | 标题内容 |
| sx | `SxProps<Theme>` | — | 样式 |

## 无障碍 (a11y)

- Dialog 自动设置 `role="dialog"` 和 `aria-modal="true"`
- `DialogTitle` 自动关联 `aria-labelledby`
- `DialogContentText` 自动关联 `aria-describedby`
- 打开时焦点自动移入 Dialog，关闭时焦点返回触发元素
- 确保 Dialog 内有可聚焦元素（按钮或输入框）

```tsx
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">{t('dialog.title')}</DialogTitle>
  <DialogContent>
    <DialogContentText id="dialog-description">
      {t('dialog.description')}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>{t('common.cancel')}</Button>
    <Button onClick={handleConfirm} autoFocus>
      {t('common.confirm')}
    </Button>
  </DialogActions>
</Dialog>
```

## Foundation 约束

⚠️ **对话框铁律**：简单确认/警告/错误/信息提示 **必须** 走 `NativeDialogs`（`confirm`/`info`/`warning`/`error`）。MUI Dialog 仅用于需要自定义 UI 的复杂场景（表单、向导、预览）。

⚠️ **配色**：Dialog Paper 背景不要硬编码，使用 `fp.bg.surface` 或 `fp.bg.elevated`。

⚠️ **i18n**：DialogTitle、DialogContentText、Button 文字、TextField label/placeholder 全部走 `t('key')`。

⚠️ **圆角**：Dialog Paper 圆角由主题统一（8px），不要在 sx 中覆盖。

⚠️ **关闭行为**：表单 Dialog 应在 `onClose` 中检查 reason，防止误触 backdrop 丢失数据：

```tsx
const handleClose = (event, reason) => {
  if (reason === 'backdropClick' && hasUnsavedChanges) return;
  onClose();
};
```

⚠️ **调用链**：Dialog 的提交逻辑应通过 ViewModel hook 调用 services/，不要在 Dialog 组件内直接 import @bindings/*。

### DialogContent

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| dividers | `boolean` | `false` | 上下分割线 |
| children | `ReactNode` | — | 内容 |
| sx | `SxProps<Theme>` | — | 样式 |

## 无障碍 (a11y)

- Dialog 自动设置 `role="dialog"` 和 `aria-modal="true"`
- `DialogTitle` 自动关联 `aria-labelledby`
- `DialogContentText` 自动关联 `aria-describedby`
- 打开时焦点自动移入 Dialog，关闭时焦点返回触发元素
- 确保 Dialog 内有可聚焦元素（按钮或输入框）

```tsx
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">{t('dialog.title')}</DialogTitle>
  <DialogContent>
    <DialogContentText id="dialog-description">
      {t('dialog.description')}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>{t('common.cancel')}</Button>
    <Button onClick={handleConfirm} autoFocus>
      {t('common.confirm')}
    </Button>
  </DialogActions>
</Dialog>
```

## Foundation 约束

⚠️ **对话框铁律**：简单确认/警告/错误/信息提示 **必须** 走 `NativeDialogs`（`confirm`/`info`/`warning`/`error`）。MUI Dialog 仅用于需要自定义 UI 的复杂场景（表单、向导、预览）。

⚠️ **配色**：Dialog Paper 背景不要硬编码，使用 `fp.bg.surface` 或 `fp.bg.elevated`。

⚠️ **i18n**：DialogTitle、DialogContentText、Button 文字、TextField label/placeholder 全部走 `t('key')`。

⚠️ **圆角**：Dialog Paper 圆角由主题统一（8px），不要在 sx 中覆盖。

⚠️ **关闭行为**：表单 Dialog 应在 `onClose` 中检查 reason，防止误触 backdrop 丢失数据：

```tsx
const handleClose = (event, reason) => {
  if (reason === 'backdropClick' && hasUnsavedChanges) return;
  onClose();
};
```

⚠️ **调用链**：Dialog 的提交逻辑应通过 ViewModel hook 调用 services/，不要在 Dialog 组件内直接 import @bindings/*。

### DialogActions

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| disableSpacing | `boolean` | `false` | 移除按钮间距 |
| children | `ReactNode` | — | 操作按钮 |
| sx | `SxProps<Theme>` | — | 样式 |

## 无障碍 (a11y)

- Dialog 自动设置 `role="dialog"` 和 `aria-modal="true"`
- `DialogTitle` 自动关联 `aria-labelledby`
- `DialogContentText` 自动关联 `aria-describedby`
- 打开时焦点自动移入 Dialog，关闭时焦点返回触发元素
- 确保 Dialog 内有可聚焦元素（按钮或输入框）

```tsx
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">{t('dialog.title')}</DialogTitle>
  <DialogContent>
    <DialogContentText id="dialog-description">
      {t('dialog.description')}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>{t('common.cancel')}</Button>
    <Button onClick={handleConfirm} autoFocus>
      {t('common.confirm')}
    </Button>
  </DialogActions>
</Dialog>
```

## Foundation 约束

⚠️ **对话框铁律**：简单确认/警告/错误/信息提示 **必须** 走 `NativeDialogs`（`confirm`/`info`/`warning`/`error`）。MUI Dialog 仅用于需要自定义 UI 的复杂场景（表单、向导、预览）。

⚠️ **配色**：Dialog Paper 背景不要硬编码，使用 `fp.bg.surface` 或 `fp.bg.elevated`。

⚠️ **i18n**：DialogTitle、DialogContentText、Button 文字、TextField label/placeholder 全部走 `t('key')`。

⚠️ **圆角**：Dialog Paper 圆角由主题统一（8px），不要在 sx 中覆盖。

⚠️ **关闭行为**：表单 Dialog 应在 `onClose` 中检查 reason，防止误触 backdrop 丢失数据：

```tsx
const handleClose = (event, reason) => {
  if (reason === 'backdropClick' && hasUnsavedChanges) return;
  onClose();
};
```

⚠️ **调用链**：Dialog 的提交逻辑应通过 ViewModel hook 调用 services/，不要在 Dialog 组件内直接 import @bindings/*。
