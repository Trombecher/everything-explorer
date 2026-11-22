import type {Language} from "@/i18n";
import type {EverythingObject} from "@/model";
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
 * An object stored in the virtual clipboard.
 *
 * Slots are addressed by their position; the first ten slots additionally have
 * number-key shortcuts in the object views.
 */
export type ClipboardSlot = {name: string; object: EverythingObject};

/**
 * Invariants:
 *
 * - If `lastUsedConnectionIndex` is not `undefined`, then it is a safe
 *   non-negative integer which is a valid connection index.
 * - No connection URL is double.
 * - Every clipboard slot has a non-empty name.
 */
export type InternalAppState = {
    languageSetting: LanguageSetting;
    currentTab: Tab;
    connections: Connection[];
    themeSetting: ThemeSetting;
    lastUsedConnectionIndex: number | undefined;
    clipboard: ClipboardSlot[];
};

export const defaultAppStateData = (): InternalAppState => ({
    languageSetting: System,
    currentTab: Tab.Debug,
    connections: [],
    themeSetting: System,
    lastUsedConnectionIndex: undefined,
    clipboard: [],
});
