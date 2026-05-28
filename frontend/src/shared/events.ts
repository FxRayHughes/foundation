// 应用启动后由后端定时推送的事件名集合，
// 与 internal/events/events.go 中的常量保持同步。
export const AppEvents = {
  Time: 'time',
} as const;

export type AppEventName = (typeof AppEvents)[keyof typeof AppEvents];
