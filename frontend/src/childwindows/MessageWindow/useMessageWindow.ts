import { useMemo } from 'react';
import { Window } from '@wailsio/runtime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { getChildWindowParams, emitResult } from '@/services/childwindow';

export type MessageVariant = 'info' | 'warning' | 'error';

const iconMap = {
  info: InfoOutlinedIcon,
  warning: WarningAmberRoundedIcon,
  error: ErrorOutlineRoundedIcon,
} as const;

function detectVariant(title: string): MessageVariant {
  const lower = title.toLowerCase();
  if (lower.includes('error')) return 'error';
  if (lower.includes('warn')) return 'warning';
  return 'info';
}

export interface UseMessageWindowReturn {
  title: string;
  message: string;
  variant: MessageVariant;
  icon: typeof InfoOutlinedIcon;
  iconColor: (fp: Record<string, unknown>) => string;
  handleOk: () => void;
}

export const useMessageWindow = (): UseMessageWindowReturn => {
  const params = getChildWindowParams();

  const variant = useMemo(() => detectVariant(params.title), [params.title]);

  const icon = iconMap[variant];

  const iconColor = (fp: Record<string, unknown>): string => {
    const status = fp.status as Record<string, string> | undefined;
    if (variant === 'error') return status?.danger ?? '#f44336';
    if (variant === 'warning') return status?.warning ?? '#ff9800';
    return fp.accent as string ?? '#2196f3';
  };

  const handleOk = (): void => {
    emitResult('ok');
    Window.Close();
  };

  return {
    title: params.title,
    message: params.message,
    variant,
    icon,
    iconColor,
    handleOk,
  };
};
