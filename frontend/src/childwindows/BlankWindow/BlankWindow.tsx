import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useT } from '@/i18n';
import { useBlankWindow } from './useBlankWindow';
import classes from './BlankWindow.module.css';

export const BlankWindow = () => {
  const t = useT();
  const { title } = useBlankWindow();

  const displayTitle = title || t('childwindow.blank.defaultTitle');

  return (
    <div className={classes.root}>
      <ChildTitleBar title={displayTitle} />
      <div className={classes.content}>
        {/* Template: extend with business content */}
      </div>
    </div>
  );
};
