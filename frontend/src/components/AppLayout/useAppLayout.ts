import { useEffect } from 'react';
import { useT } from '@/i18n';
import { useLayoutPreset, type LayoutPreset } from '@/layouts';
import { useRouter } from '@/router';
import { SystrayService } from '@/services/systray';
import { onBroadcast } from '@/services/childwindow';
import { usePreferences } from '@/preferences';
import { signalAppReady } from '@/shared/appReady';

// 托盘面板 / 子窗口发来的跨窗口指令（经 child:broadcast 总线）。
// 显示 / 聚焦主窗口由后端 SystrayService 处理；这里只负责主窗口内的路由跳转。
const OPEN_SETTINGS = 'app:open-settings';

// AppLayout 的 ViewModel：订阅跨窗口指令 + 同步托盘菜单文案，返回当前布局预设。
export const useAppLayout = (): { preset: LayoutPreset; dockSide: 'left' | 'right' } => {
  const { preset } = useLayoutPreset();
  const { ready, preferences } = usePreferences();

  // 偏好（含布局预设）读回后才通知 main.tsx 淡出启动骨架，避免布局跳变
  useEffect(() => {
    if (ready) signalAppReady();
  }, [ready]);
  const { navigate } = useRouter();
  const t = useT();

  // 托盘原生菜单在 Go 侧绘制，无法用 t()：语言变化时把译文推给后端（不进 ViewModel 返回值）。
  useEffect(() => {
    void SystrayService.setMenuLabels({
      showWindow: t('app.trayMenu.showWindow'),
      quit: t('app.trayMenu.quit'),
    }).catch(() => {
      // 后端未就绪：沿用后端英文兜底
    });
  }, [t]);

  useEffect(() => {
    return onBroadcast((msg) => {
      if (msg.type === OPEN_SETTINGS) navigate('settings');
    });
  }, [navigate]);

  // 悬浮 Dock 吸附的边：外壳据此给内容区留出边距，避免 Dock 常驻遮挡页面内容
  const dockSide = preferences.floatDockSide === 'left' ? 'left' : 'right';
  return { preset, dockSide };
};
