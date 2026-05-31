// 应用功能配置。与 main.tsx 同级，控制可选功能的启用/禁用。
// 后端通过 AppSettings service 读取此配置（前端启动时同步到后端）。

export interface FoundationSettings {
  systray: {
    enabled: boolean;
  };
}

export const settings: FoundationSettings = {
  systray: {
    enabled: false,
  },
};
