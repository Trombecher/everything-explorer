import type {DeepReadonly} from "@/util";

import {ConnectionType, type Connection, type InternalAppState} from "./types";

export const connectionsShareURI = (
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
 * Modifies the given `appState` such that all invariants are good.
 */
export const enforceInvariants = (appState: InternalAppState) => {
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
