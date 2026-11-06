# Tooltip
Package: @mantine/core
Import: import { Tooltip } from '@mantine/core';
Description: Renders tooltip at given element on mouse over or other event

## Usage

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip label="Tooltip">
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```


## Tooltip children

Tooltip requires an element or a component as a single child –
strings, fragments, numbers and multiple elements/components are not supported and **will throw an error**.
Custom components must provide a prop to get the root element ref;
all Mantine components support ref out of the box.

```tsx
import { Badge, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <>
      <Tooltip label="OK">
        <button>Native button – ok</button>
      </Tooltip>

      <Tooltip label="OK">
        <Badge>Mantine component – ok</Badge>
      </Tooltip>

      <Tooltip label="Throws">
        Raw string, NOT OK – will throw an error
      </Tooltip>

      {/* Number, NOT OK – will throw an error */}
      <Tooltip label="Throws">{2}</Tooltip>

      <Tooltip label="Throws">
        <>Fragment, NOT OK, will throw an error</>
      </Tooltip>

      <Tooltip label="Throws">
        <div>More than one node</div>
        <div>NOT OK, will throw an error</div>
      </Tooltip>
    </>
  );
}
```

## Tooltip target

The `target` prop is an alternative to `children`. It accepts a string (selector),
an HTML element or a ref object with an HTML element. Use the `target` prop when you do
not render the tooltip target as a JSX element.

Example of using the `target` prop with a string selector:

```tsx
import { Button, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <>
      <Tooltip target="#hover-me" label="Tooltip over button" />
      <Button id="hover-me">Hover me to see tooltip</Button>
    </>
  );
}
```


## Hide detached

Use the `hideDetached` prop to configure how the tooltip behaves when the target
element is removed from the DOM, hidden with `display: none`, or scrolled out of
the viewport or of a scrollable container that clips it.

By default, `hideDetached` is enabled – the tooltip is hidden with the target element.
You can change this behavior with `hideDetached={false}`.

Note that `hideDetached` has no effect on [Tooltip.Floating](#floating-tooltip) –
it is positioned relative to the mouse pointer rather than to a target element.

In test environments based on jsdom (Jest, Vitest) every element reports a zero-size rectangle,
so the target is always considered detached and the tooltip is hidden. Set `env="test"` on
[MantineProvider](https://mantine.dev/llms/theming-mantine-provider.md#env) in your test wrapper, as described in the
[Jest](https://mantine.dev/llms/guides-jest.md) and [Vitest](https://mantine.dev/llms/guides-vitest.md) guides, or pass `hideDetached={false}` –
otherwise `hideDetached` detection is disabled only in the `test` environment.

To see the difference, try to scroll the root element of the following demo:

```tsx
import { Box, Button, Group, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <Box
      bd="1px solid var(--mantine-color-dimmed)"
      p="xl"
      w={{ base: 340, sm: 400 }}
      h={200}
      style={{ overflow: 'auto' }}
    >
      <Box w={1000} h={400}>
        <Group>
          <Tooltip label="Hidden when detached" position="bottom" opened>
            <Button>Hides when detached</Button>
          </Tooltip>

          <Tooltip label="Visible when detached" position="bottom" opened hideDetached={false}>
            <Button>Stays visible</Button>
          </Tooltip>
        </Group>
      </Box>
    </Box>
  );
}
```


## Required ref prop

Custom components that are rendered inside `Tooltip` are required to support `ref` prop:

```tsx
// Example of code that WILL NOT WORK
import { Tooltip } from '@mantine/core';

function MyComponent() {
  return <div>My component</div>;
}

// This will not work – MyComponent does not support ref
function Demo() {
  return (
    <Tooltip label="Does not work">
      <MyComponent />
    </Tooltip>
  );
}
```

The component must support `ref` prop:

```tsx
// Example of code that will work
import { Tooltip } from '@mantine/core';

const MyComponent = ({ ref, ...props }) => (
  <div ref={ref} {...props}>
    My component
  </div>
);

// Works correctly – ref is forwarded
function Demo() {
  return (
    <Tooltip label="Works fine">
      <MyComponent />
    </Tooltip>
  );
}
```

## Color

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip label="Tooltip" color="blue">
      <Button>With tooltip</Button>
    </Tooltip>
  );
}
```


