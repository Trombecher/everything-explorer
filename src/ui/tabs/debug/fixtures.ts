import type {EverythingObject} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

/**
 * The fixture objects of the debug tab, grouped by object view color category:
 * functional, computation, boolean, set, literal, query, control,
 * constructions, and values.
 *
 * When adding a fixture for a new node, sort it into the group matching its
 * category in `objectViewColorCategory` (`objectViewAppearance.ts`) instead of
 * appending it to the end. Keep the groups in the order above.
 */
export const createInitialObject2 = (): EverythingObject => ({
    type: ObjectType.Composite,
    properties: [
        // Functional
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

        // Computation
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
            type: NodeType.SetCount,
            inner: {
                type: ObjectType.Set,
                items: [
                    {type: ObjectType.Atom, value: 1n},
                    {type: ObjectType.Atom, value: 2n},
                    {type: ObjectType.Atom, value: 3n},
                ],
            },
            rest: [],
        }),

        // Boolean
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
            type: NodeType.Xor,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Not,
            operand: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({type: NodeType.IsAtom, inner: defaultObject, rest: []}),
        nodeToObject({
            type: NodeType.IsConstruction,
            inner: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.IsComposite,
            inner: defaultObject,
            rest: [],
        }),
        nodeToObject({type: NodeType.IsNode, inner: defaultObject, rest: []}),
        nodeToObject({
            type: NodeType.HasASetItem,
            inner: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.HasProperty,
            subject: {type: ObjectType.Atom, value: 1n},
            property: {type: ObjectType.Atom, value: 2n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.SetContains,
            element: {type: ObjectType.Atom, value: 2n},
            set: {
                type: ObjectType.Set,
                items: [{type: ObjectType.Atom, value: 2n}],
            },
            rest: [],
        }),

        // Set
        nodeToObject({
            type: NodeType.SetUnion,
            first: defaultObject,
            second: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.SetIntersection,
            first: defaultObject,
            second: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.SetDifference,
            first: defaultObject,
            second: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.SetFilter,
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
            type: NodeType.SetMap,
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
            type: NodeType.SetEvery,
            set: defaultObject,
            predicate: nodeToObject({
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
            type: NodeType.SetAny,
            set: defaultObject,
            predicate: nodeToObject({
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
            type: NodeType.SetFold,
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
            type: NodeType.NewSet,
            items: [
                {type: ObjectType.Integer, value: 1n},
                {type: ObjectType.Integer, value: 2n},
                {type: ObjectType.Integer, value: 3n},
            ],
            rest: [],
        }),
        nodeToObject({
            type: NodeType.NewComposite,
            properties: [
                {type: ObjectType.Integer, value: 1n},
                {type: ObjectType.Integer, value: 2n},
                {type: ObjectType.Integer, value: 3n},
            ],
            rest: [],
        }),
        nodeToObject({type: NodeType.SetUnwrap, set: defaultObject, rest: []}),

        // Literal
        nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Text, text: "literal"},
            rest: [],
        }),

        // Query
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
            type: NodeType.PropertiesOf,
            inner: {type: ObjectType.Atom, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.QueryConstructionValues,
            object: defaultObject,
            propertyConstructor: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.QueryConstructions,
            constructor: defaultObject,
            rest: [],
        }),

        // Control
        nodeToObject({
            type: NodeType.If,
            condition: {type: ObjectType.Integer, value: 1n},
            thenBranch: {type: ObjectType.Integer, value: 42n},
            otherwiseBranch: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),

        // Constructions
        nodeToObject({
            type: NodeType.ConstructionConstructor,
            construction: {
                type: ObjectType.Construction,
                constructor: {type: ObjectType.Atom, value: 1n},
                value: defaultObject,
            },
            rest: [],
        }),
        nodeToObject({
            type: NodeType.ConstructionValue,
            construction: {
                type: ObjectType.Construction,
                constructor: {type: ObjectType.Atom, value: 1n},
                value: defaultObject,
            },
            rest: [],
        }),
        nodeToObject({
            type: NodeType.NewConstruction,
            constructor: {type: ObjectType.Atom, value: 1n},
            value: defaultObject,
            rest: [],
        }),
        {
            type: ObjectType.Construction,
            constructor: {type: ObjectType.Character, value: "a"},
            value: {type: ObjectType.Text, text: "this is some text"},
        },

        // Values
        {type: ObjectType.Character, value: "a"},
        {type: ObjectType.Character, value: "\n"},
        {type: ObjectType.Byte, value: 0xa5},
    ],
});
