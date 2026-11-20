import type {Accessor} from "solid-js";
import {createSignal, onCleanup, onMount} from "solid-js";

import {Language, translate} from "@/i18n";
import type {Phrase} from "@/i18n/phrases";
import {System} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";

import type {AppStateStore} from "./internal";
import {type BrowserLanguage, detectBrowserLanguage} from "./language";
import type {LanguageSetting} from "./types";

export type PreferencesState = {
    readonly languageSetting: Accessor<LanguageSetting>;
    readonly themeSetting: Accessor<ThemeSetting>;
    readonly browserLanguage: Accessor<BrowserLanguage>;

    /**
     * The language chosen for the app, resolving the system setting.
     */
    language(): Language;

    /**
     * Whether the language setting is "system" but the browser language is not
     * supported.
     */
    languageIsNotAvailable(): boolean;

    translate<P extends Phrase>(
        phrase: P,
        options: Phrase.TranslationArguments[P],
    ): string;

    setLanguageSetting(setting: LanguageSetting): void;
    setThemeSetting(setting: ThemeSetting): void;
};

/**
 * Language and theme preferences.
 *
 * The settings themselves live in the persisted store. The browser language is
 * runtime-only and kept here as well, close to the language resolution logic.
 */
export const createPreferencesState = (
    store: AppStateStore,
): PreferencesState => {
    const [browserLanguage, setBrowserLanguage] = createSignal<BrowserLanguage>(
        detectBrowserLanguage(),
    );

    const updateBrowserLanguage = () => {
        setBrowserLanguage(detectBrowserLanguage());
    };

    onMount(() => {
        window.addEventListener("languagechange", updateBrowserLanguage);
    });

    onCleanup(() => {
        window.removeEventListener("languagechange", updateBrowserLanguage);
    });

    const language = (): Language => {
        const setting = store.state.languageSetting;

        if (setting === System) {
            // Fallback, browser is set to language we do not have translations
            // for.
            return browserLanguage() ?? Language.English;
        }

        return setting;
    };

    return {
        languageSetting: () => store.state.languageSetting,
        themeSetting: () => store.state.themeSetting,
        browserLanguage,

        language,

        languageIsNotAvailable: () =>
            store.state.languageSetting === System
            && browserLanguage() === undefined,

        translate: (phrase, options) => translate(phrase, language(), options),

        setLanguageSetting(setting) {
            store.commit(draft => {
                draft.languageSetting = setting;
            });
        },

        setThemeSetting(setting) {
            store.commit(draft => {
                draft.themeSetting = setting;
            });
        },
    };
};
