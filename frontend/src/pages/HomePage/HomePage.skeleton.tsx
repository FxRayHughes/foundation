import { Skeleton, SkeletonText } from '@/components/Skeleton';
import classes from './HomePage.module.css';

// HomePage 骨架屏：复刻真实页面的版式节奏（头部 + 仪表盘网格 + 页脚），
// 避免"骨架→真实"切换时布局抖动。HomePage 同步加载，可直接复用 HomePage.module.css。
// 不包含任何文字 / aria-label 中文 —— 加载占位不消费 i18n。
export const HomePageSkeleton = () => {
  return (
    <div className={classes.root}>
      <div className={classes.body}>
        {/* eyebrow */}
        <Skeleton variant="text" width={140} height={12} />

        {/* hero */}
        <Skeleton variant="rect" width="60%" height={36} style={{ borderRadius: 4 }} />

        {/* subtitle */}
        <SkeletonText lines={2} lineHeight={14} gap={10} lastLineWidth="80%" />

        <div className={classes.grid}>
          {/* 后端往返卡片：整行 */}
          <div className={`${classes.card} ${classes.spanFull}`}>
            <Skeleton variant="text" width={120} height={12} />
            <Skeleton variant="text" width="70%" height={14} />
            <div className={classes.form}>
              <Skeleton variant="rect" height={36} style={{ flex: 1, borderRadius: 4 }} />
              <Skeleton variant="rect" width={88} height={36} style={{ borderRadius: 4 }} />
            </div>
          </div>

          {/* 子窗口 / 托盘 / 当前布局：标题 + 描述 + 按钮行 */}
          {[3, 1, 1].map((buttons, i) => (
            <div key={i} className={classes.card}>
              <Skeleton variant="text" width={100} height={12} />
              <SkeletonText lines={2} lineHeight={12} gap={8} lastLineWidth="60%" />
              <div className={classes.actions}>
                {Array.from({ length: buttons }, (_, j) => (
                  <Skeleton key={j} variant="rect" width={96} height={30} style={{ borderRadius: 4 }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className={classes.footer}>
          <Skeleton variant="text" width={180} height={11} />
          <Skeleton variant="text" width={240} height={11} />
        </div>
      </div>
    </div>
  );
};
