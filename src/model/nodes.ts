import type {Object} from ".";

export namespace NodeType {
    export const Function = Symbol();
    export const Plus = Symbol();
    export const Literal = Symbol();
}

export type NodeType = Node["type"];

export type FunctionNode = {
    readonly type: typeof NodeType.Function;
    readonly body: Node;
};

export type PlusNode = {
    readonly type: typeof NodeType.Plus;
    readonly first: Node;
    readonly second: Node;
};

export type LiteralNode = {
    readonly type: typeof NodeType.Literal;
    readonly object: Object;
};

export type Node = FunctionNode | PlusNode | LiteralNode;
