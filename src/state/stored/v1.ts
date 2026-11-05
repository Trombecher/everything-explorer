import z from "zod";

import {Language} from "@/i18n";
import {
    ConnectionType,
    defaultAppStateData,
    type Connection,
    type InternalAppState,
    type LanguageSetting,
} from "@/state/app";
import {System} from "@/state/common";
import {Theme, type ThemeSetting} from "@/state/theme";
import type {DeepReadonly} from "@/util";

const storedLanguageSettingSchema = z.enum(["en-US", "de"]);

const storedThemeSettingSchema = z.enum(["dark", "light"]);

const nonNegativeIntegerSchema = z
    .number()
    .refine(n => Number.isSafeInteger(n) && n >= 0);

const storedConnectionSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("local"),
        filePath: z.string(),
        name: z.string(),
    }),
    z.object({
        type: z.literal("remote"),
        url: z.string(),
        name: z.string(),
    }),
]);

export const storedAppStateSchema = z.object({
    /**
     * Default: system.
     */
    languageSetting: storedLanguageSettingSchema.optional(),

    /**
     * Default: system.
     */
    themeSetting: storedThemeSettingSchema.optional(),

    /**
     * Default: empty array.
     */
    connections: z.array(storedConnectionSchema).optional(),

    /**
     * Default: none
     */
    lastUsedConnectionIndex: nonNegativeIntegerSchema.optional(),
});

export type StoredAppState = z.infer<typeof storedAppStateSchema>;

export type StoredConnection = z.infer<typeof storedConnectionSchema>;

const languageSettingFromStored = (
    stored: StoredAppState["languageSetting"],
): LanguageSetting => {
    switch (stored) {
        case "en-US":
            return Language.English;
        case "de":
            return Language.German;
        case undefined:
            return System;
    }
};

const languageSettingToStored = (
    internal: LanguageSetting,
): StoredAppState["languageSetting"] => {
    switch (internal) {
        case System:
            return undefined;
        case Language.English:
            return "en-US";
        case Language.German:
            return "de";
    }
};

const themeSettingFromStored = (
    stored: StoredAppState["themeSetting"],
): ThemeSetting => {
    switch (stored) {
        case "dark":
            return Theme.Dark;
        case "light":
            return Theme.Light;
        case undefined:
            return System;
    }
};

const themeSettingToStored = (
    internal: ThemeSetting,
): StoredAppState["themeSetting"] => {
    switch (internal) {
        case System:
            return undefined;
        case Theme.Dark:
            return "dark";
        case Theme.Light:
            return "light";
    }
};

const connectionFromStored = (stored: StoredConnection): Connection => {
    switch (stored.type) {
        case "local":
            return {
                type: ConnectionType.Local,
                filePath: stored.filePath,
                name: stored.name,
            };
        case "remote":
            return {
                type: ConnectionType.Remote,
                url: stored.url,
                name: stored.name,
            };
    }
};

const connectionToStored = (
    connection: DeepReadonly<Connection>,
): StoredConnection => {
    switch (connection.type) {
        case ConnectionType.Local:
            return {
                type: "local",
                filePath: connection.filePath,
                name: connection.name,
            };
        case ConnectionType.Remote:
            return {
                type: "remote",
                url: connection.url,
                name: connection.name,
            };
    }
};

/**
 * Converts the internal app state into its stored representation.
 */
export const serializeAppState = (
    state: DeepReadonly<InternalAppState>,
): StoredAppState => {
    const languageSetting = languageSettingToStored(state.languageSetting);
    const themeSetting = themeSettingToStored(state.themeSetting);

    return {
        ...(languageSetting === undefined ? {} : {languageSetting}),
        ...(themeSetting === undefined ? {} : {themeSetting}),
        connections: state.connections.map(connectionToStored),
        lastUsedConnectionIndex: state.lastUsedConnectionIndex,
    };
};

/**
 * Converts stored app state into the internal representation.
 *
 * Falls back to the default internal app state if the stored value is invalid.
 */
export const deserializeAppState = (stored: unknown): InternalAppState => {
    const result = storedAppStateSchema.safeParse(stored);

    if (!result.success) return defaultAppStateData();

    const {
        languageSetting,
        themeSetting,
        connections,
        lastUsedConnectionIndex,
    } = result.data;

    return {
        ...defaultAppStateData(),
        languageSetting: languageSettingFromStored(languageSetting),
        themeSetting: themeSettingFromStored(themeSetting),
        connections: (connections ?? []).map(connectionFromStored),
        lastUsedConnectionIndex,
    };
};
