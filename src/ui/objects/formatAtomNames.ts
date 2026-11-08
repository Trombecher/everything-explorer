import {ObjectType, type EverythingObject} from "@/model";

/**
 * Formats the values of the `name` construction of an atom for display.
 */
export const formatAtomNames = (names: readonly EverythingObject[]): string =>
    names
        .map(object => {
            if (object.type === ObjectType.Text) return object.text;
            return "<object>";
        })
        .join(", ");
