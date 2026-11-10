import {useAppState} from "@/context";
import {Language, translate} from "@/i18n";
import {Phrase} from "@/i18n/phrases";
import type {AppState, LanguageSetting} from "@/state/app";
import {System} from "@/state/common";
import Select from "@/ui/reuse/Select";

const languageSettingToPhrase = {
    [System]: Phrase.System,
    [Language.German]: Phrase.German,
    [Language.English]: Phrase.English,
} as const satisfies Record<LanguageSetting, Phrase>;

type LanguageSettingStringId = "german" | "system" | "english";

const languageSettingToStringId = {
    [Language.English]: "english",
    [Language.German]: "german",
    [System]: "system",
} as const satisfies Record<LanguageSetting, LanguageSettingStringId>;

const languageSettingFromStringId = {
    english: Language.English,
    german: Language.German,
    system: System,
} as const satisfies Record<LanguageSettingStringId, LanguageSetting>;

const languageSettingDisplayString = (
    appState: AppState,
    languageSetting: LanguageSetting,
) => {
    const nativeLanguageTranslation = appState.translate(
        languageSettingToPhrase[languageSetting],
        undefined,
    );

    if (appState.language() === Language.English)
        return nativeLanguageTranslation;

    if (languageSetting === System) {
        const browserLanguage = appState.browserLanguage();

        return `${nativeLanguageTranslation} (${browserLanguage === undefined ? "unknown - fallback to english" : `${translate(languageSettingToPhrase[browserLanguage], Language.English, undefined)} - detected`})`;
    } else {
        const englishLanguageTranslation = translate(
            languageSettingToPhrase[languageSetting],
            Language.English,
            undefined,
        );

        return `${nativeLanguageTranslation} (${englishLanguageTranslation})`;
    }
};

export default () => {
    const appState = useAppState();

    return (
        <Select<LanguageSetting, LanguageSettingStringId>
            class="contents"
            options={[System, Language.English, Language.German]}
            value={appState.state.languageSetting}
            idFromValue={value => languageSettingToStringId[value]}
            idToValue={id => languageSettingFromStringId[id]}
            onChange={value => {
                appState.setLanguageSetting(value);
            }}
            stringifyValue={value =>
                languageSettingDisplayString(appState, value)
            }
            description={
                <>
                    {appState.translate(Phrase.Language, undefined)} (
                    {translate(Phrase.Language, Language.English, undefined)})
                </>
            }
        />
    );
};
