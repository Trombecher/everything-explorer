---
name: Frontend Node Support
description:
    Add, rename, or migrate frontend support for node kinds implemented in the
    Everything backend.
---

# Frontend Node Support

This skill describes how to surface a backend node kind in the Explorer UI and
how to migrate existing frontend nodes when the backend model changes. It
reflects the current state of the codebase and the conventions used by the
existing node implementations. All paths are relative to the repository root.

## Current architecture

The backend node implementation lives in the `everything` crate at
`../everything/crates/everything`, which `src-tauri` depends on directly. Before
changing anything, identify the node in the backend:

- `../everything/crates/everything/src/compute/nodes/kind.rs` defines
  `NodeKind`, `NodeProperty`, the property-to-atom mapping, and property
  requirements.
- `../everything/crates/everything/src/model/atoms/mod.rs` contains the actual
  `NODE_*` atom values.
- `../everything/crates/everything/src/compute/nodes/raw/` shows how a node is
  detected and which properties are required.
- `../everything/crates/everything/src/compute/nodes/mod.rs` shows the node's
  runtime shape and evaluation semantics.

Compare the backend `NodeKind` enum with `src/model/nodes/types.ts` instead of
relying on a hard-coded list of supported or missing frontend nodes.

### Objects, composites, and sets

A node is not a distinct wire type. It is an ordinary **composite** whose
properties are constructions keyed by well-known node-property atoms:

```text
⟨node_add_first ·· <child>, node_add_second ·· <child⟩⟩
```

The frontend distinguishes these representations in `src/model/index.ts`:

- `ObjectType.Composite` has `properties`. Use it for nodes and arbitrary
  property collections.
- `ObjectType.Set` has `items` and is the canonical set specialization. Each
  item is encoded as a `contains ·· item` property. It does not mean that other
  atoms or composites are not sets in the open-set model.
- A composite with both `contains` properties and other properties is an open
  set. Keep it as a `Composite` so no properties are hidden.
- `Atom.Contains` identifies the set-item constructor. Helpers in
  `src/model/index.ts` construct and project contains properties. The shared
  bigint lives in `src/model/atomValues.ts` to avoid an import cycle.

Never turn an old arbitrary `Set.elements` collection into new `Set.items`
without checking its semantics. Old structural sets became composites; only
actual mathematical item collections gained `contains` wrappers.

`defaultObject` is an empty `Composite`. Display canonicalization deliberately
leaves an empty generic composite unchanged, so defaults and DEL placeholders
render as `⟨⟩`. An explicitly specialized empty `Set` still renders as `{}`.

### Wire and stored state

The generic object serializer in `src-tauri/src/server` already supports nodes,
so adding an ordinary backend node kind needs **no Tauri IPC or HTTP wire
changes**. Adding frontend support is a TypeScript model/UI task plus copying
the backend atom values.

When the object model itself changes, keep these representations synchronized:

- HTTP (`src/connect/wire.ts` and `src-tauri/src/server/wire/object.rs`):
    - `"composite"` with `properties` for arbitrary properties;
    - `"set"` with `items` for canonical sets.
- Stored state (`src/state/stored/object.ts`) uses the same conceptual split,
  but has its own compatibility requirements. Legacy stored
  `{type: "set", elements: [...]}` values decode as `Composite.properties`, not
  as canonical set items.

Lazy iterator pages contain set **items**, not their `contains` wrappers, so
lazy evaluation results are displayed with `ObjectType.Set.items`.

### Frontend node projection

The frontend's node model in `src/model/nodes` is a non-wire abstraction layered
on top of `EverythingObject`. `objectToNode` recognizes node-shaped composites
and returns a discriminated `Node`; `nodeToObject` converts it back. The UI
works with `Node` blocks where possible and falls back to raw objects.

Backend node recognition also supports atom-defined nodes and recursively checks
that every child is a node. The frontend projection currently has no knowledge
context and remains shallow. Do not assume it provides those backend guarantees.
Plain data children must be wrapped in a `Literal` node to be evaluatable;
expressions that are already nodes must not be wrapped blindly.

## 1. Mirror the atom constants

Add each required property atom to the `Atom` namespace in `src/model/atoms.ts`.
Copy the decimal value exactly from the backend's `model/atoms/mod.rs` and write
it as a bigint literal. Follow the existing naming convention: backend
`NODE_ADD_FIRST` is frontend `NodeAddFirst`.

Atom IDs are persistent identities:

- Do not generate a new ID for an existing backend node or property.
- Renaming a node, property, or TypeScript constant does not change its bigint
  ID.
- Match the current backend name, such as `NodeSetCount`, `NodePropertiesOf`,
  `NodeSetMapSet`, `NodeNewSetItem`, and `NodeIsComposite`.
