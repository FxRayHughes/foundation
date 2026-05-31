import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress, useTheme } from '@mui/material';
import type { DataGridProProps } from './types';
import { useDataGridPro } from './useDataGridPro';
import { createStyles } from './DataGridPro.styles';

export function DataGridPro(props: DataGridProProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

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
  } = useDataGridPro(props);

  return (
    <Box ref={containerRef} sx={styles.root}>
      {hasPinnedRows && topRows.length > 0 && (
        <Box sx={styles.pinnedTop}>
          <DataGrid
            {...restProps}
            rows={topRows}
            columns={finalColumns}
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
          rows={mainRows}
          columns={finalColumns}
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
            columns={finalColumns}
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
