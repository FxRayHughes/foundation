# Stepper 步骤条

## Import

```tsx
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import StepButton from '@mui/material/StepButton';
import StepConnector from '@mui/material/StepConnector';
import MobileStepper from '@mui/material/MobileStepper';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useT } from '@/i18n';
import { stepperStyles } from './SetupWizard.styles';

export const SetupWizard = () => {
  const theme = useTheme();
  const styles = stepperStyles(theme);
  const { t } = useT();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { labelKey: 'wizard.step1' },
    { labelKey: 'wizard.step2' },
    { labelKey: 'wizard.step3' },
  ];

  return (
    <Box sx={styles.root}>
      <Stepper activeStep={activeStep} sx={styles.stepper}>
        {steps.map((step) => (
          <Step key={step.labelKey}>
            <StepLabel>{t(step.labelKey)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={styles.content}>
        {/* 步骤内容 */}
      </Box>
      <Box sx={styles.actions}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>
          {t('wizard.back')}
        </Button>
        <Button variant="contained" onClick={() => setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? t('wizard.finish') : t('wizard.next')}
        </Button>
      </Box>
    </Box>
  );
};
```

**styles.ts 工厂：**

```tsx
// SetupWizard.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const stepperStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: { p: 3 },
    stepper: {
      '& .MuiStepIcon-root': {
        color: fp.text.muted,
        '&.Mui-active': { color: fp.accent },
        '&.Mui-completed': { color: fp.status.success },
      },
      '& .MuiStepLabel-label': {
        color: fp.text.secondary,
        '&.Mui-active': { color: fp.text.primary, fontWeight: 600 },
        '&.Mui-completed': { color: fp.text.primary },
      },
      '& .MuiStepConnector-line': {
        borderColor: fp.divider,
      },
    },
    content: { mt: 3, mb: 3 },
    actions: { display: 'flex', justifyContent: 'space-between' },
  };
};
```

## 所有 Variants

### 水平步骤条（默认）

```tsx
<Stepper activeStep={activeStep}>
  <Step><StepLabel>{t('step.first')}</StepLabel></Step>
  <Step><StepLabel>{t('step.second')}</StepLabel></Step>
  <Step><StepLabel>{t('step.third')}</StepLabel></Step>
</Stepper>
```

### 垂直步骤条（带内容）

```tsx
<Stepper activeStep={activeStep} orientation="vertical">
  {steps.map((step, index) => (
    <Step key={step.labelKey}>
      <StepLabel>{t(step.labelKey)}</StepLabel>
      <StepContent>
        <Box sx={{ mb: 2 }}>{step.content}</Box>
        <Box>
          <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
            {index === steps.length - 1 ? t('wizard.finish') : t('wizard.continue')}
          </Button>
          <Button disabled={index === 0} onClick={handleBack}>
            {t('wizard.back')}
          </Button>
        </Box>
      </StepContent>
    </Step>
  ))}
</Stepper>
```

### 非线性步骤条（可点击跳转）

```tsx
<Stepper nonLinear activeStep={activeStep}>
  {steps.map((step, index) => (
    <Step key={step.labelKey} completed={completed.has(index)}>
      <StepButton onClick={() => setActiveStep(index)}>
        {t(step.labelKey)}
      </StepButton>
    </Step>
  ))}
</Stepper>
```

### 可选步骤

```tsx
<Step>
  <StepLabel optional={<Typography variant="caption">{t('wizard.optional')}</Typography>}>
    {t('step.second')}
  </StepLabel>
</Step>
```

### 错误状态

```tsx
<Step>
  <StepLabel error>{t('step.withError')}</StepLabel>
</Step>
```

### 替代标签位置（标签在图标下方）

```tsx
<Stepper activeStep={activeStep} alternativeLabel>
  {steps.map((step) => (
    <Step key={step.labelKey}>
      <StepLabel>{t(step.labelKey)}</StepLabel>
    </Step>
  ))}
</Stepper>
```

### 自定义图标

```tsx
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const CustomStepIcon = ({ active, completed, icon }: StepIconProps) => {
  const icons: Record<string, React.ReactElement> = {
    1: <SettingsRoundedIcon />,
    2: <GroupRoundedIcon />,
    3: <CheckCircleRoundedIcon />,
  };
  return (
    <Box sx={{ color: active ? fp.accent : completed ? fp.status.success : fp.text.muted }}>
      {icons[String(icon)]}
    </Box>
  );
};

<StepLabel StepIconComponent={CustomStepIcon}>{t('step.label')}</StepLabel>
```

