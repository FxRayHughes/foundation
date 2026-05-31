import { systrayRegistry } from './registry';
import type { SystrayModule } from './types';

export const useSystrayPanel = (): { modules: SystrayModule[] } => {
  const modules = systrayRegistry.list();
  return { modules };
};
