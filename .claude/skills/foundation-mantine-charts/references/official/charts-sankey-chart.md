# SankeyChart
Package: @mantine/charts
Import: import { SankeyChart } from '@mantine/charts';
Description: Sankey diagram component

## Usage

`SankeyChart` is based on the [Sankey recharts component](https://recharts.org/en-US/api/Sankey).
It visualizes flow between nodes where the width of each link is proportional to the flow value:

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <SankeyChart data={data} />;
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct-Favourite' },
    { name: 'Page-Click' },
    { name: 'Detail-Favourite' },
    { name: 'Lost' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```


## Node color

You can set `color` on each node in the data to control individual node colors.
Colors can reference [theme](https://mantine.dev/llms/theming-theme-object.md) values like `blue`, `red.5`, `orange.7`, etc.
Any valid CSS color value is also accepted.

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <SankeyChart data={data} linkOpacity={0.2} />;
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit', color: 'indigo.6' },
    { name: 'Direct-Favourite', color: 'teal.6' },
    { name: 'Page-Click', color: 'blue.6' },
    { name: 'Detail-Favourite', color: 'cyan.6' },
    { name: 'Lost', color: 'red.6' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```


## Custom colors

Use `colors` prop to provide an array of colors that are used for nodes when no
`color` is set on individual nodes. Colors can reference [theme](https://mantine.dev/llms/theming-theme-object.md) values.
The colors cycle when there are more nodes than colors:

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return (
    <SankeyChart
      data={data}
      colors={['indigo.6', 'cyan.6', 'teal.6', 'orange.6', 'red.6']}
    />
  );
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct-Favourite' },
    { name: 'Page-Click' },
    { name: 'Detail-Favourite' },
    { name: 'Lost' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```


## Node width and padding

Use `nodeWidth` to control the width of each node and `nodePadding` to control
the spacing between nodes:

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <SankeyChart data={data} nodeWidth={20} nodePadding={20} />;
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct-Favourite' },
    { name: 'Page-Click' },
    { name: 'Detail-Favourite' },
    { name: 'Lost' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```


## Link opacity

Use `linkOpacity` prop to control the opacity of links between nodes:

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <SankeyChart data={data} linkOpacity={0.2} />;
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit', color: 'indigo.6' },
    { name: 'Direct-Favourite', color: 'teal.6' },
    { name: 'Page-Click', color: 'blue.6' },
    { name: 'Detail-Favourite', color: 'cyan.6' },
    { name: 'Lost', color: 'red.6' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```


## Disable tooltip

To disable the tooltip, set `withTooltip={false}`:

```tsx
// Demo.tsx
import { SankeyChart } from '@mantine/charts';
import { data } from './data';

function Demo() {
  return <SankeyChart data={data} withTooltip={false} />;
}

// data.ts
export const data = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct-Favourite' },
    { name: 'Page-Click' },
    { name: 'Detail-Favourite' },
    { name: 'Lost' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};
```



#### Props

**SankeyChart props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | - | Additional elements rendered inside `Sankey` component |
| colors | DefaultMantineColor[] | - | An array of colors used for nodes when no `color` is set on individual nodes |
| data | SankeyChartData | required | Data used to render chart, must include `nodes` and `links` arrays |
| height | number | - | Controls chart height |
| iterations | number | - | The number of relaxation iterations |
| linkColor | MantineColor | - | Default color for links, by default depends on color scheme |
| linkCurvature | number | - | The curvature of links between nodes |
| linkOpacity | number | - | Opacity of the link fill |
| nodeColor | MantineColor | - | Default color for nodes, by default depends on color scheme |
| nodePadding | number | - | The padding between nodes |
| nodeWidth | number | - | The width of each node |
| sankeyProps | Partial<Omit<Props, "data" \| "ref">> | - | Props passed down to recharts `Sankey` component |
| textColor | MantineColor | - | Controls text color of labels |
| tooltipAnimationDuration | number | - | Tooltip animation duration in ms |
| tooltipProps | RechartsProps | - | Props passed down to `Tooltip` recharts component |
| valueFormatter | (value: number) => string | - | A function to format values inside the tooltip and node labels |
| withTooltip | boolean | - | Determines whether the tooltip should be displayed when hovered |


#### Styles API

SankeyChart component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**SankeyChart selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| root | .mantine-SankeyChart-root | Root element |
| tooltip | .mantine-SankeyChart-tooltip | Tooltip root element |
| tooltipBody | .mantine-SankeyChart-tooltipBody | Tooltip wrapper around all items |
| tooltipItem | .mantine-SankeyChart-tooltipItem | Tooltip item representing data series |
| tooltipItemBody | .mantine-SankeyChart-tooltipItemBody | Tooltip item wrapper around item color and name |
| tooltipItemColor | .mantine-SankeyChart-tooltipItemColor | Tooltip item color |
| tooltipItemName | .mantine-SankeyChart-tooltipItemName | Tooltip item name |
| tooltipItemData | .mantine-SankeyChart-tooltipItemData | Tooltip item data |
| tooltipLabel | .mantine-SankeyChart-tooltipLabel | Label of the tooltip |

**SankeyChart CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| root | --chart-node-color | Controls color of the chart nodes |
| root | --chart-link-color | Controls color of the chart links |
| root | --chart-text-color | Controls color of the node labels |
| root | --chart-height | Controls height of the chart |
