import type {EverythingComposite} from "..";
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
    if (object.type !== ObjectType.Composite) return NotANode;

    let some: EverythingObject | undefined;
    let finalNode: Node | undefined;

    some = singleAtomPropertyValue(object, Atom.NodeFunction.value);
    if (some) {
        if (finalNode) return NotANode;

        const parameterNameObject = singleAtomPropertyValue(
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
                object.properties,
                parameterName === undefined
                    ? [Atom.NodeFunction.value]
                    : [Atom.NodeFunction.value, Atom.ParameterName.value],
            ),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeLiteral.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Literal,
            object: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeLiteral.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeAddFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeAddSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Plus,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeAddFirst.value,
                    Atom.NodeAddSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeMultiplyFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeMultiplySecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Times,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeMultiplyFirst.value,
                    Atom.NodeMultiplySecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeAndFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeAndSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.And,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeAndFirst.value,
                    Atom.NodeAndSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeOrFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(object, Atom.NodeOrSecond.value);

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Or,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeOrFirst.value,
                    Atom.NodeOrSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeXorFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeXorSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Xor,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeXorFirst.value,
                    Atom.NodeXorSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeNot.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Not,
            operand: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeNot.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeCount.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Count,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeCount.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeUnionFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeUnionSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Union,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeUnionFirst.value,
                    Atom.NodeUnionSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeIntersectionFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeIntersectionSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Intersection,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeIntersectionFirst.value,
                    Atom.NodeIntersectionSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeFilterSet.value);
    if (some) {
        const filterFunction = singleAtomPropertyValue(
            object,
            Atom.NodeFilterFilter.value,
        );

        if (filterFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Filter,
                set: some,
                filterFunction,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeFilterSet.value,
                    Atom.NodeFilterFilter.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeMapSet.value);
    if (some) {
        const mapperFunction = singleAtomPropertyValue(
            object,
            Atom.NodeMapMapper.value,
        );

        if (mapperFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Map,
                set: some,
                mapperFunction,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeMapSet.value,
                    Atom.NodeMapMapper.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeFoldSet.value);
    if (some) {
        const folder = singleAtomPropertyValue(
            object,
            Atom.NodeFoldFolder.value,
        );
        const initial = singleAtomPropertyValue(
            object,
            Atom.NodeFoldInitial.value,
        );

        if (folder && initial) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Fold,
                set: some,
                folder,
                initial,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeFoldSet.value,
                    Atom.NodeFoldFolder.value,
                    Atom.NodeFoldInitial.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeEverySet.value);
    if (some) {
        const predicate = singleAtomPropertyValue(
            object,
            Atom.NodeEveryPredicate.value,
        );

        if (predicate) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Every,
                set: some,
                predicate,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeEverySet.value,
                    Atom.NodeEveryPredicate.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeAnySet.value);
    if (some) {
        const predicate = singleAtomPropertyValue(
            object,
            Atom.NodeAnyPredicate.value,
        );

        if (predicate) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Any,
                set: some,
                predicate,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeAnySet.value,
                    Atom.NodeAnyPredicate.value,
                ]),
            };
        }
    }

    const values = atomPropertyValues(object, Atom.NodeNewSetValue.value);
    if (values.length > 0) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.NewSet,
            values,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeNewSetValue.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeAtomsWithProperty.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryAtomsWithProperty,
            property: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeAtomsWithProperty.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeAtomsWithConstructor.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryAtomsWithConstructor,
            constructor: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeAtomsWithConstructor.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeValuesOf.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.ValuesOf,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeValuesOf.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeHasValue.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.HasValue,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeHasValue.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeUnwrapSet.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.Unwrap,
            set: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeUnwrapSet.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeIsAtom.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.IsAtom,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeIsAtom.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeIsConstruction.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.IsConstruction,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeIsConstruction.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeIsSet.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.IsSet,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeIsSet.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(
        object,
        Atom.NodeConstructionValuesSet.value,
    );
    if (some) {
        const propertyConstructor = singleAtomPropertyValue(
            object,
            Atom.NodeConstructionValuesPropertyConstructor.value,
        );

        if (propertyConstructor) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.QueryConstructionValues,
                set: some,
                propertyConstructor,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeConstructionValuesSet.value,
                    Atom.NodeConstructionValuesPropertyConstructor.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeQueryConstructions.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.QueryConstructions,
            constructor: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeQueryConstructions.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(
        object,
        Atom.NodeConstructorOfConstruction.value,
    );
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.ConstructionConstructor,
            construction: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeConstructorOfConstruction.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeValueOfConstruction.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.ConstructionValue,
            construction: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeValueOfConstruction.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeIfCondition.value);
    if (some) {
        const thenObject = singleAtomPropertyValue(
            object,
            Atom.NodeIfThen.value,
        );
        const otherwiseObject = singleAtomPropertyValue(
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
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeIfCondition.value,
                    Atom.NodeIfThen.value,
                    Atom.NodeIfElse.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeCallCallee.value);
    if (some) {
        const withObject = singleAtomPropertyValue(
            object,
            Atom.NodeCallWith.value,
        );

        if (withObject) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Call,
                callee: some,
                with: withObject,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeCallCallee.value,
                    Atom.NodeCallWith.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeEqualFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeEqualSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Equal,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeEqualFirst.value,
                    Atom.NodeEqualSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeLessFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeLessSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Less,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeLessFirst.value,
                    Atom.NodeLessSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeContainsElement.value);
    if (some) {
        const set = singleAtomPropertyValue(object, Atom.NodeContainsSet.value);

        if (set) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.Contains,
                element: some,
                set,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeContainsElement.value,
                    Atom.NodeContainsSet.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeFunctionSelf.value);
    if (some) {
        if (finalNode) return NotANode;

        if (some.type !== ObjectType.Integer) return NotANode;

        finalNode = {
            type: NodeType.FunctionSelf,
            depth: some.value,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeFunctionSelf.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeParameter.value);
    if (some) {
        if (finalNode) return NotANode;

        if (some.type !== ObjectType.Integer) return NotANode;

        finalNode = {
            type: NodeType.Parameter,
            depth: some.value,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeParameter.value,
            ]),
        };
    }

    return finalNode ?? NotANode;
};

const withoutAtomConstructors = (
    properties: readonly EverythingObject[],
    withoutAtomValues: readonly bigint[],
): EverythingObject[] =>
    properties.filter(property => {
        if (property.type !== ObjectType.Construction) return true;
        if (property.constructor.type !== ObjectType.Atom) return true;

        return !withoutAtomValues.includes(property.constructor.value);
    });

const singleAtomPropertyValue = (
    composite: EverythingComposite,
    atomValue: bigint,
): EverythingObject | undefined => {
    let found: EverythingObject | undefined;

    for (const property of composite.properties) {
        if (
            property.type !== ObjectType.Construction
            || property.constructor.type !== ObjectType.Atom
            || property.constructor.value !== atomValue
        ) {
            continue;
        }

        // A second match makes the atom ambiguous.
        if (found) return undefined;

        found = property.value;
    }

    return found;
};

/**
 * Collects every value of a property that may occur multiple times. The
 * property order is preserved. Zero matches yield an empty array.
 */
const atomPropertyValues = (
    composite: EverythingComposite,
    atomValue: bigint,
): EverythingObject[] => {
    const values: EverythingObject[] = [];

    for (const property of composite.properties) {
        if (
            property.type === ObjectType.Construction
            && property.constructor.type === ObjectType.Atom
            && property.constructor.value === atomValue
        ) {
            values.push(property.value);
        }
    }

    return values;
};
