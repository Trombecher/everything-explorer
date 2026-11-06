import type {EverythingSet} from ".";
import {construction, ObjectType, type Object} from ".";
import {Atom} from "./atoms";

export namespace NodeType {
    export const Function = Symbol("NodeType.Function");
    export const Plus = Symbol("NodeType.Plus");
    export const Literal = Symbol("NodeType.Literal");
    export const Times = Symbol("NodeType.Times");
}

export type NodeType = Node["type"];

export type TimesNode = {
    readonly type: typeof NodeType.Times;
    readonly first: Object;
    readonly second: Object;
    readonly rest: readonly Object[];
};

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

export type Node = FunctionNode | PlusNode | LiteralNode | TimesNode;

export const nodeChildCount = (nodeType: NodeType): number => {
    switch (nodeType) {
        case NodeType.Function:
            return 1;
        case NodeType.Literal:
            return 1;
        case NodeType.Plus:
            return 2;
        case NodeType.Times:
            return 2;
    }
};

export const NotANode = Symbol("NotANode");

const objectNodeCache = new WeakMap<Object, Node | typeof NotANode>();

/**
 * Converts an object to a {@link Node `Node`}. The result is cached.
 *
 * This function is cheap on cache hit.
 */
export const objectToNode = (object: Object): Node | typeof NotANode => {
    const cachedNode = objectNodeCache.get(object);
    if (cachedNode !== undefined) {
        return cachedNode;
    }

    const node = objectToNodeWithoutCache(object);
    objectNodeCache.set(object, node);
    return node;
};

const objectToNodeWithoutCache = (object: Object): Node | typeof NotANode => {
    if (object.type !== ObjectType.Set) return NotANode;

    let some: Object | undefined;
    let finalNode: Node | undefined;

    some = singleSetAtomValue(object, Atom.NodeFunction.value);
    if (some) {
        if (finalNode) return NotANode;

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
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Literal,
            object: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeLiteral.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeAddFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeAddSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Plus,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeAddFirst.value,
                    Atom.NodeAddSecond.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeMultiplyFirst.value);
    if (some) {
        const second = singleSetAtomValue(
            object,
            Atom.NodeMultiplySecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Times,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeMultiplyFirst.value,
                    Atom.NodeMultiplySecond.value,
                ]),
            };
        }
    }

    return finalNode ?? NotANode;
};

const withoutAtomConstructors = (
    elements: readonly Object[],
    withoutAtomValues: readonly bigint[],
): Object[] =>
    elements.filter(element => {
        return (
            element.type !== ObjectType.Construction
            || (element.constructor.type === ObjectType.Atom
                && !withoutAtomValues.includes(element.constructor.value))
        );
    });

const singleSetAtomValue = (
    set: EverythingSet,
    atomValue: bigint,
): Object | undefined => {
    // TODO: optimize

    const [element1, element2] = set.elements
        .filter(element => {
            return (
                element.type === ObjectType.Construction
                && element.constructor.type === ObjectType.Atom
                && element.constructor.value === atomValue
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

export const nodeToObject = (node: Node): Object => {
    switch (node.type) {
        case NodeType.Times:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeMultiplyFirst, node.first),
                    construction(Atom.NodeMultiplySecond, node.second),
                ],
            };
        case NodeType.Function:
            return {
                type: ObjectType.Set,
                elements: [construction(Atom.NodeFunction, node.body)],
            };
        case NodeType.Plus:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAddFirst, node.first),
                    construction(Atom.NodeAddSecond, node.second),
                ],
            };
        case NodeType.Literal:
            return {
                type: ObjectType.Set,
                elements: [construction(Atom.NodeLiteral, node.object)],
            };
    }
};
