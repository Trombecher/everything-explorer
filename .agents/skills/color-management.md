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

| Token                    | Role                                     | Constraints and intent                                                                                           |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `surface-app`            | Page background                          | Lowest elevation. Do not use it for cards or panels.                                                             |
| `surface-panel`          | Cards, side-bar panels, content panels   | Default elevated surface for containers that sit on the app background.                                          |
| `surface-raised`         | Dialogs, menus, popovers                 | Floating layers. Use for portal content instead of `surface-panel`; it must read as above the panel in any mode. |
| `surface-sunken`         | Inputs, search fields, wells             | Recessed controls on a panel. Do not use it for panels.                                                          |
| `surface-hover`          | Hover on app/panel surfaces              | Hover only, never a resting background.                                                                          |
| `surface-active`         | Pressed/expanded state, strong hover     | Stronger than hover. Also use for hover on raised menus, where `surface-hover` may not separate enough.          |
| `surface-control`        | Secondary buttons, neutral cards at rest | Pair with the control hover/active tokens for interaction states.                                                |
| `surface-control-hover`  | Hover for controls and neutral cards     | Pair with `surface-control`.                                                                                     |
| `surface-control-active` | Active/pressed controls and cards        | Pair with `surface-control`.                                                                                     |

The elevation order app < panel < raised must hold in both modes. Hover and
active states move away from their base surface.

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
6. Update `src/ui/tabs/debug/Swatch.tsx` so the new token is visible in the
   Debug tab.
7. Run `nub run check` and `nub run build`.
8. Check both modes visually (see Verification).

## Design rules

- **Elevation:** panels are lighter than the app background, and raised layers
  are above panels, in both modes.
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
- **Shadows:** `shadow-*` is not tokenized yet. It remains Tailwind's
  black-alpha shadow and is a known gap in dark mode. Use shadows sparingly on
  dark surfaces.
- **Gradients:** `bg-flare` and `bg-lush` are raw utilities in `src/global.css`.
  `bg-flare` is currently the only legitimate `dark:` utility because it sets a
  background image, not a color. `bg-lush` is currently unused.

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

- app background vs panel vs raised popover separation,
- tab and button hover/active states,
- inputs and placeholders,
- selected atoms/objects and selected menu rows,
- primary and danger buttons, including text on the fill,
- dialog scrim and raised content,
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
- The mode relationship is preserved: app < panel < raised; hover moves away
  from the surface in both modes.
- Both light and dark mode were inspected, not just one.
- `Swatch.tsx` reflects the current token set.
