---
name: SolidJS Reactivity
description:
    Decide where state, derived values, effects, and events belong in SolidJS,
    and review code that synchronizes state with effects.
---

# SolidJS Reactivity

The project uses `solid-js` 1.9, so v1 semantics apply. Code should nevertheless
be shaped so that the migration to Solid 2.0 (TODO 38) stays mechanical; the
rules below are correct for v1 and already follow the 2.0 model. All paths are
relative to the repository root.

The short version: **an effect is the last step of the reactive graph**, where a
settled value has to leave Solid and drive something Solid does not own. If a
value is merely being copied from one reactive place to another, it is derived
state and does not need an effect.

## Ground rules

1. **State is a signal or a store.** Writable values live in `AppState` (see
   `src/state/app`) or in a component when they are genuinely local to it.
2. **Derived values are derived, not copied.** A value that can be computed from
   other reactive state is a plain accessor or a `createMemo`, never a second
   signal kept in step by an effect.
3. **`createEffect` only at an imperative boundary**: a settled reactive value
   drives the DOM, Tauri IPC, HTTP/WebSocket, `localStorage`, or a third-party
   widget.
4. **Interactions do their work where they happen.** A click or key press knows
   what happened and has the current values in hand; do not set a flag for an
   effect to observe.
5. **Runtime state that must outlive a component belongs in `AppState`.** Do not
   keep a local copy and mirror it back and forth.
6. **One-shot commands are callbacks, not state.** Focus, scroll, a toast, a
   "reload now" request: call the consumer directly or use a registry. A signal
   that is set and immediately cleared again is an event bus in disguise.
7. **Async data is read where it is rendered.** `createResource` already returns
   a reactive value; do not copy it into a signal from an effect.

## What to use when

| Situation                                             | Use                                            |
| ----------------------------------------------------- | ---------------------------------------------- |
| Writable state owned by a feature                     | `createSignal` / `AppState` signal / store     |
| Value derived from state and read in JSX              | plain accessor or `createMemo`                 |
| State reset on a known event (connect, close, click)  | do it in the event handler or setter           |
| Derived state that must be written back into a signal | `createComputed` (v1 only, see below)          |
| "When X changes, do Y" without reading X in Y         | `createEffect(on(X, ...))` or `createReaction` |
| DOM, IPC, network, storage, third-party widget        | `createEffect`                                 |
| Async request/result/loading                          | `createResource` and read it in JSX            |
| Value that must survive a tab switch                  | runtime signal on `AppState`                   |

## The primitives in v1

- **`createMemo` / accessor** — derived, read-only, no side effects. Accessors
  are cheap and have no node; use a memo when the result is shared or when an
  equality boundary stops propagation.
- **`createComputed(fn)`** — a pure computation. It runs immediately when
  created and, on updates, in the update queue before render effects and user
  effects. This is the v1 way to write derived state back into a signal (the
  `createWritableMemo` idiom in the docs).
- **`createEffect(fn)`** — a user effect. It runs in the effect queue after its
  dependencies change and after render effects, so it is correct for DOM and I/O
  but wrong for state synchronization. Ordering between effects is not a
  contract; never make correctness depend on it.
- **`createReaction(onInvalidate)`** — tracks dependencies once per `track()`
  call and runs the callback untracked. Useful for "invalidate then do I/O"
  without subscribing to the value read inside the callback.
- **`batch`** — only needed around several writes that must not produce
  intermediate pure-computation runs; Solid already batches inside updates.

### Rules for `createComputed` write-backs

- Only write state derived from what the computation reads. Never perform I/O,
  DOM work, or logging (that is `createEffect`).
- Keep an equality guard and return the previous value when nothing changed, for
  example `previous.atomNames.size === 0 ? previous : {...}`. Otherwise every
  run notifies subscribers.
- Do not read, directly or transitively, a value that the computation writes:
  that is a cycle and produces repeated runs or an infinite-loop error.
- Reading a `createResource` accessor in `createComputed` participates in
  Suspense (see `read()` in `solid-js`), unlike reading it in an effect. If the
  result is adopted imperatively and a boundary may exist above the component,
  keep it in a `createEffect`.