### MobileStepper（进度条/点状步骤）

```tsx
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

<MobileStepper
  variant="dots"
  steps={6}
  position="static"
  activeStep={activeStep}
  nextButton={
    <Button size="small" onClick={handleNext} disabled={activeStep === 5}>
      {t('wizard.next')} <KeyboardArrowRightRoundedIcon />
    </Button>
  }
  backButton={
    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
      <KeyboardArrowLeftRoundedIcon /> {t('wizard.back')}
    </Button>
  }
/>
```

MobileStepper variant 选项：
- `dots`：点状指示器
- `progress`：进度条
- `text`：文字（如 "3/6"）

## Props 完整参考

### Stepper

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activeStep` | `number` | `0` | 当前活跃步骤索引 |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `nonLinear` | `boolean` | `false` | 非线性模式（允许跳步） |
| `alternativeLabel` | `boolean` | `false` | 标签在图标下方 |
| `connector` | `ReactElement \| null` | `<StepConnector />` | 自定义连接器 |
| `children` | `node` | — | Step 子元素 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### Step

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | `boolean` | — | 是否活跃（自动由 Stepper 管理） |
| `completed` | `boolean` | — | 是否已完成 |
| `disabled` | `boolean` | `false` | 禁用 |
| `expanded` | `boolean` | `false` | StepContent 展开 |
| `index` | `number` | — | 索引（自动注入） |
| `last` | `boolean` | — | 是否最后一步 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### StepLabel

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `node` | — | 标签文字 |
| `error` | `boolean` | `false` | 错误状态 |
| `icon` | `node` | — | 自定义图标 |
| `optional` | `node` | — | 可选说明文字 |
| `StepIconComponent` | `elementType` | — | 自定义步骤图标组件 |
| `StepIconProps` | `object` | — | 传递给步骤图标的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### StepContent（仅垂直步骤条）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `node` | — | 内容 |
| `TransitionComponent` | `elementType` | `Collapse` | 过渡组件 |
| `transitionDuration` | `number \| { enter, exit } \| 'auto'` | `'auto'` | 过渡时长 |
| `TransitionProps` | `object` | — | 传递给过渡组件的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### StepButton（非线性步骤条中可点击的步骤）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `node` | — | 按钮文字 |
| `icon` | `node` | — | 自定义图标 |
| `optional` | `node` | — | 可选说明 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### MobileStepper

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activeStep` | `number` | `0` | 当前步骤 |
| `steps` | `number` | **必填** | 总步数 |
| `variant` | `'dots' \| 'progress' \| 'text'` | `'dots'` | 指示器类型 |
| `position` | `'bottom' \| 'top' \| 'static'` | `'bottom'` | 定位方式 |
| `nextButton` | `node` | — | 下一步按钮 |
| `backButton` | `node` | — | 上一步按钮 |
| `LinearProgressProps` | `object` | — | 传递给进度条的 props |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

Stepper **始终是受控组件**——通过 `activeStep` 控制当前步骤：

```tsx
const [activeStep, setActiveStep] = useState(0);
const handleNext = () => setActiveStep(s => s + 1);
const handleBack = () => setActiveStep(s => s - 1);
const handleReset = () => setActiveStep(0);
```

## 无障碍 (a11y)

- Stepper 无内置 ARIA role，建议外层加 `aria-label`
- StepLabel 通过视觉状态（颜色、图标）表达进度
- 非线性 StepButton 可键盘聚焦和点击
- MobileStepper 的 nextButton/backButton 需要 `aria-label`
- 建议为步骤区域添加 `aria-live="polite"` 以通知屏幕阅读器步骤变化

## Foundation 约束

⚠️ **本项目特有约束：**

1. **配色**：活跃步骤图标 `fp.accent`，已完成 `fp.status.success`，未完成 `fp.text.muted`，连接线 `fp.divider`
2. **圆角**：步骤图标保持圆形（默认），不修改
3. **图标**：自定义步骤图标只用 `*Rounded` 系列
4. **i18n**：所有步骤标签、按钮文字走 `t('key')`
5. **样式**：复杂步骤条样式抽到 `styles.ts` 工厂函数
6. **场景选择**：简单线性流程用水平 Stepper；复杂带内容的用垂直 Stepper + StepContent；移动端/紧凑空间用 MobileStepper
