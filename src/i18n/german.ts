import type {TranslationTable} from ".";
import {Phrase} from "./phrases";

export const german = {
    [Phrase.AppSettings]: () => "App Einstellungen",
    [Phrase.Compact]: () => "Kompakt",
    [Phrase.Greeting]: ({forName}) => `Hallo, ${forName}!`,
    [Phrase.InstanceProperties]: () => "Instanzeigenschaften",
    [Phrase.Things]: () => "Dinge",
    [Phrase.English]: () => "Englisch",
    [Phrase.German]: () => "Deutsch",
    [Phrase.System]: () => "System",
    [Phrase.Language]: () => "Sprache",
    [Phrase.Version]: () => "Version",
    [Phrase.Home]: () => "Startseite",
    [Phrase.Dark]: () => "Dunkel",
    [Phrase.Light]: () => "Hell",
    [Phrase.Theme]: () => "Farbschema",
    [Phrase.WelcomeBack]: () => "Willkommen zurück",
    [Phrase.Debug]: () => "Debug",
} as const satisfies TranslationTable;
