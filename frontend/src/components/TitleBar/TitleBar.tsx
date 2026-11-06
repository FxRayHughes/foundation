import type { CSSProperties, ReactNode } from 'react';
import { useT } from '@/i18n';
import { isMac } from '@/shared/platform';
import { WindowControls } from './WindowControls';
import classes from './TitleBar.module.css';

export interface TitleBarProps {
  // 可选：覆盖默认标题（默认从 i18n 取 app.title）
  title?: string;
  // 标题前的插槽（如"专注"布局的导航菜单按钮）；自动包 no-drag，可点击
  leading?: ReactNode;
  // 标题后的插槽（如"融合标题栏"布局的水平导航）；占据中间可用宽度，自动包 no-drag
  center?: ReactNode;
}

// 自绘标题栏：
// - Windows / Linux：完整自绘（拖拽区 + 标题 + 右侧三联按钮）
// - macOS：保留系统红绿灯，只画标题与拖拽区，按钮区域留空
export const TitleBar = ({ title, leading, center }: TitleBarProps) => {
  const t = useT();
  const displayTitle = title ?? t('app.title');

  return (
    <div className={classes.root} style={{ '--wails-draggable': 'drag' } as CSSProperties}>
      {isMac && <div className={classes.macSpacer} />}
      {leading && (
        <div className={classes.slot} style={{ '--wails-draggable': 'no-drag' } as CSSProperties}>
          {leading}
        </div>
      )}
      <span className={classes.title}>{displayTitle}</span>
      {center ? (
        <div className={classes.center}>
          <div className={classes.slot} style={{ '--wails-draggable': 'no-drag' } as CSSProperties}>
            {center}
          </div>
        </div>
      ) : (
        <div className={classes.spacer} />
      )}
      {!isMac && <WindowControls />}
    </div>
  );
};
