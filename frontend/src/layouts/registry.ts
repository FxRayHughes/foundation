import { BUILTIN_LAYOUTS, DEFAULT_LAYOUT_ID } from './presets';
import type { LayoutPreset } from './types';

// 布局注册中心（与 themeRegistry 同模式）：业务方可 registerLayout 追加自定义组合。
const layouts = new Map<string, LayoutPreset>(BUILTIN_LAYOUTS.map((l) => [l.id, l]));

export const layoutRegistry = {
  register(preset: LayoutPreset): void {
    layouts.set(preset.id, preset);
  },
  has(id: string): boolean {
    return layouts.has(id);
  },
  list(): LayoutPreset[] {
    return [...layouts.values()];
  },
  // 未知 id（如旧版本存的值 / 被卸载的自定义预设）回落到默认
  resolve(id: string | undefined): LayoutPreset {
    return (id && layouts.get(id)) || layouts.get(DEFAULT_LAYOUT_ID)!;
  },
};
