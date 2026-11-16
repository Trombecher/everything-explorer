import {Language} from "@/i18n";

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
