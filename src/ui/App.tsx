import {createEffect, Match, Switch} from "solid-js";

import * as backend from "@/backend/api";
import {Phrase} from "@/i18n/phrases";
import {System, Tab} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";
import {Theme} from "@/state/theme";

import {
    useAppState,
    useConnections,
    useNavigation,
    usePreferences,
} from "../context";
import ClipboardPanel from "./clipboard/ClipboardPanel";
import {
    MIN_CLIPBOARD_PANEL_WIDTH,
    createClipboardPanelResize,
} from "./clipboard/createClipboardPanelResize";
import ResizeSeparator from "./reuse/ResizeSeparator";
import SideBar from "./sidebar/SideBar";
import ConnectionsView from "./tabs/connections/ConnectionsView";
import DebugView from "./tabs/debug/DebugView";
import EvaluateView from "./tabs/EvaluateView";
import Home from "./tabs/HomeView";
import InstancePropertiesView from "./tabs/InstancePropertiesView";
import SettingsView from "./tabs/settings/SettingsView";
import ThingsView from "./tabs/things/ThingsView";

export default () => {
    const appState = useAppState();
    const connections = useConnections();
    const navigation = useNavigation();
    const preferences = usePreferences();

    const {setContainer, maximumClipboardPanelWidth} =
        createClipboardPanelResize();

    const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
    );

    darkModeMediaQuery.addEventListener("change", () => {
        if (preferences.themeSetting() === System) {
            applyTheme(System);
        }
    });

    const applyTheme = (themeSetting: ThemeSetting) => {
        const resolvedTheme =
            themeSetting === System
                ? darkModeMediaQuery.matches
                    ? Theme.Dark
                    : Theme.Light
                : themeSetting;

        document.documentElement.style.colorScheme =
            document.documentElement.dataset.theme =
                resolvedTheme === Theme.Dark ? "dark" : "light";
    };

    if (backend.isApp()) {
        createEffect(() => {
            backend.applyThemeSetting(preferences.themeSetting());
        });

        connections.tryReconnectToLocalServer();
    }

    createEffect(() => {
        applyTheme(preferences.themeSetting());
    });

    return (
        <>
            <SideBar />
            <div
                class="flex min-w-0 grow gap-2"
                ref={element => setContainer(element)}
            >
                <div class="flex min-w-0 grow">
                    <Switch>
                        <Match when={navigation.currentTab() === Tab.Things}>
                            <ThingsView />
                        </Match>
                        <Match when={navigation.currentTab() === Tab.Evaluate}>
                            <EvaluateView />
                        </Match>
                        <Match
                            when={
                                navigation.currentTab()
                                === Tab.InstanceProperties
                            }
                        >
                            <InstancePropertiesView />
                        </Match>
                        <Match
                            when={navigation.currentTab() === Tab.Connections}
                        >
                            <ConnectionsView />
                        </Match>
                        <Match
                            when={navigation.currentTab() === Tab.AppSettings}
                        >
                            <SettingsView />
                        </Match>
                        <Match when={navigation.currentTab() === Tab.Home}>
                            <Home />
                        </Match>
                        <Match when={navigation.currentTab() === Tab.Debug}>
                            <DebugView />
                        </Match>
                    </Switch>
                </div>

                <ResizeSeparator
                    label={preferences.translate(
                        Phrase.ResizeClipboardPanel,
                        undefined,
                    )}
                    width={appState.clipboardPanelWidth}
                    setWidth={appState.setClipboardPanelWidth}
                    minWidth={MIN_CLIPBOARD_PANEL_WIDTH}
                    maxWidth={maximumClipboardPanelWidth}
                    resizedSide="end"
                    class="-mx-2"
                />

                <aside
                    class="sticky top-0 h-screen shrink-0 py-2"
                    aria-label={preferences.translate(
                        Phrase.Clipboard,
                        undefined,
                    )}
                    style={{width: `${appState.clipboardPanelWidth()}px`}}
                >
                    <ClipboardPanel />
                </aside>
            </div>
        </>
    );
};
