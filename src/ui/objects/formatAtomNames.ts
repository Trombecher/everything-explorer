import {ObjectType, type EverythingObject} from "@/model";

/**
 * Formats the values of the `name` construction of an atom for display.
 *
 * Non-text names are replaced with `nonTextPlaceholder` so callers can localize
 * it.
 */
export const formatAtomNames = (
    names: readonly EverythingObject[],
    nonTextPlaceholder: string,
): string =>
    names
        .map(object => {
            if (object.type === ObjectType.Text) return object.text;
            return nonTextPlaceholder;
        })
        .join(", ");
