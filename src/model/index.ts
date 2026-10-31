export namespace ObjectType {
    export const Atom = Symbol();
    export const Set = Symbol();
    export const Construction = Symbol();
    export const Text = Symbol();
    export const Integer = Symbol();
    export const Character = Symbol();
    export const Byte = Symbol();
}

export type ObjectType =
    | typeof ObjectType.Atom
    | typeof ObjectType.Set
    | typeof ObjectType.Construction
    | typeof ObjectType.Text
    | typeof ObjectType.Integer
    | typeof ObjectType.Character
    | typeof ObjectType.Byte;

export type Atom = {
    readonly type: typeof ObjectType.Atom;
    readonly value: bigint;
};

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