- Do not add `Contains` a second time under a node alias: the set-item property
  constructor and the `SetContains` computation node are different concepts.

## 2. Extend or migrate the node model

In `src/model/nodes/types.ts`, add or rename the `NodeType` symbol, define a
node type with a `readonly type`, one field per semantic child, and
`readonly rest: readonly EverythingObject[]`, then add it to the `Node` union.
Use `bigint` for depth-like fields.

`rest` is important: it preserves composite properties that the node model does
not interpret, so decode/encode round-trips do not silently drop user data.

In `src/model/nodes/decode.ts`, add or update a detection block in
`objectToNodeWithoutCache`:

- Use `singleAtomPropertyValue` for each required single-value property.
- Use `atomPropertyValues` for a repeatable property.
- Guard against an already detected different node kind with
  `if (finalNode) return NotANode;`.
- A missing or ambiguous required property means the kind does not match.
- Build `rest` with `withoutAtomConstructors` so only the recognized properties
  are removed. Constructions with non-atom constructors must be retained.
- Keep the cache contract; `objectToNode` is pure and cached, and nodes must be
  treated as immutable.

In `src/model/nodes/encode.ts`, add or update the inverse `case`: produce an
`ObjectType.Composite` containing one `construction(atom, child)` per node
property, then spread `...node.rest`. Decode and encode must agree exactly,
otherwise the object changes merely by viewing or editing it. TypeScript
exhaustiveness checks will point out missing `NodeType` cases.

Special cases to preserve:

- `NewSetNode.items` is non-empty for a valid persistent new-set node. Encode
  each child with `Atom.NodeNewSetItem`; the node produces a canonical set of
  evaluated items, not an arbitrary composite.
- `QueryConstructionValuesNode.object` is the target whose properties are
  queried. It is not the set operand of the set-algebra nodes.
- `IsComposite` tests the intrinsic object category. There is no frontend
  `IsSet` node in the open-set model.

## 3. Render the node

Add or update a dispatch branch in `src/ui/objects/views/ObjectViewContent.tsx`.
Put new views next to their peers under `src/ui/objects/views`: `scalars`,
`operations`, `collections`, or `functions`. Prefer reusing an existing view
when the node has a conventional shape:

- One child: `views/operations/UnaryOperationView.tsx`. Extend its
  `UnaryOperationBlock` union, `BlockIcon` map, `operandOf`, `withOperand`, and
  operand width-budget switch.
- Two children: `views/operations/BinaryOperationView.tsx` through
  `src/ui/objects/blocks/binaryOperationAccessors.ts`. Extend
  `BinaryOperationBlock`, `BlockIcon`, `getFirst`, `getSecond`,
  `changeBlockFirst`, and `changeBlockSecond`.
- Three or more children, or a graph-like layout: create a dedicated view in
  `views/operations` modelled on `FoldOperationView.tsx` or
  `IfOperationView.tsx`. It should place child `ObjectView`s with paths
  `[...props.path, index]`, reconstruct the node with `nodeToObject` whenever a
  child changes, handle deletion of required children, and hand `setObject` down
  so editing works.
- Function-like nodes and depth references use the existing
  `views/functions/FunctionObjectView.tsx` / `FunctionSelfObjectView.tsx` /
  `ParameterObjectView.tsx` patterns, including `EnclosingFunctionsContext` and
  the parameter-name field.

The view is responsible for selection paths, parent replacement, deletion
semantics, and width budgets, not only appearance.

## 4. Add or migrate an icon

If no suitable icon exists, add `src/ui/icons/<Name>Icon.tsx` and import the
Lucide icon directly from its path, for example
`import XIcon from "lucide-solid/icons/x";`. Import directly from the icon path
rather than the package barrel. Component names must end with `Icon`. Register
the icon in the relevant block icon map or custom view.

Delimiter syntax is semantic:

- `AngleBracketIcon` (`⟨` / `⟩`) is for generic composites and `IsComposite`.
- `BraceIcon` (`{` / `}`) is for canonical sets, `NewSet`, and set-specific
  operations such as `SetUnwrap`.
- Do not replace braces globally; only generic composite presentation changed to
  angle brackets.

## 5. Update layout and appearance

Several switches are deliberately exhaustive and must be updated together:

- `src/ui/objects/layout/childCount.ts`: the node's arity (0, 1, 2, 3, ...).
- `src/ui/objects/layout/rowWidth.ts`: the exact row-mode width, including icon
  widths, gaps, delimiters, commas, and every child width. This drives automatic
  row/column switching.
- `src/ui/objects/layout/iconWidths.ts`: add or rename a width entry if needed.
- `src/ui/objects/layout/widthBudgets.ts` and
  `src/ui/objects/layout/operandWidthBudgets.ts`: add or rename the child-budget
  helper and use it when passing widths down. Operand budgets for icon-prefixed
  unary nodes live in the latter.
