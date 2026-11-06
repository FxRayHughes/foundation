import { Skeleton } from '@/components/Skeleton';
import classes from './SettingsPage.skeleton.module.css';

// SettingsPage 骨架屏：复刻两列布局（左列入口 + 右列主题/偏好/自定义三段）。
// 真实页面会替换骨架时不出现版式跳动。
// 位置 / 圆角覆盖只走 Skeleton 的 style 透传（不使用 sx）。
export const SettingsPageSkeleton = () => (
  <div className={classes.root}>
    {/* 左列 */}
    <div className={classes.list}>
      <div className={classes.listHeader}>
        <Skeleton variant="text" width={80} height={11} />
        <Skeleton variant="text" width={120} height={20} style={{ marginTop: 4 }} />
      </div>
      <div className={classes.listItems}>
        {[0, 1].map((i) => (
          <div key={i} className={classes.skeletonListItem}>
            <Skeleton variant="text" width={90} height={14} />
            <Skeleton variant="text" width="70%" height={11} />
          </div>
        ))}
      </div>
    </div>

    {/* 右列 */}
    <div className={classes.detail}>
      {/* header */}
      <div className={classes.detailHeader}>
        <Skeleton variant="text" width={80} height={11} />
        <Skeleton variant="rect" width={220} height={28} style={{ borderRadius: 4 }} />
        <Skeleton variant="text" width="60%" height={14} />
      </div>

      {/* 主题分组：标题 + 描述 + 卡片网格 */}
      <div className={classes.section}>
        <Skeleton variant="text" width={64} height={14} />
        <Skeleton variant="text" width="80%" height={12} />
        <div className={classes.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" height={64} style={{ borderRadius: 6 }} />
          ))}
        </div>
      </div>

      {/* 显示偏好分组：两行 switch row */}
      <div className={classes.section}>
        <Skeleton variant="text" width={96} height={14} />
        {[0, 1].map((i) => (
          <Skeleton key={i} variant="rect" height={64} style={{ borderRadius: 6 }} />
        ))}
      </div>

      {/* 自定义主题分组：工具栏 + 调色板网格 */}
      <div className={classes.section}>
        <Skeleton variant="text" width={96} height={14} />
        <div className={classes.skeletonToolbar}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" width={120} height={28} style={{ borderRadius: 4 }} />
          ))}
        </div>
        <div className={classes.skeletonPaletteGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rect" height={68} style={{ borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
