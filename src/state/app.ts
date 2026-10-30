import {createSignal, onMount, onCleanup} from "solid-js";
import {type SetStoreFunction, createStore} from "solid-js/store";

import {Language, translate} from "../i18n";
import type {Phrase} from "../i18n/phrases";
import {Tab} from "../ui/sidebar/tabs";
import type {DeepReadonly} from "../util";
import {System} from "./common";
import type {ThemeSetting} from "./theme";

export type LanguageSetting = Language | typeof System;

export const KBConnectionTypeLocal = Symbol();
export const KBConnectionTypeRemote = Symbol();

export type KBConnection = (
    | {
          type: typeof KBConnectionTypeLocal;
          filePath: string;
      }
    | {
          type: typeof KBConnectionTypeRemote;
          url: string;
      }
) & {name: string};

export type AppStateData = {
    languageSetting: LanguageSetting;
    currentTab: Tab;
    connections: KBConnection[];
    themeSetting: ThemeSetting;
};

export type BrowserLanguage = Language | undefined;

export const detectBrowserLanguage = (): BrowserLanguage => {
    switch (navigator.language.split("-")[0]) {
        case "en":
            return Language.English;
        case "de":
            return Language.German;
        default:
            return undefined;
    }
};

export class AppState {
    public readonly state: DeepReadonly<AppStateData>;
    private readonly setState: SetStoreFunction<AppStateData>;

    public readonly browserLanguage: () => BrowserLanguage;

    constructor() {
        const [state, setState] = createStore<AppStateData>({
            languageSetting: System,
            currentTab: Tab.AppSettings,
            connections: [],
            themeSetting: System,
        });

        this.state = state;
        this.setState = setState;

        // language handling
        const [browserLanguage, setBrowserLanguage] =
            createSignal<BrowserLanguage>(detectBrowserLanguage());

        this.browserLanguage = browserLanguage;

        const updateBrowserLanguage = () => {
            setBrowserLanguage(detectBrowserLanguage());
        };

        onMount(() => {
            window.addEventListener("languagechange", updateBrowserLanguage);
        });

        onCleanup(() => {
            window.removeEventListener("languagechange", updateBrowserLanguage);
        });
    }

    public languageIsNotAvailable(): boolean {
        return (
            this.state.languageSetting === System &&
            this.browserLanguage() === undefined
        );
    }

    /**
     * The chosen language for the app.
     */
    public language(): Language {
        const languageSetting = this.state.languageSetting;

        if (languageSetting === System) {
            const browserLanguage = this.browserLanguage();

            // Fallback, browser is set to language
            // we do not have translations for.
            return browserLanguage ?? Language.English;
        }

        return languageSetting;
    }

    public setLanguageSetting(newLanguage: LanguageSetting) {
        this.setState("languageSetting", newLanguage);
    }

    public translate<P extends Phrase>(
        phrase: P,
        options: Phrase.TranslationArguments[P],
    ): string {
        return translate(phrase, this.language(), options);
    }

    public setCurrentTab(tab: Tab) {
        this.setState("currentTab", tab);
    }

    public setThemeSetting(newTheme: ThemeSetting) {
        this.setState("themeSetting", newTheme);
    }
}
