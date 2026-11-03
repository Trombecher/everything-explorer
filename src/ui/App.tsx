import {createEffect, Match, Switch} from "solid-js";

import * as backend from "@/backend/api";
import {System, Tab} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";
import {Theme} from "@/state/theme";

import {useAppState} from "../context";
import {Phrase} from "../i18n/phrases";
import SideBar from "./sidebar/SideBar";
import AllAtoms from "./views/AllAtomsView";
import DebugView from "./views/DebugView";
import Home from "./views/HomeView";
import SettingsView from "./views/SettingsView";

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

        appState.tryReconnectToLocalServer();
    }

    createEffect(() => {
        applyTheme(appState.state.themeSetting);
    });

    return (
        <>
            <SideBar />
            <Switch>
                <Match when={appState.state.currentTab === Tab.AllAtoms}>
                    <AllAtoms />
                </Match>
                <Match
                    when={appState.state.currentTab === Tab.InstanceProperties}
                >
                    {appState.translate(Phrase.Greeting, {forName: "Tobias"})}
                </Match>
                <Match when={appState.state.currentTab === Tab.AppSettings}>
                    <SettingsView />
                </Match>
                <Match when={appState.state.currentTab === Tab.Home}>
                    <Home />
                </Match>
                <Match when={appState.state.currentTab === Tab.Debug}>
                    <DebugView />
                </Match>
            </Switch>
        </>
    );
};
