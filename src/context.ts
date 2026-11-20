import {createContext, useContext} from "solid-js";

import type {AppState} from "./state/app";

export const AppStateContext = createContext<AppState | undefined>();

export const useAppState = () => {
    const state = useContext(AppStateContext);
    if (!state) throw new Error("no app state context");

    return state;
};

/**
 * The connections to knowledge bases and the client of the active connection.
 */
export const useConnections = () => useAppState().connections;

/**
 * The language and theme preferences.
 */
export const usePreferences = () => useAppState().preferences;

/**
 * The current tab and sidebar state.
 */
export const useNavigation = () => useAppState().navigation;
