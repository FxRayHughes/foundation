import { useMemo } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { DataGridPremiumProps } from './premium-types';
import { useDataGridPro } from './useDataGridPro';
import { useRowGrouping } from './features/useRowGrouping';
import { useAggregation } from './features/useAggregation';
import { useCellSelection } from './features/useCellSelection';
import { useExcelExport } from './features/useExcelExport';
import { createStyles } from './DataGridPro.styles';

export function DataGridPremium(props: DataGridPremiumProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    rowGroupingModel,
    aggregationModel,
    cellSelection,
    onCellSelectionChange,
    ...proProps
  } = props;

  const { groupedRows, groupColumn } = useRowGrouping({
    rows: proProps.rows,
    rowGroupingModel,
  });

  const propsWithGroupedRows = { ...proProps, rows: groupedRows };

  const {
    containerRef,
    finalColumns,
    topRows,
    mainRows,
    bottomRows,
    hasPinnedRows,
    filterModel,
    sentinelRef,
    isLoading,
    restProps,
  } = useDataGridPro(propsWithGroupedRows);

  const { footerRow } = useAggregation({
    rows: mainRows,
    aggregationModel,
  });

  useCellSelection({
    enabled: cellSelection,
    onChange: onCellSelectionChange,
  });

  useExcelExport({ rows: mainRows, columns: finalColumns });

  const columnsWithGroup: GridColDef[] = useMemo(() => {
    if (!groupColumn) return finalColumns;
    return [groupColumn, ...finalColumns];
  }, [groupColumn, finalColumns]);

  const rowsWithFooter = useMemo(() => {
    if (!footerRow) return mainRows;
    return [...mainRows, footerRow];
  }, [mainRows, footerRow]);

  return (
    <Box ref={containerRef} sx={styles.root}>
      {hasPinnedRows && topRows.length > 0 && (
        <Box sx={styles.pinnedTop}>
          <DataGrid
            {...restProps}
            rows={topRows}
            columns={columnsWithGroup}
            hideFooter
            disableColumnMenu
            columnHeaderHeight={0}
            autoHeight
          />
        </Box>
      )}

      <Box sx={styles.mainSection}>
        <DataGrid
          {...restProps}
          rows={rowsWithFooter}
          columns={columnsWithGroup}
          filterModel={filterModel}
          columnHeaderHeight={
            props.headerFilters?.enabled ? 80 : undefined
          }
        />
        {props.lazyLoading && (
          <>
            <Box ref={sentinelRef} sx={styles.sentinel} />
            {isLoading && (
              <Box sx={styles.loadingIndicator}>
                <CircularProgress size={24} />
              </Box>
            )}
          </>
        )}
      </Box>

      {hasPinnedRows && bottomRows.length > 0 && (
        <Box sx={styles.pinnedBottom}>
          <DataGrid
            {...restProps}
            rows={bottomRows}
            columns={columnsWithGroup}
            hideFooter
            disableColumnMenu
            columnHeaderHeight={0}
            autoHeight
          />
        </Box>
      )}
    </Box>
  );
}
