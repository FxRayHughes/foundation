import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { usePreferences } from '@/preferences';
import { useNavigation } from '../useNavigation';

const EDGE_GAP = 16; // 吸附后距左右边缘的距离（px）
// 距内容区上下边缘的最小安全距离（px）。内容区在标题栏下方，Dock 永远不会进入标题栏 ——
// macOS 上标题栏顶部 40pt 是原生拖拽区（InvisibleTitleBarHeight）且左上是红绿灯，
// Dock 若压到那里手柄将无法再被拖动。
const SAFE_GAP = 12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface DockDrag {
  side: 'left' | 'right';
  y: number; // 0–1
  dragging: boolean;
  // 拖拽中的实时像素位置（相对容器，Dock 中心点）；非拖拽时为 null
  live: { x: number; y: number } | null;
  onHandlePointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onHandleKeyDown: (e: { key: string; preventDefault: () => void }) => void;
  onHandleDoubleClick: () => void;
}

// 浮动 Dock ViewModel：复用共享导航 VM；悬浮模式额外提供拖拽状态。
// 位置持久化到 preferences（floatDockSide / floatDockY），以比例存储，窗口缩放后依然成立。
export const useNavDock = () => {
  const nav = useNavigation();
  const { preferences, setPreference } = usePreferences();
  const side: 'left' | 'right' = preferences.floatDockSide === 'left' ? 'left' : 'right';
  // y 为 Dock 中心的比例；真正的像素夹取在渲染时用 CSS clamp() 结合 Dock 实际高度完成
  const y = clamp(preferences.floatDockY, 0, 1);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const grab = useRef<{ dx: number; dy: number; rect: DOMRect } | null>(null);

  const onHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const handle = e.currentTarget;
      const dock = handle.closest<HTMLElement>('[data-dock]');
      const layer = dock?.parentElement;
      if (!dock || !layer) return;
      e.preventDefault();
      const rect = layer.getBoundingClientRect();
      const d = dock.getBoundingClientRect();
      const cx = d.left + d.width / 2;
      const cy = d.top + d.height / 2;
      const halfW = d.width / 2;
      const halfH = d.height / 2;
      grab.current = { dx: e.clientX - cx, dy: e.clientY - cy, rect };
      setLive({ x: cx - rect.left, y: cy - rect.top });

      // 指针捕获：光标离开手柄 / 进入标题栏时依旧把 move / up 投递给手柄
      const pointerId = e.pointerId;
      try {
        handle.setPointerCapture(pointerId);
      } catch {
        // 某些 webview 不支持时退化为 window 监听（下方同样挂了）
      }

      // 当前（已夹取的）中心点，像素，相对容器
      let last = { x: cx - rect.left, y: cy - rect.top };
      const place = (clientX: number, clientY: number) => {
        const g = grab.current;
        if (!g) return;
        last = {
          x: clamp(clientX - g.dx - g.rect.left, halfW, g.rect.width - halfW),
          y: clamp(clientY - g.dy - g.rect.top, halfH + SAFE_GAP, g.rect.height - halfH - SAFE_GAP),
        };
        setLive(last);
      };
      const move = (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) place(ev.clientX, ev.clientY);
      };
      // 结束拖拽：正常松手 / 取消 / 失去捕获 / 窗口失焦（如在 macOS 标题栏原生拖拽区松手，
      // webview 收不到 pointerup）—— 一律以最后一个合法位置提交，避免拖拽状态卡死
      const finish = () => {
        handle.removeEventListener('pointermove', move);
        window.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', finish);
        window.removeEventListener('pointerup', finish);
        handle.removeEventListener('pointercancel', finish);
        handle.removeEventListener('lostpointercapture', finish);
        window.removeEventListener('blur', finish);
        const g = grab.current;
        grab.current = null;
        setLive(null);
        if (!g) return;
        setPreference('floatDockSide', last.x < g.rect.width / 2 ? 'left' : 'right');
        setPreference('floatDockY', last.y / g.rect.height);
      };
      handle.addEventListener('pointermove', move);
      window.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', finish);
      window.addEventListener('pointerup', finish);
      handle.addEventListener('pointercancel', finish);
      handle.addEventListener('lostpointercapture', finish);
      window.addEventListener('blur', finish);
    },
    [setPreference],
  );

  // 键盘可达：方向键移动 / 换边
  const onHandleKeyDown = useCallback(
    (e: { key: string; preventDefault: () => void }) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setPreference('floatDockY', clamp(y + (e.key === 'ArrowUp' ? -0.05 : 0.05), 0, 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setPreference('floatDockSide', e.key === 'ArrowLeft' ? 'left' : 'right');
      }
    },
    [setPreference, y],
  );

  // 双击手柄：复位到右侧居中
  const onHandleDoubleClick = useCallback(() => {
    setPreference('floatDockSide', 'right');
    setPreference('floatDockY', 0.5);
  }, [setPreference]);

  const drag: DockDrag = {
    side,
    y,
    dragging: live !== null,
    live,
    onHandlePointerDown,
    onHandleKeyDown,
    onHandleDoubleClick,
  };
  return { ...nav, drag, edgeGap: EDGE_GAP, safeGap: SAFE_GAP };
};