- When converting from `createEffect(on(source, fn, {defer: true}))`, keep
  `defer: true`: `createComputed` runs immediately at creation.

## Event-driven resets instead of watchers

Resetting state when something happens is not a synchronization problem. Put the
reset where the event is already handled:

- The connection lifecycle has exactly one mutation point per direction:
  `connect`, `disconnect`, and `tryReconnectToLocalServer` in
  `src/state/app/connectionState.ts` are the only setters of `connectionClient`.
  State that depends on the active knowledge base (atom name caches, selected
  atom, added atoms) should be reset through an option callback such as the
  existing `onDisconnected`, not by watching `connectionClient`.
- Dialog fields reset in the dialog's `onOpenChange`, not in an effect that
  watches `props.open`.
- A search field and its parsed selection are one piece of state. Store the raw
  text in `AppState` and derive the parsed value; do not mirror two signals.
- Purely local state that only exists while a dialog is open can also live in a
  child component that is mounted with the dialog.

## The effect-based sync anti-pattern

```ts
// Do not: two sources of truth, one update behind.
const [text, setText] = createSignal("");
createEffect(() => setText(props.value));

// Do: derive it where it is read.
const text = () => props.value;
```

```ts
// Do not: a flag that an effect observes.
const [open, setOpen] = createSignal(false);
createEffect(() => {
    if (open()) setFields("");
});

// Do: work in the handler that caused it.
const openDialog = () => {
    setFields("");
    setOpen(true);
};
```

Why it matters in v1: the effect-written state is not updated when render
effects run, so the affected DOM is produced twice (the stale pass and the
corrected pass). Other user effects may observe the interim state because their
ordering relative to the writer is not guaranteed. In Solid 2.0 the same shape
is reported as `EFFECT_RELAY_TEAR` and `createComputed` no longer exists.

## Project patterns

- **`AppState` composition** (`src/state/app`): each feature module exposes
  accessors and guarded setters. Persisted fields go through `store.commit`;
  runtime signals (panel widths, layout options, selected atom) stay in
  `AppState` so they survive tab changes. Derived members (for example
  `preferences.language()`) are plain functions, not signals.
- **Persistence** (`src/Root.tsx`, `src/ui/App.tsx`): writing the app state to
  Tauri IPC or `localStorage`, applying the theme to the DOM, and applying the
  theme setting in the backend are legitimate effects. They must stay effects.
- **Async data** (`src/ui/tabs/things/properties/createPropertySync.ts`): a
  resource result is adopted into an imperative `ObjectHistory` and edits are
  sent back over the network. The adoption is an async boundary and the network
  sync is I/O; both stay effects. Keep the `syncedObjects` diff logic inside the
  sync loop, not in render.
- **Domain caches** (`src/ui/objects/AtomView.tsx`): atom display names are
  produced by an async request and consumed by layout
  (`src/ui/objects/layout/rowWidth.ts`). The write is an observation, not a
  derivation. If a write-back is unavoidable, use `createComputed`, keep the
  identity guard, and prefer a per-key cache over replacing a whole `Map` (a
  global map copy invalidates every object view).
- **Selection and focus** (`src/ui/objects/selection.ts`,
  `src/ui/objects/ObjectView.tsx`): selection paths are state; a focus request
  is a command. Prefer a callback registered by the tree root over a signal that
  every object view subscribes to. Never create one effect per rendered node for
  a global request.
- **Refs**: a `ref` callback runs inside the compiler's render effect. Create
  effects in the component body, not inside a `ref`, unless the effect is truly
  tied to that element. If you need one-time owned DOM setup, use `onMount` and
  `onCleanup`.

## Known deviations (TODO 40)

Delete an entry when it is fixed. These are the remaining effect-based
synchronizations found in the audit:

- `src/state/app/AppState.ts:176` — clears the atom-name cache and the selected
  atom when `connectionClient` changes. Move the reset into the connection
  lifecycle.
- `src/ui/tabs/connections/AddRemoteConnectionDialog.tsx:64` — resets the text
  fields when `props.open` becomes true. Reset in `onOpenChange`.
