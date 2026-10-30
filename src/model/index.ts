export const OBJECT_TYPE_ATOM = Symbol();
export const OBJECT_TYPE_SET = Symbol();
export const OBJECT_TYPE_CONSTRUCTION = Symbol();
export const OBJECT_TYPE_TEXT = Symbol();
export const OBJECT_TYPE_INTEGER = Symbol();
export const OBJECT_TYPE_CHARACTER = Symbol();

export type Atom = {
    readonly type: typeof OBJECT_TYPE_ATOM;
    readonly value: bigint;
};

export type SetObject = {
    readonly type: typeof OBJECT_TYPE_SET;
    readonly elements: readonly Object[];
};

export type Construction = {
    readonly type: typeof OBJECT_TYPE_CONSTRUCTION;
    readonly constructor: Object;
    readonly value: Object;
};

export type Object =
    | Atom
    | SetObject
    | Construction
    | {
          readonly type: typeof OBJECT_TYPE_TEXT;
          readonly text: string;
      }
    | {
          readonly type: typeof OBJECT_TYPE_INTEGER;
          readonly character: number;
      };
