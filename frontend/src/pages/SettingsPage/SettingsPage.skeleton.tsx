import { Box, useTheme } from '@mui/material';
import { Skeleton } from '@/components/Skeleton';
import { settingsPageStyles } from './SettingsPage.styles';

// SettingsPage 骨架屏：复刻两列布局（左列入口 + 右列主题/偏好/自定义三段）。
// 真实页面会替换骨架时不出现版式跳动。
export const SettingsPageSkeleton = () => {
  const theme = useTheme();
  const styles = settingsPageStyles(theme);

  return (
    <Box sx={styles.root}>
      {/* 左列 */}
      <Box sx={styles.list}>
        <Box sx={styles.listHeader}>
          <Skeleton variant="text" width={80} height={11} />
          <Skeleton variant="text" width={120} height={20} sx={{ mt: 0.5 }} />
        </Box>
        <Box sx={styles.listItems}>
          {[0, 1].map((i) => (
            <Box
              key={i}
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Skeleton variant="text" width={90} height={14} />
              <Skeleton variant="text" width="70%" height={11} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* 右列 */}
      <Box sx={styles.detail}>
        {/* header */}
        <Box sx={styles.detailHeader}>
          <Skeleton variant="text" width={80} height={11} />
          <Skeleton variant="rect" width={220} height={28} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="60%" height={14} />
        </Box>

        {/* 主题分组：标题 + 描述 + 卡片网格 */}
        <Box sx={styles.section}>
          <Skeleton variant="text" width={64} height={14} />
          <Skeleton variant="text" width="80%" height={12} />
          <Box sx={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rect"
                height={64}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Box>
        </Box>

        {/* 显示偏好分组：两行 switch row */}
        <Box sx={styles.section}>
          <Skeleton variant="text" width={96} height={14} />
          {[0, 1].map((i) => (
            <Skeleton
              key={i}
              variant="rect"
              height={64}
              sx={{ borderRadius: 1.5 }}
            />
          ))}
        </Box>

        {/* 自定义主题分组：工具栏 + 调色板网格 */}
        <Box sx={styles.section}>
          <Skeleton variant="text" width={96} height={14} />
          <Box sx={styles.paletteToolbar}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rect"
                width={120}
                height={28}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
          <Box sx={styles.paletteGrid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                variant="rect"
                height={68}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
