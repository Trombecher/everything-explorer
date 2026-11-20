import type {Accessor} from "solid-js";
import {createResource} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Atom} from "@/model/atoms";

import {formatAtomNames} from "./formatAtomNames";

/**
 * Reactive display name of the given atom.
 *
 * Returns `undefined` while the names are loading, when they are unavailable,
 * or when the atom has no names. Callers fall back to the numeric value in that
 * case.
 */
export const createAtomName = (
    atom: Accessor<Atom>,
): Accessor<string | undefined> => {
    const connections = useConnections();
    const preferences = usePreferences();

    const [names] = createResource(
        () => {
            const connectionClient = connections.connectionClient();
            return connectionClient && {connectionClient, atom: atom()};
        },
        ({connectionClient, atom}) =>
            connectionClient
                .constructionValuesOfObject(atom, Atom.Name)
                .then(names => ({connectionClient, names})),
    );

    return () => {
        // Reading the resource while it is loading or errored would either
        // return the previous atom's names or throw.
        if (names.loading || names.error) return undefined;

        const loaded = names();

        // A resource keeps its last value when the connection disappears.
        if (
            !loaded
            || loaded.connectionClient !== connections.connectionClient()
        ) {
            return undefined;
        }

        return loaded.names.length === 0
            ? undefined
            : formatAtomNames(
                  loaded.names,
                  preferences.translate(Phrase.ObjectPlaceholder, undefined),
              );
    };
};
