import type {Accessor} from "solid-js";
import {createContext, untrack, useContext} from "solid-js";
import {createStore} from "solid-js/store";

import type {ConnectionClient} from "@/connect";

import {defaultBlockLayoutOptions, type LayoutOptions} from "./layout/options";

type AtomNameEntry = {
    /**
     * The connection the name was resolved with.
     */
    readonly client: ConnectionClient;
    readonly name: string;
};

export type AtomNames = {
    /**
     * The layout options of all object views. Stable for the app lifetime, so
     * the row width cache is shared by all views.
     */
    readonly layoutOptions: LayoutOptions;

    /**
     * The display name of the atom for the active connection, if it is known.
     */
    name(value: bigint): string | undefined;

    /**
     * Remembers the display name of the atom for the active connection.
     */
    setName(value: bigint, name: string): void;
};

/**
 * The atom display names that layout measurement uses.
 *
 * Atom names belong to a specific knowledge base. Every entry remembers the
 * connection it was resolved with and is ignored for another connection, so a
 * connection change cannot leak names between knowledge bases. Old entries are
 * simply never read again; there is no reset to keep in sync.
 *
 * Names are stored per atom. Resolving one name therefore only invalidates the
 * layout computations that actually read that atom.
 */
export const createAtomNames = (
    connectionClient: Accessor<ConnectionClient | undefined>,
): AtomNames => {
    const [entries, setEntries] = createStore<Record<string, AtomNameEntry>>(
        {},
    );

    const name = (value: bigint): string | undefined => {
        const client = connectionClient();
        const entry = entries[String(value)];

        return entry !== undefined && entry.client === client
            ? entry.name
            : undefined;
    };

    const setName = (value: bigint, atomName: string) => {
        const client = connectionClient();
        if (client === undefined) return;

        const key = String(value);

        // Untracked: `setName` is called from a computation that also reads
        // this name, and the cache must not feed back into that computation.
        const unchanged = untrack(() => {
            const current = entries[key];

            return current?.client === client && current.name === atomName;
        });

        if (unchanged) return;

        setEntries(key, {client, name: atomName});
    };

    return {
        layoutOptions: {block: defaultBlockLayoutOptions, atomName: name},
        name,
        setName,
    };
};

export const AtomNamesContext = createContext<AtomNames>();

export const useAtomNames = (): AtomNames => {
    const atomNames = useContext(AtomNamesContext);
    if (atomNames === undefined) throw new Error("no atom names context");

    return atomNames;
};

/**
 * The layout options shared by all object views.
 */
export const useLayoutOptions = (): LayoutOptions =>
    useAtomNames().layoutOptions;
