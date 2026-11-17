import type {EverythingSet} from "..";
import {ObjectType, type EverythingObject} from "..";
import {Atom} from "../atoms";
import {type Node, NodeType, NotANode} from "./types";

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

    some = singleSetAtomValue(object, Atom.NodeMapSet.value);
    if (some) {
        const mapperFunction = singleSetAtomValue(
            object,
            Atom.NodeMapMapper.value,
        );

        if (mapperFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Map,
                set: some,
                mapperFunction,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeMapSet.value,
                    Atom.NodeMapMapper.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeAtomsWithProperty.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryAtomsWithProperty,
            property: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeAtomsWithProperty.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeAtomsWithConstructor.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryAtomsWithConstructor,
            constructor: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeAtomsWithConstructor.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeValuesOf.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.ValuesOf,
            inner: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeValuesOf.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeUnwrapSet.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Unwrap,
            set: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeUnwrapSet.value,
            ]),
        };
    }

    some = singleSetAtomValue(object, Atom.NodeConstructionValuesSet.value);
    if (some) {
        const propertyConstructor = singleSetAtomValue(
            object,
            Atom.NodeConstructionValuesPropertyConstructor.value,
        );

        if (propertyConstructor) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.QueryConstructionValues,
                set: some,
                propertyConstructor,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeConstructionValuesSet.value,
                    Atom.NodeConstructionValuesPropertyConstructor.value,
                ]),
            };
        }
    }

    some = singleSetAtomValue(object, Atom.NodeQueryConstructions.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryConstructions,
            constructor: some,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeQueryConstructions.value,
            ]),
        };
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

    some = singleSetAtomValue(object, Atom.NodeLessFirst.value);
    if (some) {
        const second = singleSetAtomValue(object, Atom.NodeLessSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Less,
                first: some,
                second,
                rest: withoutAtomConstructors(object.elements, [
                    Atom.NodeLessFirst.value,
                    Atom.NodeLessSecond.value,
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

    some = singleSetAtomValue(object, Atom.NodeFunctionSelf.value);
    if (some) {
        if (finalNode) return NotANode;

        if (some.type !== ObjectType.Integer) return NotANode;

        finalNode = {
            type: NodeType.FunctionSelf,
            depth: some.value,
            rest: withoutAtomConstructors(object.elements, [
                Atom.NodeFunctionSelf.value,
            ]),
        };
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
