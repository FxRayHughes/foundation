// ChildWindowService 包装后端 ChildWindowService 的 Wails bindings。
// ViewModel 通过此 service 调用后端，不直接 import @bindings/*。
// bindings 由 wails3 generate bindings 生成，开发时可能不存在，故用 dynamic import。

export interface ChildWindowOpenOptions {
  type: string;
  title: string;
  message: string;
  width: number;
  height: number;
}

async function loadBindings() {
  // @ts-ignore bindings generated at runtime by wails3
  return await import('@bindings/foundation/internal/app/childwindowservice');
}

export const ChildWindowService = {
  async open(opts: ChildWindowOpenOptions): Promise<string> {
    const mod = await loadBindings();
    return mod.Open(opts);
  },

  async close(id: string): Promise<void> {
    const mod = await loadBindings();
    return mod.Close(id);
  },

  async list(): Promise<string[]> {
    const mod = await loadBindings();
    return mod.List();
  },
};
