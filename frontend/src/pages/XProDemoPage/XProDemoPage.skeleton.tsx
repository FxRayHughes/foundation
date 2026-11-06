import { Skeleton } from '@/components/Skeleton';
import classes from './XProDemoPage.skeleton.module.css';

export const XProDemoPageSkeleton = () => (
  <div className={classes.root}>
    <div className={classes.body}>
      <Skeleton variant="text" width={200} height={24} />
      <Skeleton variant="rect" width="100%" height={400} />
      <div className={classes.chartRow}>
        <Skeleton variant="rect" width="100%" height={200} />
        <Skeleton variant="rect" width="100%" height={200} />
        <Skeleton variant="rect" width="100%" height={200} />
      </div>
    </div>
  </div>
);
