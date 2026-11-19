---
name: Color Management
description: Add, change, or review UI colors in light and dark mode.
---

# Color Management

This project uses a **semantic color layer** on top of Tailwind CSS v4. The
source of truth for token names and values is `src/global.css`; this skill
describes how to use that layer, not what its current values are. All paths in
this skill are relative to the repository root.

## Ground rules

1. **Use semantic tokens, never the raw palette.** UI code must use `surface-*`,
   `line-*`, `fg-*`, `primary-*`, `danger-*`, `on-*` and `scrim` instead of
   `neutral-*`, `blue-*`, `red-*`, `bg-white`, `text-black`, etc.
2. **Do not use `dark:` color variants.** Every token already has a light and a
   dark value. The only allowed `dark:` color utility is `dark:bg-flare`, which
   is a gradient image, not a color.
3. **Raw palette and literal `white`/`black` are reserved for**
   `src/global.css`, the debug swatch (`src/ui/tabs/debug/Swatch.tsx`) and the
   object-view category tints (`obj-*`).
4. **Use `on-primary` / `on-danger`** for text and icons on a solid accent fill.
   Use `primary-fg` / `danger-fg` for accent-colored text on a neutral surface.
5. **Use `always-white` / `always-black`** only when a color must not change
   between modes. Do not use them as general text colors.
6. **Never derive dark values by mechanically inverting light lightness.**
   Elevation, hover direction, accent contrast, alpha compositing and shadows do
   not survive a pure inversion.

If you need the actual value of a token, read `src/global.css`. Do not copy
values into components, docs or other skills.

## How mode switching works

- `src/ui/App.tsx` sets `data-theme="light" | "dark"` on `<html>` from the user
  setting or the system preference. It also sets the CSS `color-scheme`.
- Light values live in the `@theme` block of `src/global.css`.
- Dark values override the same custom properties in `html[data-theme="dark"]`.
- Tailwind generates utilities such as `bg-surface-panel` from
  `--color-surface-panel`. A token therefore works in both modes without any
  component-level variant.
- The custom `dark` variant exists, but it should not be needed for colors.

## Token catalog

The catalog describes the **role** and **usage constraints** of each token.
Light/dark values are intentionally omitted; read `src/global.css` for them.

### Surfaces

| Token                    | Role                                     | Constraints and intent                                                                    |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `surface-app`            | Page background                          | Lowest elevation. Do not use it for cards or panels.                                      |
| `surface-panel`          | Cards, panels, dialogs, menus, popovers  | Default elevated surface; also the fill for floating layers, paired with `shadow-raised`. |
| `surface-sunken`         | Inputs, search fields, wells             | Recessed controls on a panel. Do not use it for panels.                                   |
| `surface-hover`          | Hover on surfaces and menu rows          | Hover only, never a resting background.                                                   |
| `surface-active`         | Pressed/expanded state, strong hover     | At least as strong as hover; the strongest neutral state.                                 |
| `surface-control`        | Secondary buttons, neutral cards at rest | Pair with the control hover/active tokens for interaction states.                         |
| `surface-control-hover`  | Hover for controls and neutral cards     | Pair with `surface-control`.                                                              |
| `surface-control-active` | Active/pressed controls and cards        | Pair with `surface-control`.                                                              |

The elevation order app < panel must hold in both modes. Floating layers do not
add a third fill; they separate from the panel with a border and
`shadow-raised`. Hover and active states move away from their base surface.

### Lines

| Token           | Role                                    | Constraints and intent                                                       |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| `line-subtle`   | Default borders and separators          | Use for most borders.                                                        |
| `line-strong`   | Emphasized borders, dashed empty states | Stronger emphasis than `line-subtle`; do not use it for every border.        |
| `line-emphasis` | Object-view borders on tinted blocks    | Only for `ObjectView` on top of `obj-*` tints; not a general-purpose border. |

### Text

| Token       | Role                            | Constraints and intent                       |
| ----------- | ------------------------------- | -------------------------------------------- |
| `fg`        | Body text and default icons     | Default foreground.                          |
| `fg-strong` | Headings and strongest emphasis | Do not use it for large blocks of body text. |
| `fg-muted`  | Secondary text, hints, paths    | Lower emphasis but still readable as prose.  |
| `fg-subtle` | Placeholders and quiet icons    | Low emphasis. Never use it for body text.    |

### Actions

