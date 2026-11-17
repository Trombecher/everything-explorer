import type {EverythingObject} from "..";

export namespace NodeType {
    export const Function = Symbol("NodeType.Function");
    export const FunctionSelf = Symbol("NodeType.FunctionSelf");
    export const Plus = Symbol("NodeType.Plus");
    export const Literal = Symbol("NodeType.Literal");
    export const Times = Symbol("NodeType.Times");
    export const Equal = Symbol("NodeType.Equal");
    export const Less = Symbol("NodeType.Less");
    export const Contains = Symbol("NodeType.Contains");
    export const And = Symbol("NodeType.And");
    export const Or = Symbol("NodeType.Or");
    export const Not = Symbol("NodeType.Not");
    export const Union = Symbol("NodeType.Union");
    export const Filter = Symbol("NodeType.Filter");
    export const Map = Symbol("NodeType.Map");
    export const QueryAtomsWithProperty = Symbol(
        "NodeType.QueryAtomsWithProperty",
    );
    export const ValuesOf = Symbol("NodeType.ValuesOf");
    export const Unwrap = Symbol("NodeType.Unwrap");
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

export type FunctionSelfNode = {
    readonly type: typeof NodeType.FunctionSelf;
    readonly depth: bigint;
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

export type LessNode = {
    readonly type: typeof NodeType.Less;
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

export type MapNode = {
    readonly type: typeof NodeType.Map;
    readonly set: EverythingObject;
    readonly mapperFunction: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type QueryAtomsWithPropertyNode = {
    readonly type: typeof NodeType.QueryAtomsWithProperty;
    readonly property: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type ValuesOfNode = {
    readonly type: typeof NodeType.ValuesOf;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type UnwrapNode = {
    readonly type: typeof NodeType.Unwrap;
    readonly set: EverythingObject;
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
    | FunctionSelfNode
    | PlusNode
    | LiteralNode
    | TimesNode
    | EqualNode
    | LessNode
    | ContainsNode
    | AndNode
    | OrNode
    | NotNode
    | UnionNode
    | FilterNode
    | MapNode
    | QueryAtomsWithPropertyNode
    | ValuesOfNode
    | UnwrapNode
    | IfNode
    | CallNode
    | ParameterNode;

export const NotANode = Symbol("NotANode");
