const German = Symbol();
const English = Symbol();
const System = Symbol();
const Language = Symbol();
const Light = Symbol();
const Dark = Symbol();
const Theme = Symbol();
const UnknownFallbackToEnglish = Symbol();
const Detected = Symbol();

export const settingsPhrases = {
    German,
    English,
    System,
    Language,
    Light,
    Dark,
    Theme,
    UnknownFallbackToEnglish,
    Detected,
} as const;

export type SettingsTranslationArguments = {
    [German]: undefined;
    [English]: undefined;
    [System]: undefined;
    [Language]: undefined;
    [Light]: undefined;
    [Dark]: undefined;
    [Theme]: undefined;
    [UnknownFallbackToEnglish]: undefined;
    [Detected]: undefined;
};
