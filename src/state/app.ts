import type {Accessor, Setter} from "solid-js";
import {createSignal, onCleanup, onMount} from "solid-js";
import {type SetStoreFunction, createStore} from "solid-js/store";

import * as backend from "@/backend/api";
import {ConnectionClient} from "@/connect";

import {Language, translate} from "../i18n";
import type {Phrase} from "../i18n/phrases";
import type {DeepReadonly} from "../util";
import {System, Tab} from "./common";
import type {ThemeSetting} from "./theme";

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

const connectionsShareURI = (
    connection: DeepReadonly<Connection>,
    connection2: DeepReadonly<Connection>,
): boolean => {
    if (
        connection2.type === ConnectionType.Local
        && connection.type === ConnectionType.Local
    ) {
        return connection.filePath === connection2.filePath;
    }

    if (
        connection.type === ConnectionType.Remote
        && connection2.type === ConnectionType.Remote
    ) {
        return connection.url === connection2.url;
    }

    return false;
};

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

/**
 * Modifies the given `appState` such that all invariants are good.
 */
const enforceInvariants = (appState: InternalAppState) => {
    // Filter out doubles.
    appState.connections = appState.connections.filter(
        (connection, i) =>
            !appState.connections.find(
                (connection2, j) =>
                    i < j && connectionsShareURI(connection, connection2),
            ),
    );

    if (
        appState.lastUsedConnectionIndex !== undefined
        && (!Number.isSafeInteger(appState.lastUsedConnectionIndex)
            || appState.lastUsedConnectionIndex < 0
            || !appState.connections[appState.lastUsedConnectionIndex])
    ) {
        appState.lastUsedConnectionIndex = undefined;
    }
};

export type BrowserLanguage = Language | undefined;

export const detectBrowserLanguage = (): BrowserLanguage => {
    switch (navigator.language.split("-")[0]) {
        case "en":
            return Language.English;
        case "de":
            return Language.German;
        default:
            return undefined;
    }
};

export const defaultAppStateData = (): InternalAppState => ({
    languageSetting: System,
    currentTab: Tab.Debug,
    connections: [],
    themeSetting: System,
    lastUsedConnectionIndex: undefined,
});

export class AppState {
    public readonly state: DeepReadonly<InternalAppState>;
    private readonly setState: SetStoreFunction<InternalAppState>;

    public readonly connectionClient: Accessor<undefined | ConnectionClient>;
    private readonly setConnectionClient: Setter<undefined | ConnectionClient>;

    public readonly browserLanguage: () => BrowserLanguage;

    constructor(initial: InternalAppState) {
        enforceInvariants(initial);

        const [state, setState] = createStore<InternalAppState>(initial);

        this.state = state;
        this.setState = setState;

        // language handling
        const [browserLanguage, setBrowserLanguage] =
            createSignal<BrowserLanguage>(detectBrowserLanguage());

        this.browserLanguage = browserLanguage;

        const updateBrowserLanguage = () => {
            setBrowserLanguage(detectBrowserLanguage());
        };

        onMount(() => {
            window.addEventListener("languagechange", updateBrowserLanguage);
        });

        onCleanup(() => {
            window.removeEventListener("languagechange", updateBrowserLanguage);
        });

        // Connection client

        const [connectionClient, setConnectionClient] = createSignal<
            undefined | ConnectionClient
        >(undefined);

        this.connectionClient = connectionClient;
        this.setConnectionClient = setConnectionClient;
    }

    public async disconnect() {
        if (backend.isApp()) await backend.stopServer();
        this.setConnectionClient(undefined);
        if (
            this.state.currentTab === Tab.InstanceProperties
            || this.state.currentTab === Tab.Things
        )
            this.setCurrentTab(Tab.Home);
    }

    public isConnected() {
        return Boolean(this.connectionClient());
    }

    /**
     * Reconnects to the
     */
    public async tryReconnectToLocalServer() {
        if (!backend.isApp()) {
            console.warn("`tryReconnect` called when not in app");
            return;
        }

        const serverRunningOnPort = await backend.serverIsRunningOnPort();

        if (serverRunningOnPort === null) {
            // No need to reconnect because the server is not running.
            return;
        }

        const connectionClient = new ConnectionClient(
            `http://localhost:${serverRunningOnPort}`,
        );

        const servingPath = await connectionClient.servingPath();

        const connectionIndex = this.localConnectionIndexFromPath(servingPath);

        if (connectionIndex === undefined) {
            // The server is serving an unknown file.
            // Let's just add that to the connections.

            this.addConnection({
                type: ConnectionType.Local,
                filePath: servingPath,
                name: "",
            });
        }

        this.setConnectionClient(connectionClient);
    }

    public localConnectionIndexFromPath(filePath: string): number | undefined {
        const index = this.state.connections.findIndex(
            connection =>
                connection.type === ConnectionType.Local
                && connection.filePath === filePath,
        );

        return index === -1 ? undefined : index;
    }

    public async connect(connectionIndex: number) {
        const connection = this.connection(connectionIndex);

        if (connection.type === ConnectionType.Local) {
            if (!backend.isApp()) {
                console.warn(
                    "tried to connect to local without a backend, ignoring...",
                );
                return;
            }

            // Spin up the server.
            const port = await backend.servePath(connection.filePath);

            this.setConnectionClient(
                new ConnectionClient(`http://localhost:${port}`),
            );
        } else {
            // Remote connection -> just connect directly.

            this.setConnectionClient(new ConnectionClient(connection.url));
        }

        this.setState("lastUsedConnectionIndex", connectionIndex);
    }

    public reset() {
        this.setState(defaultAppStateData());
    }

    public languageIsNotAvailable(): boolean {
        return (
            this.state.languageSetting === System
            && this.browserLanguage() === undefined
        );
    }

    /**
     * The chosen language for the app.
     */
    public language(): Language {
        const languageSetting = this.state.languageSetting;

        if (languageSetting === System) {
            const browserLanguage = this.browserLanguage();

            // Fallback, browser is set to language
            // we do not have translations for.
            return browserLanguage ?? Language.English;
        }

        return languageSetting;
    }

    public setLanguageSetting(newLanguage: LanguageSetting) {
        this.setState("languageSetting", newLanguage);
    }

    public translate<P extends Phrase>(
        phrase: P,
        options: Phrase.TranslationArguments[P],
    ): string {
        return translate(phrase, this.language(), options);
    }

    public setCurrentTab(tab: Tab) {
        this.setState("currentTab", tab);
    }

    public setThemeSetting(newTheme: ThemeSetting) {
        this.setState("themeSetting", newTheme);
    }

    public addConnection(connection: Connection) {
        this.setState("connections", connections => [
            connection,
            ...connections,
        ]);
    }

    public connection(connectionIndex: number) {
        const connection = this.state.connections[connectionIndex];
        if (connection === undefined)
            throw new Error(`invalid connection index ${connectionIndex}`);

        return connection;
    }

    public lastUsedConnection(): Connection | undefined {
        if (this.state.lastUsedConnectionIndex === undefined) return;

        return this.connection(this.state.lastUsedConnectionIndex);
    }

    private modifyConnection(
        connectionIndex: number,
        transform: (connection: Connection) => Connection,
    ) {
        this.connection(connectionIndex);

        this.setState("connections", connections =>
            connections.map((c, i) =>
                i === connectionIndex ? transform(c) : c,
            ),
        );
    }

    public setConnectionName(connectionIndex: number, newName: string) {
        this.modifyConnection(connectionIndex, c => ({...c, name: newName}));
    }
}
