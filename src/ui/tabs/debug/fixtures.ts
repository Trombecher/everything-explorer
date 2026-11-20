import type {EverythingObject} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

export const createInitialObject2 = (): EverythingObject => ({
    type: ObjectType.Set,
    elements: [
        nodeToObject({
            type: NodeType.Function,
            body: nodeToObject({
                type: NodeType.Literal,
                object: {type: ObjectType.Integer, value: 42n},
                rest: [],
            }),
            parameterName: undefined,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Function,
            body: nodeToObject({
                type: NodeType.FunctionSelf,
                depth: 0n,
                rest: [],
            }),
            parameterName: undefined,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Text, text: "literal"},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Plus,
            first: {type: ObjectType.Atom, value: 34534598n},
            second: nodeToObject({
                type: NodeType.Times,
                first: defaultObject,
                second: defaultObject,
                rest: [],
            }),
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Times,
            first: {type: ObjectType.Integer, value: 6n},
            second: {type: ObjectType.Integer, value: 7n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Equal,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Less,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 2n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Contains,
            element: {type: ObjectType.Atom, value: 2n},
            set: {
                type: ObjectType.Set,
                elements: [{type: ObjectType.Atom, value: 2n}],
            },
            rest: [],
        }),
        nodeToObject({
            type: NodeType.And,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Or,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Not,
            operand: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Union,
            first: defaultObject,
            second: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Filter,
            set: defaultObject,
            filterFunction: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Parameter,
                    depth: 0n,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Map,
            set: defaultObject,
            mapperFunction: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Parameter,
                    depth: 0n,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Fold,
            set: defaultObject,
            folder: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Function,
                    body: nodeToObject({
                        type: NodeType.Parameter,
                        depth: 0n,
                        rest: [],
                    }),
                    parameterName: undefined,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            initial: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.QueryAtomsWithProperty,
            property: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.QueryAtomsWithConstructor,
            constructor: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.ValuesOf,
            inner: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.HasValue,
            inner: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({type: NodeType.Unwrap, set: defaultObject, rest: []}),
        nodeToObject({
            type: NodeType.QueryConstructionValues,
            set: defaultObject,
            propertyConstructor: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.QueryConstructions,
            constructor: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.If,
            condition: {type: ObjectType.Integer, value: 1n},
            thenBranch: {type: ObjectType.Integer, value: 42n},
            otherwiseBranch: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Call,
            callee: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Parameter,
                    depth: 0n,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            with: {type: ObjectType.Integer, value: 42n},
            rest: [],
        }),
        nodeToObject({type: NodeType.Parameter, depth: 0n, rest: []}),
        {type: ObjectType.Character, value: "a"},
        {type: ObjectType.Character, value: "\n"},
        {type: ObjectType.Byte, value: 0xa5},
        {
            type: ObjectType.Construction,
            constructor: {type: ObjectType.Character, value: "a"},
            value: {type: ObjectType.Text, text: "this is some text"},
        },
    ],
});
