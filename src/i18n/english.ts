import {type TranslationTable} from ".";
import {Phrase} from "./phrases";

export const english = {
    [Phrase.AppSettings]: () => "App Settings",
    [Phrase.Greeting]: ({forName}) => `Hello, ${forName}!`,
    [Phrase.InstanceProperties]: () => "Instance Properties",
    [Phrase.Things]: () => "Things",
    [Phrase.English]: () => "English",
    [Phrase.German]: () => "German",
    [Phrase.System]: () => "System",
    [Phrase.Language]: () => "Language",
    [Phrase.Version]: () => "Version",
    [Phrase.Home]: () => "Home",
    [Phrase.Dark]: () => "Dark",
    [Phrase.Light]: () => "Light",
    [Phrase.Theme]: () => "Theme",
    [Phrase.WelcomeBack]: () => "Welcome back",
    [Phrase.Debug]: () => "Debug",
} as const satisfies TranslationTable;
