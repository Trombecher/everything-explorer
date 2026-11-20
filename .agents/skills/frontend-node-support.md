---
name: Frontend Node Support
description:
    Add frontend support for a node kind that is already implemented in the
    Everything backend.
---

# Frontend Node Support

This skill describes how to surface a backend node kind in the Explorer UI. It
reflects the current state of the codebase and the conventions used by the
existing node implementations. All paths are relative to the repository root.

## Current architecture

The backend node implementation lives in the `everything` crate at
`../everything/crates/everything`, which `src-tauri` depends on directly. A node
is not a distinct wire type: it is an ordinary object set whose elements are
constructions keyed by well-known node-property atoms. The Explorer server in
`src-tauri/src/server` serializes generic objects, so a node kind that already
exists in the backend needs **no Tauri IPC or HTTP wire changes**. Adding it to
the frontend is a TypeScript model and UI task, plus copying the backend's atom
values.

The frontend's node model is a non-wire abstraction in `src/model/nodes` layered
on top of `EverythingObject`. `objectToNode` recognizes node-shaped sets and
returns a discriminated `Node`; `nodeToObject` converts it back. Everything in
the UI works with `Node` blocks where possible and falls back to raw objects.

Before changing anything, identify the node in the backend:

- `../everything/crates/everything/src/compute/nodes/kind.rs` defines
  `NodeKind`, `NodeProperty`, the property-to-atom mapping, and property
  requirements.
- `../everything/crates/everything/src/model/atoms.rs` contains the actual
  `NODE_*` atom values.
- `../everything/crates/everything/src/compute/nodes/raw/` shows how a node is
  detected and which properties are required.
- `../everything/crates/everything/src/compute/nodes/mod.rs` shows the node's
  runtime shape and evaluation semantics.

At the time of writing the frontend models Function, FunctionSelf, Parameter,
Call, Literal, Plus (backend Add), Times (backend Multiply), Equal, Less,
Contains, And, Or, Not, Union, Filter, Map, Fold, the four query nodes, If,
Unwrap, and the query/value variants. The backend already implements additional
kinds which are not yet modeled: Count, Xor, Intersection, Difference, IsAtom,
Every, Any, IsConstruction, IsSet, NewConstruction, ConstructionConstructor, and
ConstructionValue. Treat that list as an observation, not a contract; check
`kind.rs` when starting a new node.

## 1. Mirror the atom constants

Add each required property atom to the `Atom` namespace in `src/model/atoms.ts`.
Copy the decimal value exactly from the backend's `atoms.rs` and write it as a
bigint literal. Follow the existing naming convention: backend `NODE_ADD_FIRST`
is frontend `NodeAddFirst`. Do not generate new IDs for an existing backend
node, and do not rename an atom that the backend already uses. These atoms are
the keys that make the wire object recognizable as this node.

## 2. Extend the node model

In `src/model/nodes/types.ts`, add a `NodeType` symbol for the kind, define a
node type with a `readonly type`, one field per semantic child, and
`readonly rest: readonly EverythingObject[]`, then add it to the `Node` union.
Use `bigint` for depth-like fields. `rest` is important: it preserves elements
of the set that the node model does not interpret, so decode/encode round-trips
do not silently drop user data.

In `src/model/nodes/decode.ts`, add a detection block in
`objectToNodeWithoutCache`. Use `singleSetAtomValue` for the marker and every
required child property, guard against an already-detected different node
(`if (finalNode) return NotANode;`), and build `rest` with
`withoutAtomConstructors` so all property constructions are removed. If a
required property is missing or ambiguous, return `NotANode`. Keep the existing
cache contract; `objectToNode` is a pure, cached function and nodes must be
treated as immutable.

In `src/model/nodes/encode.ts`, add the inverse `case`: produce an
`ObjectType.Set` containing one `construction(atom, child)` per property, then
spread `...node.rest`. Decode and encode must agree exactly, otherwise the
object changes just by viewing or editing it. TypeScript exhaustiveness checks
will point out any missing `NodeType` case.

## 3. Render the node

