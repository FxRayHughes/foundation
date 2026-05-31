import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LegendItem {
  label: string;
  color: string;
}

interface LegendProps {
  items: LegendItem[];
}

export function Legend({ items }: LegendProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', padding: '8px 0' }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '3px',
              backgroundColor: item.color,
            }}
          />
          <Box component="span" sx={{ fontSize: '12px', color: fp.text.secondary }}>
            {item.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
