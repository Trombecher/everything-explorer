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

    some = singleAtomPropertyValue(object, Atom.NodeSetCount.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.SetCount,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeSetCount.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetUnionFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeSetUnionSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetUnion,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetUnionFirst.value,
                    Atom.NodeSetUnionSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetIntersectionFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeSetIntersectionSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetIntersection,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetIntersectionFirst.value,
                    Atom.NodeSetIntersectionSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetDifferenceFirst.value);
    if (some) {
        const second = singleAtomPropertyValue(
            object,
            Atom.NodeSetDifferenceSecond.value,
        );

        if (second) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetDifference,
                first: some,
                second,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetDifferenceFirst.value,
                    Atom.NodeSetDifferenceSecond.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetFilterSet.value);
    if (some) {
        const filterFunction = singleAtomPropertyValue(
            object,
            Atom.NodeSetFilterFilter.value,
        );

        if (filterFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetFilter,
                set: some,
                filterFunction,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetFilterSet.value,
                    Atom.NodeSetFilterFilter.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetMapSet.value);
    if (some) {
        const mapperFunction = singleAtomPropertyValue(
            object,
            Atom.NodeSetMapMapper.value,
        );

        if (mapperFunction) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetMap,
                set: some,
                mapperFunction,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetMapSet.value,
                    Atom.NodeSetMapMapper.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetFoldSet.value);
    if (some) {
        const folder = singleAtomPropertyValue(
            object,
            Atom.NodeSetFoldFolder.value,
        );
        const initial = singleAtomPropertyValue(
            object,
            Atom.NodeSetFoldInitial.value,
        );

        if (folder && initial) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetFold,
                set: some,
                folder,
                initial,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetFoldSet.value,
                    Atom.NodeSetFoldFolder.value,
                    Atom.NodeSetFoldInitial.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetEverySet.value);
    if (some) {
        const predicate = singleAtomPropertyValue(
            object,
            Atom.NodeSetEveryPredicate.value,
        );

        if (predicate) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetEvery,
                set: some,
                predicate,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetEverySet.value,
                    Atom.NodeSetEveryPredicate.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetAnySet.value);
    if (some) {
        const predicate = singleAtomPropertyValue(
            object,
            Atom.NodeSetAnyPredicate.value,
        );

        if (predicate) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetAny,
                set: some,
                predicate,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetAnySet.value,
                    Atom.NodeSetAnyPredicate.value,
                ]),
            };
        }
    }

    const values = atomPropertyValues(object, Atom.NodeNewSetItem.value);
    if (values.length > 0) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.NewSet,
            items: values,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeNewSetItem.value,
            ]),
        };
    }

    const properties = atomPropertyValues(
        object,
        Atom.NodeNewCompositeProperty.value,
    );
    if (properties.length > 0) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.NewComposite,
            properties,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeNewCompositeProperty.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(
        object,
        Atom.NodeNewConstructionConstructor.value,
    );
    if (some) {
        const value = singleAtomPropertyValue(
            object,
            Atom.NodeNewConstructionValue.value,
        );

        if (value) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.NewConstruction,
                constructor: some,
                value,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeNewConstructionConstructor.value,
                    Atom.NodeNewConstructionValue.value,
                ]),
            };
        }
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

    some = singleAtomPropertyValue(object, Atom.NodePropertiesOf.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.PropertiesOf,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodePropertiesOf.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeHasASetItem.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.HasASetItem,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeHasASetItem.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeHasPropertySubject.value);
    if (some) {
        const property = singleAtomPropertyValue(
            object,
            Atom.NodeHasPropertyProperty.value,
        );

        if (property) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.HasProperty,
                subject: some,
                property,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeHasPropertySubject.value,
                    Atom.NodeHasPropertyProperty.value,
                ]),
            };
        }
    }

    some = singleAtomPropertyValue(object, Atom.NodeSetUnwrapSet.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.SetUnwrap,
            set: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeSetUnwrapSet.value,
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

    some = singleAtomPropertyValue(object, Atom.NodeIsComposite.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.IsComposite,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeIsComposite.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(object, Atom.NodeIsNode.value);
    if (some) {
        if (finalNode) return NotANode;

        finalNode = {
            type: NodeType.IsNode,
            inner: some,
            rest: withoutAtomConstructors(object.properties, [
                Atom.NodeIsNode.value,
            ]),
        };
    }

    some = singleAtomPropertyValue(
        object,
        Atom.NodeConstructionValuesObject.value,
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
                object: some,
                propertyConstructor,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeConstructionValuesObject.value,
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

    some = singleAtomPropertyValue(object, Atom.NodeSetContainsElement.value);
    if (some) {
        const set = singleAtomPropertyValue(
            object,
            Atom.NodeSetContainsSet.value,
        );

        if (set) {
            if (finalNode) return NotANode;

            finalNode = {
                type: NodeType.SetContains,
                element: some,
                set,
                rest: withoutAtomConstructors(object.properties, [
                    Atom.NodeSetContainsElement.value,
                    Atom.NodeSetContainsSet.value,
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
