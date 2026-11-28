import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType, type Node} from "@/model/nodes";

export type ObjectInsertion = {
    readonly object: EverythingObject;

    /**
     * The child index to select after the insertion, if any.
     */
    readonly selectChild?: number;

    /**
     * Whether the first input of the inserted object should receive focus.
     */
    readonly focusFirstInput?: boolean;
};

type Inserter = (object: EverythingObject) => ObjectInsertion;

/**
 * Wraps the object in a unary node and selects the new operand.
 */
const unary =
    (makeNode: (object: EverythingObject) => Node): Inserter =>
    object => ({object: nodeToObject(makeNode(object)), selectChild: 0});

/**
 * Wraps the object in a binary node and selects the new second operand.
 */
const binary =
    (makeNode: (object: EverythingObject) => Node): Inserter =>
    object => ({object: nodeToObject(makeNode(object)), selectChild: 1});

/**
 * Inserts an object around the selected object for a keyboard shortcut.
 *
 * The insertion is only a description: the caller applies the object and the
 * selection so that this module does not need to know about the selection.
 */
const insertions: Readonly<Record<string, Inserter | undefined>> = {
    "+": binary(object => ({
        type: NodeType.Plus,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    "=": binary(object => ({
        type: NodeType.Equal,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    "<": binary(object => ({
        type: NodeType.Less,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    "&": binary(object => ({
        type: NodeType.And,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    "|": binary(object => ({
        type: NodeType.Or,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    X: binary(object => ({
        type: NodeType.Xor,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    u: binary(object => ({
        type: NodeType.SetUnion,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    n: binary(object => ({
        type: NodeType.SetIntersection,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    d: binary(object => ({
        type: NodeType.SetDifference,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    "*": binary(object => ({
        type: NodeType.Times,
        first: object,
        second: defaultObject,
        rest: [],
    })),
    H: binary(object => ({
        type: NodeType.HasProperty,
        subject: object,
        property: defaultObject,
        rest: [],
    })),
    i: binary(object => ({
        type: NodeType.If,
        condition: object,
        thenBranch: defaultObject,
        otherwiseBranch: defaultObject,
        rest: [],
    })),
    F: binary(object => ({
        type: NodeType.SetFilter,
        set: object,
        filterFunction: defaultObject,
        rest: [],
    })),
    A: binary(object => ({
        type: NodeType.SetEvery,
        set: object,
        predicate: defaultObject,
        rest: [],
    })),
    E: binary(object => ({
        type: NodeType.SetAny,
        set: object,
        predicate: defaultObject,
        rest: [],
    })),
    m: binary(object => ({
        type: NodeType.SetMap,
        set: object,
        mapperFunction: defaultObject,
        rest: [],
    })),
    r: binary(object => ({
        type: NodeType.SetFold,
        set: object,
        folder: defaultObject,
        initial: defaultObject,
        rest: [],
    })),
    e: binary(object => ({
        type: NodeType.SetContains,
        element: object,
        set: defaultObject,
        rest: [],
    })),
    c: binary(object => ({
        type: NodeType.Call,
        callee: object,
        with: defaultObject,
        rest: [],
    })),
    " ": object => ({
        object: {
            type: ObjectType.Construction,
            constructor: object,
            value: defaultObject,
        },
        selectChild: 1,
    }),
    "!": unary(object => ({type: NodeType.Not, operand: object, rest: []})),
    C: unary(object => ({type: NodeType.SetCount, inner: object, rest: []})),
    q: unary(object => ({
        type: NodeType.QueryAtomsWithProperty,
        property: object,
        rest: [],
    })),
    v: unary(object => ({
        type: NodeType.PropertiesOf,
        inner: object,
        rest: [],
    })),
    h: unary(object => ({type: NodeType.HasASetItem, inner: object, rest: []})),
    U: unary(object => ({type: NodeType.SetUnwrap, set: object, rest: []})),
    I: unary(object => ({type: NodeType.IsComposite, inner: object, rest: []})),
    J: unary(object => ({type: NodeType.IsNode, inner: object, rest: []})),
    P: unary(object => ({type: NodeType.IsAtom, inner: object, rest: []})),
    K: unary(object => ({
        type: NodeType.IsConstruction,
        inner: object,
        rest: [],
    })),
    k: unary(object => ({
        type: NodeType.ConstructionConstructor,
        construction: object,
        rest: [],
    })),
    V: unary(object => ({
        type: NodeType.ConstructionValue,
        construction: object,
        rest: [],
    })),
    l: unary(object => ({type: NodeType.Literal, object, rest: []})),
    f: unary(object => ({
        type: NodeType.Function,
        body: object,
        parameterName: undefined,
        rest: [],
    })),
    N: object => ({
        object: nodeToObject({
            type: NodeType.NewSet,
            items: [object],
            rest: [],
        }),
        selectChild: 0,
    }),
    O: object => ({
        object: nodeToObject({
            type: NodeType.NewComposite,
            properties: [object],
            rest: [],
        }),
        selectChild: 0,
    }),
    b: binary(object => ({
        type: NodeType.NewConstruction,
        constructor: object,
        value: defaultObject,
        rest: [],
    })),
    p: () => ({
        object: nodeToObject({type: NodeType.Parameter, depth: 0n, rest: []}),
    }),
    s: () => ({
        object: nodeToObject({
            type: NodeType.FunctionSelf,
            depth: 0n,
            rest: [],
        }),
    }),
    z: () => ({
        object: {type: ObjectType.Integer, value: 0n},
        focusFirstInput: true,
    }),
    a: () => ({object: {type: ObjectType.Atom, value: 0n}}),
    t: () => ({object: {type: ObjectType.Text, text: ""}}),
    "'": () => ({
        object: {type: ObjectType.Character, value: "a"},
        focusFirstInput: true,
    }),
    x: () => ({
        object: {type: ObjectType.Byte, value: 0},
        focusFirstInput: true,
    }),
};

export const insertObjectForShortcut = (
    key: string,
    object: EverythingObject,
): ObjectInsertion | undefined => insertions[key]?.(object);

export const isInsertionShortcut = (key: string): boolean =>
    Object.prototype.hasOwnProperty.call(insertions, key);
