import {english} from "./english";
import {german} from "./german";
import type {Phrase} from "./phrases";

export namespace Language {
    export const English = Symbol();
    export const German = Symbol();
}

export type Language = typeof Language.English | typeof Language.German;

export type TranslationTable = {
    [P in Phrase]: Phrase.TranslationArguments[P] extends undefined
        ? () => string
        : (options: Phrase.TranslationArguments[P]) => string;
};

const languageTable = {
    [Language.English]: english,
    [Language.German]: german,
} as const satisfies Record<Language, TranslationTable>;

export const translate = <P extends Phrase>(
    phrase: P,
    language: Language,
    template: Phrase.TranslationArguments[P],
) => {
    const translation = languageTable[language][phrase];

    // @ts-expect-error this is fine!
    return translation(template);
};
