import { useNavigation } from '../useNavigation';

// 图标栏 ViewModel：复用共享导航 VM（条目 / 激活态 / 偏好开关）
export const useNavRail = () => useNavigation();