| Token            | Role                                           | Constraints and intent                                                                                           |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `primary`        | Solid primary fill                             | Use only as a filled background. Pair it with `on-primary`.                                                      |
| `primary-hover`  | Primary fill hover                             | Use together with `primary`.                                                                                     |
| `primary-active` | Primary fill active                            | Use together with `primary`.                                                                                     |
| `on-primary`     | Text/icons on a solid primary fill             | Only on top of `primary`; never use it as a general text color.                                                  |
| `primary-fg`     | Primary-colored text/icons on neutral surfaces | Contrast-safe accent for text and icons on panels and the app background. Do not use it as a solid fill.         |
| `primary-subtle` | Subtle primary tint and selection              | For selected rows/cards, selected tabs and similar tints. Pair it with `border-primary` when a border is needed. |
| `danger`         | Solid danger fill                              | Use only as a filled background. Pair it with `on-danger`.                                                       |
| `danger-hover`   | Danger fill hover                              | Use together with `danger`.                                                                                      |
| `danger-active`  | Danger fill active                             | Use together with `danger`.                                                                                      |
| `on-danger`      | Text/icons on a solid danger fill              | Only on top of `danger`; never use it as a general text color.                                                   |
| `danger-fg`      | Danger-colored text/icons and error text       | Contrast-safe destructive accent on neutral surfaces. Do not use it as a solid fill.                             |
| `danger-subtle`  | Subtle danger tint                             | For destructive hover backgrounds and similar tints, not for filled destructive actions.                         |

Do not use `primary` as a subtle selection background, and do not use
`primary-subtle` as a button fill. The same rule applies to the danger pair.

### Miscellaneous

| Token          | Role                                   | Constraints and intent                                                         |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| `scrim`        | Modal overlay                          | Only for modal/dialog scrims.                                                  |
| `always-white` | Content that must never flip with mode | Only when mode invariance is required; not a general text or background color. |
| `always-black` | Content that must never flip with mode | Only when mode invariance is required; not a general text or background color. |

Shadows are tokenized through `shadow-raised`, which reads the per-mode
`--elevation-raised` token. It is the only shadow for floating layers; pair it
with `surface-panel`. Do not use raw `shadow-lg` / `shadow-xl` on popovers.

### Object-view tints

`obj-functional`, `obj-computation`, `obj-boolean`, `obj-set`, `obj-literal`,
`obj-query`, `obj-control`, `obj-constructions`, `obj-atom` and `obj-values` are
a separate semantic layer for object-view backgrounds. They intentionally use
different values per mode and only the hue encodes the category. They are
selected through `src/ui/objects/objectViewAppearance.ts`. Do not replace them
with general surface tokens.

## Adding or changing a token

1. Add or edit the token in the `@theme` block of `src/global.css` for light
   mode.
2. Add the matching override in `html[data-theme="dark"]`.
3. Prefer OKLCH and keep the new token coherent with the existing per-mode
   palette. Do not derive one mode mechanically from the other.
4. Keep the token vocabulary semantic. Do not add a token named after a hue (for
   example `blue-...`); name it after its role.
5. Use `*-fg` for accented text on neutral surfaces and `on-*` for text on a
   solid accent fill. Keep the two pairs distinct.
6. Shadows follow the same pattern: put the value in an `--elevation-*` custom
   property in `@theme`, override it in dark mode, and expose it through a
   semantic `shadow-*` utility in `src/global.css` (see `shadow-raised`). Name
   the utility after the layer, not after the CSS effect.
7. Update `src/ui/tabs/debug/Swatch.tsx` so the new token is visible in the
   Debug tab.
8. Run `nub run check` and `nub run build`.
9. Check both modes visually (see Verification).

## Design rules

- **Elevation:** panels are lighter than the app background. Floating layers use
  the same `surface-panel` fill; a border and `shadow-raised` carry their
  elevation in both modes.
- **Interaction:** hover/active states move away from the surface; light mode
  darkens, dark mode lightens.
- **Consistency:** reuse existing role tokens and keep interaction deltas
  consistent. Add a semantic token only when a genuinely new role appears, not
  for a one-off component.
- **Accents:** dark-mode accent text is lighter than light-mode accent text.
  Solid fills keep their own hover direction. Do not use one accent token as
  both text and fill without checking contrast.
- **Contrast:** check body text, muted text, placeholders, and text on solid
  fills separately.
- **Focus:** the base layer in `src/global.css` applies `outline-primary` to all
  elements. Do not hardcode per-component focus colors; use a semantic accent
  token if a component genuinely needs a different focus role.
- **Shadows:** use `shadow-raised` for any floating layer (`surface-panel`). It
  reads the per-mode `--elevation-raised` token. Do not use the raw `shadow-lg`
  / `shadow-xl` utilities for popovers, and do not add `dark:` variants; the
  token already has a value per mode.
- **Gradients:** `bg-flare` and `bg-lush` are raw utilities in `src/global.css`.
  `bg-flare` is currently the only legitimate `dark:` utility because it sets a
  background image, not a color. `bg-lush` is currently unused.

## Menu rows