## Offset

Set the `offset` prop to a number to change the tooltip position relative to the target element.
This way you can control the tooltip offset on the main axis only.

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip label="Tooltip" opened position="top" offset={5}>
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```


To control the offset on both axes, pass an object with `mainAxis` and `crossAxis` properties:

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip
      position="top"
      opened
      label="Tooltip"
      offset={{ mainAxis: 5, crossAxis: 0 }}
    >
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```


## Arrow

Set the `withArrow` prop to add an arrow to the tooltip. The arrow is a `div` element rotated with `transform: rotate(45deg)`.

The `arrowPosition` prop determines how the arrow is positioned relative to the target element when `position` is set to `*-start` and `*-end` values on the `Popover` component.
By default, the value is `center` – the arrow is positioned in the center of the target element if it is possible.

If you change `arrowPosition` to `side`, then the arrow will be positioned on the side of the target element,
and you will be able to control the arrow offset with the `arrowOffset` prop. Note that when `arrowPosition` is set to `center`,
the `arrowOffset` prop is ignored.

If you set `arrowPosition` to `merge`, the arrow will form a right triangle merged with the corresponding
corner of the tooltip, and the border radius of that corner will be removed. This mode only works
with `*-start` and `*-end` positions. Note that `arrowOffset` and `arrowRadius` props are ignored
when `arrowPosition` is set to `merge`.

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip arrowPosition="center" arrowOffset={10} arrowSize={4} arrowRadius={0} label="Tooltip" withArrow opened position="top-start">
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```


## Controlled

```tsx
import { useState } from 'react';
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  const [opened, setOpened] = useState(true);

  return (
    <Tooltip label="Ctrl + J" opened={opened}>
      <Button onClick={() => setOpened((o) => !o)}>
        Toggle color scheme
      </Button>
    </Tooltip>
  );
}
```


## Change events

Events that trigger the tooltip can be changed with the `events` prop; it accepts an object
with the following properties that determine which events will trigger the tooltip:

* `hover` – mouse hover event, `true` by default
* `focus` – focus/blur events excluding clicks on the target element, `false` by default
* `touch` – events for touchscreen devices, `false` by default

```tsx
import { Tooltip } from '@mantine/core';

function Demo() {
  return (
    <Tooltip
      label="Tooltip"
      events={{ hover: true, focus: true, touch: false }}
    >
      <button>target</button>
    </Tooltip>
  );
}
```

## Interactive tooltip

By default, the tooltip closes as soon as the pointer leaves the target element, and the tooltip body ignores pointer events. Set the `interactive` prop to keep the tooltip open while the pointer travels from the target to the tooltip and rests over its content.

The `interactive` prop satisfies the *hoverable* condition of [WCAG 2.1 success criterion 1.4.13: Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html), so the pointer can reach the tooltip body without dismissing it, for example to read or select its content.

Do not put interactive or focusable content (links, buttons, inputs) inside a tooltip. Interactive content should be put in a [Popover](https://mantine.dev/llms/core-popover.md) instead, which is reachable by mouse, keyboard, and touch.

Note that an interactive tooltip receives pointer events, which means that while it is open, it intercepts clicks and hover events of the elements that it overlaps. The tooltip stops receiving pointer events as soon as it starts closing. The `interactive` prop is not supported by `Tooltip.Floating`, which always follows the mouse.

```tsx
import { Button, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <Tooltip
      interactive
      withArrow
      multiline
      w={220}
      label="This tooltip stays open while you move the pointer onto it, so you can read or select its full contents without it closing."
    >
      <Button>Hover to read the tooltip</Button>
    </Tooltip>
  );
}
```


## Multiline

To enable multiline mode, set the `multiline` prop to enable line breaks and the `w` [style prop](https://mantine.dev/llms/styles-style-props.md) to set the tooltip width:

```tsx
import { Tooltip, Button } from '@mantine/core';

function Demo() {
  return (
    <Tooltip
      multiline
      w={220}
      withArrow
      transitionProps={{ duration: 200 }}
      label="Use this button to save this information in your profile, after that you will be able to access it any time and share it via email."
    >
      <Button>Multiline tooltip</Button>
    </Tooltip>
  );
}
```


## Inline

Set the `inline` prop to use `Tooltip` with inline elements:

```tsx
import { Tooltip, Mark, Text } from '@mantine/core';

