import type {Language} from "@/i18n";
import {System, Tab} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";

export type LanguageSetting = Language | typeof System;

export namespace ConnectionType {
    export const Local = Symbol();
    export const Remote = Symbol();
}

export type ConnectionType =
    | typeof ConnectionType.Local
    | typeof ConnectionType.Remote;

export type Connection = (
    | {type: typeof ConnectionType.Local; filePath: string}
    | {type: typeof ConnectionType.Remote; url: string}
) & {name: string};

/**
 * Invariants:
 *
 * - If `lastUsedConnectionIndex` is not `undefined`, then it is a safe
 *   non-negative integer which is a valid connection index.
 * - No connection URL is double.
 */
export type InternalAppState = {
    languageSetting: LanguageSetting;
    currentTab: Tab;
    connections: Connection[];
    themeSetting: ThemeSetting;
    lastUsedConnectionIndex: number | undefined;
};

export const defaultAppStateData = (): InternalAppState => ({
    languageSetting: System,
    currentTab: Tab.Debug,
    connections: [],
    themeSetting: System,
    lastUsedConnectionIndex: undefined,
});