Rows in floating menus come in two kinds, and the hover treatment must encode
the difference. The row background tells the user what activating the row will
do, so it is not interchangeable decoration.

- **Value rows** change a value in place: select options, filter choices,
  setting options. Hover them with the neutral tint `bg-surface-hover` (for
  example `hover:bg-surface-hover` or `data-highlighted:bg-surface-hover`). Show
  the current value through `data-selected` styling and a trailing check icon,
  not through an accent fill on hover.
- **Action rows** perform a command: they create something, navigate, or open
  another dialog or menu. They are buttons that happen to be laid out in a menu,
  so they use the button hover language: the filled `primary` background with
  `on-primary` text (the `hover:bg-primary` and `hover:text-on-primary`
  utilities). A destructive action row uses the `danger` / `on-danger` pair
  instead.

Rules:

- Decide per row, not per menu. Mixing the two kinds in one menu is allowed only
  when the labels make the difference obvious.
- Never use the filled `primary` hover for a row that merely changes a value; it
  reads as "this submits or performs something", which is false.
- Never leave an action row on `surface-hover`; that is the neutral hover state,
  not a call to action.
- Both kinds may add `active:scale-97` for the pressed state.
- Value rows use `surface-hover` on floating menus too; the token's dark value
  is tuned to stay visible on `surface-panel`.

Current examples: the `Select` list rows in `src/ui/reuse/Select.tsx` are value
rows and use `hover:bg-surface-hover`. The rows in
`src/ui/tabs/connections/AddConnectionButton.tsx` are action rows (they pick
files or open the remote-connection dialog) and use the primary hover.

## Common mistakes

- `bg-white` / `dark:bg-neutral-100` for a panel → use `bg-surface-panel`.
- `text-white` on a primary button → use `text-on-primary`.
- `text-blue-700 dark:text-blue-200` → use `text-primary-fg`.
- `hover:bg-neutral-200` → use `bg-surface-hover` or `bg-surface-control-hover`
  depending on whether the element is a neutral control/card.
- `bg-neutral-100 dark:bg-white` for an input → use `bg-surface-sunken`.
- `border-neutral-200` → use `border-line-subtle`.
- Adding a token only to `@theme` and forgetting the dark override.
- Using `primary` as a subtle selection background instead of `primary-subtle`.
- Using `fg-subtle` for body text.
- Using `primary` on hover for a value row (select option, filter) → use
  `surface-hover`; the filled accent is for action rows only (see Menu rows).
- Using the neutral `surface-hover` on an action row that opens a dialog or
  creates something → use the primary hover; it is a button.
- Using `shadow-lg` / `shadow-xl` on a popover → use `shadow-raised`; it is the
  per-mode floating-layer shadow.
- Expecting the light-mode `surface-panel` fill to separate a popover on its own
  → keep the border and `shadow-raised`.
- Deriving dark values by inverting the light lightness.
- Forgetting to add the token to the debug swatch.

## Verification

Run the static checks:

```sh
nub run check
nub run build
```

For visual checks, the dev server is usually available at
`http://localhost:1420`. Test both themes (App Settings, or set
`document.documentElement.dataset.theme = "dark"`). Look at:

- app background vs panel vs floating-layer separation,
- popover shadow depth against both the app and panel backgrounds,
- tab and button hover/active states,
- inputs and placeholders,
- selected atoms/objects and selected menu rows,
- primary and danger buttons, including text on the fill,
- dialog scrim and floating content,
- error text and delete-button hover.

### Formatting caveat

The repository formats with `oxfmt` and lints with `oxlint-tailwindcss`. They
can disagree about class order for custom color utilities. `nub run format` runs
`oxfmt` and then `oxlint --fix`, so its final order is authoritative. If
`nub run check` reports `tailwindcss(enforce-sort-order)` after running `oxfmt`
alone, run `nub x oxlint --fix <files>` or `nub run format`.

## Review checklist

- No raw palette classes in UI code (`neutral-*`, `blue-*`, `red-*`, `bg-white`,
  `text-black`, `text-white`).
- No `dark:` color variants in components; only `dark:bg-flare` is acceptable.
- Every new token exists in both the light `@theme` block and the dark
  `html[data-theme="dark"]` block.
- Text on accent fills uses `on-primary` / `on-danger`, not literal white or
  black.
- Menu rows match their kind: value rows hover with `surface-hover`, action rows
  hover with the primary/danger fill (see Menu rows).
- Floating layers use `surface-panel`, a border and `shadow-raised`; no raw
  `shadow-*` utilities.
- The elevation relationship holds: panels are lighter than the app; floating
  layers rely on a border and `shadow-raised`, not a separate fill.
- Hover moves away from the surface in both modes.
- Both light and dark mode were inspected, not just one.
- `Swatch.tsx` reflects the current token set.
