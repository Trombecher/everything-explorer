import {
    compositePropertiesToSetItems,
    type EverythingComposite,
    type EverythingObject,
    ObjectType,
} from "@/model";
import {Atom} from "@/model/atoms";

const canonicalObjectCache = new WeakMap<EverythingObject, EverythingObject>();

/**
 * Returns the canonical representation of an object for display.
 *
 * The internal object model is structural and deliberately allows multiple
 * representations of the same value. The display layer picks the representation
 * that is easiest to read, mirroring the specializations of the backend's
 * `Composite` model: integers, characters, bytes and text are represented by
 * their corresponding object variants instead of by their expanded composites.
 * A composite whose properties are all `contains` properties is shown as a
 * canonical set.
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
    if (object.type !== ObjectType.Composite) return object;

    return canonicalizeComposite(object);
};

const canonicalizeComposite = (
    composite: EverythingComposite,
): EverythingObject => {
    switch (composite.properties.length) {
        case 1:
            return (
                singlePropertyOfComposite(composite)
                ?? canonicalSetOfComposite(composite)
                ?? composite
            );
        case 2:
            return (
                textOfComposite(composite)
                ?? canonicalSetOfComposite(composite)
                ?? composite
            );
        case 8:
            return (
                byteOfComposite(composite)
                ?? canonicalSetOfComposite(composite)
                ?? composite
            );
        default:
            return canonicalSetOfComposite(composite) ?? composite;
    }
};

/**
 * Recognizes a non-empty composite whose properties are all `contains`
 * properties.
 *
 * An empty generic composite is left unchanged so the default object and
 * deletion placeholders remain composites. An explicitly specialized empty set
 * still remains a set. A composite with any non-`contains` property also
 * remains a composite so that those properties are not hidden.
 */
const canonicalSetOfComposite = (
    composite: EverythingComposite,
): EverythingObject | undefined => {
    if (composite.properties.length === 0) return undefined;

    const items = compositePropertiesToSetItems(composite.properties);

    return items === undefined ? undefined : {type: ObjectType.Set, items};
};

/**
 * Recognizes a composite with a single integer or character property.
 */
const singlePropertyOfComposite = (
    composite: EverythingComposite,
): EverythingObject | undefined => {
    const property = composite.properties[0];
    if (property?.type !== ObjectType.Construction) return undefined;
    if (property.constructor.type !== ObjectType.Atom) return undefined;

    if (property.constructor.value === Atom.SuccessorOf.value) {
        const value = parseInteger(property.value);
        if (value !== undefined && value >= 0n) {
            return {type: ObjectType.Integer, value: value + 1n};
        }
    } else if (property.constructor.value === Atom.PredecessorOf.value) {
        const value = parseInteger(property.value);
        if (value !== undefined && value <= 0n) {
            return {type: ObjectType.Integer, value: value - 1n};
        }
    } else if (property.constructor.value === Atom.CodePoint.value) {
        const codePoint = parseInteger(property.value);
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
 * Recognizes a text composite of the form `⟨list_item, list_tail⟩`.
 */
const textOfComposite = (
    composite: EverythingComposite,
): EverythingObject | undefined => {
    const parts = textCompositeParts(composite);
    if (parts === undefined) return undefined;

    const tail = textTailOf(parts.tail);
    if (tail === undefined) return undefined;

    return {type: ObjectType.Text, text: parts.item + tail};
};

/**
 * Parses the two slots of a text composite. The item is returned as a character
 * string.
 */
const textCompositeParts = (
    composite: EverythingComposite,
): {readonly item: string; readonly tail: EverythingObject} | undefined => {
    if (composite.properties.length !== 2) return undefined;

    let item: EverythingObject | undefined;
    let tail: EverythingObject | undefined;

    for (const property of composite.properties) {
        if (property.type !== ObjectType.Construction) return undefined;
        if (property.constructor.type !== ObjectType.Atom) return undefined;

        if (property.constructor.value === Atom.ListItem.value) {
            if (item !== undefined) return undefined;
            item = property.value;
        } else if (property.constructor.value === Atom.ListTail.value) {
            if (tail !== undefined) return undefined;
            tail = property.value;
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
 * Returns the text of a list tail. Raw nested composites are followed so that
 * non-canonical text is recognized as well.
 */
const textTailOf = (tail: EverythingObject): string | undefined => {
    const items: string[] = [];
    let current = tail;

    while (true) {
        if (current.type === ObjectType.Text) {
            return items.join("") + current.text;
        }

        if (current.type === ObjectType.Set) {
            return current.items.length === 0 ? items.join("") : undefined;
        }

        if (current.type !== ObjectType.Composite) return undefined;
        if (current.properties.length === 0) return items.join("");

        const parts = textCompositeParts(current);
        if (parts === undefined) return undefined;

        items.push(parts.item);
        current = parts.tail;
    }
};

/**
 * Recognizes a byte composite with all eight bit slots.
 */
const byteOfComposite = (
    composite: EverythingComposite,
): EverythingObject | undefined => {
    if (composite.properties.length !== 8) return undefined;

    let value = 0;
    let seenSlots = 0;

    for (const property of composite.properties) {
        if (property.type !== ObjectType.Construction) return undefined;
        if (property.constructor.type !== ObjectType.Atom) return undefined;
        if (property.value.type !== ObjectType.Atom) return undefined;

        const slot = bitSlotIndexByAtomValue.get(property.constructor.value);
        if (slot === undefined) return undefined;

        const bit = bitOfAtomValue(property.value.value);
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
 * raw nested composites so that locally authored or remotely served
 * non-canonical integers are recognized as well.
 */
const parseInteger = (object: EverythingObject): bigint | undefined => {
    switch (object.type) {
        case ObjectType.Atom:
            return object.value === Atom.Zero.value ? 0n : undefined;
        case ObjectType.Integer:
            return object.value;
        case ObjectType.Composite: {
            if (object.properties.length !== 1) return undefined;

            const property = object.properties[0];
            if (property?.type !== ObjectType.Construction) return undefined;
            if (property.constructor.type !== ObjectType.Atom) return undefined;

            if (property.constructor.value === Atom.SuccessorOf.value) {
                const value = parseInteger(property.value);

                return value !== undefined && value >= 0n
                    ? value + 1n
                    : undefined;
            }

            if (property.constructor.value === Atom.PredecessorOf.value) {
                const value = parseInteger(property.value);

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