- `src/ui/objects/AtomView.tsx:22` — writes the resolved atom name into
  `appState.layoutOptions.atomNames`. Use `createComputed` or a per-key cache.
- `src/ui/objects/ObjectView.tsx:113` — one effect per object view consumes
  `objectSelection.focusRequest()`. Replace with a single focus consumer or a
  callback registry.
- `src/ui/tabs/things/createAtomList.ts:52` — clears locally added atoms when
  `connectionClient` changes. Likely unreachable because the things tab
  unmounts; either delete it or key the added atoms by client.
- `src/ui/tabs/things/ThingsView.tsx:49` and `:56` — two-way mirror between the
  search text and `appState.selectedAtomId`. Keep the search text in `AppState`
  and derive the parsed atom.

Legitimate effects that should stay: `src/Root.tsx:25` and `:31`,
`src/ui/App.tsx:63` and `:70`, and
`src/ui/tabs/things/properties/createPropertySync.ts:124` (network I/O) plus
`:115` (async resource adoption).

## Review checklist

- Does every `createEffect` drive something outside Solid (DOM, IPC, network,
  storage, third-party)? If not, move it earlier in the reactive sequence.
- Is any signal written from an effect where a memo, accessor, or
  `createResource` could provide the value?
- Is an interaction routed through a flag that an effect observes?
- Does a component copy props into a signal and keep them in step with an
  effect? Derive it, or lift the state so there is one owner.
- Is the same information represented twice (`searchText` and `selectedId`,
  `open` and `reset fields`)? Collapse it to one representation.
- Does an effect subscribe every rendered node to one global request? That is
  O(n) work per interaction; use one consumer.
- Are write-backs guarded with an identity/equality check, and do they avoid
  reading their own output?
- Are `defer` and `on` preserved when converting effect to `createComputed`?
- Does any reset depend on the order of effects? Move it into an event.

## Common mistakes

- `createEffect(() => setDerived(source()))` → use a memo or accessor.
- `createEffect(() => { if (props.open) setText(""); })` → reset in the open
  handler or `onOpenChange`.
- `createEffect(on(connectionClient, () => reset()))` → call `reset` from
  `connect` / `disconnect`.
- Mirroring `AppState` runtime state into a component signal and back → own the
  state in `AppState`.
- Creating an effect inside a `ref` callback for something unrelated to the
  element.
- Reading a resource in `createComputed` when the result is adopted imperatively
  and a Suspense boundary may exist above.
- Writing the whole `layoutOptions` map for every atom name → invalidates all
  object views.
- Using `createComputed` for IPC, DOM, or logging "because it runs earlier".

## Solid 2.0 direction

The 2.0 model is what these rules anticipate:

- `createComputed` is removed. A derived value becomes a `createMemo`; a
  writable derived value becomes the function form of `createSignal(fn)`.
- Writes in ordinary owned scopes (component bodies, memo computations) are
  rejected in development. Writes belong in event handlers, actions, or effect
  functions.
- `createEffect` splits into a tracked compute function and an untracked effect
  function that may return cleanup. `on` and `onMount` are replaced by the
  compute phase and `onSettled`.
- Sync shapes are diagnosed as `EFFECT_RELAY_TEAR` (copied derived state) and
  `EFFECT_WRITES_OWN_SOURCE` (an effect that feeds itself).

Do not introduce new `createComputed` write-backs without a plan to remove them
in the migration; they exist only because v1 lacks writable derivations.

## Verification

There are no frontend test files in this project (see `AGENTS.md`). Verify
reactivity changes by:

1. `nub run format` and `nub run check`.
2. Exercising the affected flow in the running app: theme and language switch,
   connect/disconnect and reconnect, atom search and selection across tab
   switches, property add/remove/undo/redo, dialog open/close/cancel, and
   arrow-key navigation in the evaluate and properties trees.
3. Watching for duplicated work: a state change that updates the DOM twice, or
   an interaction that re-runs work proportional to the number of object views,
   is a sign that an effect is still relaying state.