- `src/ui/objects/objectViewAppearance.ts`: assign a color category and decide
  whether the node is centered in column mode. A genuinely new visual category
  also requires extending `ObjectViewColorCategory`, its union, and
  `colorCategoryClasses`.
- `src/ui/objects/layout/layoutMode.ts`: usually no change; it derives row or
  column mode from arity and row width. Composite and Set collections both need
  delimiter-aware layout.

Prefer existing icon-width constants and category assignments over inventing new
visual conventions. Colors must use the semantic tokens described in the
color-management skill.

## 6. Editing and discoverability

In `src/ui/objects/editing/insertObject.ts`, add the creation hotkey to the
insertion table if the node should be creatable, selecting the relevant child
afterwards. The table also feeds `isHandledKey` in
`src/ui/objects/editing/keyboardShortcuts.ts`. Check for key conflicts before
choosing a shortcut.

Keep the deletion operations distinct:

- Shift+Backspace collapses a node and retains its most meaningful child
  (usually the first operand, set, queried object, or body). Add the retained
  child to `src/ui/objects/editing/replaceWithRetainedChild.ts`.
- DEL passes `undefined` to the parent. Collection parents drop the child;
  ordinary node/root parents replace it with `defaultObject`, which is the empty
  composite. Deleting the last `NewSet` item removes the now-invalid new-set
  node.
- Enter appends to `NewSetNode.items`, `Composite.properties`, or `Set.items` as
  appropriate. Do not add a contains construction manually when editing the
  already-projected `Set.items` array.

For query-like node families, update
`src/ui/objects/editing/queryNodeVariants.ts` so digit-key retyping and
positional child retention also cover the variant. Preserve `rest`, and use
`QueryConstructionValuesNode.object` for the first child.

For nodes with labels, add a phrase to `src/i18n/phrases/objects.ts` and
translations to `src/i18n/english.ts` and `src/i18n/german.ts`; unused labels do
not need phrases.

Add the node to `createInitialObject2` in `src/ui/tabs/debug/fixtures.ts` so the
debug tab renders it. This is the project's manual rendering harness; do not add
frontend test files.

## 7. Rename or migrate existing nodes

For an ordinary node rename, keep every atom ID stable and update the complete
surface in one pass:

1. `src/model/atoms.ts` constant names.
2. `NodeType`, the node interface, and fields in `types.ts`.
3. Encoding and decoding, including the properties excluded from `rest`.
4. Unary/binary/custom views and `ObjectViewContent` dispatch.
5. Accessors, keyboard creation/collapse, and query retyping.
6. Child counts, row widths, icon widths, width budgets, appearance, and debug
   fixtures.
7. Searches for stale names, followed by all verification steps below.

When migrating pre-composite frontend code, the current names are:

| Old frontend name                 | Current name                         |
| --------------------------------- | ------------------------------------ |
| `Count`                           | `SetCount`                           |
| `ValuesOf`                        | `PropertiesOf`                       |
| `Contains`                        | `SetContains`                        |
| `Union` / `Intersection`          | `SetUnion` / `SetIntersection`       |
| `Filter` / `Map` / `Fold`         | `SetFilter` / `SetMap` / `SetFold`   |
| `Every` / `Any`                   | `SetEvery` / `SetAny`                |
| `Unwrap`                          | `SetUnwrap`                          |
| `IsSet`                           | `IsComposite`                        |
| `HasValue`                        | `HasASetItem`                        |
| `NewSetNode.values`               | `NewSetNode.items`                   |
| `QueryConstructionValuesNode.set` | `QueryConstructionValuesNode.object` |

Apply the corresponding `Node*` atom-alias rename without changing numeric IDs.
Set-taking nodes now operate on **items**, whereas `PropertiesOf` exposes all
properties as items. Do not mechanically preserve old set-operation test
expectations.

A broader object-model migration should be phased so each boundary remains
reviewable: migrate the Rust server and wire tests first, then the frontend
object/wire/stored models and collection rendering, then all node names and UI
consumers.

## 8. Verify

Run `nub run format`, then:

```sh
nub run check
nub run build
git diff --check
```

If the Rust server or wire representation changed, also run:

```sh
cargo test --manifest-path src-tauri/Cargo.toml
```

Exercise the node in the running app:

- Use the debug tab to confirm rendering, selection, editing, deletion, icons,
  and row/column layout, with no unimplemented fallback or console errors.
- Check node encode/decode round-trips for every affected node, including `rest`
  properties with non-atom constructors.
- Build an expression in the evaluate tab and confirm the backend result. For
  set nodes, use actual canonical set items and distinguish item operations from
  property operations. Check lazy-result paging where relevant.
- When a connection is needed, add a remote connection to
  `http://localhost:3000` as described in `AGENTS.md`.

Do not add frontend test files.
