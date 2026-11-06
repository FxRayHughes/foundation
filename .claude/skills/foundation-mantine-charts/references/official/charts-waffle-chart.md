# WaffleChart
Package: @mantine/charts
Import: import { WaffleChart } from '@mantine/charts';
Description: Part-to-whole grid chart with colored cells

## Usage

`WaffleChart` displays parts of a whole as a grid of colored cells. Each segment
of the `data` array is allocated a number of cells proportional to its `value`.

```tsx
// Demo.tsx
import { WaffleChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <WaffleChart data={data} />;
}

// data.ts
import { WaffleChartCell } from '@mantine/charts';

export const data: WaffleChartCell[] = [
  { name: 'Chrome', value: 65, color: 'blue' },
  { name: 'Safari', value: 19, color: 'teal' },
  { name: 'Firefox', value: 10, color: 'orange' },
  { name: 'Other', value: 6, color: 'gray' },
];
```


## Total

By default, the sum of all `value` fields is treated as 100% and the entire grid
is filled. Set `total` to a larger number to leave the remaining cells empty, for example
to display progress towards a goal. Values smaller than the sum of the data are ignored.

## Tooltip

Set `withTooltip` to display a tooltip when a cell is hovered. Use `getTooltipLabel`
to customize its content – the function receives the segment and the number of cells
allocated to it:

```tsx
// Demo.tsx
import { WaffleChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <WaffleChart
      data={data}
      withTooltip
      getTooltipLabel={(cell) => `${cell.name}: ${cell.value}%`}
    />
  );
}

// data.ts
import { WaffleChartCell } from '@mantine/charts';

export const data: WaffleChartCell[] = [
  { name: 'Chrome', value: 65, color: 'blue' },
  { name: 'Safari', value: 19, color: 'teal' },
  { name: 'Firefox', value: 10, color: 'orange' },
  { name: 'Other', value: 6, color: 'gray' },
];
```


## Legend

Legend is displayed at the bottom of the chart by default. Use `legendPosition`
to move it to the `top`, `left` or `right` side, or set `withLegend={false}` to hide it:

```tsx
// Demo.tsx
import { WaffleChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <WaffleChart data={data}  legendPosition="bottom" />;
}

// data.ts
import { WaffleChartCell } from '@mantine/charts';

export const data: WaffleChartCell[] = [
  { name: 'Chrome', value: 65, color: 'blue' },
  { name: 'Safari', value: 19, color: 'teal' },
  { name: 'Firefox', value: 10, color: 'orange' },
  { name: 'Other', value: 6, color: 'gray' },
];
```


## Gap and grid size

Use `rows` and `columns` props to change the number of cells in the grid (10 × 10 by default),
`gap` to change the distance between them and `cellRadius` to change their border radius.
Set `size` to control the width of the chart.

```tsx
// Demo.tsx
import { WaffleChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <WaffleChart data={data}  gap={2} columns={10} rows={10} />;
}

// data.ts
import { WaffleChartCell } from '@mantine/charts';

export const data: WaffleChartCell[] = [
  { name: 'Chrome', value: 65, color: 'blue' },
  { name: 'Safari', value: 19, color: 'teal' },
  { name: 'Firefox', value: 10, color: 'orange' },
  { name: 'Other', value: 6, color: 'gray' },
];
```


## Fill direction

`fillDirection` controls the order in which cells are filled:

```tsx
// Demo.tsx
import { WaffleChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <WaffleChart data={data}  fillDirection="left-to-right" />;
}

// data.ts
import { WaffleChartCell } from '@mantine/charts';

export const data: WaffleChartCell[] = [
  { name: 'Chrome', value: 65, color: 'blue' },
  { name: 'Safari', value: 19, color: 'teal' },
  { name: 'Firefox', value: 10, color: 'orange' },
  { name: 'Other', value: 6, color: 'gray' },
];
```


## Empty cells color

Use `emptyColor` prop to change the color of cells that are not allocated to any segment:

```tsx
import { WaffleChart } from '@mantine/charts';

function Demo() {
  return (
    <WaffleChart
      data={[{ name: 'Completed', value: 68, color: 'teal' }]}
      total={100}
      emptyColor="gray.3"
    />
  );
}
```


## Accessibility

The grid is exposed to screen readers as a single image labelled with every segment name and value.
Set `aria-label` or `aria-labelledby` to describe what the values represent, your label is
announced together with the generated data summary.


#### Props

**WaffleChart props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cellRadius | number | - | Cell border radius, |
| columns | number | - | Number of columns, |
| data | WaffleChartCell[] | required | Array of data segments with name, value, and color |
| emptyColor | MantineColor | - | Color of empty (unfilled) cells |
| fillDirection | "right-to-left" \| "left-to-right" \| "top-to-bottom" \| "bottom-to-top" | - | Fill direction, |
| gap | number | - | Gap between cells in px, |
| getTooltipLabel | (cell: WaffleChartCell & { count: number; }) => ReactNode | - | Custom tooltip label formatter |
| legendPosition | "left" \| "right" \| "bottom" \| "top" | - | Legend position, |
| rows | number | - | Number of rows, |
| size | number | - | Chart size (width), auto-calculated from columns if not set |
| total | number | - | Total value for the chart, determines how many cells are filled vs empty, sum of all values by default |
| withLegend | boolean | - | Whether to show legend, |
| withTooltip | boolean | - | Whether to show tooltip on hover, |


#### Styles API

WaffleChart component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**WaffleChart selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| root | .mantine-WaffleChart-root | Root container element |
| grid | .mantine-WaffleChart-grid | SVG grid element |
| cell | .mantine-WaffleChart-cell | Individual cell rect |
| legend | .mantine-WaffleChart-legend | Legend container |
| legendItem | .mantine-WaffleChart-legendItem | Legend item wrapper |
| legendSwatch | .mantine-WaffleChart-legendSwatch | Legend color swatch |
| legendLabel | .mantine-WaffleChart-legendLabel | Legend text label |

**WaffleChart CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| root | --waffle-cell-radius | Controls cell and legend swatch border radius |
| root | --waffle-empty-color | Controls empty cell background color |
