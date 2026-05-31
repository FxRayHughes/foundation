import { Box, useTheme } from '@mui/material';
import { Skeleton } from '@/components/Skeleton';
import { xProDemoStyles } from './XProDemoPage.styles';

export const XProDemoPageSkeleton = () => {
  const theme = useTheme();
  const styles = xProDemoStyles(theme);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.body}>
        <Skeleton variant="text" width={200} height={24} />
        <Skeleton variant="rect" width="100%" height={400} />
        <Box sx={styles.chartRow}>
          <Skeleton variant="rect" width="100%" height={200} />
          <Skeleton variant="rect" width="100%" height={200} />
          <Skeleton variant="rect" width="100%" height={200} />
        </Box>
      </Box>
    </Box>
  );
};
