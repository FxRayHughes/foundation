import { Box, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { CSSProperties } from 'react';
import { skeletonStyles } from './Skeleton.styles';

// 三种基础形状，覆盖 80% 场景。
// 复杂版式（卡片 / 列表行）用多个 Skeleton 组合，View 层各自实现。
type Variant = 'rect' | 'text' | 'circle';

export interface SkeletonProps {
  variant?: Variant;            // 默认 'rect'
  width?: number | string;
  height?: number | string;
  // 透传 sx 让消费方覆盖位置 / 圆角等；不要用它改 backgroundColor，否则破坏主题适配
  sx?: SxProps<Theme>;
  // 透传 style 给原生 div（用于 width/height 的快速覆盖，避免 sx 重渲）
  style?: CSSProperties;
  // 自定义 className（如需调试）
  className?: string;
  ariaLabel?: string;
}

// 单个骨架占位块。
// - 颜色 / 动画走 theme.palette.foundation，自动跟随主题
// - aria-busy + role="status" 让屏幕阅读器宣告"加载中"
// - prefers-reduced-motion 时自动停止扫光
export const Skeleton = ({
  variant = 'rect',
  width,
  height,
  sx,
  style,
  className,
  ariaLabel,
}: SkeletonProps) => {
  const theme = useTheme();
  const styles = skeletonStyles(theme);

  const variantSx: SxProps<Theme> =
    variant === 'text' ? styles.text! : variant === 'circle' ? styles.circle! : styles.rect!;

  return (
    <Box
      role="status"
      aria-busy
      aria-label={ariaLabel ?? 'Loading'}
      className={className}
      sx={[styles.base!, variantSx, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}
      style={{
        width: width ?? '100%',
        height: height ?? (variant === 'text' ? 12 : variant === 'circle' ? 40 : 16),
        ...style,
      }}
    />
  );
};

// 一组文本骨架行：常用于段落 / 描述文案占位。
// 最后一行默认窄 60%，模拟自然换行的视觉。
export interface SkeletonTextProps {
  lines?: number;          // 默认 3
  lineHeight?: number;     // 单行高度 px，默认 12
  gap?: number;            // 行距 px，默认 8
  lastLineWidth?: string;  // 末行宽度，默认 '60%'
  width?: number | string;
  sx?: SxProps<Theme>;
}

export const SkeletonText = ({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastLineWidth = '60%',
  width,
  sx,
}: SkeletonTextProps) => {
  return (
    <Box sx={[{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: width ?? '100%' }, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1 && lines > 1;
        return (
          <Skeleton
            key={i}
            variant="text"
            height={lineHeight}
            width={isLast ? lastLineWidth : '100%'}
          />
        );
      })}
    </Box>
  );
};
