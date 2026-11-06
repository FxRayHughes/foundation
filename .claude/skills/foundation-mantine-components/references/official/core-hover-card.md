# HoverCard
Package: @mantine/core
Import: import { HoverCard } from '@mantine/core';
Description: Display popover section when target element is hovered

## Usage

```tsx
import { HoverCard, Button, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard width={280} shadow="md">
        <HoverCard.Target>
          <Button>Hover to reveal the card</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">
            Hover card is revealed when user hovers over target element, it will be hidden once
            mouse is not over both target and dropdown elements
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## Delays

Set open and close delays in ms with the `openDelay` and `closeDelay` props:

```tsx
import { HoverCard, Button, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard shadow="md" openDelay={1000}>
        <HoverCard.Target>
          <Button>1000ms open delay</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">Opened with 1000ms delay</Text>
        </HoverCard.Dropdown>
      </HoverCard>

      <HoverCard shadow="md" closeDelay={1000}>
        <HoverCard.Target>
          <Button>1000ms close delay</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">Will close with 1000ms delay</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## HoverCard delay group

Use the `HoverCard.Group` component to sync open and close delays of multiple `HoverCard` components:

```tsx
import { HoverCard, Button, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <HoverCard.Group openDelay={500} closeDelay={100}>
      <Group justify="center">
        <HoverCard shadow="md">
          <HoverCard.Target>
            <Button>First</Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">First hover card content</Text>
          </HoverCard.Dropdown>
        </HoverCard>

        <HoverCard shadow="md">
          <HoverCard.Target>
            <Button>Second</Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Second hover card content</Text>
          </HoverCard.Dropdown>
        </HoverCard>

        <HoverCard shadow="md">
          <HoverCard.Target>
            <Button>Third</Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Third hover card content</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    </HoverCard.Group>
  );
}
```


## Activation events

The `events` prop determines which interactions open the dropdown. Fields that are not specified
keep their default values, for example `events={{ focus: false }}` disables focus activation
and leaves hover activation enabled:

Focus activation uses [:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
semantics: the dropdown is opened when the target is focused with the keyboard, but not when it
is focused by a mouse click.

`touch` is disabled by default because there is no hover on touch devices – the first tap would
open the dropdown instead of activating the target. Enable it only if the target does not have its
own tap action. `touch` extends hover activation, it has no effect if `hover` is disabled.

```tsx
import { HoverCard, Button, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard width={280} shadow="md" events={{ focus: false }}>
        <HoverCard.Target>
          <Button>Hover only</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">Focusing the target does not open this dropdown</Text>
        </HoverCard.Dropdown>
      </HoverCard>

      <HoverCard width={280} shadow="md" events={{ touch: true }}>
        <HoverCard.Target>
          <Button>Hover, focus and touch</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">This dropdown is also opened by a tap on touch devices</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## Keyboard interactions

The dropdown is also closed when the user presses outside of the target and the dropdown
(`pointerdown` event), set `closeOnClickOutside={false}` to disable this behavior. Note that the
`clickOutsideEvents` prop is not supported by `HoverCard`: outside press is always detected with
the `pointerdown` event.

```tsx
import { HoverCard, Button, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <Button variant="default">Press Tab to move focus</Button>

      <HoverCard width={280} shadow="md">
        <HoverCard.Target>
          <Button>Hover or focus me</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">
            The dropdown is opened when the target is hovered or focused with the keyboard.
            Press Escape to close it.
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## Interactive dropdown

By default, the dropdown is closed as soon as the pointer leaves the target: if there is a gap
between the target and the dropdown, or if the pointer travels diagonally over unrelated elements,
the dropdown closes before the pointer reaches it.

Set the `interactive` prop to keep the dropdown open while the pointer travels toward it. It is
required by [WCAG 1.4.13](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
if the dropdown contains interactive content. Note that an interactive dropdown intercepts pointer
events of the content it overlaps:

```tsx
import { HoverCard, Button, Text, Group, Anchor } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard width={280} shadow="md" interactive position="bottom-end" offset={40}>
        <HoverCard.Target>
          <Button>Interactive</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">
            Move the pointer diagonally to the{' '}
            <Anchor href="https://mantine.dev" target="_blank">
              link
            </Anchor>{' '}
            – the dropdown stays open
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>

      <HoverCard width={280} shadow="md" position="bottom-end" offset={40}>
        <HoverCard.Target>
          <Button variant="default">Not interactive</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">Moving the pointer outside of the target closes this dropdown</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## With interactive elements

`HoverCard` is displayed only when the mouse is over the target element or dropdown.
You can use anchors and buttons within dropdowns, using inputs is not recommended:

```tsx
import { HoverCard, Avatar, Text, Group, Anchor, Stack } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard width={320} shadow="md" withArrow openDelay={200} closeDelay={400}>
        <HoverCard.Target>
          <Avatar src="https://avatars.githubusercontent.com/u/79146003?s=200&v=4" radius="xl" />
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Group>
            <Avatar src="https://avatars.githubusercontent.com/u/79146003?s=200&v=4" radius="xl" />
            <Stack gap={5}>
              <Text size="sm" fw={700} style={{ lineHeight: 1 }}>
                Mantine
              </Text>
              <Anchor
                href="https://x.com/mantinedev"
                c="dimmed"
                size="xs"
                style={{ lineHeight: 1 }}
              >
                @mantinedev
              </Anchor>
            </Stack>
          </Group>

          <Text size="sm" mt="md">
            Customizable React components and hooks library with focus on usability, accessibility
            and developer experience
          </Text>

          <Group mt="md" gap="xl">
            <Text size="sm">
              <b>0</b> Following
            </Text>
            <Text size="sm">
              <b>1,174</b> Followers
            </Text>
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## Dropdown role

The `role` prop controls the accessible relation between the target and the dropdown:

Use `role="tooltip"` if the dropdown contains only descriptive content – its content is then
announced by screen readers as the description of the target.

Keep the default `role="dialog"` if the dropdown contains headings, links, buttons or any other
content that is not a plain description of the target.

```tsx
import { HoverCard, Text, Group } from '@mantine/core';

function Demo() {
  return (
    <Group justify="center">
      <HoverCard width={280} shadow="md" role="tooltip">
        <HoverCard.Target>
          <Text td="underline dotted" tabIndex={0} w="fit-content">
            Hydration
          </Text>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">
            Attaching React event handlers to the HTML that was rendered on the server
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
```


## Target component

The target element determines where the HoverCard will be positioned relative to.

## Accessibility

`HoverCard` can be opened with a mouse and with the keyboard, and is announced by screen readers:

* The target is focusable if it is an interactive element (a button or a link). If the target is
  not interactive, add `tabIndex={0}` to it to make it reachable with the keyboard.
* Focusing the target with the keyboard opens the dropdown, `Escape` and a press outside of the
  target and the dropdown close it.
* `onDismiss` is called when the dropdown is closed with `Escape` key or with a press outside of
  the target and the dropdown.
* `aria-haspopup`, `aria-expanded`, `aria-controls` and `aria-describedby` attributes are managed
  by the component, see the [Dropdown role](#dropdown-role) section.
* The `returnFocus` prop is ignored while focus activation is enabled (`events.focus`, the
  default): focus is already on the target when the dropdown is opened with the keyboard, and
  returning it after the target was blurred would trap keyboard users on the target. `Escape`
  pressed inside the dropdown always returns focus to the target.

### Limitations

The dropdown is rendered in a portal at the end of `document.body`, it is not a part of the tab
order of the page. Keyboard users can open, read and dismiss the dropdown, but **cannot move focus
into it** – links and buttons inside the dropdown are not reachable with the keyboard.

If the dropdown contains interactive content, that content must also be available elsewhere on the
page. Do not use the `trapFocus` prop to work around this limitation: focus cannot be moved into
the dropdown in the first place, and trapping focus in a hover-triggered element strands keyboard
users.

With `withinPortal={false}` the dropdown is rendered next to the target and focus can be moved into
it with `Tab`, but moving focus out of the dropdown with `Tab` does not close it – the dropdown is
closed with `Escape`, with a press outside or when the pointer leaves the target.

Hover and focus activations do not coordinate: if the pointer leaves the target while the target is
focused with the keyboard, the dropdown is closed after `closeDelay` and is not reopened until the
target is blurred and focused again.


#### Props

**HoverCard props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| arrowOffset | number | - | Arrow offset in px |
| arrowPosition | 'center' \| 'side' | - | Arrow position |
| arrowRadius | number | - | Arrow `border-radius` in px |
| arrowSize | number | - | Arrow size in px |
| children | React.ReactNode | - | `Popover.Target` and `Popover.Dropdown` components |
| clickOutsideCapture | boolean | - | If set, outside click listeners are registered in the capture phase |
| clickOutsideEvents | string[] | - | Not supported by `HoverCard`: outside press is always detected with the `pointerdown` event. Use `closeOnClickOutside` to disable it. |
| closeDelay | number | - | Delay in ms before the dropdown closes after mouse leaves the target or dropdown. Overridden by HoverCard.Group delay if used within a group. |
| closeOnClickOutside | boolean | - | Determines whether the dropdown should be closed when the user presses outside of the target and the dropdown |
| closeOnEscape | boolean | - | Determines whether dropdown should be closed when `Escape` key is pressed |
| defaultOpened | boolean | - | Initial opened state for uncontrolled component |
| disabled | boolean | - | If set, popover dropdown will not be rendered |
| events | HoverCardEvents | - | Determines which events open the dropdown. Fields that are not specified keep their default values. |
| floatingStrategy | FloatingStrategy | - | Changes floating ui [position strategy](https://floating-ui.com/docs/usefloating#strategy) |
| hideDetached | boolean | - | If set, the dropdown is hidden when the element is hidden with styles or not visible on the screen |
| id | string | - | Id base to create accessibility connections |
| initiallyOpened | boolean | - | Initial opened state |
| interactive | boolean | - | If set, the dropdown stays open while the pointer travels from the target to the dropdown and remains over it. Set it if the dropdown contains interactive content. |
| keepMounted | boolean | - | If set, the dropdown is not unmounted from the DOM when hidden. `display: none` styles are added instead. |
| keepMountedMode | "activity" \| "display-none" | - | Controls how the dropdown is hidden when `keepMounted` is set: `'activity'` – hidden with React 19 `Activity` component, `'display-none'` – hidden with `display: none` styles |
| middlewares | PopoverMiddlewares | - | Floating ui middlewares to configure position handling |
| offset | number \| FloatingAxesOffsets | - | Offset of the dropdown element |
| onClose | () => void | - | Called when the dropdown is closed |
| onDismiss | () => void | - | Called when the dropdown is closed with `Escape` key or with a press outside of the target and the dropdown |
| onEnterTransitionEnd | () => void | - | Called when enter transition ends |
| onExitTransitionEnd | () => void | - | Called when exit transition ends |
| onOpen | () => void | - | Called when the dropdown is opened |
| onPositionChange | (position: FloatingPosition) => void | - | Called when dropdown position changes |
| openDelay | number | - | Delay in ms before the dropdown opens after mouse enters the target. Overridden by HoverCard.Group delay if used within a group. |
| overlayProps | OverlayProps & ElementProps<"div"> | - | Props passed down to `Overlay` component |
| portalProps | BasePortalProps | - | Props to pass down to the `Portal` when `withinPortal` is true |
| position | FloatingPosition | - | Dropdown position relative to the target element |
| preventPositionChangeWhenVisible | boolean | - | If `true`, the dropdown picks its side on open (flip runs once, preferring the `position` prop) and then never changes side — scrolling, resizing, and content size changes will not flip the dropdown. The side is recalculated fresh on the next open. Does not affect the `shift` middleware. Set to `false` to keep flip active and allow the dropdown to re-flip on every change. |
| radius | MantineRadius \| number | - | Key of `theme.radius` or any valid CSS value to set border-radius |
| returnFocus | boolean | - | Determines whether focus should be returned to the target when the dropdown closes. Ignored when focus activation is enabled (`events.focus`, the default), otherwise moving focus away from the target would return it and reopen the dropdown. `Escape` pressed inside the dropdown always returns focus to the target. |
| role | "dialog" \| "tooltip" | - | Accessible relation between the target and the dropdown. `dialog` sets `aria-haspopup`, `aria-expanded` and `aria-controls` on the target, `tooltip` sets `aria-describedby` instead and should be used if the dropdown contains only descriptive content. |
| shadow | MantineShadow | - | Key of `theme.shadows` or any other valid CSS `box-shadow` value |
| transitionProps | TransitionProps | - | Props passed down to the `Transition` component. Use to configure duration and animation type. |
| trapFocus | boolean | - | Determines whether focus should be trapped within dropdown |
| width | PopoverWidth | - | Dropdown width, or `'target'` to make dropdown width the same as target element |
| withArrow | boolean | - | Determines whether component should have an arrow |
| withOverlay | boolean | - | Determines whether the overlay should be displayed when the dropdown is opened |
| withRoles | boolean | - | Determines whether dropdown and target elements should have accessible roles |
| withinPortal | boolean | - | Determines whether dropdown should be rendered within the `Portal` |
| zIndex | string \| number | - | Dropdown `z-index` |

**HoverCard..Target props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | required | Target element |
| eventPropsWrapperName | string | - | Name of the prop to wrap event listeners in. Use when the target component expects event listeners in a nested object. For example, some components expect `componentProps={{ onMouseEnter, onMouseLeave }}`. |
| popupType | string | - | Popup accessible type |
| refProp | string | - | Key of the prop that should be used to access element ref |

**HoverCard..Dropdown props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | - | Dropdown content |

**HoverCard..Group props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | required | `HoverCard` components |
| closeDelay | number | - | Close delay in ms |
| openDelay | number | - | Open delay in ms |

**HoverCard.Target props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | required | Target element |
| eventPropsWrapperName | string | - | Name of the prop to wrap event listeners in. Use when the target component expects event listeners in a nested object. For example, some components expect `componentProps={{ onMouseEnter, onMouseLeave }}`. |
| popupType | string | - | Popup accessible type |
| refProp | string | - | Key of the prop that should be used to access element ref |

**HoverCard.Group props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | required | `HoverCard` components |
| closeDelay | number | - | Close delay in ms |
| openDelay | number | - | Open delay in ms |