import { Box, useTheme } from '@mui/material';
import { Skeleton, SkeletonText } from '@/components/Skeleton';
import { homePageStyles } from './HomePage.styles';

// HomePage 骨架屏：复刻真实页面的版式节奏，避免"骨架→真实"切换时布局抖动。
// 不包含任何文字 / aria-label 中文 —— 加载占位不消费 i18n。
export const HomePageSkeleton = () => {
  const theme = useTheme();
  const styles = homePageStyles(theme);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.body}>
        {/* eyebrow */}
        <Skeleton variant="text" width={140} height={12} />

        {/* hero */}
        <Skeleton variant="rect" width="60%" height={36} sx={{ borderRadius: 1 }} />

        {/* subtitle */}
        <SkeletonText lines={2} lineHeight={14} gap={10} lastLineWidth="80%" />

        {/* card */}
        <Box sx={styles.card}>
          <Skeleton variant="text" width={120} height={12} />
          <Skeleton variant="text" width="70%" height={14} />
          <Box sx={styles.form}>
            <Skeleton variant="rect" height={36} sx={{ flex: 1, borderRadius: 1 }} />
            <Skeleton variant="rect" width={88} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>

        {/* footer */}
        <Box sx={styles.footer}>
          <Skeleton variant="text" width={180} height={11} />
          <Skeleton variant="text" width={240} height={11} />
        </Box>
      </Box>
    </Box>
  );
};
