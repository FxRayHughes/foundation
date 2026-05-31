import { useRef, useState, useCallback, type ReactNode, type WheelEvent, type MouseEvent } from 'react';
import { Box } from '@mui/material';

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ZoomableChartProps {
  children: ReactNode;
  enableZoom?: boolean;
  enablePan?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function ZoomableChart({
  children,
  enableZoom = true,
  enablePan = true,
  minZoom = 0.5,
  maxZoom = 5,
  onZoomChange,
}: ZoomableChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const clampScale = useCallback(
    (s: number) => Math.min(maxZoom, Math.max(minZoom, s)),
    [minZoom, maxZoom],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!enableZoom) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => {
        const newScale = clampScale(prev.scale * delta);
        onZoomChange?.(newScale);
        return { ...prev, scale: newScale };
      });
    },
    [enableZoom, clampScale, onZoomChange],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enablePan) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { x: zoom.translateX, y: zoom.translateY };
    },
    [enablePan, zoom.translateX, zoom.translateY],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setZoom((prev) => ({
        ...prev,
        translateX: panOrigin.current.x + dx,
        translateY: panOrigin.current.y + dy,
      }));
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const transform = `scale(${zoom.scale}) translate(${zoom.translateX / zoom.scale}px, ${zoom.translateY / zoom.scale}px)`;

  return (
    <Box
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: enablePan ? (isPanning.current ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          transform,
          transformOrigin: 'center center',
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