Add a dispatch branch in `src/ui/objects/blocks/ObjectViewContent.tsx`. Prefer
reusing an existing view when the node has a conventional shape:

- One child: `UnaryOperationView`. Extend its `UnaryOperationBlock` union,
  `BlockIcon` map, `operandOf`, `withOperand`, and operand width-budget switch.
- Two children: `BinaryOperationView` through
  `src/ui/objects/blocks/binaryOperationAccessors.ts`. Extend
  `BinaryOperationBlock`, `BlockIcon`, `getFirst`, `getSecond`,
  `changeBlockFirst`, and `changeBlockSecond`.
- Three or more children, or a graph-like layout: create a dedicated view
  modelled on `FoldOperationView.tsx` or `IfOperationView.tsx`. It should place
  child `ObjectView`s with paths `[...props.path, index]`, reconstruct the node
  with `nodeToObject` whenever a child changes, remove the parent when a
  required child is deleted, and hand `setObject` down so editing works.
- Function-like nodes and depth references use the existing `FunctionObjectView`
  / `FunctionSelfObjectView` / `ParameterObjectView` patterns, including
  `EnclosingFunctionsContext` and the parameter-name field.

The view is responsible for selection paths, parent replacement, deletion
semantics, and width budgets, not only appearance.

## 4. Add an icon

If no suitable icon exists, add `src/ui/icons/<Name>Icon.tsx` and import the
Lucide icon directly from its path, for example
`import XIcon from "lucide-solid/icons/x";`. Import directly from the icon path
rather than the package barrel. Component names must end with `Icon`. Register
the icon in the relevant block icon map (`BinaryOperationView`'s accessors or
`UnaryOperationView`'s local map, or the new custom view).

## 5. Update layout and appearance

Several switches are deliberately exhaustive and must be updated together:

- `src/ui/objects/layout/childCount.ts`: the node's arity (0, 1, 2, 3, ...).
- `src/ui/objects/layout/rowWidth.ts`: the exact row-mode width, including icon
  widths, gaps, and every child width. This drives automatic row/column
  switching.
- `src/ui/objects/layout/iconWidths.ts`: add a width entry if the icon width is
  not already covered.
- `src/ui/objects/layout/widthBudgets.ts`: add a helper for the child budget of
  a unary or custom view, and use it when passing widths down.
- `src/ui/objects/objectViewAppearance.ts`: assign a color category and decide
  whether the node is centered in column mode. A genuinely new visual category
  also requires extending `ObjectViewColorCategory`, its union, and
  `colorCategoryClasses`.
- `src/ui/objects/layout/layoutMode.ts`: usually no change; it derives row or
  column mode from arity and row width.

Prefer existing icon-width constants and category assignments over inventing new
visual conventions. Colors must use the semantic tokens described in the
color-management skill.

## 6. Editing and discoverability

In `src/ui/objects/editing/keyboardShortcuts.ts`, add the creation hotkey to
`isHandledKey` and the corresponding branch if the node should be creatable,
selecting the relevant child afterwards. Also add a `Backspace` collapse case:
when the node is deleted, retain its most meaningful child (usually the first
operand, the set, or the body) rather than dropping the whole expression. Check
for key conflicts before choosing a shortcut.

For query-like node families, update
`src/ui/objects/editing/queryNodeVariants.ts` so digit-key retyping and
positional child retention also cover the new variant. For nodes with labels,
add a phrase to `src/i18n/phrases/objects.ts` and translations to
`src/i18n/english.ts` and `src/i18n/german.ts`; unused labels do not need
phrases.

Add the node to `createInitialObject2` in `src/ui/tabs/debug/fixtures.ts` so the
debug tab renders it. This is the project's manual rendering harness; do not add
frontend test files.

## 7. Verify

Run `nub run format` for formatting first, and then run `nub run check` for
TypeScript and oxlint. Exercise the node in the running app: use the debug tab
to confirm rendering, selection, editing, deletion, and row/column layout, then
build an expression containing the node in the evaluate tab and confirm the
backend returns the expected result. When a connection is needed, add a remote
connection to `http://localhost:3000` as described in `AGENTS.md`.
