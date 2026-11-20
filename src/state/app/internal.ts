import type {DeepReadonly} from "@/util";

import type {InternalAppState} from "./types";

/**
 * The persisted application state together with the only mutation channel that
 * the feature modules receive.
 *
 * `commit` applies a mutation to the single application store and enforces the
 * state invariants before the update becomes visible. Feature modules never get
 * access to the raw store setter, so they cannot publish invalid state.
 */
export type AppStateStore = {
    readonly state: DeepReadonly<InternalAppState>;

    readonly commit: (mutate: (draft: InternalAppState) => void) => void;
};
