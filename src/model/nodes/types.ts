import type {EverythingObject} from "..";

export namespace NodeType {
    export const Function = Symbol("NodeType.Function");
    export const FunctionSelf = Symbol("NodeType.FunctionSelf");
    export const Plus = Symbol("NodeType.Plus");
    export const Literal = Symbol("NodeType.Literal");
    export const Times = Symbol("NodeType.Times");
    export const Equal = Symbol("NodeType.Equal");
    export const Less = Symbol("NodeType.Less");
    export const SetContains = Symbol("NodeType.SetContains");
    export const And = Symbol("NodeType.And");
    export const Or = Symbol("NodeType.Or");
    export const Xor = Symbol("NodeType.Xor");
    export const Not = Symbol("NodeType.Not");
    export const SetCount = Symbol("NodeType.SetCount");
    export const SetUnion = Symbol("NodeType.SetUnion");
    export const SetIntersection = Symbol("NodeType.SetIntersection");
    export const SetFilter = Symbol("NodeType.SetFilter");
    export const SetMap = Symbol("NodeType.SetMap");
    export const SetFold = Symbol("NodeType.SetFold");
    export const SetEvery = Symbol("NodeType.SetEvery");
    export const SetAny = Symbol("NodeType.SetAny");
    export const NewSet = Symbol("NodeType.NewSet");
    export const NewComposite = Symbol("NodeType.NewComposite");
    export const QueryAtomsWithProperty = Symbol(
        "NodeType.QueryAtomsWithProperty",
    );
    export const QueryAtomsWithConstructor = Symbol(
        "NodeType.QueryAtomsWithConstructor",
    );
    export const PropertiesOf = Symbol("NodeType.PropertiesOf");
    export const HasValue = Symbol("NodeType.HasValue");
    export const HasProperty = Symbol("NodeType.HasProperty");
    export const SetUnwrap = Symbol("NodeType.SetUnwrap");
    export const IsAtom = Symbol("NodeType.IsAtom");
    export const IsConstruction = Symbol("NodeType.IsConstruction");
    export const IsComposite = Symbol("NodeType.IsComposite");
    export const QueryConstructionValues = Symbol(
        "NodeType.QueryConstructionValues",
    );
    export const QueryConstructions = Symbol("NodeType.QueryConstructions");
    export const ConstructionConstructor = Symbol(
        "NodeType.ConstructionConstructor",
    );
    export const ConstructionValue = Symbol("NodeType.ConstructionValue");
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

export type SetContainsNode = {
    readonly type: typeof NodeType.SetContains;
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

export type XorNode = {
    readonly type: typeof NodeType.Xor;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type NotNode = {
    readonly type: typeof NodeType.Not;
    readonly operand: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetCountNode = {
    readonly type: typeof NodeType.SetCount;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetUnionNode = {
    readonly type: typeof NodeType.SetUnion;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetIntersectionNode = {
    readonly type: typeof NodeType.SetIntersection;
    readonly first: EverythingObject;
    readonly second: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetFilterNode = {
    readonly type: typeof NodeType.SetFilter;
    readonly set: EverythingObject;
    readonly filterFunction: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetMapNode = {
    readonly type: typeof NodeType.SetMap;
    readonly set: EverythingObject;
    readonly mapperFunction: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetFoldNode = {
    readonly type: typeof NodeType.SetFold;
    readonly set: EverythingObject;
    readonly folder: EverythingObject;
    readonly initial: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetEveryNode = {
    readonly type: typeof NodeType.SetEvery;
    readonly set: EverythingObject;
    readonly predicate: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetAnyNode = {
    readonly type: typeof NodeType.SetAny;
    readonly set: EverythingObject;
    readonly predicate: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type NewSetNode = {
    readonly type: typeof NodeType.NewSet;
    readonly items: readonly EverythingObject[];
    readonly rest: readonly EverythingObject[];
};

export type NewCompositeNode = {
    readonly type: typeof NodeType.NewComposite;
    readonly properties: readonly EverythingObject[];
    readonly rest: readonly EverythingObject[];
};

export type QueryAtomsWithPropertyNode = {
    readonly type: typeof NodeType.QueryAtomsWithProperty;
    readonly property: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type QueryAtomsWithConstructorNode = {
    readonly type: typeof NodeType.QueryAtomsWithConstructor;
    readonly constructor: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type PropertiesOfNode = {
    readonly type: typeof NodeType.PropertiesOf;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type HasValueNode = {
    readonly type: typeof NodeType.HasValue;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type HasPropertyNode = {
    readonly type: typeof NodeType.HasProperty;
    readonly subject: EverythingObject;
    readonly property: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type SetUnwrapNode = {
    readonly type: typeof NodeType.SetUnwrap;
    readonly set: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type IsAtomNode = {
    readonly type: typeof NodeType.IsAtom;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type IsConstructionNode = {
    readonly type: typeof NodeType.IsConstruction;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type IsCompositeNode = {
    readonly type: typeof NodeType.IsComposite;
    readonly inner: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type QueryConstructionValuesNode = {
    readonly type: typeof NodeType.QueryConstructionValues;
    readonly object: EverythingObject;
    readonly propertyConstructor: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type QueryConstructionsNode = {
    readonly type: typeof NodeType.QueryConstructions;
    readonly constructor: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type ConstructionConstructorNode = {
    readonly type: typeof NodeType.ConstructionConstructor;
    readonly construction: EverythingObject;
    readonly rest: readonly EverythingObject[];
};

export type ConstructionValueNode = {
    readonly type: typeof NodeType.ConstructionValue;
    readonly construction: EverythingObject;
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
    | SetContainsNode
    | AndNode
    | OrNode
    | XorNode
    | NotNode
    | SetCountNode
    | SetUnionNode
    | SetIntersectionNode
    | SetFilterNode
    | SetMapNode
    | SetFoldNode
    | SetEveryNode
    | SetAnyNode
    | NewSetNode
    | NewCompositeNode
    | QueryAtomsWithPropertyNode
    | QueryAtomsWithConstructorNode
    | PropertiesOfNode
    | HasValueNode
    | HasPropertyNode
    | SetUnwrapNode
    | IsAtomNode
    | IsConstructionNode
    | IsCompositeNode
    | QueryConstructionValuesNode
    | QueryConstructionsNode
    | ConstructionConstructorNode
    | ConstructionValueNode
    | IfNode
    | CallNode
    | ParameterNode;

export const NotANode = Symbol("NotANode");
