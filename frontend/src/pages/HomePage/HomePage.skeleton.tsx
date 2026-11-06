import { Skeleton, SkeletonText } from '@/components/Skeleton';
import classes from './HomePage.module.css';

// HomePage 骨架屏：复刻真实页面的版式节奏，避免"骨架→真实"切换时布局抖动。
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

        {/* card */}
        <div className={classes.card}>
          <Skeleton variant="text" width={120} height={12} />
          <Skeleton variant="text" width="70%" height={14} />
          <div className={classes.form}>
            <Skeleton variant="rect" height={36} style={{ flex: 1, borderRadius: 4 }} />
            <Skeleton variant="rect" width={88} height={36} style={{ borderRadius: 4 }} />
          </div>
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
