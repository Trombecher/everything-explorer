import type {Accessor} from "solid-js";
import {createSignal} from "solid-js";

import type {Tab} from "@/state/common";

import type {AppStateStore} from "./internal";

export type NavigationState = {
    /**
     * The tab that is currently shown.
     */
    readonly currentTab: Accessor<Tab>;

    /**
     * Whether the sidebar is collapsed to a slim icon rail.
     */
    readonly sidebarCollapsed: Accessor<boolean>;

    setCurrentTab(tab: Tab): void;
    setSidebarCollapsed(collapsed: boolean): void;
    toggleSidebarCollapsed(): void;
};

/**
 * Navigation state of the app.
 *
 * `currentTab` is part of the persisted store (although it is not serialized
 * yet), while `sidebarCollapsed` is runtime-only.
 */
export const createNavigationState = (
    store: AppStateStore,
): NavigationState => {
    const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);

    return {
        currentTab: () => store.state.currentTab,
        sidebarCollapsed,

        setCurrentTab(tab) {
            store.commit(draft => {
                draft.currentTab = tab;
            });
        },

        setSidebarCollapsed,

        toggleSidebarCollapsed() {
            setSidebarCollapsed(collapsed => !collapsed);
        },
    };
};
