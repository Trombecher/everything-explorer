import {ObjectType, type Object} from ".";
import {Atom} from "./atoms";

export namespace NodeType {
    export const Function = Symbol();
    export const Plus = Symbol();
    export const Literal = Symbol();
}

export type NodeType = Node["type"];

export type FunctionNode = {
    readonly type: typeof NodeType.Function;
    readonly body: Object;
    readonly rest: readonly Object[];
};

export type PlusNode = {
    readonly type: typeof NodeType.Plus;
    readonly first: Object;
    readonly second: Object;
    readonly rest: readonly Object[];
};

export type LiteralNode = {
    readonly type: typeof NodeType.Literal;
    readonly object: Object;
    readonly rest: readonly Object[];
};

export type Node = FunctionNode | PlusNode | LiteralNode;

export const objectToNode = (object: Object): Node | undefined => {
    if (object.type !== ObjectType.Set) return;

    if (object.elements.length === 1) {
        const element = object.elements[0]!;

        if (element.type === ObjectType.Construction) {
            if (element.constructor.type === ObjectType.Atom) {
                if (element.constructor.value === Atom.NodeFunction.value) {
                    return {
                        type: NodeType.Function,
                        body: element.value,
                        rest: [],
                    };
                } else if (
                    element.constructor.value === Atom.NodeLiteral.value
                ) {
                    return {
                        type: NodeType.Literal,
                        object: element.value,
                        rest: [],
                    };
                }
            }
        }
    } else if (object.elements.length === 2) {
        // TODO: add node detection
    }

    return undefined;
};
