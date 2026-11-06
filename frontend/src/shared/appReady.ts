// 主窗口"就绪"信号：首屏所需的异步状态（用户偏好 / 布局预设）已就位。
// main.tsx 据此淡出启动骨架；业务一般不需要直接使用。
export const APP_READY_EVENT = 'foundation:app-ready';

export const signalAppReady = (): void => {
  window.dispatchEvent(new Event(APP_READY_EVENT));
};
