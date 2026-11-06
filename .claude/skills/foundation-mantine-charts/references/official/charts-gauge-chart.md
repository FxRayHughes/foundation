# GaugeChart
Package: @mantine/charts
Import: import { GaugeChart } from '@mantine/charts';
Description: Radial gauge chart for KPI and status display

## Usage

`GaugeChart` displays a single value on a radial arc. The arc is filled from `min`
up to `value`, and the value is displayed in the center of the chart.

```tsx
import { GaugeChart } from '@mantine/charts';

function Demo() {
  return <GaugeChart value={72} size={200} thickness={12} />;
}
```


## Sections

Use `sections` to split the arc into threshold bands. Each section starts where
the previous one ends and is filled up to its own `value`, the last section should end at `max`.

When `sections` is set, the entire arc is colored and `value` is displayed only in the center
label. To mark where the value falls on the arc, use the [target marker](#target-marker):

```tsx
// Demo.tsx
import { GaugeChart } from '@mantine/charts';
import { sections } from './data';

function Demo() {
  return <GaugeChart value={72} sections={sections} />;
}

// data.ts
import { GaugeChartSection } from '@mantine/charts';

export const sections: GaugeChartSection[] = [
  { value: 60, color: 'teal' },
  { value: 80, color: 'yellow' },
  { value: 100, color: 'red' },
];
```


## Target marker

Set `target` to draw a line marker across the arc at the given value.
Use `targetColor` and `targetSize` to change its color and thickness:

```tsx
// Demo.tsx
import { GaugeChart } from '@mantine/charts';
import { sections } from './data';

function Demo() {
  return <GaugeChart value={72} target={75} sections={sections} />;
}

// data.ts
import { GaugeChartSection } from '@mantine/charts';

export const sections: GaugeChartSection[] = [
  { value: 60, color: 'teal' },
  { value: 80, color: 'yellow' },
  { value: 100, color: 'red' },
];
```


## Start and end angle

`startAngle` and `endAngle` control the span of the arc in degrees, `-120` and `120` by
default. `0` is the top of the chart, positive values go clockwise:

```tsx
import { GaugeChart } from '@mantine/charts';

function Demo() {
  return <GaugeChart value={72} startAngle={-90} endAngle={90} />;
}
```


A span of 360 degrees renders a full circle. Set `endAngle` lower than `startAngle`
to draw the arc counter-clockwise:

```tsx
import { GaugeChart } from '@mantine/charts';

function Demo() {
  return (
    <>
      {/* Full circle */}
      <GaugeChart value={72} startAngle={0} endAngle={360} />

      {/* Counter-clockwise */}
      <GaugeChart value={72} startAngle={120} endAngle={-120} />
    </>
  );
}
```

## Thickness

`thickness` controls the width of the arc in px, `size` controls both the width and the
height of the chart:

```tsx
import { GaugeChart } from '@mantine/charts';
import { Group } from '@mantine/core';

function Demo() {
  return (
    <Group>
      <GaugeChart value={72} thickness={6} size={160} />
      <GaugeChart value={72} thickness={20} size={160} />
    </Group>
  );
}
```


## Custom label

By default, the center label displays `value` formatted with `valueFormatter`. Use the
`label` prop to render any React node instead:

```tsx
import { GaugeChart } from '@mantine/charts';
import { Text } from '@mantine/core';

function Demo() {
  return (
    <GaugeChart
      value={72}
      label={
        <div>
          <Text ta="center" fz="xl" fw={700}>72%</Text>
          <Text ta="center" fz="xs" c="dimmed">CPU Usage</Text>
        </div>
      }
    />
  );
}
```


## Round caps

Set `roundCaps` to round the endpoints of the arc:

```tsx
import { GaugeChart } from '@mantine/charts';
import { Group } from '@mantine/core';

function Demo() {
  return (
    <Group>
      <GaugeChart value={72} roundCaps size={160} />
      <GaugeChart value={72} roundCaps={false} size={160} />
      <GaugeChart
        value={72}
        roundCaps
        size={160}
        sections={[
          { value: 60, color: 'teal' },
          { value: 80, color: 'yellow' },
          { value: 100, color: 'red' },
        ]}
      />
    </Group>
  );
}
```


## Accessibility

The chart has `role="meter"`. Set `aria-label` to give it an accessible name:

```tsx
import { GaugeChart } from '@mantine/charts';

function Demo() {
  return <GaugeChart value={72} aria-label="CPU utilization" />;
}
```


#### Props

**GaugeChart props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| endAngle | number | - | End angle in degrees, |
| filledColor | MantineColor | - | Color of the filled arc when sections are not provided |
| label | React.ReactNode | - | Label displayed in the center of the gauge |
| max | number | - | Maximum value of the gauge, |
| min | number | - | Minimum value of the gauge, |
| roundCaps | boolean | - | Whether to round arc endpoints. With `sections`, only the outer ends of the first and last sections are rounded. |
| sections | GaugeChartSection[] | - | Threshold sections of the gauge arc, each section is filled from the previous section upper bound to its own `value`. If set, the arc is not filled based on `value`. |
| size | number | - | Chart size (width and height), |
| startAngle | number | - | Start angle in degrees, |
| target | number | - | Value marked on the arc with a line marker, use to display a goal or the current value of a gauge with `sections` |
| targetColor | MantineColor | - | Color of the target marker |
| targetSize | number | - | Thickness of the target marker, |
| thickness | number | - | Arc thickness in px, |
| trackColor | MantineColor | - | Color of the gauge track (unfilled portion) |
| value | number | required | Current value to display. Fills the arc from `min` up to `value`, unless `sections` is set – then the arc is colored by thresholds and the value is displayed only in the center label. |
| valueFormatter | (value: number) => string | - | Value formatter for default label, |


#### Styles API

GaugeChart component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**GaugeChart selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| root | .mantine-GaugeChart-root | Root SVG element |
| track | .mantine-GaugeChart-track | Background arc path |
| section | .mantine-GaugeChart-section | Filled section arc path |
| sectionCap | .mantine-GaugeChart-sectionCap | Round-capped copy of the first and last sections, rendered when roundCaps is set |
| needle | .mantine-GaugeChart-needle | Target marker line |
| label | .mantine-GaugeChart-label | Center label container |

**GaugeChart CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| root | --gauge-size | Controls chart width, height is derived from the arc proportions |
