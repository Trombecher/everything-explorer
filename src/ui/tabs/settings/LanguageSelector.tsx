import {Show} from "solid-js";

import {usePreferences} from "@/context";
import {Language, translate} from "@/i18n";
import {Phrase} from "@/i18n/phrases";
import type {LanguageSetting, PreferencesState} from "@/state/app";
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
    preferences: PreferencesState,
    languageSetting: LanguageSetting,
) => {
    const nativeLanguageTranslation = preferences.translate(
        languageSettingToPhrase[languageSetting],
        undefined,
    );

    if (preferences.language() === Language.English)
        return nativeLanguageTranslation;

    if (languageSetting === System) {
        const browserLanguage = preferences.browserLanguage();

        return `${nativeLanguageTranslation} (${browserLanguage === undefined ? preferences.translate(Phrase.UnknownFallbackToEnglish, undefined) : `${translate(languageSettingToPhrase[browserLanguage], Language.English, undefined)} - ${preferences.translate(Phrase.Detected, undefined)}`})`;
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
    const preferences = usePreferences();

    return (
        <Select<LanguageSetting, LanguageSettingStringId>
            class="contents"
            options={[System, Language.English, Language.German]}
            value={preferences.languageSetting()}
            idFromValue={value => languageSettingToStringId[value]}
            idToValue={id => languageSettingFromStringId[id]}
            onChange={value => {
                preferences.setLanguageSetting(value);
            }}
            stringifyValue={value =>
                languageSettingDisplayString(preferences, value)
            }
            description={
                <>
                    {preferences.translate(Phrase.Language, undefined)}
                    <Show when={preferences.language() !== Language.English}>
                        {" ("}
                        {translate(
                            Phrase.Language,
                            Language.English,
                            undefined,
                        )}
                        {")"}
                    </Show>
                </>
            }
        />
    );
};
