import { useRef, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { useChartDimensions, type ChartDimensions } from './useChartDimensions';

interface ChartContainerProps {
  width?: number;
  height?: number;
  children: (dimensions: ChartDimensions) => ReactNode;
}

export function ChartContainer({ width, height, children }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef, width, height);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: width ?? '100%',
        height: height ?? '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && children(dimensions)}
    </Box>
  );
}
