import { Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { isMac } from '@/shared/platform';
import { WindowControls } from './WindowControls';
import { titleBarStyles } from './TitleBar.styles';

export interface TitleBarProps {
  // 可选：覆盖默认标题（默认从 i18n 取 app.title）
  title?: string;
}

// 自绘标题栏：
// - Windows / Linux：完整自绘（拖拽区 + 标题 + 右侧三联按钮）
// - macOS：保留系统红绿灯，只画标题与拖拽区，按钮区域留空
export const TitleBar = ({ title }: TitleBarProps) => {
  const theme = useTheme();
  const styles = titleBarStyles(theme);
  const t = useT();
  const displayTitle = title ?? t('app.title');

  return (
    <Box sx={styles.root} style={{ '--wails-draggable': 'drag' } as React.CSSProperties}>
      {isMac && <Box sx={styles.macSpacer} />}
      <Typography variant="caption" sx={styles.title}>
        {displayTitle}
      </Typography>
      <Box sx={styles.spacer} />
      {!isMac && <WindowControls />}
    </Box>
  );
};