function Demo() {
  return (
    <Text>
      Stantler’s magnificent antlers were traded at high prices as works of art. As a result, this
      Pokémon was hunted close to extinction by those who were after the priceless antlers.{' '}
      <Tooltip inline label="Inline tooltip">
        <Mark>When visiting a junkyard</Mark>
      </Tooltip>
      , you may catch sight of it having an intense fight with Murkrow over shiny objects.Ho-Oh’s
      feathers glow in seven colors depending on the angle at which they are struck by light. These
      feathers are said to bring happiness to the bearers. This Pokémon is said to live at the foot
      of a rainbow.
    </Text>
  );
}
```


## Change transition

Tooltip is built with the [Transition](https://mantine.dev/llms/core-transition.md) component; it supports `transitionProps` props:

```tsx
import { Button, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <Tooltip
      label="Tooltip with custom transition"
      transitionProps={{ transition: 'skew-up', duration: 300 }}
    >
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```

All available premade transitions:

```tsx
function Demo() {
  const transitions = keys(MANTINE_TRANSITIONS).map((transition) => (
    <Tooltip key={transition} label={transition} transitionProps={{ transition, duration: 300 }}>
      <Badge variant="light">{transition}</Badge>
    </Tooltip>
  ));

  return (
    <Group justify="center" style={{ cursor: 'default' }}>
      {transitions}
    </Group>
  );
}
```


## Close and open delay

You can delay tooltip open/close events by setting the `openDelay` and `closeDelay` props in ms:

```tsx
import { Button, Tooltip, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <Tooltip label="Opened after 500ms" openDelay={500}>
        <Button>Delay open - 500ms</Button>
      </Tooltip>
      <Tooltip label="Closes after 500ms" closeDelay={500}>
        <Button>Delay close - 500ms</Button>
      </Tooltip>
    </Group>
  );
}
```


## Tooltip delay group

The `Tooltip.Group` component can be used to sync open and close delays for multiple tooltips:

```tsx
import { Tooltip, Button, Group } from '@mantine/core';

function Demo() {
  return (
    <Tooltip.Group openDelay={500} closeDelay={100}>
      <Group justify="center">
        <Tooltip label="Tooltip 1">
          <Button>Button 1</Button>
        </Tooltip>
        <Tooltip label="Tooltip 2">
          <Button>Button 2</Button>
        </Tooltip>
        <Tooltip label="Tooltip 3">
          <Button>Button 3</Button>
        </Tooltip>
      </Group>
    </Tooltip.Group>
  );
}
```


## Floating tooltip

`Tooltip.Floating` component has the same API as the Tooltip component but the tooltip will follow the mouse:

```tsx
import { Box, Tooltip } from '@mantine/core';

function Demo() {
  return (
    <Tooltip.Floating label="Floating tooltip">
      <Box p="xl" bg="var(--mantine-color-blue-light)" style={{ cursor: 'default' }}>
        Hover over the box to see tooltip
      </Box>
    </Tooltip.Floating>
  );
}
```


## Accessibility

Tooltip follows the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):

* The tooltip body has `role="tooltip"` attribute
* The target element has `aria-describedby` attribute
* `Tooltip.Floating` is ignored by screen readers
* Uncontrolled tooltips are dismissed with `Escape` without moving the pointer or focus

By default, Tooltip is not triggered by focus events and thus users who use a screen reader
or navigate with the keyboard will not be able to get tooltip content. Set the `events` prop to enable
focus/blur tooltip events:

```tsx
import { Button, Tooltip } from '@mantine/core';

