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
        case NodeType.Contains:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeContainsElement, node.element),
                    construction(Atom.NodeContainsSet, node.set),
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
        case NodeType.Count:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeCount, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.Union:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeUnionFirst, node.first),
                    construction(Atom.NodeUnionSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Intersection:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIntersectionFirst, node.first),
                    construction(Atom.NodeIntersectionSecond, node.second),
                    ...node.rest,
                ],
            };
        case NodeType.Filter:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeFilterSet, node.set),
                    construction(Atom.NodeFilterFilter, node.filterFunction),
                    ...node.rest,
                ],
            };
        case NodeType.Map:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeMapSet, node.set),
                    construction(Atom.NodeMapMapper, node.mapperFunction),
                    ...node.rest,
                ],
            };
        case NodeType.Fold:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeFoldSet, node.set),
                    construction(Atom.NodeFoldFolder, node.folder),
                    construction(Atom.NodeFoldInitial, node.initial),
                    ...node.rest,
                ],
            };
        case NodeType.Every:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeEverySet, node.set),
                    construction(Atom.NodeEveryPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.Any:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeAnySet, node.set),
                    construction(Atom.NodeAnyPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.NewSet:
            return {
                type: ObjectType.Composite,
                properties: [
                    ...node.values.map(value =>
                        construction(Atom.NodeNewSetValue, value),
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
        case NodeType.ValuesOf:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeValuesOf, node.inner),
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
        case NodeType.Unwrap:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeUnwrapSet, node.set),
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
        case NodeType.IsSet:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeIsSet, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.QueryConstructionValues:
            return {
                type: ObjectType.Composite,
                properties: [
                    construction(Atom.NodeConstructionValuesSet, node.set),
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
