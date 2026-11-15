import {Show} from "solid-js";

import {useAppState} from "@/context";

import AppInfo from "./AppInfo";
import ConnectionStatusView from "./ConnectionStatusView";
import Views from "./Views";

export default () => {
    const appState = useAppState();

    return (
        <aside
            id="app-sidebar"
            class={`sticky top-0 flex h-screen shrink-0 flex-col gap-2 p-2 transition-[width] duration-150 ${appState.sidebarCollapsed() ? "w-18.5" : "w-64"}`}
        >
            <AppInfo compact={appState.sidebarCollapsed()} />
            <ConnectionStatusView compact={appState.sidebarCollapsed()} />
            <Show when={appState.isConnected()}>
                <Views compact={appState.sidebarCollapsed()} />
            </Show>
        </aside>
    );
};
