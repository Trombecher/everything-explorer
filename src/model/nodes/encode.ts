import {construction, ObjectType, type EverythingObject} from "..";
import {Atom} from "../atoms";
import {type Node, NodeType} from "./types";

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
        case NodeType.Less:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeLessFirst, node.first),
                    construction(Atom.NodeLessSecond, node.second),
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
        case NodeType.Count:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeCount, node.inner),
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
        case NodeType.Map:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeMapSet, node.set),
                    construction(Atom.NodeMapMapper, node.mapperFunction),
                    ...node.rest,
                ],
            };
        case NodeType.Fold:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeFoldSet, node.set),
                    construction(Atom.NodeFoldFolder, node.folder),
                    construction(Atom.NodeFoldInitial, node.initial),
                    ...node.rest,
                ],
            };
        case NodeType.Every:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeEverySet, node.set),
                    construction(Atom.NodeEveryPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.Any:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAnySet, node.set),
                    construction(Atom.NodeAnyPredicate, node.predicate),
                    ...node.rest,
                ],
            };
        case NodeType.QueryAtomsWithProperty:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeAtomsWithProperty, node.property),
                    ...node.rest,
                ],
            };
        case NodeType.QueryAtomsWithConstructor:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(
                        Atom.NodeAtomsWithConstructor,
                        node.constructor,
                    ),
                    ...node.rest,
                ],
            };
        case NodeType.ValuesOf:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeValuesOf, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.HasValue:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeHasValue, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.Unwrap:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeUnwrapSet, node.set),
                    ...node.rest,
                ],
            };
        case NodeType.IsAtom:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeIsAtom, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.IsSet:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeIsSet, node.inner),
                    ...node.rest,
                ],
            };
        case NodeType.QueryConstructionValues:
            return {
                type: ObjectType.Set,
                elements: [
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
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeQueryConstructions, node.constructor),
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
        case NodeType.FunctionSelf:
            return {
                type: ObjectType.Set,
                elements: [
                    construction(Atom.NodeFunctionSelf, {
                        type: ObjectType.Integer,
                        value: node.depth,
                    }),
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
