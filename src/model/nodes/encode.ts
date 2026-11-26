import {construction, ObjectType, type EverythingObject} from "..";
import {Atom} from "../atoms";
import {type Node, NodeType} from "./types";

export const nodeToObject = (node: Node): EverythingObject => {
    switch (node.type) {
        case NodeType.Times:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeMultiplyFirst, node.first),
                    construction(Atom.NodeMultiplySecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Function:
            return {
                type: ObjectType.Composite,
                properties: [
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
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeAddFirst, node.first),
                    construction(Atom.NodeAddSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Literal:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeLiteral, node.object),
                    ...node.rest,
                ],
            };
        case NodeType.Equal:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeEqualFirst, node.first),
                    construction(Atom.NodeEqualSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Less:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeLessFirst, node.first),
                    construction(Atom.NodeLessSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.SetContains:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetContainsElement, node.element),
                    construction(Atom.NodeSetContainsSet, node.set),
                    ...node.rest,
                ],
            };
        case NodeType.And:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeAndFirst, node.first),
                    construction(Atom.NodeAndSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Or:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeOrFirst, node.first),
                    construction(Atom.NodeOrSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Xor:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeXorFirst, node.first),
                    construction(Atom.NodeXorSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Not:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeNot, node.operand),
                    ...node.rest,
                ],
            };
        case NodeType.SetCount:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetCount, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.SetUnion:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetUnionFirst, node.first),
                    construction(Atom.NodeSetUnionSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.SetIntersection:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetIntersectionFirst, node.first),
                    construction(Atom.NodeSetIntersectionSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.SetFilter:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetFilterSet, node.set),
                    construction(Atom.NodeSetFilterFilter, node.filterFunction),
                    ...node.rest,
                ],
            };
        case NodeType.SetMap:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetMapSet, node.set),
                    construction(Atom.NodeSetMapMapper, node.mapperFunction),
                    ...node.rest,
                ],
            };
        case NodeType.SetFold:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetFoldSet, node.set),
                    construction(Atom.NodeSetFoldFolder, node.folder),
                    construction(Atom.NodeSetFoldInitial, node.initial),
                    ...node.rest,
                ],
            };
        case NodeType.SetEvery:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetEverySet, node.set),
                    construction(Atom.NodeSetEveryPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.SetAny:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetAnySet, node.set),
                    construction(Atom.NodeSetAnyPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.NewSet:
            return {
                type: ObjectType.Composite,
                properties: [
                    ...node.items.map(value =>
                        construction(Atom.NodeNewSetItem, value),
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.NewComposite:
            return {
                type: ObjectType.Composite,
                properties: [
                    ...node.properties.map(property =>
                        construction(Atom.NodeNewCompositeProperty, property),
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.QueryAtomsWithProperty:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeAtomsWithProperty, node.property),
                    ...node.rest,
                ],
            };
        case NodeType.QueryAtomsWithConstructor:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(
                        Atom.NodeAtomsWithConstructor,
                        node.constructor,
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.PropertiesOf:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodePropertiesOf, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.HasValue:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeHasValue, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.HasProperty:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeHasPropertySubject, node.subject),
                    construction(Atom.NodeHasPropertyProperty, node.property),
                    ...node.rest,
                ],
            };
        case NodeType.SetUnwrap:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeSetUnwrapSet, node.set),
                    ...node.rest,
                ],
            };
        case NodeType.IsAtom:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIsAtom, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.IsConstruction:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIsConstruction, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.IsComposite:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIsComposite, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.QueryConstructionValues:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(
                        Atom.NodeConstructionValuesObject,
                        node.object,
                    ),
                    construction(
                        Atom.NodeConstructionValuesPropertyConstructor,
                        node.propertyConstructor,
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.QueryConstructions:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeQueryConstructions, node.constructor),
                    ...node.rest,
                ],
            };
        case NodeType.ConstructionConstructor:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(
                        Atom.NodeConstructorOfConstruction,
                        node.construction,
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.ConstructionValue:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(
                        Atom.NodeValueOfConstruction,
                        node.construction,
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.If:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIfCondition, node.condition),
                    construction(Atom.NodeIfThen, node.thenBranch),
                    construction(Atom.NodeIfElse, node.otherwiseBranch),
                    ...node.rest,
                ],
            };
        case NodeType.Call:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeCallCallee, node.callee),
                    construction(Atom.NodeCallWith, node.with),
                    ...node.rest,
                ],
            };
        case NodeType.FunctionSelf:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeFunctionSelf, {
                        type: ObjectType.Integer,
                        value: node.depth,
                    }),
                    ...node.rest,
                ],
            };
        case NodeType.Parameter:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeParameter, {
                        type: ObjectType.Integer,
                        value: node.depth,
                    }),
                    ...node.rest,
                ],
            };
    }
};
