# CandlestickChart
Package: @mantine/charts
Import: import { CandlestickChart } from '@mantine/charts';
Description: Financial OHLC candlestick chart

## Usage

`CandlestickChart` is a financial chart that displays open, high, low and close (OHLC)
values as candles. The body of a candle shows the open–close range, the thin line shows
the high–low range.

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <CandlestickChart h={300} data={data} dataKey="date"  tickLine="y" gridAxis="x" withXAxis={true} withYAxis={true} withTooltip={true} />;
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```


## Data

`CandlestickChart` requires an array of objects as the `data` prop. Set the `dataKey`
prop to the key that is used for the x-axis (category) values. By default, the chart
reads OHLC values from the `open`, `high`, `low` and `close` keys of each data object:

```tsx
import { CandlestickChart } from '@mantine/charts';

const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
];

function Demo() {
  return <CandlestickChart h={300} data={data} dataKey="date" />;
}
```

Unlike other charts, the y-axis does not start at zero: its domain is calculated from
the lowest and the highest values in the data. To change the domain, pass `domain`
through `yAxisProps`.

## Custom data keys

If your data uses keys other than `open`/`high`/`low`/`close`, map them with the
`dataKeys` prop:

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <CandlestickChart
      h={300}
      data={data}
      dataKey="day"
      dataKeys={{ open: 'o', high: 'h', low: 'l', close: 'c' }}
    />
  );
}

// data.ts
export const data = [
  { day: 'Mon', o: 136, h: 142, l: 133, c: 140 },
  { day: 'Tue', o: 140, h: 145, l: 131, c: 133 },
  { day: 'Wed', o: 133, h: 138, l: 129, c: 137 },
  { day: 'Thu', o: 137, h: 150, l: 136, c: 148 },
  { day: 'Fri', o: 148, h: 154, l: 145, c: 146 },
];
```


## Colors

Use `upColor` and `downColor` props to change the colors of rising (`close >= open`)
and falling candles. Colors are referenced from [theme](https://mantine.dev/llms/theming-colors.md) the same way as in other components,
for example, `blue`, `red.5`, `orange.7`, etc. Any valid CSS color value is also accepted.

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <CandlestickChart
      h={300}
      data={data}
      dataKey="date"
      upColor="blue.6"
      downColor="orange.6"
    />
  );
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```


## Candle width

By default, candles take up the available category width. Use the `maxCandleWidth`
prop to limit the maximum candle width in px:

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <CandlestickChart h={300} data={data} dataKey="date" maxCandleWidth={12} />;
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```


## Value formatter

To format values on the y-axis and inside the tooltip, use the `valueFormatter` prop.
It accepts a function that takes a number value as an argument and returns a formatted value:

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <CandlestickChart
      h={300}
      data={data}
      dataKey="date"
      valueFormatter={(value) => `$${value.toFixed(2)}`}
    />
  );
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```


## Tooltip labels

The tooltip displays open, high, low and close values with English labels by default.
Use the `labels` prop to change them:

```tsx
import { CandlestickChart } from '@mantine/charts';

function Demo() {
  return (
    <CandlestickChart
      data={data}
      dataKey="date"
      labels={{ open: 'Ouverture', high: 'Haut', low: 'Bas', close: 'Clôture' }}
    />
  );
}
```

## Axis labels

Use `xAxisLabel` and `yAxisLabel` props to display axis labels:

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <CandlestickChart
      h={300}
      data={data}
      dataKey="date"
      xAxisLabel="Date"
      yAxisLabel="Price"
    />
  );
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```


## Reference lines

Use the `referenceLines` prop to render reference lines, for example to highlight
support and resistance levels:

```tsx
// Demo.tsx
import { CandlestickChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <CandlestickChart
      h={300}
      data={data}
      dataKey="date"
      referenceLines={[
        { y: 160, label: 'Resistance', color: 'red.6' },
        { y: 128, label: 'Support', color: 'teal.6' },
      ]}
    />
  );
}

// data.ts
export const data = [
  { date: 'Mar 01', open: 136, high: 142, low: 133, close: 140 },
  { date: 'Mar 02', open: 140, high: 145, low: 138, close: 139 },
  { date: 'Mar 03', open: 139, high: 141, low: 129, close: 131 },
  { date: 'Mar 04', open: 131, high: 134, low: 124, close: 125 },
  { date: 'Mar 05', open: 125, high: 133, low: 124, close: 132 },
  { date: 'Mar 06', open: 132, high: 138, low: 131, close: 137 },
  { date: 'Mar 07', open: 137, high: 137, low: 128, close: 129 },
  { date: 'Mar 08', open: 129, high: 135, low: 127, close: 134 },
  { date: 'Mar 09', open: 134, high: 148, low: 133, close: 146 },
  { date: 'Mar 10', open: 146, high: 152, low: 144, close: 151 },
  { date: 'Mar 11', open: 151, high: 154, low: 143, close: 145 },
  { date: 'Mar 12', open: 145, high: 149, low: 142, close: 148 },
  { date: 'Mar 13', open: 148, high: 156, low: 147, close: 155 },
  { date: 'Mar 14', open: 155, high: 158, low: 150, close: 152 },
  { date: 'Mar 15', open: 152, high: 153, low: 141, close: 143 },
  { date: 'Mar 16', open: 143, high: 147, low: 139, close: 146 },
  { date: 'Mar 17', open: 146, high: 160, low: 145, close: 159 },
  { date: 'Mar 18', open: 159, high: 164, low: 156, close: 157 },
  { date: 'Mar 19', open: 157, high: 162, low: 153, close: 161 },
  { date: 'Mar 20', open: 161, high: 168, low: 160, close: 166 },
];
```



