import {ObjectType} from ".";

export type Atom = {
    readonly type: typeof ObjectType.Atom;
    readonly value: bigint;
};

export namespace Atom {
    export const NodeFunction = {
        type: ObjectType.Atom,
        value: 2148623901005465698003044719488417081n,
    } as const satisfies Atom;

    export const NodeAddFirst = {
        type: ObjectType.Atom,
        value: 2148566534810416742677953060919673357n,
    } as const satisfies Atom;

    export const NodeAddSecond = {
        type: ObjectType.Atom,
        value: 2148566534810416742677953060919673358n,
    } as const satisfies Atom;

    export const NodeLiteral = {
        type: ObjectType.Atom,
        value: 2148623946948209931514052368378168923n,
    } as const satisfies Atom;

    export const NodeMultiplyFirst = {
        type: ObjectType.Atom,
        value: 2150955291898078111384483788783842606n,
    } as const satisfies Atom;

    export const NodeMultiplySecond = {
        type: ObjectType.Atom,
        value: 2150955291897679523990373018161137292n,
    } as const satisfies Atom;

    export const Name = {
        type: ObjectType.Atom,
        value: 2168675532473521068209426099129078617n,
    } as const satisfies Atom;
}
