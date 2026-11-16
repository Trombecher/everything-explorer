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
    export const Not = Symbol("NodeType.Not");
    export const Union = Symbol("NodeType.Union");
    export const Filter = Symbol("NodeType.Filter");
    export const If = Symbol("NodeType.If");
    export const Call = Symbol("NodeType.Call");
    export const Parameter = Symbol("NodeType.Parameter");
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
    readonly parameterName: string | undefined;
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

export type NotNode = {
    readonly type: typeof NodeType.Not;
    readonly operand: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type UnionNode = {
    readonly type: typeof NodeType.Union;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type FilterNode = {
    readonly type: typeof NodeType.Filter;
    readonly set: EverythingObject;
    readonly filterFunction: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type IfNode = {
    readonly type: typeof NodeType.If;
    readonly condition: EverythingObject;
    readonly thenBranch: EverythingObject;
    readonly otherwiseBranch: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type CallNode = {
    readonly type: typeof NodeType.Call;
    readonly callee: EverythingObject;
    readonly with: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type ParameterNode = {
    readonly type: typeof NodeType.Parameter;
    readonly depth: bigint;
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
    | NotNode
    | UnionNode
    | FilterNode
    | IfNode
    | CallNode
    | ParameterNode;

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

        const parameterNameObject = singleSetAtomValue(
            object,
            Atom.ParameterName.value,
        );
        const parameterName =
            parameterNameObject?.type === ObjectType.Text
                ? parameterNameObject.text
                : undefined;

        finalNode = {
            type: NodeType.Function,
            body: some,
            parameterName,
            rest: withoutAtomConstructors(
                object.elements,
                parameterName === undefined
                    ? [Atom.NodeFunction.value]
                    : [Atom.NodeFunction.value, Atom.ParameterName.value],
            ),
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

    some = singleSetAtomValue(object, Atom.NodeNot.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Not,
            operand: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeNot.value,
            ]),
        };
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

    some = singleSetAtomValue(object, Atom.NodeFilterSet.value);
    if (some) {
        const filterFunction = singleSetAtomValue(
            object,
            Atom.NodeFilterFilter.value,
        );

        if (filterFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Filter,
                set: some,
                filterFunction,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeFilterSet.value,
                    Atom.NodeFilterFilter.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeIfCondition.value);
    if (some) {
        const thenObject = singleSetAtomValue(object, Atom.NodeIfThen.value);
        const otherwiseObject = singleSetAtomValue(
            object,
            Atom.NodeIfElse.value,
        );

        if (thenObject && otherwiseObject) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.If,
                condition: some,
                thenBranch: thenObject,
                otherwiseBranch: otherwiseObject,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeIfCondition.value,
                    Atom.NodeIfThen.value,
                    Atom.NodeIfElse.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeCallCallee.value);
    if (some) {
        const withObject = singleSetAtomValue(object, Atom.NodeCallWith.value);

        if (withObject) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Call,
                callee: some,
                with: withObject,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeCallCallee.value,
                    Atom.NodeCallWith.value,
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

    some = singleSetAtomValue(object, Atom.NodeParameter.value);
    if (some) {
        if (finalNode) return NotANode;

        if (some.type !== ObjectType.Integer) return NotANode;

        finalNode = {
            type: NodeType.Parameter,
            depth: some.value,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeParameter.value,
            ]),
        };
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
    let found: EverythingObject | undefined;

    for (const element of set.elements) {
        if (
            element.type !== ObjectType.Construction
            || element.constructor.type !== ObjectType.Atom
            || element.constructor.value !== atomValue
        ) {
            continue;
        }

        // A second match makes the atom ambiguous.
        if (found) return undefined;

        found = element.value;
    }

    return found;
};

export const nodeToObject = (node: Node): EverythingObject => {
    switch (node.type) {
        case NodeType.Times:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeMultiplyFirst, node.first),
                    construction(Atom.NodeMultiplySecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Function:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeFunction, node.body),
                    ...node.rest,
                    ...(node.parameterName === undefined
                        ? []
                        : [
                              construction(Atom.ParameterName, {
                                  type: ObjectType.Text,
                                  text: node.parameterName,
                              }),
                          ]),
                ],
            };
        case NodeType.Plus:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAddFirst, node.first),
                    construction(Atom.NodeAddSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Literal:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeLiteral, node.object),
                    ...node.rest,
                ],
            };
        case NodeType.Equal:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeEqualFirst, node.first),
                    construction(Atom.NodeEqualSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Contains:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeContainsElement, node.element),
                    construction(Atom.NodeContainsSet, node.set),
                    ...node.rest,
                ],
            };
        case NodeType.And:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAndFirst, node.first),
                    construction(Atom.NodeAndSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Or:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeOrFirst, node.first),
                    construction(Atom.NodeOrSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Not:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeNot, node.operand),
                    ...node.rest,
                ],
            };
        case NodeType.Union:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeUnionFirst, node.first),
                    construction(Atom.NodeUnionSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Filter:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeFilterSet, node.set),
                    construction(Atom.NodeFilterFilter, node.filterFunction),
                    ...node.rest,
                ],
            };
        case NodeType.If:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeIfCondition, node.condition),
                    construction(Atom.NodeIfThen, node.thenBranch),
                    construction(Atom.NodeIfElse, node.otherwiseBranch),
                    ...node.rest,
                ],
            };
        case NodeType.Call:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeCallCallee, node.callee),
                    construction(Atom.NodeCallWith, node.with),
                    ...node.rest,
                ],
            };
        case NodeType.Parameter:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeParameter, {
                        type: ObjectType.Integer,
                        value: node.depth,
                    }),
                    ...node.rest,
                ],
            };
    }
};
