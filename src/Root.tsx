import {createEffect} from "solid-js";

import * as backend from "@/backend/api";

import {AppStateContext} from "./context";
import type {InternalAppState} from "./state/app";
import {AppState} from "./state/app";
import {localStorageAppStateKey, serializeAppState} from "./state/stored";
import App from "./ui/App";
import {AtomNames, AtomNamesContext} from "./ui/objects/atomNames";

export const loadedInitialState: {state: InternalAppState | undefined} = {
    state: undefined,
};

export default () => {
    if (loadedInitialState.state === undefined) {
        throw new Error("missing initial state");
    }

    const appState = new AppState(loadedInitialState.state);
    loadedInitialState.state = undefined;

    const atomNames = new AtomNames();

    createEffect(() => {
        atomNames.noteConnection(appState.connectionClient());
    });

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
            <AtomNamesContext.Provider value={atomNames}>
                <App />
            </AtomNamesContext.Provider>
        </AppStateContext.Provider>
    );
};
