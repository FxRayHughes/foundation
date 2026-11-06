import { useEffect } from 'react';
import { useT } from '@/i18n';
import { useRouter } from '@/router';
import { SystrayService } from '@/services/systray';
import { onBroadcast } from '@/services/childwindow';

// 托盘面板 / 子窗口发来的跨窗口指令（经 child:broadcast 总线）。
// 显示 / 聚焦主窗口由后端 SystrayService 处理；这里只负责主窗口内的路由跳转。
const OPEN_SETTINGS = 'app:open-settings';

// AppLayout 的 ViewModel：订阅跨窗口指令 + 同步托盘菜单文案，不返回任何数据。
export const useAppLayout = (): void => {
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
};
