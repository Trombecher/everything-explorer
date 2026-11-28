import DotIcon from "lucide-solid/icons/dot";
import EqualIcon from "lucide-solid/icons/equal";
import HammerIcon from "lucide-solid/icons/hammer";
import PlusIcon from "lucide-solid/icons/plus";
import type {Component} from "solid-js";

import {ObjectType, type Construction, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type AndNode,
    type SetAnyNode,
    type CallNode,
    type HasPropertyNode,
    type SetContainsNode,
    type EqualNode,
    type SetEveryNode,
    type SetFilterNode,
    type SetIntersectionNode,
    type NewConstructionNode,
    type LessNode,
    type SetMapNode,
    type OrNode,
    type PlusNode,
    type QueryConstructionValuesNode,
    type SetDifferenceNode,
    type TimesNode,
    type SetUnionNode,
    type XorNode,
} from "@/model/nodes";

import ConstructionIcon from "../../icons/constructions/ConstructionIcon";
import CallIcon from "../../icons/functions/CallIcon";
import ElementOfIcon from "../../icons/math/ElementOfIcon";
import ExistsIcon from "../../icons/math/ExistsIcon";
import ForAllIcon from "../../icons/math/ForAllIcon";
import IntersectionIcon from "../../icons/math/IntersectionIcon";
import LessThanIcon from "../../icons/math/LessThanIcon";
import SetDifferenceIcon from "../../icons/math/SetDifferenceIcon";
import UnionIcon from "../../icons/math/UnionIcon";
import VeeIcon from "../../icons/math/VeeIcon";
import WedgeIcon from "../../icons/math/WedgeIcon";
import XorIcon from "../../icons/math/XorIcon";
import FilterIcon from "../../icons/query/FilterIcon";
import HasPropertyIcon from "../../icons/query/HasPropertyIcon";
import QueryConstructionValuesIcon from "../../icons/query/QueryConstructionValuesIcon";
import SetMapIcon from "../../icons/query/SetMapIcon";
import ColonIcon from "../../icons/syntax/ColonIcon";

export type BinaryOperationBlock =
    | TimesNode
    | PlusNode
    | EqualNode
    | LessNode
    | SetContainsNode
    | HasPropertyNode
    | AndNode
    | OrNode
    | XorNode
    | SetUnionNode
    | SetIntersectionNode
    | SetDifferenceNode
    | SetFilterNode
    | SetMapNode
    | SetEveryNode
    | SetAnyNode
    | NewConstructionNode
    | QueryConstructionValuesNode
    | CallNode
    | Construction;

export const BlockIcon = {
    [NodeType.Times]: DotIcon,
    [NodeType.Plus]: PlusIcon,
    [NodeType.Equal]: EqualIcon,
    [NodeType.Less]: LessThanIcon,
    [NodeType.SetContains]: ElementOfIcon,
    [NodeType.HasProperty]: HasPropertyIcon,
    [NodeType.And]: WedgeIcon,
    [NodeType.Or]: VeeIcon,
    [NodeType.Xor]: XorIcon,
    [NodeType.SetUnion]: UnionIcon,
    [NodeType.SetIntersection]: IntersectionIcon,
    [NodeType.SetDifference]: SetDifferenceIcon,
    [NodeType.SetFilter]: FilterIcon,
    [NodeType.SetMap]: SetMapIcon,
    [NodeType.SetEvery]: ColonIcon,
    [NodeType.SetAny]: ColonIcon,
    [NodeType.NewConstruction]: ConstructionIcon,
    [NodeType.QueryConstructionValues]: QueryConstructionValuesIcon,
    [NodeType.Call]: CallIcon,
    [ObjectType.Construction]: ConstructionIcon,
};

/**
 * Icons rendered before the first child of a binary operation.
 *
 * This is used by quantifier-like nodes such as `every` and `any`, which read
 * as `prefix set : predicate`.
 */
const BlockPrefixIcon: Partial<
    Record<BinaryOperationBlock["type"], Component<{class?: string}>>
> = {
    [NodeType.SetEvery]: ForAllIcon,
    [NodeType.SetAny]: ExistsIcon,
    [NodeType.NewConstruction]: HammerIcon,
};

export const prefixIconOf = (block: BinaryOperationBlock) =>
    BlockPrefixIcon[block.type];

export const getFirst = (block: BinaryOperationBlock) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
            return block.first;
        case NodeType.SetContains:
            return block.element;
        case NodeType.NewConstruction:
            return block.constructor;
        case NodeType.HasProperty:
            return block.subject;
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
            return block.set;
        case NodeType.QueryConstructionValues:
            return block.object;
        case NodeType.Call:
            return block.callee;
        case ObjectType.Construction:
            return block.constructor;
    }
};

export const getSecond = (block: BinaryOperationBlock) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
            return block.second;
        case NodeType.SetContains:
            return block.set;
        case NodeType.NewConstruction:
            return block.value;
        case NodeType.HasProperty:
            return block.property;
        case NodeType.SetFilter:
            return block.filterFunction;
        case NodeType.SetMap:
            return block.mapperFunction;
        case NodeType.SetEvery:
            return block.predicate;
        case NodeType.SetAny:
            return block.predicate;
        case NodeType.QueryConstructionValues:
            return block.propertyConstructor;
        case NodeType.Call:
            return block.with;
        case ObjectType.Construction:
            return block.value;
    }
};

export const changeBlockFirst = (
    block: BinaryOperationBlock,
    newFirst: EverythingObject,
) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
            return nodeToObject({...block, first: newFirst});
        case NodeType.SetContains:
            return nodeToObject({...block, element: newFirst});
        case NodeType.NewConstruction:
            return nodeToObject({...block, constructor: newFirst});
        case NodeType.HasProperty:
            return nodeToObject({...block, subject: newFirst});
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
            return nodeToObject({...block, set: newFirst});
        case NodeType.QueryConstructionValues:
            return nodeToObject({...block, object: newFirst});
        case NodeType.Call:
            return nodeToObject({...block, callee: newFirst});
        case ObjectType.Construction:
            return {...block, constructor: newFirst};
    }
};

export const changeBlockSecond = (
    block: BinaryOperationBlock,
    newSecond: EverythingObject,
) => {
    switch (block.type) {
        case NodeType.Times:
        case NodeType.Plus:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
            return nodeToObject({...block, second: newSecond});
        case NodeType.SetContains:
            return nodeToObject({...block, set: newSecond});
        case NodeType.NewConstruction:
            return nodeToObject({...block, value: newSecond});
        case NodeType.HasProperty:
            return nodeToObject({...block, property: newSecond});
        case NodeType.SetFilter:
            return nodeToObject({...block, filterFunction: newSecond});
        case NodeType.SetMap:
            return nodeToObject({...block, mapperFunction: newSecond});
        case NodeType.SetEvery:
            return nodeToObject({...block, predicate: newSecond});
        case NodeType.SetAny:
            return nodeToObject({...block, predicate: newSecond});
        case NodeType.QueryConstructionValues:
            return nodeToObject({...block, propertyConstructor: newSecond});
        case NodeType.Call:
            return nodeToObject({...block, with: newSecond});
        case ObjectType.Construction:
            return {...block, value: newSecond};
    }
};
