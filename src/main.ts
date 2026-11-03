/* @refresh reload */
import {render} from "solid-js/web";

import * as backend from "@/backend/api";

import Root, {loadedInitialState} from "./Root";

import "./global.css";
import {deserializeAppState, localStorageAppStateKey} from "./state/stored";

const loadAppState = async (): Promise<object> => {
    const string = backend.isApp()
        ? await backend.getAppSettings()
        : localStorage.getItem(localStorageAppStateKey);

    try {
        return JSON.parse(string ?? "");
    } catch {
        return {};
    }
};

// Block until initial app state is loaded.
loadedInitialState.state = deserializeAppState(await loadAppState());

document.body.style.backgroundColor = "";
document.querySelector("#loading")?.remove();

render(Root, document.body);
