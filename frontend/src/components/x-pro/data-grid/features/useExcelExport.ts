import { useCallback } from 'react';
import { ExportService, type ExportCell } from '@/services/export';
import type { ExcelExportOptions } from '../premium-types';
import type { DataGridColumn, DataGridRow } from '../types';
import { UTILITY_PREFIX, columnLabel, fieldOf, formatValue, getCellValue } from '../utils';

// CSV / Excel 导出：经 ExportService 弹原生「另存为」对话框，由后端写文件（不走浏览器下载）。
//  - CSV：单元格用"显示值"（valueFormatter 返回字符串 / 数字时用它，否则用默认格式化）
//  - XLSX：单元格用"原始值"（valueGetter / accessor），数字 / 布尔保持原类型，日期转 ISO 字符串（CSV BOM 由后端加）
// 返回保存路径；用户取消返回 null；写入失败抛错（由调用方提示）。
// 对话框标题由调用方（View）经 t() 传入 options.dialogTitle。

interface UseExcelExportParams<T extends DataGridRow> {
  rows: T[];
  columns: DataGridColumn<T>[];
}

export interface UseExcelExportResult {
  exportDataAsExcel: (options?: ExcelExportOptions) => Promise<string | null>;
  exportDataAsCsv: (options?: ExcelExportOptions) => Promise<string | null>;
}

const exportable = <T extends DataGridRow>(columns: DataGridColumn<T>[]) =>
  columns.filter((c) => !fieldOf(c).startsWith(UTILITY_PREFIX) && !c.hidden);

// 把 filename 的扩展名替换成目标格式（'employees.xlsx' 导出 CSV → 'employees.csv'）
const withExtension = (filename: string | undefined, ext: 'csv' | 'xlsx'): string => {
  const base = (filename ?? 'export').replace(/\.(csv|xlsx?|tsv)$/i, '');
  return `${base || 'export'}.${ext}`;
};

const displayText = <T extends DataGridRow>(col: DataGridColumn<T>, row: T): string => {
  const raw = getCellValue(col, row);
  if (col.valueFormatter) {
    const formatted = col.valueFormatter(raw, row);
    if (typeof formatted === 'string') return formatted;
    if (typeof formatted === 'number') return String(formatted);
    // 其余 ReactNode（元素 / 数组等）无法转文本，回落到默认格式化
  }
  return formatValue(raw);
};

const rawCell = (v: unknown): ExportCell => {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const csvEscape = (s: string): string => (/[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function useExcelExport<T extends DataGridRow>({ rows, columns }: UseExcelExportParams<T>): UseExcelExportResult {
  const exportDataAsCsv = useCallback(
    async (options?: ExcelExportOptions) => {
      const cols = exportable(columns);
      const lines: string[] = [];
      if (options?.includeHeaders ?? true) lines.push(cols.map((c) => csvEscape(columnLabel(c))).join(','));
      for (const row of rows) lines.push(cols.map((c) => csvEscape(displayText(c, row))).join(','));
      return ExportService.saveCSV({
        defaultFilename: withExtension(options?.filename, 'csv'),
        content: lines.join('\r\n'),
        title: options?.dialogTitle,
        filterLabel: options?.filterLabel,
      });
    },
    [rows, columns],
  );

  const exportDataAsExcel = useCallback(
    async (options?: ExcelExportOptions) => {
      const cols = exportable(columns);
      return ExportService.saveXLSX({
        defaultFilename: withExtension(options?.filename, 'xlsx'),
        table: {
          sheetName: options?.sheetName ?? 'Sheet1',
          headers: options?.includeHeaders ?? true ? cols.map(columnLabel) : [],
          rows: rows.map((row) => cols.map((c) => rawCell(getCellValue(c, row)))),
        },
        title: options?.dialogTitle,
        filterLabel: options?.filterLabel,
      });
    },
    [rows, columns],
  );

  return { exportDataAsExcel, exportDataAsCsv };
}
