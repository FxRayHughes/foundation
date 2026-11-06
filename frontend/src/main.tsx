import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles';
import { App } from './App';
import { APP_READY_EVENT } from '@/shared/appReady';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 启动骨架淡出与移除：
// 在 React 完成首次提交、首帧绘制完成之后再淡出，避免"骨架消失 → 真实 UI 出现"之间的白闪。
//
// 时序：
//   1) createRoot.render() 调度首次渲染
//   2) requestAnimationFrame 等首帧绘制完成
//   3) 给骨架加 fade-out class（CSS transition 160ms 完成淡出）
//   4) transition 结束后 remove 节点（同时 remove 监听器）
//
// 设计兜底：哪怕浏览器掐了 transitionend，800ms 后强行移除骨架（避免长留 DOM）。
const removeStartupSkeleton = (): void => {
  const skeleton = document.getElementById('startup-skeleton');
  if (!skeleton) return;

  let removed = false;
  const remove = (): void => {
    if (removed) return;
    removed = true;
    skeleton.parentNode?.removeChild(skeleton);
  };

  skeleton.addEventListener('transitionend', remove, { once: true });
  // 兜底：transition 没触发也 800ms 后移除
  window.setTimeout(remove, 800);

  skeleton.classList.add('fade-out');
};

// 骨架覆盖层（fixed, z-index 9999）一直盖到"应用就绪"再淡出：
// AppLayout 在用户偏好（含布局预设）从 SQLite 读回后派发 APP_READY_EVENT，
// 避免非默认布局的用户先看到默认布局再跳变。兜底 1500ms（后端异常时也不会一直挡住）。
// 就绪后 rAF 嵌套两层，确保 React 已完成该次 commit + paint 再淡出。
let skeletonScheduled = false;
const scheduleSkeletonRemoval = (): void => {
  if (skeletonScheduled) return;
  skeletonScheduled = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(removeStartupSkeleton);
  });
};
window.addEventListener(APP_READY_EVENT, scheduleSkeletonRemoval, { once: true });
window.setTimeout(scheduleSkeletonRemoval, 1500);
