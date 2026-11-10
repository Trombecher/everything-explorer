import {ObjectType} from ".";

export type Atom = {
    readonly type: typeof ObjectType.Atom;
    readonly value: bigint;
};

/**
 * The largest possible atom id. Atom ids are unsigned 128-bit integers.
 */
export const MAX_ATOM_ID = (1n << 128n) - 1n;

/**
 * Generates a new atom id from a ULID.
 *
 * A ULID is a 128-bit value made of a 48-bit millisecond timestamp followed by
 * 80 random bits.
 */
export const generateAtomId = (): bigint => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(10));

    let randomness = 0n;
    for (const byte of randomBytes) {
        randomness = (randomness << 8n) | BigInt(byte);
    }

    return (BigInt(Date.now()) << 80n) | randomness;
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

    export const NodeEqualFirst = {
        type: ObjectType.Atom,
        value: 2148623984105467336671475554302291443n,
    } as const satisfies Atom;

    export const NodeEqualSecond = {
        type: ObjectType.Atom,
        value: 2150546540588687321716707989954282134n,
    } as const satisfies Atom;

    export const NodeAndFirst = {
        type: ObjectType.Atom,
        value: 2148623952614130968570357528352754483n,
    } as const satisfies Atom;

    export const NodeAndSecond = {
        type: ObjectType.Atom,
        value: 2150546484857217536175129940420364334n,
    } as const satisfies Atom;

    export const NodeOrFirst = {
        type: ObjectType.Atom,
        value: 2148623991617605004082324671379584752n,
    } as const satisfies Atom;

    export const NodeOrSecond = {
        type: ObjectType.Atom,
        value: 2150546471301176810351954476414010805n,
    } as const satisfies Atom;

    export const NodeUnionFirst = {
        type: ObjectType.Atom,
        value: 2150602665196451232518504136866676495n,
    } as const satisfies Atom;

    export const NodeUnionSecond = {
        type: ObjectType.Atom,
        value: 2150602676477464422271577313769115263n,
    } as const satisfies Atom;

    export const NodeFilterSet = {
        type: ObjectType.Atom,
        value: 2150755714608308122129968313720999578n,
    } as const satisfies Atom;

    export const NodeFilterFilter = {
        type: ObjectType.Atom,
        value: 2150755715328094057860222292607728283n,
    } as const satisfies Atom;

    export const NodeContainsElement = {
        type: ObjectType.Atom,
        value: 2166943953075778840020869770686077619n,
    } as const satisfies Atom;

    export const NodeContainsSet = {
        type: ObjectType.Atom,
        value: 2166943953076260545247311619503999088n,
    } as const satisfies Atom;

    export const NodeMultiplyFirst = {
        type: ObjectType.Atom,
        value: 2150955291898078111384483788783842606n,
    } as const satisfies Atom;

    export const NodeMultiplySecond = {
        type: ObjectType.Atom,
        value: 2150955291897679523990373018161137292n,
    } as const satisfies Atom;

    export const NodeParameter = {
        type: ObjectType.Atom,
        value: 2148623964016728126166347458070520202n,
    } as const satisfies Atom;

    export const Name = {
        type: ObjectType.Atom,
        value: 2168675532473521068209426099129078617n,
    } as const satisfies Atom;
}
