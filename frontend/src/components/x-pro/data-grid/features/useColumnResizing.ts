import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

// 列宽拖拽（表头右边缘手柄）。
// mantine-datatable 的 resizable 依赖 storeColumnsKey（localStorage），这里自管宽度状态，只存在内存中；
// 宽度通过列定义的 width 传给 mantine-datatable（它会同时写 width / minWidth / maxWidth）。

export const DEFAULT_MIN_COLUMN_WIDTH = 60;

interface UseColumnResizingParams {
  enabled: boolean;
  onColumnWidthChange?: (field: string, width: number) => void;
}

export interface ResizeHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onDoubleClick: (e: { stopPropagation: () => void }) => void;
}

export interface UseColumnResizingResult {
  enabled: boolean;
  resizingField: string | null;
  /** 用户拖拽后的列宽；未改过返回 undefined（沿用列定义的 width） */
  getWidth: (field: string) => number | undefined;
  getResizeHandleProps: (field: string, minWidth?: number) => ResizeHandleProps | null;
}

// 拖拽松手后浏览器会在 th 上补发一次 click（会触发排序），吞掉它
const swallowNextClick = () => {
  const swallow = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
};

export function useColumnResizing({ enabled, onColumnWidthChange }: UseColumnResizingParams): UseColumnResizingResult {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [resizingField, setResizingField] = useState<string | null>(null);
  const callbackRef = useRef(onColumnWidthChange);
  callbackRef.current = onColumnWidthChange;

  const getWidth = useCallback((field: string) => widths[field], [widths]);

  const getResizeHandleProps = useCallback(
    (field: string, minWidth = DEFAULT_MIN_COLUMN_WIDTH): ResizeHandleProps | null => {
      if (!enabled) return null;
      return {
        onPointerDown: (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          const th = e.currentTarget.closest('th');
          const startWidth = th ? th.getBoundingClientRect().width : minWidth;
          const startX = e.clientX;
          const rtl = th ? getComputedStyle(th).direction === 'rtl' : false;
          const handle = e.currentTarget;
          const pointerId = e.pointerId;
          handle.setPointerCapture(pointerId);
          setResizingField(field);

          let frame = 0;
          let latest = startWidth;
          const onMove = (ev: PointerEvent) => {
            const dx = (ev.clientX - startX) * (rtl ? -1 : 1);
            latest = Math.max(minWidth, Math.round(startWidth + dx));
            if (frame) return;
            frame = requestAnimationFrame(() => {
              frame = 0;
              setWidths((w) => (w[field] === latest ? w : { ...w, [field]: latest }));
            });
          };
          const onUp = () => {
            if (frame) cancelAnimationFrame(frame);
            setWidths((w) => (w[field] === latest ? w : { ...w, [field]: latest }));
            setResizingField(null);
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            handle.removeEventListener('pointercancel', onUp);
            if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
            swallowNextClick();
            if (latest !== startWidth) callbackRef.current?.(field, latest);
          };
          handle.addEventListener('pointermove', onMove);
          handle.addEventListener('pointerup', onUp);
          handle.addEventListener('pointercancel', onUp);
        },
        // 双击恢复列定义的默认宽度
        onDoubleClick: (e) => {
          e.stopPropagation();
          setWidths((w) => {
            if (!(field in w)) return w;
            const next = { ...w };
            delete next[field];
            return next;
          });
        },
      };
    },
    [enabled],
  );

  return { enabled, resizingField, getWidth, getResizeHandleProps };
}
