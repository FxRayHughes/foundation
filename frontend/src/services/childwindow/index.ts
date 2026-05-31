import { ChildWindowEvents, getWindowId, emit, on } from './bus';
import type { ChildWindowResult, WindowMessage } from './bus';

export type { ChildWindowResult, WindowMessage } from './bus';
export { getWindowId, getChildWindowParams, sendToWindow, broadcast } from './bus';

// 发送结果（子窗口调用，通知调用方）
export function emitResult(action: string, payload?: unknown): void {
  const id = getWindowId();
  const result: ChildWindowResult = { windowId: id, action, payload };
  emit(ChildWindowEvents.result(id), result);
}

// 监听来自其他窗口的定向消息
export function onMessage(handler: (msg: WindowMessage) => void): () => void {
  const id = getWindowId();
  return on(ChildWindowEvents.send(id), (event) => {
    if (event.data) handler(event.data as WindowMessage);
  });
}

// 监听广播消息
export function onBroadcast(handler: (msg: WindowMessage) => void): () => void {
  return on(ChildWindowEvents.broadcast, (event) => {
    if (event.data) handler(event.data as WindowMessage);
  });
}

// 监听子窗口结果（主窗口或其他窗口调用）
export function onChildResult(childId: string, handler: (result: ChildWindowResult) => void): () => void {
  return on(ChildWindowEvents.result(childId), (event) => {
    if (event.data) handler(event.data as ChildWindowResult);
  });
}

// 监听子窗口关闭
export function onChildClosed(childId: string, handler: () => void): () => void {
  return on(ChildWindowEvents.closed(childId), () => {
    handler();
  });
}
