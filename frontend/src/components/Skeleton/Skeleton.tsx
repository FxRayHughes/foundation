import clsx from 'clsx';
import type { CSSProperties } from 'react';
import classes from './Skeleton.module.css';

// 三种基础形状，覆盖 80% 场景。
// 复杂版式（卡片 / 列表行）用多个 Skeleton 组合，View 层各自实现。
type Variant = 'rect' | 'text' | 'circle';

export interface SkeletonProps {
  variant?: Variant;            // 默认 'rect'
  width?: number | string;
  height?: number | string;
  // 透传 style 给原生 div：覆盖尺寸 / 位置 / 圆角（如 { flex: 1, borderRadius: 4, marginTop: 4 }）。
  // 不要用它改 background，否则破坏主题适配。
  style?: CSSProperties;
  // 自定义 className（CSS Modules 覆盖用）
  className?: string;
  ariaLabel?: string;
}

const variantClass: Record<Variant, string | undefined> = {
  rect: classes.rect,
  text: classes.text,
  circle: classes.circle,
};

// 单个骨架占位块。
// - 颜色 / 动画走 --fd-* 变量，自动跟随主题
// - aria-busy + role="status" 让屏幕阅读器宣告"加载中"
// - prefers-reduced-motion 时自动停止扫光
export const Skeleton = ({
  variant = 'rect',
  width,
  height,
  style,
  className,
  ariaLabel,
}: SkeletonProps) => {
  return (
    <div
      role="status"
      aria-busy
      aria-label={ariaLabel ?? 'Loading'}
      className={clsx(classes.base, variantClass[variant], className)}
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
  style?: CSSProperties;
  className?: string;
}

export const SkeletonText = ({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastLineWidth = '60%',
  width,
  style,
  className,
}: SkeletonTextProps) => {
  return (
    <div
      className={clsx(classes.textGroup, className)}
      style={{ gap: `${gap}px`, width: width ?? '100%', ...style }}
    >
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
    </div>
  );
};
