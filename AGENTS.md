# Everything Explorer

This is the source of an app to browse and to modify Everything knowledge bases.
You can read more about Everything at `../everything` (there is an `AGENTS.md`
and docs) there.

## Application Architecture

### Project Setup

This is a Tauri V2 application consisting of a Rust backend crate at `src-tauri`
and a frontend single page application in this directory, with the source being
in `src` (classic Vite setup).

The frontend uses SolidJS, Vite, and TailwindCSS. Formatting is done via rustfmt
for the backend and the oxfmt / oxlint for the frontend.

### Connection Management

The frontend app is also designed to be run without a tauri backend. The client
can connect to local and remote knowledge bases. Any data from the knowledge
bases is NOT sent over Tauri IPC, although the backend has an in-process
database. Instead, the data is always sent over HTTP(s) / WebSocket (to avoid
maintaining two adapters). To support local knowledge base browsing, the
frontend (when run in the app) starts a separate Rust webserver in the backend
which then serves the knowledge. This communication is (must be) done over Tauri
IPC.

The local webserver is NOT exposed over LAN and always binds to localhost (with
OS-assigned) port. So we can be a bit relaxive with authentication and stuff.

### API Management

Tauri IPC relies on `src\backend\api.ts` and `src-tauri\src\lib.rs` having a
synched api surface. The client side does not need Zod because the communication
is trusted, but all endpoint names and shapes must be synched.

The general-purpose (remote) knowledge base adapter in `src\connect\index.ts`
must also be synched with the backend in `src-tauri\src\server\mod.rs`. This is
the HTTP(s) / WebSocket traffic and the TypeScript client must not trust the
data it receives (since the client is also used with untrusted remote
connections).

## TypeScript

### Enum Style

Enums are declared by a namespace containing symbol constants in pascal case
form. The namespace is also pascal case. Then the equally named type declaration
is a union of all typeof's of the variants. Here an example:

```ts
export namespace SomeEnum {
    export const VariantOne = Symbol();
    export const VariantTwo = Symbol();
    export const VariantThree = Symbol();
}

export type SomeEnum =
    | typeof SomeEnum.VariantOne
    | typeof SomeEnum.VariantTwo
    | typeof SomeEnum.VariantThree;
```

Please use this instead of inline string discriminants. This rule does not apply
to wire objects, i.e. objects and enums that are serialized. The serialized
objects are declared separately such that there is a translation layer between
internal types and wire types.

### I18n

I18n lives in `src\i18n`. You can declare phrases for UI code and they must be
translated to all declared languages (type-level enforcement).

### Package Manager

Nub is used as the package manager. It mirrors the Bun / pnpm CLI for common
operations.

## TypeScript UI Code Style

We are using Kobalte UI (unstyled components) and Lucide Icons.

Frequently reused components from Kobalte UI that we style ourselves live in
`src/ui/reuse`.

### Colors

On dark mode, all colors are automatically swapped to the inverts. The default
colors are in white mode, so design the components as they look in light mode
and dark mode works automatically. For some corner cases (like buttons that are
always blue and the text is always white), you have to add `dark:` variants just
to keep the color.

### Lucide Icons

To avoid loading ALL icons, we do not use imports from the root barrel file
import, but instead import directly from the icon path. All icon component
imports must end with `Icon`. We debate about adding
`vite-plugin-lucide-preprocess` in the future to import the icons all from
`lucide-solid`.

## Testing

Please do not add any frontend tests (or try to test the frontend code in other
ways) (if not said otherwise).
