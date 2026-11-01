import {invoke, isTauri} from "@tauri-apps/api/core";

import {System} from "@/state/common";
import type {ThemeSetting} from "@/state/theme";
import {Theme} from "@/state/theme";

export const isApp = () => isTauri();

const themeSettingToString = {
    [Theme.Dark]: "dark",
    [Theme.Light]: "light",
    [System]: "system",
} as const satisfies Record<ThemeSetting, string>;

export const applyThemeSetting = (themeSetting: ThemeSetting) => {
    invoke("apply_theme_setting", {
        themeSetting: themeSettingToString[themeSetting],
    });
};

/**
 * Returns the stored app settings as a JSON string, or `null` if nothing has been stored yet.
 */
export const getAppSettings = () => invoke<string | null>("get_app_settings");

/**
 * Stores app settings, which must be a JSON object serialized as a string.
 */
export const setAppSettings = (settings: string) =>
    invoke<void>("set_app_settings", {settings});

export const pickKnowledgeBaseFile = () =>
    invoke<string | null>("pick_knowledge_base_file");

export const pickPathForNewKnowledgeBaseFile = () =>
    invoke<string | null>("pick_new_knowledge_base_file");

/**
 * Starts the server for serving a knowledge base at that path.
 * @returns the port of the server on localhost.
 */
export const servePath = (path: string) =>
    invoke<number>("serve_knowledge_base", {path});

/**
 * Returns whether the server is running.
 */
export const serverIsRunningOnPort = () =>
    invoke<number | null>("server_is_running_on_port");

/**
 * Stops the server.
 */
export const stopServer = () =>
    invoke<undefined>("stop_serving_knowledge_base");

export const osUserFullName = () => invoke<string>("os_user_full_name");
