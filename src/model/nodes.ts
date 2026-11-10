import type {EverythingSet} from ".";
import {construction, ObjectType, type EverythingObject} from ".";
import {Atom} from "./atoms";

export namespace NodeType {
    export const Function = Symbol("NodeType.Function");
    export const Plus = Symbol("NodeType.Plus");
    export const Literal = Symbol("NodeType.Literal");
    export const Times = Symbol("NodeType.Times");
    export const Equal = Symbol("NodeType.Equal");
    export const Contains = Symbol("NodeType.Contains");
    export const And = Symbol("NodeType.And");
    export const Or = Symbol("NodeType.Or");
    export const Union = Symbol("NodeType.Union");
}

export type NodeType = Node["type"];

export type TimesNode = {
    readonly type: typeof NodeType.Times;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type FunctionNode = {
    readonly type: typeof NodeType.Function;
    readonly body: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type PlusNode = {
    readonly type: typeof NodeType.Plus;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type LiteralNode = {
    readonly type: typeof NodeType.Literal;
    readonly object: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type EqualNode = {
    readonly type: typeof NodeType.Equal;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type ContainsNode = {
    readonly type: typeof NodeType.Contains;
    readonly element: EverythingObject;
    readonly set: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type AndNode = {
    readonly type: typeof NodeType.And;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type OrNode = {
    readonly type: typeof NodeType.Or;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type UnionNode = {
    readonly type: typeof NodeType.Union;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type Node =
    | FunctionNode
    | PlusNode
    | LiteralNode
    | TimesNode
    | EqualNode
    | ContainsNode
    | AndNode
    | OrNode
    | UnionNode;

export const NotANode = Symbol("NotANode");

const objectNodeCache = new WeakMap<EverythingObject, Node | typeof NotANode>();

/**
 * Converts an object to a {@link Node `Node`}. The result is cached.
 *
 * This function is cheap on cache hit.
 */
export const objectToNode = (
    object: EverythingObject,
): Node | typeof NotANode => {
    const cachedNode = objectNodeCache.get(object);
    if (cachedNode !== undefined) {
        return cachedNode;
    }

    const node = objectToNodeWithoutCache(object);
    objectNodeCache.set(object, node);
    return node;
};

const objectToNodeWithoutCache = (
    object: EverythingObject,
): Node | typeof NotANode => {
    if (object.type !== ObjectType.Set) return NotANode;

    let some: EverythingObject | undefined;
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

    some = singleSetAtomValue(object, Atom.NodeAndFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeAndSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.And,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeAndFirst.value,
                    Atom.NodeAndSecond.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeOrFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeOrSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Or,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeOrFirst.value,
                    Atom.NodeOrSecond.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeUnionFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeUnionSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Union,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeUnionFirst.value,
                    Atom.NodeUnionSecond.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeEqualFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeEqualSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Equal,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeEqualFirst.value,
                    Atom.NodeEqualSecond.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeContainsElement.value);
    if (some) {
        const set = singleSetAtomValue(object, Atom.NodeContainsSet.value);

        if (set) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Contains,
                element: some,
                set,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeContainsElement.value,
                    Atom.NodeContainsSet.value,
                ]),
            };
        }
    }

    return finalNode ?? NotANode;
};

const withoutAtomConstructors = (
    elements: readonly EverythingObject[],
    withoutAtomValues: readonly bigint[],
): EverythingObject[] =>
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
): EverythingObject | undefined => {
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
                (
                    element as EverythingObject & {
                        type: typeof ObjectType.Construction;
                    }
                ).value,
        );

    if (element2) return;
    return element1;
};

export const nodeToObject = (node: Node): EverythingObject => {
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
        case NodeType.Equal:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeEqualFirst, node.first),
                    construction(Atom.NodeEqualSecond, node.second),
                ],
            };
        case NodeType.Contains:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeContainsElement, node.element),
                    construction(Atom.NodeContainsSet, node.set),
                ],
            };
        case NodeType.And:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAndFirst, node.first),
                    construction(Atom.NodeAndSecond, node.second),
                ],
            };
        case NodeType.Or:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeOrFirst, node.first),
                    construction(Atom.NodeOrSecond, node.second),
                ],
            };
        case NodeType.Union:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeUnionFirst, node.first),
                    construction(Atom.NodeUnionSecond, node.second),
                ],
            };
    }
};
