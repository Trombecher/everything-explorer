export namespace Phrase {
    type RequireArgsForEveryPhrase<
        A extends Record<Phrase, object | undefined>,
    > = A;

    export type TranslationArguments = RequireArgsForEveryPhrase<{
        [AppSettings]: undefined;
        [Greeting]: {forName: string};
        [InstanceProperties]: undefined;
        [AllAtoms]: undefined;
        [German]: undefined;
        [English]: undefined;
        [System]: undefined;
        [Language]: undefined;
        [Version]: undefined;
        [Connections]: undefined;
        [Light]: undefined;
        [Dark]: undefined;
        [Theme]: undefined;
    }>;

    export const AppSettings = Symbol();
    export const Greeting = Symbol();
    export const InstanceProperties = Symbol();
    export const AllAtoms = Symbol();
    export const German = Symbol();
    export const English = Symbol();
    export const System = Symbol();
    export const Language = Symbol();
    export const Version = Symbol();
    export const Connections = Symbol();
    export const Dark = Symbol();
    export const Light = Symbol();
    export const Theme = Symbol();
}

export type Phrase =
    | typeof Phrase.AppSettings
    | typeof Phrase.Greeting
    | typeof Phrase.InstanceProperties
    | typeof Phrase.AllAtoms
    | typeof Phrase.German
    | typeof Phrase.English
    | typeof Phrase.System
    | typeof Phrase.Language
    | typeof Phrase.Version
    | typeof Phrase.Connections
    | typeof Phrase.Dark
    | typeof Phrase.Light
    | typeof Phrase.Theme;
