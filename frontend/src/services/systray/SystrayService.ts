// SystrayService 包装后端 SystrayService 的 Wails bindings。

async function loadBindings() {
  // @ts-ignore bindings generated at runtime by wails3
  return await import('@bindings/foundation/internal/app/systrayservice');
}

export const SystrayService = {
  async enable(): Promise<void> {
    const mod = await loadBindings();
    return mod.Enable();
  },

  async disable(): Promise<void> {
    const mod = await loadBindings();
    return mod.Disable();
  },

  async isEnabled(): Promise<boolean> {
    const mod = await loadBindings();
    return mod.IsEnabled();
  },
};
