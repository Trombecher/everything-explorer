import {Show} from "solid-js";

import {useAppState} from "@/context";

import AppInfo from "./AppInfo";
import ConnectionStatusView from "./ConnectionStatusView";
import Views from "./Views";

export default () => {
    const appState = useAppState();

    return (
        <aside class="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-3 p-2">
            <AppInfo />
            <ConnectionStatusView />
            <Show when={appState.isConnected()}>
                <Views />
            </Show>
        </aside>
    );
};
