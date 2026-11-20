import {Show} from "solid-js";

import {useConnections, useNavigation} from "@/context";

import AppInfo from "./AppInfo";
import ConnectionStatusView from "./ConnectionStatusView";
import Views from "./Views";

export default () => {
    const connections = useConnections();
    const navigation = useNavigation();

    return (
        <aside
            id="app-sidebar"
            class={`sticky top-0 flex h-screen shrink-0 flex-col gap-2 p-2 transition-[width] duration-150 ${navigation.sidebarCollapsed() ? "w-18.5" : "w-64"}`}
        >
            <AppInfo compact={navigation.sidebarCollapsed()} />
            <ConnectionStatusView compact={navigation.sidebarCollapsed()} />
            <Show when={connections.isConnected()}>
                <Views compact={navigation.sidebarCollapsed()} />
            </Show>
        </aside>
    );
};
