# MatrixChart
Package: @mantine/charts
Import: import { MatrixChart } from '@mantine/charts';
Description: Generic x/y heatmap with categorical axes

## Usage

`MatrixChart` is a generic x/y heatmap with categorical axes. Each cell is colored based on a value.
Data is an array of objects with `x`, `y`, and `value` properties.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      yLabels={['James', 'Mary', 'Robert', 'Linda', 'Michael', 'Sarah', 'David', 'Emma']}
      withYLabels
      withTooltip
      getTooltipLabel={({ x, y, value }) =>
        `${y}, Mar ${x}: ${value === null ? 'No contributions' : `${value} contribution${value > 1 ? 's' : ''}`}`
      }
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const data: MatrixChartCell[] = [
  { x: '1', y: 'James', value: 7 },
  { x: '2', y: 'James', value: 10 },
  { x: '3', y: 'James', value: 2 },
  { x: '4', y: 'James', value: 10 },
  { x: '5', y: 'James', value: 8 },
  { x: '6', y: 'James', value: null },
  { x: '7', y: 'James', value: null },
  { x: '8', y: 'James', value: 6 },
  { x: '9', y: 'James', value: 2 },
  { x: '10', y: 'James', value: 8 },
  { x: '11', y: 'James', value: 1 },
  { x: '12', y: 'James', value: 3 },
  { x: '13', y: 'James', value: 7 },
  { x: '14', y: 'James', value: null },
  { x: '15', y: 'James', value: 9 },
  { x: '16', y: 'James', value: 10 },
  { x: '17', y: 'James', value: null },
  { x: '18', y: 'James', value: 1 },
  { x: '19', y: 'James', value: 8 },
  { x: '20', y: 'James', value: null },
  { x: '21', y: 'James', value: null },
  { x: '22', y: 'James', value: 5 },
  { x: '23', y: 'James', value: 8 },
  { x: '24', y: 'James', value: 2 },
  { x: '25', y: 'James', value: 5 },
  { x: '26', y: 'James', value: 6 },
  { x: '27', y: 'James', value: null },
  { x: '28', y: 'James', value: null },
  { x: '29', y: 'James', value: 7 },
  { x: '30', y: 'James', value: 7 },
  { x: '31', y: 'James', value: 6 },
  { x: '1', y: 'Mary', value: 3 },
  { x: '2', y: 'Mary', value: 1 },
  // ... remaining data
];
```


## Data format

Data is an array of `MatrixChartCell` objects:

```tsx
interface MatrixChartCell {
  x: string;
  y: string;
  value: number | null;
}
```

* `x` – column identifier
* `y` – row identifier
* `value` – numeric value for color interpolation, `null` for empty cells

## Labels

Set `withXLabels` and `withYLabels` to display axis labels. By default, labels are taken
from `x` and `y` values of `data`. Use `xLabels` and `yLabels` props to change them and
`xLabelsPosition="top"` to display x-axis labels above the chart.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return <MatrixChart data={data} xLabels={xLabels} yLabels={yLabels} withYLabels withXLabels />;
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## X-axis labels rotation

By default, x-axis labels are rotated -90 degrees. Use `xLabelsRotation` prop to change the angle.
Set it to `0` for horizontal labels or `-45` for angled labels.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      xLabelsRotation={-45}
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Tooltip

Set `withTooltip` prop and provide `getTooltipLabel` function to display a tooltip on cell hover.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      withTooltip
      getTooltipLabel={({ x, y, value }) =>
        `${y} ${x}: ${value === null ? 'No data' : `${value} visitors`}`
      }
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Colors

Use `colors` prop to customize the color palette. Colors are interpolated based on the cell value
within the domain range.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      colors={[
        'var(--mantine-color-orange-2)',
        'var(--mantine-color-orange-4)',
        'var(--mantine-color-orange-6)',
        'var(--mantine-color-orange-9)',
      ]}
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Values domain

By default, domain is auto-calculated from data min/max values. Use `domain` prop to set
a custom `[min, max]` range for color interpolation.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      domain={[0, 50]}
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Cell size and gap

Use `cellSize` and `gap` props to control cell dimensions and spacing. `cellRadius` controls
the border radius of cells.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      cellSize={30}
      gap={3}
      cellRadius={4}
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Pass props to cells

Use `getCellProps` callback to add custom props to individual cells based on their data.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      getCellProps={(cell) => {
        if (cell.value === null) {
          return {};
        }

        if (cell.value >= 25) {
          return { fill: 'var(--mantine-color-teal-6)' };
        }

        if (cell.value >= 15) {
          return { fill: 'var(--mantine-color-yellow-6)' };
        }

        return { fill: 'var(--mantine-color-red-6)' };
      }}
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Legend

Set `withLegend` prop to display a color legend below the chart. Use `legendLabels` prop
to customize the legend text.

```tsx
// Demo.tsx
import { MatrixChart } from '@mantine/charts';
import { data, xLabels, yLabels } from './data';

