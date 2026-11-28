import {
    clipboardPhrases,
    type ClipboardTranslationArguments,
} from "./clipboard";
import {commonPhrases, type CommonTranslationArguments} from "./common";
import {
    connectionPhrases,
    type ConnectionTranslationArguments,
} from "./connections";
import {evaluatePhrases, type EvaluateTranslationArguments} from "./evaluate";
import {keybindPhrases, type KeybindTranslationArguments} from "./keybinds";
import {objectsPhrases, type ObjectsTranslationArguments} from "./objects";
import {settingsPhrases, type SettingsTranslationArguments} from "./settings";
import {thingsPhrases, type ThingsTranslationArguments} from "./things";

const phrases = {
    ...commonPhrases,
    ...connectionPhrases,
    ...thingsPhrases,
    ...evaluatePhrases,
    ...settingsPhrases,
    ...objectsPhrases,
    ...clipboardPhrases,
    ...keybindPhrases,
} as const;

export const Phrase = phrases;
export type Phrase = (typeof phrases)[keyof typeof phrases];

export namespace Phrase {
    type RequireArgsForEveryPhrase<
        A extends Record<Phrase, object | undefined>,
    > = A;

    export type TranslationArguments = RequireArgsForEveryPhrase<
        CommonTranslationArguments
            & ConnectionTranslationArguments
            & ThingsTranslationArguments
            & EvaluateTranslationArguments
            & SettingsTranslationArguments
            & ObjectsTranslationArguments
            & ClipboardTranslationArguments
            & KeybindTranslationArguments
    >;
}
