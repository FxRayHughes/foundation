// ExportService：表格导出（CSV / XLSX）统一走原生「另存为」对话框 + 后端落盘，
// 替代浏览器 blob 下载（webview 内无法选择保存位置、行为不一致）。
//
// 流程：NativeDialogs.saveFile 让用户选路径 → 补齐扩展名 → 后端 exportsvc 写文件
// （CSV 带 UTF-8 BOM；XLSX 由 excelize 生成，表头加粗冻结、数字保持数值）。
//
// 用户取消对话框时返回 null；写入失败时 reject，由调用方 ViewModel 提示错误。
// 对话框标题由调用方传入（已经过 t()），本文件不含任何人类可见文案。
import { NativeDialogs, type FileFilter } from '@/services/dialogs/NativeDialogs';

export type ExportCell = string | number | boolean | null;

export interface TableExportPayload {
  sheetName: string;
  headers: string[];
  rows: ExportCell[][];
}

interface ExportBindings {
  Service: {
    WriteCSV(path: string, content: string): Promise<void>;
    WriteXLSX(path: string, table: TableExportPayload): Promise<void>;
  };
}

// bindings 由 wails3 generate bindings 生成；开发期可能尚不存在，故用 dynamic import。
async function loadBindings(): Promise<ExportBindings> {
  // @ts-ignore bindings generated at runtime by wails3
  return (await import('@bindings/foundation/internal/services/exportsvc')) as ExportBindings;
}

// 过滤器显示名由调用方经 t() 传入（filterLabel）；未传时用格式名兜底（非自然语言）。
const csvFilters = (label?: string): FileFilter[] => [{ displayName: label || 'CSV (*.csv)', pattern: '*.csv' }];
const xlsxFilters = (label?: string): FileFilter[] => [{ displayName: label || 'Excel (*.xlsx)', pattern: '*.xlsx' }];

// 确保文件名以 ext 结尾（大小写不敏感）；空文件名退化为 "export<ext>"。
function withExtension(name: string, ext: string): string {
  const trimmed = name.trim() || 'export';
  return trimmed.toLowerCase().endsWith(ext) ? trimmed : `${trimmed}${ext}`;
}

// 非有限数字（NaN / Infinity）无法 JSON 序列化为数字，统一转 null。
function sanitizeRows(rows: ExportCell[][]): ExportCell[][] {
  return rows.map((row) =>
    row.map((cell) => (typeof cell === 'number' && !Number.isFinite(cell) ? null : cell)),
  );
}

async function pickPath(
  defaultFilename: string,
  ext: string,
  filters: FileFilter[],
  title?: string,
): Promise<string | null> {
  const picked = await NativeDialogs.saveFile({
    title,
    filename: withExtension(defaultFilename, ext),
    filters,
    canCreateDirectories: true,
  });
  // 用户在对话框里可能删掉了扩展名，这里补齐，保证后端扩展名校验通过
  return picked ? withExtension(picked, ext) : null;
}

export const ExportService = {
  async saveCSV(opts: {
    defaultFilename: string;
    content: string;
    title?: string;
    filterLabel?: string;
  }): Promise<string | null> {
    const path = await pickPath(opts.defaultFilename, '.csv', csvFilters(opts.filterLabel), opts.title);
    if (!path) return null;
    const mod = await loadBindings();
    await mod.Service.WriteCSV(path, opts.content);
    return path;
  },

  async saveXLSX(opts: {
    defaultFilename: string;
    table: TableExportPayload;
    title?: string;
    filterLabel?: string;
  }): Promise<string | null> {
    const path = await pickPath(opts.defaultFilename, '.xlsx', xlsxFilters(opts.filterLabel), opts.title);
    if (!path) return null;
    const mod = await loadBindings();
    await mod.Service.WriteXLSX(path, {
      sheetName: opts.table.sheetName,
      headers: opts.table.headers,
      rows: sanitizeRows(opts.table.rows),
    });
    return path;
  },
} as const;
