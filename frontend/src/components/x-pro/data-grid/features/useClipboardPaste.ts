import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { ClipboardPasteConfig, ClipboardPasteContext } from '../types';

// 剪贴板粘贴：监听容器 paste 事件，解析 TSV（Excel / 表格软件）或 CSV，
// 起点 = 当前聚焦单元格（data-dg-row / data-dg-col），其次是单元格选区左上角，最后回落 (0, 0)。

export const CELL_ROW_ATTR = 'data-dg-row';
export const CELL_COL_ATTR = 'data-dg-col';

interface UseClipboardPasteParams {
  config?: ClipboardPasteConfig;
  containerRef: RefObject<HTMLDivElement | null>;
  /** 无聚焦单元格时的起点（例如单元格选区） */
  getAnchor?: () => { row: number; col: number } | null;
  /** 把起点 + 数据尺寸解析为行 id / 列字段 */
  resolveContext: (startRow: number, startCol: number, rows: number, cols: number) => ClipboardPasteContext;
}

interface UseClipboardPasteResult {
  isActive: boolean;
}

export function parseTSV(text: string): string[][] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('\t'));
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(current);
      current = '';
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
    } else if (char === '\r' && !inQuotes) {
      continue;
    } else {
      current += char;
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }
  return rows;
}

export function useClipboardPaste({
  config,
  containerRef,
  getAnchor,
  resolveContext,
}: UseClipboardPasteParams): UseClipboardPasteResult {
  const enabled = !!config?.enabled;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (!config?.onPaste) return;
      // 输入框（如表头筛选）里的粘贴保持原生行为
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;

      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      e.preventDefault();

      const data = text.includes('\t') ? parseTSV(text) : parseCSV(text);
      if (data.length === 0) return;

      const cell = active?.closest(`[${CELL_ROW_ATTR}][${CELL_COL_ATTR}]`);
      const anchor = cell
        ? {
            row: parseInt(cell.getAttribute(CELL_ROW_ATTR) ?? '0', 10),
            col: parseInt(cell.getAttribute(CELL_COL_ATTR) ?? '0', 10),
          }
        : (getAnchor?.() ?? { row: 0, col: 0 });

      const width = Math.max(...data.map((r) => r.length));
      config.onPaste(data, anchor.row, anchor.col, resolveContext(anchor.row, anchor.col, data.length, width));
    };

    container.addEventListener('paste', handlePaste);
    return () => container.removeEventListener('paste', handlePaste);
  }, [enabled, config, containerRef, getAnchor, resolveContext]);

  return { isActive: enabled };
}
