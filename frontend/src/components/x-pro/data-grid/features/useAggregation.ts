import { useMemo } from 'react';
import type { GridRowModel } from '@mui/x-data-grid';
import type { AggregationModel, AggregationFunction, CustomAggregationFn, AggregationResult } from '../premium-types';

interface UseAggregationParams {
  rows: GridRowModel[];
  aggregationModel?: AggregationModel;
}

function computeBuiltIn(values: unknown[], fn: AggregationFunction): unknown {
  const nums = values
    .map((v) => (typeof v === 'number' ? v : parseFloat(String(v))))
    .filter((n) => !isNaN(n));

  switch (fn) {
    case 'count':
      return values.length;
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case 'min':
      return nums.length > 0 ? Math.min(...nums) : 0;
    case 'max':
      return nums.length > 0 ? Math.max(...nums) : 0;
    default:
      return null;
  }
}

export function useAggregation({ rows, aggregationModel }: UseAggregationParams): AggregationResult {
  const footerRow = useMemo(() => {
    if (!aggregationModel || Object.keys(aggregationModel).length === 0) {
      return null;
    }

    const footer: GridRowModel = { id: '__aggregation_footer__' };

    for (const [field, fnOrCustom] of Object.entries(aggregationModel)) {
      const values = rows.map((r) => r[field]);

      if (typeof fnOrCustom === 'function') {
        footer[field] = (fnOrCustom as CustomAggregationFn)(values);
      } else {
        footer[field] = computeBuiltIn(values, fnOrCustom as AggregationFunction);
      }
    }

    return footer;
  }, [rows, aggregationModel]);

  return { footerRow };
}
