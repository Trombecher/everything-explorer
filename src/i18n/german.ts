import type {TranslationTable} from ".";
import {Phrase} from "./phrases";

export const german = {
    [Phrase.AppSettings]: () => "App Einstellungen",
    [Phrase.Greeting]: ({forName}) => `Hallo, ${forName}!`,
    [Phrase.InstanceProperties]: () => "Instanzeigenschaften",
    [Phrase.AllAtoms]: () => "Alle Sachen",
    [Phrase.English]: () => "Englisch",
    [Phrase.German]: () => "Deutsch",
    [Phrase.System]: () => "System",
    [Phrase.Language]: () => "Sprache",
    [Phrase.Version]: () => "Version",
    [Phrase.Connections]: () => "Verbindungen",
    [Phrase.Dark]: () => "Dunkel",
    [Phrase.Light]: () => "Hell",
} as const satisfies TranslationTable;
