// StorageService：数据库路径 / 占用空间 / 表级统计与清空。
//
// 切换路径是后端的"原子操作"——前端只需调用，期间业务请求会短暂阻塞
// （单连接池），完成后正常恢复。失败时后端已回滚到旧路径，可继续使用。
import { Service as Binding } from '@bindings/foundation/internal/services/storagesvc';

export interface StorageStats {
  path: string;
  isCustom: boolean;
  defaultPath: string;
  sizeBytes: number;
}

// 单张表的展示元数据 + 占用。
// labelKey 是 i18n 键的"后缀"——前端拼成 settings.database.tables.<key>.label。
// estimated=true 表示后端无法用 dbstat 取精确字节数，UI 应注明"估算"。
export interface TableInfo {
  name: string;
  labelKey: string;
  clearable: boolean;
  rowCount: number;
  sizeBytes: number;
  estimated: boolean;
}

export interface TableStats {
  totalBytes: number;
  tables: TableInfo[];
}

export const StorageService = {
  async getStats(): Promise<StorageStats> {
    const s = await Binding.GetStats();
    return {
      path: s.path ?? '',
      isCustom: Boolean(s.isCustom),
      defaultPath: s.defaultPath ?? '',
      sizeBytes: Number(s.sizeBytes ?? 0),
    };
  },

  async getTableStats(): Promise<TableStats> {
    const s = await Binding.GetTableStats();
    return {
      totalBytes: Number(s.totalBytes ?? 0),
      tables: (s.tables ?? []).map<TableInfo>((t) => ({
        name: t.name ?? '',
        labelKey: t.labelKey ?? '',
        clearable: Boolean(t.clearable),
        rowCount: Number(t.rowCount ?? 0),
        sizeBytes: Number(t.sizeBytes ?? 0),
        estimated: Boolean(t.estimated),
      })),
    };
  },

  // newPath 必须是数据库 .db 文件的完整路径（含文件名）。
  async setCustomPath(newPath: string): Promise<void> {
    await Binding.SetCustomPath(newPath);
  },

  async resetPath(): Promise<void> {
    await Binding.ResetPath();
  },

  async clearTable(name: string): Promise<void> {
    await Binding.ClearTable(name);
  },
} as const;
