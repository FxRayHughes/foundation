// SystrayService 包装后端 internal/app.SystrayService 的 Wails bindings。
// ViewModel 通过此 service 调用后端，不直接 import @bindings/*。
//
// 后端负责：运行时创建 / 销毁托盘 + 面板窗口、把开关持久化到 SQLite preferences 表，
// 并在下次启动时自动恢复。前端只需调用 enable / disable，并用 isEnabled 读当前状态。
import * as SystrayServiceBinding from '@bindings/foundation/internal/app/systrayservice';

export const SystrayService = {
  enable(): Promise<void> {
    return SystrayServiceBinding.Enable();
  },

  disable(): Promise<void> {
    return SystrayServiceBinding.Disable();
  },

  isEnabled(): Promise<boolean> {
    return SystrayServiceBinding.IsEnabled();
  },

  // 托盘原生右键菜单文案（调用方传 t() 结果）；托盘未启用时后端只保存，下次创建时生效。
  setMenuLabels(labels: { showWindow: string; quit: string }): Promise<void> {
    return SystrayServiceBinding.SetMenuLabels(labels);
  },
} as const;
