import type {Atom} from "./atoms";
import {CONTAINS_ATOM_VALUE} from "./atomValues";

export namespace ObjectType {
    export const Atom = Symbol("ObjectType.Atom");
    export const Composite = Symbol("ObjectType.Composite");
    export const Set = Symbol("ObjectType.Set");
    export const Construction = Symbol("ObjectType.Construction");
    export const Text = Symbol("ObjectType.Text");
    export const Integer = Symbol("ObjectType.Integer");
    export const Character = Symbol("ObjectType.Character");
    export const Byte = Symbol("ObjectType.Byte");
}

export type ObjectType = EverythingObject["type"];

export type EverythingComposite = {
    readonly type: typeof ObjectType.Composite;
    readonly properties: readonly EverythingObject[];
};

export type EverythingSet = {
    readonly type: typeof ObjectType.Set;
    readonly items: readonly EverythingObject[];
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
    | EverythingComposite
    | EverythingSet
    | Construction
    | TextObject
    | IntegerObject
    | CharacterObject
    | ByteObject;

export const construction = (
    constructor: EverythingObject,
    value: EverythingObject,
): Construction => ({type: ObjectType.Construction, constructor, value});

const containsAtom = {
    type: ObjectType.Atom,
    value: CONTAINS_ATOM_VALUE,
} as const satisfies Atom;

/**
 * Constructs the property `contains ·· item`.
 */
export const containsProperty = (item: EverythingObject): Construction =>
    construction(containsAtom, item);

/**
 * Returns the item contributed by a `contains ·· item` property, if any.
 */
export const itemOfContainsProperty = (
    property: EverythingObject,
): EverythingObject | undefined => {
    if (property.type !== ObjectType.Construction) return undefined;
    if (property.constructor.type !== ObjectType.Atom) return undefined;
    if (property.constructor.value !== CONTAINS_ATOM_VALUE) return undefined;

    return property.value;
};

/**
 * Converts canonical set items into the properties that encode them.
 */
export const setItemsToCompositeProperties = (
    items: readonly EverythingObject[],
): EverythingObject[] => items.map(containsProperty);

/**
 * Projects the properties of a canonical set composite into its items.
 *
 * Returns `undefined` if at least one property is not a `contains` property,
 * i.e. if the composite is not a canonical set and the extra properties would
 * be hidden.
 */
export const compositePropertiesToSetItems = (
    properties: readonly EverythingObject[],
): EverythingObject[] | undefined => {
    const items: EverythingObject[] = [];

    for (const property of properties) {
        const item = itemOfContainsProperty(property);
        if (item === undefined) return undefined;

        items.push(item);
    }

    return items;
};

export const defaultObject = {
    type: ObjectType.Composite,
    properties: [],
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
 * Returns `true` iff the two collections contain the same objects regardless of
 * their order and duplicates.
 */
const unorderedCollectionsEqual = (
    left: readonly EverythingObject[],
    right: readonly EverythingObject[],
): boolean => {
    const leftObjects = deduplicateObjects(left);
    const rightObjects = deduplicateObjects(right);

    return (
        leftObjects.length === rightObjects.length
        && leftObjects.every(object =>
            rightObjects.some(other => objectsEqual(object, other)),
        )
    );
};

/**
 * Returns the properties that encode the set view of an object, or `undefined`
 * if the object is not a composite or a canonical set.
 *
 * Canonical set items are compared through the `contains` properties that
 * encode them, so a composite and its canonical set specialization compare
 * equal.
 */
const collectionPropertiesOf = (
    object: EverythingObject,
): readonly EverythingObject[] | undefined => {
    switch (object.type) {
        case ObjectType.Composite:
            return object.properties;
        case ObjectType.Set:
            return setItemsToCompositeProperties(object.items);
        default:
            return undefined;
    }
};

/**
 * Compares two objects by their structure only, i.e. their type and the values
 * of their fields. No semantic meaning is taken into account: for example, two
 * collections are only equal if their objects are the same, regardless of their
 * order and duplicates. A composite and a canonical set are equal if their
 * property projections are equal.
 */
export const objectsEqual = (
    left: EverythingObject,
    right: EverythingObject,
): boolean => {
    const leftProperties = collectionPropertiesOf(left);
    if (leftProperties !== undefined) {
        const rightProperties = collectionPropertiesOf(right);

        return (
            rightProperties !== undefined
            && unorderedCollectionsEqual(leftProperties, rightProperties)
        );
    }

    switch (left.type) {
        case ObjectType.Atom:
            return right.type === ObjectType.Atom && left.value === right.value;
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
        case ObjectType.Composite:
        case ObjectType.Set:
            return false;
    }
};
