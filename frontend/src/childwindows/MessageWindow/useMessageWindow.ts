import { useMemo } from 'react';
import { Window } from '@wailsio/runtime';
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { getChildWindowParams, emitResult } from '@/services/childwindow';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';

export type MessageVariant = 'info' | 'warning' | 'error';

const iconMap: Record<MessageVariant, Icon> = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertCircle,
};

// 图标颜色：引用 --fd-* 变量（而非具体色值），主题切换自动生效
const colorMap: Record<MessageVariant, string> = {
  info: FOUNDATION_CSS_VARS.accent,
  warning: FOUNDATION_CSS_VARS.status.warning,
  error: FOUNDATION_CSS_VARS.status.danger,
};

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
  icon: Icon;
  // CSS 颜色值（var(--fd-*) 引用）
  iconColor: string;
  handleOk: () => void;
}

export const useMessageWindow = (): UseMessageWindowReturn => {
  const params = getChildWindowParams();

  const variant = useMemo(() => detectVariant(params.title), [params.title]);

  const handleOk = (): void => {
    emitResult('ok');
    Window.Close();
  };

  return {
    title: params.title,
    message: params.message,
    variant,
    icon: iconMap[variant],
    iconColor: colorMap[variant],
    handleOk,
  };
};