function Demo() {
  return (
    <MatrixChart
      data={data}
      xLabels={xLabels}
      yLabels={yLabels} withYLabels
      withXLabels
      withLegend
    />
  );
}

// data.ts
import { MatrixChartCell } from '@mantine/charts';

export const xLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
export const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data: MatrixChartCell[] = [
  { x: '6 AM', y: 'Mon', value: 3 },
  { x: '8 AM', y: 'Mon', value: 14 },
  { x: '10 AM', y: 'Mon', value: 26 },
  { x: '12 PM', y: 'Mon', value: 30 },
  { x: '2 PM', y: 'Mon', value: 28 },
  { x: '4 PM', y: 'Mon', value: 22 },
  { x: '6 PM', y: 'Mon', value: 12 },
  { x: '8 PM', y: 'Mon', value: 5 },
  { x: '6 AM', y: 'Tue', value: 4 },
  { x: '8 AM', y: 'Tue', value: 16 },
  { x: '10 AM', y: 'Tue', value: 28 },
  { x: '12 PM', y: 'Tue', value: 32 },
  { x: '2 PM', y: 'Tue', value: 30 },
  { x: '4 PM', y: 'Tue', value: 24 },
  { x: '6 PM', y: 'Tue', value: 14 },
  { x: '8 PM', y: 'Tue', value: 6 },
  { x: '6 AM', y: 'Wed', value: 5 },
  { x: '8 AM', y: 'Wed', value: 18 },
  { x: '10 AM', y: 'Wed', value: 30 },
  { x: '12 PM', y: 'Wed', value: 35 },
  { x: '2 PM', y: 'Wed', value: 32 },
  { x: '4 PM', y: 'Wed', value: 26 },
  { x: '6 PM', y: 'Wed', value: 16 },
  { x: '8 PM', y: 'Wed', value: 8 },
  { x: '6 AM', y: 'Thu', value: 3 },
  { x: '8 AM', y: 'Thu', value: 15 },
  { x: '10 AM', y: 'Thu', value: 25 },
  { x: '12 PM', y: 'Thu', value: 29 },
  { x: '2 PM', y: 'Thu', value: 27 },
  { x: '4 PM', y: 'Thu', value: 21 },
  { x: '6 PM', y: 'Thu', value: 13 },
  { x: '8 PM', y: 'Thu', value: 7 },
  { x: '6 AM', y: 'Fri', value: 2 },
  { x: '8 AM', y: 'Fri', value: 12 },
  { x: '10 AM', y: 'Fri', value: 22 },
  { x: '12 PM', y: 'Fri', value: 26 },
  { x: '2 PM', y: 'Fri', value: 24 },
  { x: '4 PM', y: 'Fri', value: 18 },
  { x: '6 PM', y: 'Fri', value: 15 },
  { x: '8 PM', y: 'Fri', value: 10 },
  { x: '6 AM', y: 'Sat', value: 1 },
  { x: '8 AM', y: 'Sat', value: 4 },
  { x: '10 AM', y: 'Sat', value: 8 },
  { x: '12 PM', y: 'Sat', value: 12 },
  { x: '2 PM', y: 'Sat', value: 14 },
  { x: '4 PM', y: 'Sat', value: 10 },
  { x: '6 PM', y: 'Sat', value: 8 },
  { x: '8 PM', y: 'Sat', value: 6 },
  { x: '6 AM', y: 'Sun', value: null },
  { x: '8 AM', y: 'Sun', value: 2 },
  { x: '10 AM', y: 'Sun', value: 5 },
  { x: '12 PM', y: 'Sun', value: 9 },
  { x: '2 PM', y: 'Sun', value: 10 },
  { x: '4 PM', y: 'Sun', value: 7 },
  { x: '6 PM', y: 'Sun', value: 5 },
  { x: '8 PM', y: 'Sun', value: 3 },
];
```


## Accessibility

Cells are not announced by screen readers. Set `aria-label` or `aria-labelledby`
to describe what the chart shows:

```tsx
import { MatrixChart } from '@mantine/charts';

