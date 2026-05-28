import { Box, IconButton, useTheme } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Remove';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';
import { useT } from '@/i18n';
import { useWindowControls } from './useWindowControls';
import { titleBarStyles } from './TitleBar.styles';

// 窗口三联按钮：方形圆角设计，等距间隔。
// 关闭键 hover 变红，最小化/最大化保持中性灰。
// 通过 --wails-draggable: no-drag 阻止拖拽穿透。
// aria-label 走 i18n（titleBar.controls.*），系统按钮不应硬编码语言。
export const WindowControls = () => {
  const theme = useTheme();
  const styles = titleBarStyles(theme);
  const t = useT();
  const { minimise, toggleMaximise, close } = useWindowControls();

  return (
    <Box sx={styles.controls} style={{ '--wails-draggable': 'no-drag' } as React.CSSProperties}>
      <IconButton
        size="small"
        onClick={minimise}
        sx={styles.controlBtn}
        aria-label={t('titleBar.controls.minimise')}
      >
        <MinimizeIcon fontSize="inherit" />
      </IconButton>
      <IconButton
        size="small"
        onClick={toggleMaximise}
        sx={styles.controlBtn}
        aria-label={t('titleBar.controls.maximise')}
      >
        <CropSquareIcon fontSize="inherit" />
      </IconButton>
      <IconButton
        size="small"
        onClick={close}
        sx={styles.closeBtn}
        aria-label={t('titleBar.controls.close')}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};
