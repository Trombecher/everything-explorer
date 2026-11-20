import type {Accessor} from "solid-js";
import {createSignal} from "solid-js";

import * as backend from "@/backend/api";
import {ConnectionClient} from "@/connect";
import type {DeepReadonly} from "@/util";

import {connectionsShareURI} from "./connections";
import type {AppStateStore} from "./internal";
import {ConnectionType, type Connection, type InternalAppState} from "./types";

export type ConnectionState = {
    readonly connectionClient: Accessor<ConnectionClient | undefined>;
    readonly list: Accessor<readonly DeepReadonly<Connection>[]>;
    readonly lastUsedConnectionIndex: Accessor<number | undefined>;

    isConnected(): boolean;

    /**
     * Returns the connection with the given index.
     *
     * Throws if the index is invalid.
     */
    connection(connectionIndex: number): DeepReadonly<Connection>;

    lastUsedConnection(): DeepReadonly<Connection> | undefined;

    localConnectionIndexFromPath(filePath: string): number | undefined;

    connect(connectionIndex: number): Promise<void>;
    disconnect(): Promise<void>;
    tryReconnectToLocalServer(): Promise<void>;

    /**
     * Adds a connection at the beginning of the connection list.
     *
     * @returns The index of the added connection.
     */
    addConnection(connection: Connection): number;

    /**
     * Removes the connection with the given index.
     *
     * If the app is currently connected to that connection, it is disconnected
     * first.
     */
    removeConnection(connectionIndex: number): Promise<void>;

    setConnectionName(connectionIndex: number, newName: string): void;
};

export type ConnectionStateOptions = {
    /**
     * Called after the app disconnected from a knowledge base. The app uses
     * this to leave tabs that only make sense while connected.
     */
    readonly onDisconnected: () => void;
};

const prependConnection = (draft: InternalAppState, connection: Connection) => {
    draft.connections = [connection, ...draft.connections];

    // The new connection is prepended, so all indices shift by one.
    if (draft.lastUsedConnectionIndex !== undefined) {
        draft.lastUsedConnectionIndex += 1;
    }
};

/**
 * The connections to knowledge bases and the client of the active connection.
 *
 * `connections` and `lastUsedConnectionIndex` are persisted and share an
 * invariant, so they are kept together in this module.
 */
export const createConnectionState = (
    store: AppStateStore,
    options: ConnectionStateOptions,
): ConnectionState => {
    const [connectionClient, setConnectionClient] = createSignal<
        ConnectionClient | undefined
    >(undefined);

    const connection = (connectionIndex: number): DeepReadonly<Connection> => {
        const value = store.state.connections[connectionIndex];
        if (value === undefined) {
            throw new Error(`invalid connection index ${connectionIndex}`);
        }

        return value;
    };

    const isConnected = () => Boolean(connectionClient());

    const localConnectionIndexFromPath = (
        filePath: string,
    ): number | undefined => {
        const index = store.state.connections.findIndex(
            candidate =>
                candidate.type === ConnectionType.Local
                && candidate.filePath === filePath,
        );

        return index === -1 ? undefined : index;
    };

    const disconnect = async () => {
        if (backend.isApp()) await backend.stopServer();

        setConnectionClient(undefined);
        options.onDisconnected();
    };

    const connect = async (connectionIndex: number) => {
        const selected = connection(connectionIndex);

        if (selected.type === ConnectionType.Local) {
            if (!backend.isApp()) {
                console.warn(
                    "tried to connect to local without a backend, ignoring...",
                );
                return;
            }

            // Spin up the server.
            const port = await backend.servePath(selected.filePath);

            setConnectionClient(
                new ConnectionClient(`http://localhost:${port}`),
            );
        } else {
            // Remote connection -> just connect directly.
            setConnectionClient(new ConnectionClient(selected.url));
        }

        store.commit(draft => {
            draft.lastUsedConnectionIndex = connectionIndex;
        });
    };

    /**
     * Reconnects to the local server if it is still running.
     */
    const tryReconnectToLocalServer = async () => {
        if (!backend.isApp()) {
            console.warn("`tryReconnectToLocalServer` called when not in app");
            return;
        }

        const serverRunningOnPort = await backend.serverIsRunningOnPort();

        if (serverRunningOnPort === null) {
            // No need to reconnect because the server is not running.
            return;
        }

        const client = new ConnectionClient(
            `http://localhost:${serverRunningOnPort}`,
        );

        const servingPath = await client.servingPath();
        const existingIndex = localConnectionIndexFromPath(servingPath);

        if (existingIndex === undefined) {
            store.commit(draft => {
                prependConnection(draft, {
                    type: ConnectionType.Local,
                    filePath: servingPath,
                    name: "",
                });

                // The app is connected to the prepended connection, so it is
                // the last used one.
                draft.lastUsedConnectionIndex = 0;
            });
        } else {
            // The app is connected to this connection, so it is the last used
            // one.
            store.commit(draft => {
                draft.lastUsedConnectionIndex = existingIndex;
            });
        }

        setConnectionClient(client);
    };

    const addConnection = (value: Connection): number => {
        const existingIndex = store.state.connections.findIndex(candidate =>
            connectionsShareURI(candidate, value),
        );

        // Duplicates are not a valid state, so do not add one and report the
        // index of the existing connection instead.
        if (existingIndex !== -1) return existingIndex;

        store.commit(draft => {
            prependConnection(draft, value);
        });

        return 0;
    };

    const modifyConnection = (
        connectionIndex: number,
        transform: (connection: Connection) => Connection,
    ) => {
        connection(connectionIndex);

        store.commit(draft => {
            const current = draft.connections[connectionIndex];
            if (current !== undefined) {
                draft.connections[connectionIndex] = transform(current);
            }
        });
    };

    const setConnectionName = (connectionIndex: number, newName: string) => {
        modifyConnection(connectionIndex, current => ({
            ...current,
            name: newName,
        }));
    };

    const removeConnection = async (connectionIndex: number) => {
        connection(connectionIndex);

        if (
            store.state.lastUsedConnectionIndex === connectionIndex
            && isConnected()
        ) {
            await disconnect();
        }

        store.commit(draft => {
            draft.connections = draft.connections.filter(
                (_, index) => index !== connectionIndex,
            );

            const lastUsedConnectionIndex = draft.lastUsedConnectionIndex;

            if (lastUsedConnectionIndex === connectionIndex) {
                draft.lastUsedConnectionIndex = undefined;
            } else if (
                lastUsedConnectionIndex !== undefined
                && lastUsedConnectionIndex > connectionIndex
            ) {
                draft.lastUsedConnectionIndex = lastUsedConnectionIndex - 1;
            }
        });
    };

    return {
        connectionClient,
        list: () => store.state.connections,
        lastUsedConnectionIndex: () => store.state.lastUsedConnectionIndex,

        isConnected,
        connection,

        lastUsedConnection() {
            const index = store.state.lastUsedConnectionIndex;
            return index === undefined ? undefined : connection(index);
        },

        localConnectionIndexFromPath,

        connect,
        disconnect,
        tryReconnectToLocalServer,

        addConnection,
        removeConnection,
        setConnectionName,
    };
};
