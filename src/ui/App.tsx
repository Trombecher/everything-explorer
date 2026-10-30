import {createEffect, Match, Switch} from "solid-js";

import * as backend from "@/backend/api";
import {System} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";
import {Theme} from "@/state/theme";

import {useAppState} from "../context";
import {Phrase} from "../i18n/phrases";
import ConnectionsView from "./ConnectionsView";
import SettingsView from "./SettingsView";
import SideBar from "./sidebar/SideBar";
import {Tab} from "./sidebar/tabs";

export default () => {
    const appState = useAppState();

    const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
    );

    darkModeMediaQuery.addEventListener("change", () => {
        if (appState.state.themeSetting === System) {
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
            backend.applyThemeSetting(appState.state.themeSetting);
        });
    }

    createEffect(() => {
        applyTheme(appState.state.themeSetting);
    });

    return (
        <>
            <SideBar />
            <Switch>
                <Match when={appState.state.currentTab === Tab.AllAtoms}>
                    <section class="flex flex-wrap gap-6 p-6">
                        {Array.from({length: 100}, (_, i) => (
                            <div class="min-h-48 w-48 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                                object @{(i * 823490458205) % 2349230423492}
                            </div>
                        ))}
                    </section>
                </Match>
                <Match
                    when={appState.state.currentTab === Tab.InstanceProperties}
                >
                    {appState.translate(Phrase.Greeting, {forName: "Tobias"})}
                </Match>
                <Match when={appState.state.currentTab === Tab.AppSettings}>
                    <SettingsView />
                </Match>
                <Match when={appState.state.currentTab === Tab.Connections}>
                    <ConnectionsView />
                </Match>
            </Switch>
        </>
    );
};
