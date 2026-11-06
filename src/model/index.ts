import type {Atom} from "./atoms";

export namespace ObjectType {
    export const Atom = Symbol("ObjectType.Atom");
    export const Set = Symbol("ObjectType.Set");
    export const Construction = Symbol("ObjectType.Construction");
    export const Text = Symbol("ObjectType.Text");
    export const Integer = Symbol("ObjectType.Integer");
    export const Character = Symbol("ObjectType.Character");
    export const Byte = Symbol("ObjectType.Byte");
}

export type ObjectType = EverythingObject["type"];

export type EverythingSet = {
    readonly type: typeof ObjectType.Set;
    readonly elements: readonly EverythingObject[];
};

export type Construction = {
    readonly type: typeof ObjectType.Construction;
    readonly constructor: EverythingObject;
    readonly value: EverythingObject;
};

export type TextObject = {
    readonly type: typeof ObjectType.Text;
    readonly text: string;
};

export type IntegerObject = {
    readonly type: typeof ObjectType.Integer;
    readonly value: bigint;
};

export type CharacterObject = {
    readonly type: typeof ObjectType.Character;
    readonly value: string;
};

export type ByteObject = {
    readonly type: typeof ObjectType.Byte;
    readonly value: number;
};

export type EverythingObject =
    | Atom
    | EverythingSet
    | Construction
    | TextObject
    | IntegerObject
    | CharacterObject
    | ByteObject;

/**
 * A statement states that an atom has an object as a property.
 */
export type Statement = {
    readonly atom: Atom;
    readonly object: EverythingObject;
};

export const construction = (
    constructor: EverythingObject,
    value: EverythingObject,
): Construction => ({type: ObjectType.Construction, constructor, value});

export const defaultObject = {
    type: ObjectType.Set,
    elements: [],
} as const satisfies EverythingObject;

const deduplicateObjects = (
    objects: readonly EverythingObject[],
): EverythingObject[] => {
    const unique: EverythingObject[] = [];
    for (const object of objects) {
        if (!unique.some(existing => objectsEqual(existing, object))) {
            unique.push(object);
        }
    }
    return unique;
};

/**
 * Compares two objects by their structure only, i.e. their type and the values
 * of their fields. No semantic meaning is taken into account: for example, two
 * sets are only equal if their elements are the same, regardless of their order
 * and duplicates.
 */
export const objectsEqual = (
    left: EverythingObject,
    right: EverythingObject,
): boolean => {
    switch (left.type) {
        case ObjectType.Atom:
            return right.type === ObjectType.Atom && left.value === right.value;
        case ObjectType.Set: {
            if (right.type !== ObjectType.Set) return false;

            const leftElements = deduplicateObjects(left.elements);
            const rightElements = deduplicateObjects(right.elements);

            return (
                leftElements.length === rightElements.length
                && leftElements.every(element =>
                    rightElements.some(other => objectsEqual(element, other)),
                )
            );
        }
        case ObjectType.Construction:
            return (
                right.type === ObjectType.Construction
                && objectsEqual(left.constructor, right.constructor)
                && objectsEqual(left.value, right.value)
            );
        case ObjectType.Text:
            return right.type === ObjectType.Text && left.text === right.text;
        case ObjectType.Integer:
            return (
                right.type === ObjectType.Integer && left.value === right.value
            );
        case ObjectType.Character:
            return (
                right.type === ObjectType.Character
                && left.value === right.value
            );
        case ObjectType.Byte:
            return right.type === ObjectType.Byte && left.value === right.value;
    }
};
