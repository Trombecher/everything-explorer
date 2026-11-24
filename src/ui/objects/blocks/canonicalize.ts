import {type EverythingObject, type EverythingSet, ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

const canonicalObjectCache = new WeakMap<EverythingObject, EverythingObject>();

/**
 * Returns the canonical representation of an object for display.
 *
 * The internal object model is structural and deliberately allows multiple
 * representations of the same value. The display layer picks the representation
 * that is easiest to read, mirroring the specializations of the backend's `Set`
 * model: integers, characters, bytes and text are represented by their
 * corresponding object variants instead of by their expanded sets.
 *
 * The result is cached, so this is cheap when called repeatedly for the same
 * object.
 */
export const canonicalizeForDisplay = (
    object: EverythingObject,
): EverythingObject => {
    const cached = canonicalObjectCache.get(object);
    if (cached !== undefined) return cached;

    const canonical = canonicalizeWithoutCache(object);
    canonicalObjectCache.set(object, canonical);

    return canonical;
};

const canonicalizeWithoutCache = (
    object: EverythingObject,
): EverythingObject => {
    if (object.type !== ObjectType.Set) return object;

    return canonicalizeSet(object);
};

const canonicalizeSet = (set: EverythingSet): EverythingObject => {
    switch (set.elements.length) {
        case 1:
            return singleElementOfSet(set) ?? set;
        case 2:
            return textOfSet(set) ?? set;
        case 8:
            return byteOfSet(set) ?? set;
        default:
            return set;
    }
};

/**
 * Recognizes a set with a single integer or character element.
 */
const singleElementOfSet = (
    set: EverythingSet,
): EverythingObject | undefined => {
    const element = set.elements[0];
    if (element?.type !== ObjectType.Construction) return undefined;
    if (element.constructor.type !== ObjectType.Atom) return undefined;

    if (element.constructor.value === Atom.SuccessorOf.value) {
        const value = parseInteger(element.value);
        if (value !== undefined && value >= 0n) {
            return {type: ObjectType.Integer, value: value + 1n};
        }
    } else if (element.constructor.value === Atom.PredecessorOf.value) {
        const value = parseInteger(element.value);
        if (value !== undefined && value <= 0n) {
            return {type: ObjectType.Integer, value: value - 1n};
        }
    } else if (element.constructor.value === Atom.CodePoint.value) {
        const codePoint = parseInteger(element.value);
        const character =
            codePoint === undefined
                ? undefined
                : characterOfCodePoint(codePoint);

        if (character !== undefined) {
            return {type: ObjectType.Character, value: character};
        }
    }

    return undefined;
};

/**
 * Recognizes a text set of the form `{list_item, list_tail}`.
 */
const textOfSet = (set: EverythingSet): EverythingObject | undefined => {
    const parts = textSetParts(set);
    if (parts === undefined) return undefined;

    const tail = textTailOf(parts.tail);
    if (tail === undefined) return undefined;

    return {type: ObjectType.Text, text: parts.item + tail};
};

/**
 * Parses the two slots of a text set. The item is returned as a character
 * string.
 */
const textSetParts = (
    set: EverythingSet,
): {readonly item: string; readonly tail: EverythingObject} | undefined => {
    if (set.elements.length !== 2) return undefined;

    let item: EverythingObject | undefined;
    let tail: EverythingObject | undefined;

    for (const element of set.elements) {
        if (element.type !== ObjectType.Construction) return undefined;
        if (element.constructor.type !== ObjectType.Atom) return undefined;

        if (element.constructor.value === Atom.ListItem.value) {
            if (item !== undefined) return undefined;
            item = element.value;
        } else if (element.constructor.value === Atom.ListTail.value) {
            if (tail !== undefined) return undefined;
            tail = element.value;
        } else {
            return undefined;
        }
    }

    if (item === undefined || tail === undefined) return undefined;

    const canonicalItem = canonicalizeForDisplay(item);

    if (
        canonicalItem.type !== ObjectType.Character
        || !isSingleCharacter(canonicalItem.value)
    ) {
        return undefined;
    }

    return {item: canonicalItem.value, tail};
};

/**
 * Returns `true` iff the value is exactly one Unicode scalar value.
 */
const isSingleCharacter = (value: string): boolean => {
    const codePoint = value.codePointAt(0);
    if (codePoint === undefined) return false;

    const width = codePoint > 0xffff ? 2 : 1;

    return (
        value.length === width && !(codePoint >= 0xd800 && codePoint <= 0xdfff)
    );
};

/**
 * Returns the text of a list tail. Raw nested lists are followed so that
 * non-canonical text is recognized as well.
 */
const textTailOf = (tail: EverythingObject): string | undefined => {
    const items: string[] = [];
    let current = tail;

    while (true) {
        if (current.type === ObjectType.Text) {
            return items.join("") + current.text;
        }

        if (current.type !== ObjectType.Set) return undefined;
        if (current.elements.length === 0) return items.join("");

        const parts = textSetParts(current);
        if (parts === undefined) return undefined;

        items.push(parts.item);
        current = parts.tail;
    }
};

/**
 * Recognizes a byte set with all eight bit slots.
 */
const byteOfSet = (set: EverythingSet): EverythingObject | undefined => {
    if (set.elements.length !== 8) return undefined;

    let value = 0;
    let seenSlots = 0;

    for (const element of set.elements) {
        if (element.type !== ObjectType.Construction) return undefined;
        if (element.constructor.type !== ObjectType.Atom) return undefined;
        if (element.value.type !== ObjectType.Atom) return undefined;

        const slot = bitSlotIndexByAtomValue.get(element.constructor.value);
        if (slot === undefined) return undefined;

        const bit = bitOfAtomValue(element.value.value);
        if (bit === undefined) return undefined;

        const slotMask = 1 << slot;
        if ((seenSlots & slotMask) !== 0) return undefined;

        seenSlots |= slotMask;
        value |= bit << slot;
    }

    // All eight slots were present exactly once.
    return seenSlots === 0xff ? {type: ObjectType.Byte, value} : undefined;
};

const bitSlotIndexByAtomValue = new Map<bigint, number>([
    [Atom.BitSlot0.value, 0],
    [Atom.BitSlot1.value, 1],
    [Atom.BitSlot2.value, 2],
    [Atom.BitSlot3.value, 3],
    [Atom.BitSlot4.value, 4],
    [Atom.BitSlot5.value, 5],
    [Atom.BitSlot6.value, 6],
    [Atom.BitSlot7.value, 7],
]);

const bitOfAtomValue = (atomValue: bigint): number | undefined => {
    if (atomValue === Atom.BitOn.value) return 1;
    if (atomValue === Atom.BitOff.value) return 0;

    return undefined;
};

/**
 * Parses the canonical integer representation. This intentionally looks through
 * raw nested sets so that locally authored or remotely served non-canonical
 * integers are recognized as well.
 */
const parseInteger = (object: EverythingObject): bigint | undefined => {
    switch (object.type) {
        case ObjectType.Atom:
            return object.value === Atom.Zero.value ? 0n : undefined;
        case ObjectType.Integer:
            return object.value;
        case ObjectType.Set: {
            if (object.elements.length !== 1) return undefined;

            const element = object.elements[0];
            if (element?.type !== ObjectType.Construction) return undefined;
            if (element.constructor.type !== ObjectType.Atom) return undefined;

            if (element.constructor.value === Atom.SuccessorOf.value) {
                const value = parseInteger(element.value);

                return value !== undefined && value >= 0n
                    ? value + 1n
                    : undefined;
            }

            if (element.constructor.value === Atom.PredecessorOf.value) {
                const value = parseInteger(element.value);

                return value !== undefined && value <= 0n
                    ? value - 1n
                    : undefined;
            }

            return undefined;
        }
        default:
            return undefined;
    }
};

/**
 * Converts a Unicode scalar value into a character string. Surrogate code
 * points are not valid Unicode scalar values.
 */
const characterOfCodePoint = (codePoint: bigint): string | undefined => {
    if (codePoint < 0n || codePoint > 0x10ffffn) return undefined;

    const number = Number(codePoint);

    if (number >= 0xd800 && number <= 0xdfff) return undefined;

    return String.fromCodePoint(number);
};
