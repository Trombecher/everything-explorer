import {createContext, useContext} from "solid-js";

import type {AppState} from "./state/app";

export const AppStateContext = createContext<AppState | undefined>();

export const useAppState = () => {
    const state = useContext(AppStateContext);
    if (!state) throw new Error("no app state context");

    return state;
};
