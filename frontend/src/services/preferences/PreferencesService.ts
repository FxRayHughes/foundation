// PreferencesService：行为偏好键值存储的前端封装。
//
// 后端单条记录 { key, value: JSON-string }。前端把任意 JS 值序列化后传入，
// 读取时 JSON.parse —— 业务方完全不需要关心持久化。
import { Service as Binding } from '@bindings/foundation/internal/services/preferences';

export const PreferencesService = {
  // 读单个键；缺失返回 undefined（区别于"显式存了 null"）。
  async get<T>(key: string): Promise<T | undefined> {
    const raw = await Binding.Get(key);
    if (raw === '') return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },

  // 写单个键；upsert 语义。
  async set<T>(key: string, value: T): Promise<void> {
    await Binding.Set(key, JSON.stringify(value));
  },

  // 一次拉所有键值对（启动时初始化整个 Preferences 用）。
  async list(): Promise<Record<string, unknown>> {
    const entries = await Binding.List();
    const out: Record<string, unknown> = {};
    for (const e of entries) {
      try {
        out[e.key] = JSON.parse(e.value);
      } catch {
        // 损坏的 JSON 直接跳过，避免阻断启动
      }
    }
    return out;
  },

  async delete(key: string): Promise<void> {
    await Binding.Delete(key);
  },

  async reset(): Promise<void> {
    await Binding.Reset();
  },
} as const;
