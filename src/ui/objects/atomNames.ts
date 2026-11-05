import {createSignal} from "solid-js";

import {ObjectType, type Object} from "@/model";
import type {Atom} from "@/model/atoms";

/**
 * Formats the values of the `name` construction of an atom for display.
 */
export const formatAtomNames = (names: readonly Object[]): string =>
    names
        .map(object => {
            if (object.type === ObjectType.Text) return object.text;
            return "<object>";
        })
        .join(", ");

const namesCache = new Map<bigint, readonly Object[]>();

const [revision, setRevision] = createSignal(0);

/**
 * Reactive revision of the atom name cache. Layout computations read this to
 * invalidate their width caches when new names are loaded.
 */
export const atomNamesRevision = revision;

/**
 * The text displayed for an atom next to its icon. Prefers the atom's name(s)
 * and falls back to its numeric id when no name is known.
 */
export const atomDisplayText = (atom: Atom): string => {
    const names = namesCache.get(atom.value);

    if (!names || names.length === 0) return String(atom.value);

    return formatAtomNames(names);
};

let currentConnectionURL: string | undefined;

/**
 * Clears the name cache when the connection changes. Since atom names are
 * looked up per knowledge base, names from a previous connection must not be
 * reused.
 */
export const noteAtomNamesConnection = (url: string) => {
    if (currentConnectionURL === url) return;

    currentConnectionURL = url;
    namesCache.clear();
    setRevision(revision => revision + 1);
};

export const cacheAtomNames = (atom: Atom, names: readonly Object[]) => {
    namesCache.set(atom.value, names);
    setRevision(revision => revision + 1);
};