function Demo() {
  return <MatrixChart data={[]} aria-label="Deployments per service and weekday" />;
}
```


#### Props

**MatrixChart props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cellRadius | number | - | Cell border radius, |
| cellSize | number | - | Cell size in px, |
| colors | DefaultMantineColor[] | - | Array of colors for value interpolation, by default 4 shades of green colors are used |
| data | MatrixChartData | required | Array of cell objects with x, y, and value |
| domain | [number, number] | - | Value domain [min, max] for color interpolation, auto-calculated if not set |
| emptyColor | MantineColor | - | Color for empty/null cells |
| fontSize | number | - | Font size for axis labels, |
| gap | number | - | Gap between cells in px, |
| getCellProps | (cell: MatrixChartCell) => SVGProps<SVGRectElement> | - | Callback to add custom props to cells |
| getTooltipLabel | (cell: MatrixChartCell) => ReactNode | - | A function to generate tooltip label based on the hovered cell, required for the tooltip to be visible |
| legendLabels | [string, string] | - | Legend labels, |
| tooltipProps | Partial<TooltipFloatingProps> | - | Props passed down to the `Tooltip.Floating` component |
| withLegend | boolean | - | Whether to show legend, |
| withTooltip | boolean | - | If set, tooltip is displayed on cell hover, requires `getTooltipLabel` to be set |
| withXLabels | boolean | - | If set, x-axis labels are displayed, |
| withYLabels | boolean | - | If set, y-axis labels are displayed, |
| xLabels | string[] | - | Labels for x-axis (columns), displayed along top or bottom |
| xLabelsHeight | number | - | Height reserved for x-axis labels, |
| xLabelsPosition | "bottom" \| "top" | - | X-axis label position, |
| xLabelsRotation | number | - | Rotation angle for x-axis labels in degrees, |
| yLabels | string[] | - | Labels for y-axis (rows), displayed along left side |
| yLabelsWidth | number | - | Width reserved for y-axis labels, |


#### Styles API

MatrixChart component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**MatrixChart selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| root | .mantine-MatrixChart-root | Root SVG element |
| cell | .mantine-MatrixChart-cell | Individual cell rect element |
| xLabel | .mantine-MatrixChart-xLabel | X-axis label text |
| yLabel | .mantine-MatrixChart-yLabel | Y-axis label text |
| legend | .mantine-MatrixChart-legend | Legend group element |
| legendLabel | .mantine-MatrixChart-legendLabel | Legend text label |
| legendRect | .mantine-MatrixChart-legendRect | Legend color rect |

**MatrixChart CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| root | --matrix-level-1 | Controls color of the cells in the lowest value range |
| root | --matrix-level-2 | Controls color of the cells in the second value range |
| root | --matrix-level-3 | Controls color of the cells in the third value range |
| root | --matrix-level-4 | Controls color of the cells in the highest value range |
| root | --matrix-empty-bg | Controls background color of empty cells |