#### Props

**CandlestickChart props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| accessibilityLayer | boolean | - | Determines whether the chart should be keyboard-navigable with the recharts accessibility layer, `true` by default |
| candleStrokeWidth | number | - | Stroke width of the candle wick and body outline |
| children | React.ReactNode | - | Additional components that are rendered inside recharts `ComposedChart` component |
| composedChartProps | (CartesianChartProps<unknown> & { ref?: Ref<SVGSVGElement>; }) \| undefined | - | Props passed down to recharts `ComposedChart` component |
| data | Record<string, any>[] | required | Data used to display chart |
| dataKey | string | required | Key of the `data` object for x-axis values |
| dataKeys | CandlestickChartDataKeys | - | Keys of the `data` object used to read open, high, low and close values |
| downColor | MantineColor | - | Color of candles with `close < open`, key of `theme.colors` or any valid CSS color |
| gridAxis | "none" \| "x" \| "y" \| "xy" | - | Specifies which lines should be displayed in the grid, `'x'` by default |
| gridColor | MantineColor | - | Color of the grid and cursor lines, by default depends on color scheme |
| gridProps | RechartsProps | - | Props passed down to the `CartesianGrid` component |
| labels | Partial<CandlestickChartLabels> | - | Labels of open, high, low and close values displayed in the tooltip |
| maxCandleWidth | number | - | Maximum candle width in px |
| referenceAreas | ChartReferenceAreaProps[] | - | Reference areas that should be displayed on the chart |
| referenceDots | ChartReferenceDotProps[] | - | Reference dots that should be displayed on the chart |
| referenceLines | ChartReferenceLineProps[] | - | Reference lines that should be displayed on the chart |
| strokeDasharray | string \| number | - | Dash array for the grid lines and cursor, `'5 5'` by default |
| textColor | MantineColor | - | Color of the text displayed inside the chart, `'dimmed'` by default |
| tickLine | "none" \| "x" \| "y" \| "xy" | - | Specifies which axis should have tick line, `'y'` by default |
| tooltipAnimationDuration | number | - | Tooltip position animation duration in ms, `0` by default |
| tooltipProps | RechartsProps | - | Props passed down to the `Tooltip` component |
| unit | string | - | Unit displayed next to each tick in y-axis |
| upColor | MantineColor | - | Color of candles with `close >= open`, key of `theme.colors` or any valid CSS color |
| valueFormatter | (value: number) => string | - | A function to format values on Y axis and inside the tooltip |
| withTooltip | boolean | - | Determines whether chart tooltip should be displayed, `true` by default |
| withXAxis | boolean | - | Determines whether x-axis should be displayed, `true` by default |
| withYAxis | boolean | - | Determines whether y-axis should be displayed, `true` by default |
| xAxisLabel | string | - | A label to display below the x-axis |
| xAxisProps | RechartsProps | - | Props passed down to the `XAxis` recharts component |
| yAxisLabel | string | - | A label to display next to the y-axis |
| yAxisProps | RechartsProps | - | Props passed down to the `YAxis` recharts component |


#### Styles API

CandlestickChart component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**CandlestickChart selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| root | .mantine-CandlestickChart-root | Root element |
| candle | .mantine-CandlestickChart-candle | Candle shape representing open, high, low and close values |
| axis | .mantine-CandlestickChart-axis | X and Y axis of the chart |
| container | .mantine-CandlestickChart-container | Recharts ResponsiveContainer component |
| grid | .mantine-CandlestickChart-grid | Recharts CartesianGrid component |
| tooltip | .mantine-CandlestickChart-tooltip | Tooltip root element |
| tooltipBody | .mantine-CandlestickChart-tooltipBody | Tooltip wrapper around all items |
| tooltipItem | .mantine-CandlestickChart-tooltipItem | Tooltip item representing open, high, low or close value |
| tooltipItemBody | .mantine-CandlestickChart-tooltipItemBody | Tooltip item wrapper around item color and name |
| tooltipItemColor | .mantine-CandlestickChart-tooltipItemColor | Tooltip item color |
| tooltipItemName | .mantine-CandlestickChart-tooltipItemName | Tooltip item name |
| tooltipItemData | .mantine-CandlestickChart-tooltipItemData | Tooltip item data |
| tooltipLabel | .mantine-CandlestickChart-tooltipLabel | Label of the tooltip |
| referenceLine | .mantine-CandlestickChart-referenceLine | Reference line |
| referenceArea | .mantine-CandlestickChart-referenceArea | Reference area |
| referenceDot | .mantine-CandlestickChart-referenceDot | Reference dot |
| axisLabel | .mantine-CandlestickChart-axisLabel | X and Y axis labels |

**CandlestickChart CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| root | --chart-grid-color | Controls color of the grid and cursor lines |
| root | --chart-text-color | Controls color of the axis labels |
