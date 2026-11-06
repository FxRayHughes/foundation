import { Button } from '@mantine/core';
import { IconColumns3, IconFileSpreadsheet, IconFileTypeCsv } from '@tabler/icons-react';
import { useState } from 'react';
import { useT } from '@/i18n';
import { NativeDialogs } from '@/services';
import type { DataGridPremiumProps } from './premium-types';
import type { DataGridRow } from './types';
import { useDataGridPro } from './useDataGridPro';
import { DataGridSurface } from './DataGridSurface';
import classes from './DataGrid.module.css';

// DataGrid Premium：在 Pro 之上增加 行分组（多级 + 组内聚合）/ 聚合页脚 / 单元格范围选择（Ctrl+C 复制为 TSV）/
// CSV & Excel 导出（showToolbar 时显示导出按钮；经 ExportService 原生「另存为」对话框 + 后端写文件）。
export function DataGridPremium<T extends DataGridRow = DataGridRow>(props: DataGridPremiumProps<T>) {
  const t = useT();
  const vm = useDataGridPro<T>(props);
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);

  const runExport = async (kind: 'csv' | 'xlsx') => {
    if (exporting) return;
    setExporting(kind);
    try {
      const options = {
        ...props.excelExportOptions,
        dialogTitle: t(kind === 'csv' ? 'dataGrid.export.csvDialogTitle' : 'dataGrid.export.excelDialogTitle'),
        filterLabel: t(kind === 'csv' ? 'dataGrid.export.csvFilter' : 'dataGrid.export.excelFilter'),
      };
      await (kind === 'csv' ? vm.exporter.exportDataAsCsv(options) : vm.exporter.exportDataAsExcel(options));
    } catch (err) {
      await NativeDialogs.error(t('dataGrid.export.errorTitle'), err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(null);
    }
  };

  const selectedCount = vm.cells.cellSelectionModel.ranges.reduce(
    (n, r) => n + (r.endRow - r.startRow + 1) * (r.endCol - r.startCol + 1),
    0,
  );

  const toolbar = props.showToolbar ? (
    <div className={classes.toolbar} role="toolbar" aria-label={t('dataGrid.toolbar.ariaLabel')}>
      <Button
        size="xs"
        variant="subtle"
        leftSection={<IconFileTypeCsv size={16} stroke={1.75} />}
        loading={exporting === 'csv'}
        disabled={exporting !== null && exporting !== 'csv'}
        onClick={() => void runExport('csv')}
      >
        {t('dataGrid.toolbar.exportCsv')}
      </Button>
      <Button
        size="xs"
        variant="subtle"
        leftSection={<IconFileSpreadsheet size={16} stroke={1.75} />}
        loading={exporting === 'xlsx'}
        disabled={exporting !== null && exporting !== 'xlsx'}
        onClick={() => void runExport('xlsx')}
      >
        {t('dataGrid.toolbar.exportExcel')}
      </Button>
      {vm.columnMenu.enabled && (
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconColumns3 size={16} stroke={1.75} />}
          onClick={vm.columnMenu.openColumnsPanel}
        >
          {t('dataGrid.columnMenu.manageColumns')}
        </Button>
      )}
      <div className={classes.toolbarSpacer} />
      {vm.cells.enabled && selectedCount > 1 && (
        <span className={classes.toolbarInfo}>{t('dataGrid.toolbar.selectedCells', { count: selectedCount })}</span>
      )}
    </div>
  ) : null;

  return <DataGridSurface vm={vm} props={props} toolbar={toolbar} />;
}
