import { Box, useTheme } from '@mui/material';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useT } from '@/i18n';
import { useBlankWindow } from './useBlankWindow';
import { blankWindowStyles } from './BlankWindow.styles';

export const BlankWindow = () => {
  const theme = useTheme();
  const styles = blankWindowStyles(theme);
  const t = useT();
  const { title } = useBlankWindow();

  const displayTitle = title || t('childwindow.blank.defaultTitle');

  return (
    <Box sx={styles.root}>
      <ChildTitleBar title={displayTitle} />
      <Box sx={styles.content}>
        {/* Template: extend with business content */}
      </Box>
    </Box>
  );
};