// Tooltip will be visible for screen readers
function Demo() {
  return (
    <Tooltip
      label="Tooltip"
      events={{ hover: true, focus: true, touch: false }}
    >
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```

[WCAG 2.1 success criterion 1.4.13: Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
additionally requires content that appears on hover to be dismissable, hoverable and persistent.
Tooltip is persistent out of the box and dismissable if its opened state is not controlled
(`Escape` closes it without moving the pointer – if you control the `opened` prop, you are responsible
for handling `Escape` yourself). Tooltip is not hoverable by default – set the
[interactive](#interactive-tooltip) prop to make the tooltip body hoverable:

```tsx
import { Button, Tooltip } from '@mantine/core';

// Tooltip stays open while the pointer is over its content
function Demo() {
  return (
    <Tooltip label="Tooltip" interactive>
      <Button>Button with tooltip</Button>
    </Tooltip>
  );
}
```


#### Props

**Tooltip props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| arrowOffset | number | - | Arrow offset in px |
| arrowPosition | 'center' \| 'side' | - | Arrow position relative to the tooltip |
| arrowRadius | number | - | Arrow `border-radius` in px |
| arrowSize | number | - | Arrow size in px |
| autoContrast | boolean | - | If set, adjusts text color based on background color for `filled` variant |
| children | React.ReactNode | - | Target element, must support `ref` prop and `...others` |
| closeDelay | number | - | Close delay in ms |
| color | MantineColor | - | Key of `theme.colors` or any valid CSS color, controls tooltip background, by default set based on current color scheme |
| defaultOpened | boolean | - | Uncontrolled tooltip initial opened state |
| disabled | boolean | - | If set, tooltip element will not be rendered |
| events | { hover: boolean; focus: boolean; touch: boolean; } | - | Determines which events will be used to show tooltip |
| floatingStrategy | FloatingStrategy | - | Changes floating ui [position strategy](https://floating-ui.com/docs/usefloating#strategy) |
| hideDetached | boolean | - | If set, the tooltip is hidden when the target element is removed from the DOM, hidden with `display: none` or scrolled out of the visible area. Has no effect on `Tooltip.Floating` |
| inline | boolean | - | Must be set if the tooltip target is an inline element |
| interactive | boolean | - | If set, the tooltip stays open while the pointer is over it |
| keepMounted | boolean | - | If set, the tooltip is not unmounted from the DOM when hidden, `display: none` styles are applied instead |
| label | React.ReactNode | required | Tooltip content |
| middlewares | TooltipMiddlewares | - | Floating ui middlewares to configure position handling, `{ flip: true, shift: true, inline: false }` by default |
| multiline | boolean | - | Determines whether content should be wrapped on to the next line, `false` by default |
| offset | number \| FloatingAxesOffsets | - | Space between target element and tooltip in px |
| onPositionChange | (position: FloatingPosition) => void | - | Called when tooltip position changes |
| openDelay | number | - | Open delay in ms |
| opened | boolean | - | Controlled opened state |
| portalProps | Omit<BasePortalProps, "withinPortal"> | - | Props to pass down to the portal when withinPortal is true |
| position | FloatingPosition | - | Tooltip position relative to target element (`Tooltip` component) or mouse (`Tooltip.Floating` component) |
| radius | MantineRadius \| number | - | Key of `theme.radius` or any valid CSS value to set border-radius, numbers are converted to rem@default theme.defaultRadius |
| refProp | string | - | Key of the prop that can be used to access element ref, `ref` by default |
| target | string \| HTMLElement \| RefObject<HTMLElement \| null> \| null | - | Selector, ref of an element or element itself that should be used for positioning |
| transitionProps | TransitionProps | - | Props passed down to the `Transition` component that used to animate tooltip presence, use to configure duration and animation type |
| withArrow | boolean | - | If set, the tooltip has an arrow |
| withinPortal | boolean | - | Determines whether tooltip should be rendered within `Portal`, `true` by default |
| zIndex | string \| number | - | Tooltip z-index, `300` by default |


#### Styles API

Tooltip component supports Styles API. With Styles API, you can customize styles of any inner element. Follow the documentation to learn how to use CSS modules, CSS variables and inline styles to get full control over component styles.

**Tooltip selectors**

| Selector | Static selector | Description |
|----------|----------------|-------------|
| tooltip | .mantine-Tooltip-tooltip | Root element |
| arrow | .mantine-Tooltip-arrow | Tooltip arrow, rendered inside tooltip |

**Tooltip CSS variables**

| Selector | Variable | Description |
|----------|----------|-------------|
| tooltip | --tooltip-bg | Tooltip `background-color` |
| tooltip | --tooltip-radius | Tooltip `border-radius` |
| tooltip | --tooltip-color | Controls tooltip text color |

**Tooltip data attributes**

| Selector | Attribute | Condition | Value |
|----------|-----------|-----------|-------|
| tooltip | data-multiline | `multiline` prop is set | - |
