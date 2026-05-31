import { useEffect, useCallback } from 'react';
import type { ClipboardPasteConfig } from '../types';

interface UseClipboardPasteParams {
  config?: ClipboardPasteConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseClipboardPasteResult {
  isActive: boolean;
}

function parseTSV(text: string): string[][] {
  return text
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('\t'));
}

function parseCSV(text: string): string[][] {
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
}: UseClipboardPasteParams): UseClipboardPasteResult {
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!config?.enabled || !config.onPaste) return;
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;

      e.preventDefault();

      const data = text.includes('\t') ? parseTSV(text) : parseCSV(text);
      if (data.length === 0) return;

      const activeElement = document.activeElement;
      const container = containerRef.current;
      if (!container || !activeElement) return;

      const cell = activeElement.closest('[data-rowindex][data-colindex]');
      const startRow = cell ? parseInt(cell.getAttribute('data-rowindex') ?? '0', 10) : 0;
      const startCol = cell ? parseInt(cell.getAttribute('data-colindex') ?? '0', 10) : 0;

      config.onPaste(data, startRow, startCol);
    },
    [config, containerRef],
  );

  useEffect(() => {
    if (!config?.enabled) return;
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('paste', handlePaste);
    return () => container.removeEventListener('paste', handlePaste);
  }, [config?.enabled, containerRef, handlePaste]);

  return { isActive: !!config?.enabled };
}
