import {Phrase} from "@/i18n/phrases";

export namespace Tab {
    export const AllAtoms = Symbol();
    export const InstanceProperties = Symbol();
    export const AppSettings = Symbol();
    export const Connections = Symbol();
}

export type Tab =
    | typeof Tab.AllAtoms
    | typeof Tab.InstanceProperties
    | typeof Tab.AppSettings
    | typeof Tab.Connections;

export const tabToPhrase = {
    [Tab.AllAtoms]: Phrase.AllAtoms,
    [Tab.InstanceProperties]: Phrase.InstanceProperties,
    [Tab.AppSettings]: Phrase.AppSettings,
    [Tab.Connections]: Phrase.Connections,
} as const satisfies Record<Tab, Phrase>;
