import { useDisclosure } from '@mantine/hooks';
import { usePreferences } from '@/preferences';

// 抽屉按钮 ViewModel：抽屉开关状态 + Tooltip 偏好
export const useNavigationDrawerButton = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { preferences } = usePreferences();
  return { opened, open, close, showTooltip: preferences.showTooltip };
};
