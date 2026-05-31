import { useState, useCallback } from 'react';

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  const show = useCallback((x: number, y: number, content: string) => {
    setTooltip({ visible: true, x, y, content });
  }, []);

  const hide = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return { tooltip, show, hide };
}
