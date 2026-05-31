import { useCallback } from 'react';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import type { ExcelExportOptions } from '../premium-types';

interface UseExcelExportParams {
  rows: GridRowModel[];
  columns: GridColDef[];
}

interface UseExcelExportResult {
  exportDataAsExcel: (options?: ExcelExportOptions) => Promise<void>;
  exportDataAsCsv: (options?: ExcelExportOptions) => void;
}

function buildCsvContent(rows: GridRowModel[], columns: GridColDef[], includeHeaders: boolean): string {
  const fields = columns.map((c) => c.field);
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(fields.map((f) => {
      const col = columns.find((c) => c.field === f);
      return `"${(col?.headerName ?? f).replace(/"/g, '""')}"`;
    }).join(','));
  }

  for (const row of rows) {
    const values = fields.map((f) => {
      const val = row[f];
      if (val == null) return '';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useExcelExport({ rows, columns }: UseExcelExportParams): UseExcelExportResult {
  const exportDataAsCsv = useCallback((options?: ExcelExportOptions) => {
    const filename = options?.filename ?? 'export.csv';
    const includeHeaders = options?.includeHeaders ?? true;
    const csv = buildCsvContent(rows, columns, includeHeaders);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
  }, [rows, columns]);

  const exportDataAsExcel = useCallback(async (options?: ExcelExportOptions) => {
    const filename = options?.filename ?? 'export.xlsx';
    const sheetName = options?.sheetName ?? 'Sheet1';
    const includeHeaders = options?.includeHeaders ?? true;

    try {
      const xlsxModule = 'xlsx';
      const XLSX = await (Function('m', 'return import(m)')(xlsxModule)) as any;
      const fields = columns.map((c) => c.field);
      const data: unknown[][] = [];

      if (includeHeaders) {
        data.push(fields.map((f) => {
          const col = columns.find((c) => c.field === f);
          return col?.headerName ?? f;
        }));
      }

      for (const row of rows) {
        data.push(fields.map((f) => row[f] ?? ''));
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      downloadBlob(blob, filename);
    } catch {
      const csvFilename = filename.replace(/\.xlsx$/i, '.csv');
      exportDataAsCsv({ ...options, filename: csvFilename });
    }
  }, [rows, columns, exportDataAsCsv]);

  return { exportDataAsExcel, exportDataAsCsv };
}
