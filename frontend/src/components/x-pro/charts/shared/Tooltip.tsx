import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { TooltipState } from './useChartTooltip';

interface TooltipProps {
  state: TooltipState;
}

export function Tooltip({ state }: TooltipProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;

  if (!state.visible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: state.x + 12,
        top: state.y - 8,
        backgroundColor: fp.bg.elevated,
        color: fp.text.primary,
        border: `1px solid ${fp.divider}`,
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '12px',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}
    >
      {state.content}
    </Box>
  );
}
