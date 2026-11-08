import {createEffect} from "solid-js";

import * as backend from "@/backend/api";

import {AppStateContext} from "./context";
import type {InternalAppState} from "./state/app";
import {AppState} from "./state/app";
import {localStorageAppStateKey, serializeAppState} from "./state/stored";
import App from "./ui/App";
import LayoutOptionsProvider from "./ui/objects/LayoutOptionsProvider";

export const loadedInitialState: {state: InternalAppState | undefined} = {
    state: undefined,
};

export default () => {
    if (loadedInitialState.state === undefined) {
        throw new Error("missing initial state");
    }

    const appState = new AppState(loadedInitialState.state);
    loadedInitialState.state = undefined;

    // State sync.
    if (backend.isApp()) {
        createEffect(() => {
            backend.setAppSettings(
                JSON.stringify(serializeAppState(appState.state)),
            );
        });
    } else {
        createEffect(() => {
            localStorage.setItem(
                localStorageAppStateKey,
                JSON.stringify(serializeAppState(appState.state)),
            );
        });
    }

    return (
        <AppStateContext.Provider value={appState}>
            <LayoutOptionsProvider>
                <App />
            </LayoutOptionsProvider>
        </AppStateContext.Provider>
    );
};
