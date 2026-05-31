import { useState, useCallback, useMemo } from 'react';
import type { GridColDef, GridFilterModel, GridFilterItem } from '@mui/x-data-grid';
import type { HeaderFilterConfig } from '../types';
import { createElement } from 'react';
import { TextField, Box } from '@mui/material';

interface UseHeaderFiltersParams {
  columns: GridColDef[];
  config?: HeaderFilterConfig;
}

interface UseHeaderFiltersResult {
  filterModel: GridFilterModel;
  headerFilterRow: GridColDef[] | null;
  onFilterChange: (field: string, value: string) => void;
  isActive: boolean;
}

export function useHeaderFilters({
  columns,
  config,
}: UseHeaderFiltersParams): UseHeaderFiltersResult {
  const [internalFilter, setInternalFilter] = useState<Record<string, string>>({});

  const filterModel: GridFilterModel = useMemo(() => {
    if (config?.filterModel) return config.filterModel;
    const items: GridFilterItem[] = Object.entries(internalFilter)
      .filter(([, value]) => value.length > 0)
      .map(([field, value], idx) => ({
        id: idx,
        field,
        operator: 'contains',
        value,
      }));
    return { items };
  }, [config?.filterModel, internalFilter]);

  const onFilterChange = useCallback(
    (field: string, value: string) => {
      if (config?.onFilterModelChange) {
        const items: GridFilterItem[] = [
          ...filterModel.items.filter((item) => item.field !== field),
          ...(value ? [{ id: Date.now(), field, operator: 'contains', value }] : []),
        ];
        config.onFilterModelChange({ items });
      } else {
        setInternalFilter((prev) => ({ ...prev, [field]: value }));
      }
    },
    [config, filterModel],
  );

  const headerFilterRow = useMemo(() => {
    if (!config?.enabled) return null;
    return columns.map((col) => ({
      ...col,
      renderHeader: () =>
        createElement(
          Box,
          { sx: { display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 } },
          createElement(Box, { sx: { fontWeight: 500, fontSize: '0.875rem' } }, col.headerName ?? col.field),
          col.filterable !== false
            ? createElement(TextField, {
                size: 'small',
                variant: 'standard',
                placeholder: '...',
                value: internalFilter[col.field] ?? '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  onFilterChange(col.field, e.target.value),
                sx: { '& .MuiInput-input': { fontSize: '0.75rem', py: 0.25 } },
                onClick: (e: React.MouseEvent) => e.stopPropagation(),
              })
            : null,
        ),
    }));
  }, [columns, config?.enabled, internalFilter, onFilterChange]);

  return { filterModel, headerFilterRow, onFilterChange, isActive: !!config?.enabled };
}
