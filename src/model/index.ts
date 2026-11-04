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

export type ObjectType = Object["type"];

export type SetObject = {
    readonly type: typeof ObjectType.Set;
    readonly elements: readonly Object[];
};

export type Construction = {
    readonly type: typeof ObjectType.Construction;
    readonly constructor: Object;
    readonly value: Object;
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

export type Object =
    | Atom
    | SetObject
    | Construction
    | TextObject
    | IntegerObject
    | CharacterObject
    | ByteObject;

export const defaultObject = {
    type: ObjectType.Set,
    elements: [],
} as const satisfies Object;
