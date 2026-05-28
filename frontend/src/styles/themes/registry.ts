import type { FoundationThemePreset } from './types';

// 主题注册中心：单例。运行时所有可用主题都从这里取。
class ThemeRegistry {
  private presets = new Map<string, FoundationThemePreset>();
  private defaultName: string | null = null;
  private listeners = new Set<() => void>();

  register(preset: FoundationThemePreset, options: { default?: boolean } = {}): void {
    this.presets.set(preset.name, preset);
    if (options.default || this.defaultName === null) {
      this.defaultName = preset.name;
    }
    this.listeners.forEach((fn) => fn());
  }

  unregister(name: string): void {
    if (this.defaultName === name) {
      throw new Error(`Cannot unregister default theme "${name}"`);
    }
    this.presets.delete(name);
    this.listeners.forEach((fn) => fn());
  }

  get(name: string): FoundationThemePreset {
    const preset = this.presets.get(name);
    if (!preset) {
      throw new Error(`Theme preset "${name}" is not registered`);
    }
    return preset;
  }

  has(name: string): boolean {
    return this.presets.has(name);
  }

  list(): FoundationThemePreset[] {
    return [...this.presets.values()];
  }

  defaultPresetName(): string {
    if (this.defaultName === null) {
      throw new Error('No default theme has been registered');
    }
    return this.defaultName;
  }

  // 订阅注册表变更，主要供 ThemeProvider 在 hot-reload 时同步 UI
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const themeRegistry = new ThemeRegistry();
