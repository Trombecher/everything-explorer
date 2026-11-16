import {ObjectType} from "@/model";
import {MAX_ATOM_ID, type Atom} from "@/model/atoms";

export const DECIMAL_INTEGER_PATTERN = /^\d+$/;

export const parseAtomId = (input: string): Atom | undefined => {
    const trimmed = input.trim();

    if (!DECIMAL_INTEGER_PATTERN.test(trimmed)) return undefined;

    const value = BigInt(trimmed);
    if (value > MAX_ATOM_ID) return undefined;

    return {type: ObjectType.Atom, value};
};
