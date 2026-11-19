import {defaultObject, type EverythingObject} from "@/model";
import {
    NodeType,
    type Node,
    type QueryAtomsWithConstructorNode,
    type QueryAtomsWithPropertyNode,
    type QueryConstructionValuesNode,
    type QueryConstructionsNode,
} from "@/model/nodes";

export type QueryNode =
    | QueryAtomsWithPropertyNode
    | QueryAtomsWithConstructorNode
    | QueryConstructionsNode
    | QueryConstructionValuesNode;

/**
 * The query node variants in the order in which the digit hotkeys select them.
 * Index `n` corresponds to the hotkey `n + 1`.
 */
export const queryNodeVariants = [
    NodeType.QueryAtomsWithProperty,
    NodeType.QueryAtomsWithConstructor,
    NodeType.QueryConstructions,
    NodeType.QueryConstructionValues,
] as const;

export type QueryNodeVariant = (typeof queryNodeVariants)[number];

export const isQueryNode = (node: Node): node is QueryNode =>
    node.type === NodeType.QueryAtomsWithProperty
    || node.type === NodeType.QueryAtomsWithConstructor
    || node.type === NodeType.QueryConstructions
    || node.type === NodeType.QueryConstructionValues;

/**
 * The children of a query node, in positional order. Growing a node fills the
 * missing children with {@link defaultObject}; shrinking a node drops the
 * trailing children. Children are only kept because they are the user's data,
 * not because they necessarily make sense for the new variant.
 */
const queryNodeChildren = (
    node: QueryNode,
): readonly [EverythingObject, EverythingObject] => {
    switch (node.type) {
        case NodeType.QueryAtomsWithProperty:
            return [node.property, defaultObject];
        case NodeType.QueryAtomsWithConstructor:
        case NodeType.QueryConstructions:
            return [node.constructor, defaultObject];
        case NodeType.QueryConstructionValues:
            return [node.set, node.propertyConstructor];
    }
};

/**
 * Changes the variant of a query node while keeping as much information as
 * possible. Children are mapped positionally and the extra properties of the
 * source node are retained.
 */
export const retypeQueryNode = (
    node: QueryNode,
    variant: QueryNodeVariant,
): QueryNode => {
    const [first, second] = queryNodeChildren(node);

    switch (variant) {
        case NodeType.QueryAtomsWithProperty:
            return {type: variant, property: first, rest: node.rest};
        case NodeType.QueryAtomsWithConstructor:
            return {type: variant, constructor: first, rest: node.rest};
        case NodeType.QueryConstructions:
            return {type: variant, constructor: first, rest: node.rest};
        case NodeType.QueryConstructionValues:
            return {
                type: variant,
                set: first,
                propertyConstructor: second,
                rest: node.rest,
            };
    }
};
