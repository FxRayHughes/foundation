import { Events } from '@wailsio/runtime';

// 子窗口事件协议常量
export const ChildWindowEvents = {
  result: (id: string) => `child:result:${id}`,
  send: (id: string) => `child:send:${id}`,
  broadcast: 'child:broadcast',
  closed: (id: string) => `child:closed:${id}`,
} as const;

// 子窗口结果类型
export interface ChildWindowResult {
  windowId: string;
  action: 'confirm' | 'cancel' | 'close' | string;
  payload?: unknown;
}

// 窗口间消息类型
export interface WindowMessage {
  from: string;
  type: string;
  payload?: unknown;
}

// 获取当前窗口 ID（主窗口为 "main"，子窗口从 URL params 读取）
export function getWindowId(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'main';
}

// 获取子窗口初始参数（仅子窗口使用）
export function getChildWindowParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id') || '',
    type: params.get('type') || 'blank',
    title: params.get('title') || '',
    message: params.get('message') || '',
  };
}

// Wails v3 Events.Emit/On 使用强类型约束（仅接受 RegisterEvent 注册的事件名）。
// 子窗口事件是动态命名的，需要绕过类型检查。
export const emit = Events.Emit as unknown as (name: string, data?: unknown) => Promise<boolean>;
export const on = Events.On as unknown as (name: string, callback: (event: { data?: unknown }) => void) => () => void;

// 向指定窗口发送消息
export function sendToWindow(targetId: string, msg: WindowMessage): void {
  emit(ChildWindowEvents.send(targetId), msg);
}

// 广播消息给所有窗口
export function broadcast(msg: WindowMessage): void {
  emit(ChildWindowEvents.broadcast, msg);
}
