import type {Accessor, Setter} from "solid-js";
import {createContext, createSignal, useContext} from "solid-js";

import type {ConnectionClient} from "@/connect";
import {Atom} from "@/model/atoms";

import {formatAtomNames} from "./formatAtomNames";

/**
 * Display names of the atoms of the current connection.
 *
 * Atoms without names (and atoms whose names could not be fetched) map to their
 * numeric value, so a lookup never has to distinguish "not loaded yet" from
 * "has no names".
 */
export class AtomNames {
    /**
     * Reactive snapshot of all known atom names.
     *
     * The snapshot is replaced (never mutated) on every update, so it can be
     * used as part of a `LayoutOptions` identity that keys layout width
     * caches.
     */
    public readonly map: Accessor<ReadonlyMap<bigint, string>>;

    private readonly names = new Map<bigint, string>();
    private readonly inFlight = new Map<bigint, Promise<void>>();
    private readonly setMap: Setter<ReadonlyMap<bigint, string>>;

    /**
     * The connection the stored names belong to. Names are knowledge base
     * specific, so changing the connection invalidates all of them.
     */
    private connection: ConnectionClient | undefined;

    public constructor() {
        const [map, setMap] = createSignal<ReadonlyMap<bigint, string>>(
            new Map(),
        );

        this.map = map;
        this.setMap = setMap;
    }

    /**
     * Reactive display text of the given atom.
     */
    public displayText(atom: Atom): string {
        return this.map().get(atom.value) ?? String(atom.value);
    }

    /**
     * Drops all stored names if the connection changed.
     *
     * Compares `ConnectionClient` identity instead of its URL, because a
     * reconnect to the same knowledge base creates a new client and must not
     * reuse names of the previous connection.
     */
    public noteConnection(connection: ConnectionClient | undefined): void {
        if (connection === this.connection) return;

        const hadNames = this.names.size !== 0;

        this.connection = connection;
        this.names.clear();
        this.inFlight.clear();

        if (hadNames) this.publish();
    }

    /**
     * Makes sure the display text of the given atom is known, fetching its
     * names once per connection.
     */
    public ensure(connection: ConnectionClient, atom: Atom): void {
        this.noteConnection(connection);

        if (this.names.has(atom.value) || this.inFlight.has(atom.value)) {
            return;
        }

        const request = connection
            .constructionValuesOfObject(atom, Atom.Name)
            .then(fetchedNames => {
                // Ignore responses of a connection that is no longer current.
                if (connection !== this.connection) return;

                this.names.set(
                    atom.value,
                    fetchedNames.length === 0
                        ? String(atom.value)
                        : formatAtomNames(fetchedNames),
                );
                this.publish();
            })
            .catch(() => {
                if (connection !== this.connection) return;

                // Fall back to the numeric value instead of retrying forever.
                this.names.set(atom.value, String(atom.value));
                this.publish();
            })
            .finally(() => {
                if (this.inFlight.get(atom.value) === request) {
                    this.inFlight.delete(atom.value);
                }
            });

        this.inFlight.set(atom.value, request);
    }

    private publish(): void {
        this.setMap(new Map(this.names));
    }
}

export const AtomNamesContext = createContext<AtomNames>();

export const useAtomNames = (): AtomNames => {
    const atomNames = useContext(AtomNamesContext);
    if (!atomNames) throw new Error("no atom names context");

    return atomNames;
};
