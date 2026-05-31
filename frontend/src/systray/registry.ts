import type { SystrayModule } from './types';

class SystrayRegistry {
  private modules: SystrayModule[] = [];

  register(module: SystrayModule): void {
    const existing = this.modules.findIndex(m => m.id === module.id);
    if (existing >= 0) {
      this.modules[existing] = module;
    } else {
      this.modules.push(module);
    }
    this.modules.sort((a, b) => a.order - b.order);
  }

  unregister(id: string): void {
    this.modules = this.modules.filter(m => m.id !== id);
  }

  list(): SystrayModule[] {
    return [...this.modules];
  }
}

export const systrayRegistry = new SystrayRegistry();
