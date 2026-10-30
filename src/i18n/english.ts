import {type TranslationTable} from ".";
import {Phrase} from "./phrases";

export const english = {
    [Phrase.AppSettings]: () => "App Settings",
    [Phrase.Greeting]: ({forName}) => `Hello, ${forName}!`,
    [Phrase.InstanceProperties]: () => "Instance Properties",
    [Phrase.AllAtoms]: () => "All Atoms",
    [Phrase.English]: () => "English",
    [Phrase.German]: () => "German",
    [Phrase.System]: () => "System",
    [Phrase.Language]: () => "Language",
    [Phrase.Version]: () => "Version",
    [Phrase.Connections]: () => "Connections",
    [Phrase.Dark]: () => "Dark",
    [Phrase.Light]: () => "Light",
} as const satisfies TranslationTable;
