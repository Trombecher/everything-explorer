import type {SetObject} from ".";
import {ObjectType, type Object} from ".";
import {Atom} from "./atoms";

export namespace NodeType {
    export const Function = Symbol();
    export const Plus = Symbol();
    export const Literal = Symbol();
}

export type NodeType = Node["type"];

export type FunctionNode = {
    readonly type: typeof NodeType.Function;
    readonly body: Object;
    readonly rest: readonly Object[];
};

export type PlusNode = {
    readonly type: typeof NodeType.Plus;
    readonly first: Object;
    readonly second: Object;
    readonly rest: readonly Object[];
};

export type LiteralNode = {
    readonly type: typeof NodeType.Literal;
    readonly object: Object;
    readonly rest: readonly Object[];
};

export type Node = FunctionNode | PlusNode | LiteralNode;

export const objectToNode = (object: Object): Node | undefined => {
    if (object.type !== ObjectType.Set) return;

    let some: Object | undefined;
    let finalNode: Node | undefined;

    some = singleSetAtomValue(object, Atom.NodeFunction.value);
    if (some) {
        if (finalNode) return undefined;

        finalNode = {
            type: NodeType.Function,
            body: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeFunction.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeLiteral.value);
    if (some) {
        if (finalNode) return undefined;

        finalNode = {
            type: NodeType.Literal,
            object: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeLiteral.value,
            ]),
        };
    }

    return finalNode;
};

const withoutAtomConstructors = (
    elements: readonly Object[],
    withoutAtomValues: readonly bigint[],
): Object[] =>
    elements.filter(element => {
        return (
            element.type !== ObjectType.Construction ||
            (element.constructor.type === ObjectType.Atom &&
                !withoutAtomValues.includes(element.constructor.value))
        );
    });

const singleSetAtomValue = (
    set: SetObject,
    atomValue: bigint,
): Object | undefined => {
    // TODO: optimize

    const [element1, element2] = set.elements
        .filter(element => {
            return (
                element.type === ObjectType.Construction &&
                element.constructor.type === ObjectType.Atom &&
                element.constructor.value === atomValue
            );
        })
        .map(
            element =>
                (element as Object & {type: typeof ObjectType.Construction})
                    .value,
        );

    if (element2) return;
    return element1;
};
