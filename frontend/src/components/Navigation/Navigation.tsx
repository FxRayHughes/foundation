import type { NavPlacement, NavVariant } from '@/layouts';
import { NavRail } from './NavRail';
import { NavSidebar } from './NavSidebar';
import { NavBar } from './NavBar';
import { NavDock } from './NavDock';
import classes from './Navigation.module.css';

export interface NavigationProps {
  variant: Exclude<NavVariant, 'none'>;
  placement: NavPlacement;
}

// 导航分发器：按布局预设的 variant 选择具体形态，placement 透传给形态组件。
//  - rail    ：64px 图标栏（left / right）
//  - sidebar ：展开侧栏，可折叠为图标栏（left / right）
//  - bar     ：水平导航条（top：标题栏下独占一行 / titlebar：嵌入标题栏）
//  - dock    ：底部居中浮动 Dock / float：竖向悬浮 Dock（可拖拽，吸附左右边缘）
// 不接收条目 / 回调 —— 全部从 useRouter() / usePreferences() 读取。
export const Navigation = ({ variant, placement }: NavigationProps) => {
  const side = placement === 'right' ? 'right' : 'left';
  let content;
  switch (variant) {
    case 'rail':
      content = <NavRail placement={side} />;
      break;
    case 'sidebar':
      content = <NavSidebar placement={side} />;
      break;
    case 'bar':
      content = <NavBar placement={placement === 'titlebar' ? 'titlebar' : 'top'} />;
      break;
    case 'dock':
      content = placement === 'float' ? <NavDock floating /> : <NavDock />;
      break;
  }
  return (
    <div className={classes.root} data-variant={variant} data-placement={placement}>
      {content}
    </div>
  );
};
