import type {InternalAppState} from "@/state/app";
import {defaultAppStateData} from "@/state/app";
import type {DeepReadonly} from "@/util";

import * as v1 from "./v1";

const CURRENT_VERSION = "1";

export type StoredAppState = {
    version: typeof CURRENT_VERSION;
} & v1.StoredAppState;

const storedVersion = (stored: unknown): unknown => {
    if (typeof stored !== "object" || stored === null) return undefined;

    return (stored as {version?: unknown}).version;
};

/**
 * Converts versioned stored app state into the internal representation.
 *
 * Falls back to the default internal app state if the version is unknown or the
 * stored value is invalid.
 */
export const deserializeAppState = (stored: unknown): InternalAppState => {
    switch (storedVersion(stored)) {
        case "1":
            return v1.deserializeAppState(stored);
        default:
            return defaultAppStateData();
    }
};

/**
 * Converts the internal app state into the current versioned stored
 * representation.
 */
export const serializeAppState = (
    state: DeepReadonly<InternalAppState>,
): StoredAppState => ({
    version: CURRENT_VERSION,
    ...v1.serializeAppState(state),
});

export const localStorageAppStateKey = "appState";
