import DotIcon from "lucide-solid/icons/dot";
import EqualIcon from "lucide-solid/icons/equal";
import PlusIcon from "lucide-solid/icons/plus";

import {ObjectType, type Construction, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type AndNode,
    type CallNode,
    type ContainsNode,
    type EqualNode,
    type FilterNode,
    type LessNode,
    type MapNode,
    type OrNode,
    type PlusNode,
    type QueryConstructionValuesNode,
    type TimesNode,
    type UnionNode,
} from "@/model/nodes";

import CallIcon from "../../icons/CallIcon";
import DotDotIcon from "../../icons/DotDotIcon";
import ElementOfIcon from "../../icons/ElementOfIcon";
import FilterIcon from "../../icons/FilterIcon";
import LessThanIcon from "../../icons/LessThanIcon";
import QueryConstructionValuesIcon from "../../icons/QueryConstructionValuesIcon";
import SetMapIcon from "../../icons/SetMapIcon";
import UnionIcon from "../../icons/UnionIcon";
import VeeIcon from "../../icons/VeeIcon";
import WedgeIcon from "../../icons/WedgeIcon";

export type BinaryOperationBlock =
    | TimesNode
    | PlusNode
    | EqualNode
    | LessNode
    | ContainsNode
    | AndNode
    | OrNode
    | UnionNode
    | FilterNode
    | MapNode
    | QueryConstructionValuesNode
    | CallNode
    | Construction;

export const BlockIcon = {
    [NodeType.Times]: DotIcon,
    [NodeType.Plus]: PlusIcon,
    [NodeType.Equal]: EqualIcon,
    [NodeType.Less]: LessThanIcon,
    [NodeType.Contains]: ElementOfIcon,
    [NodeType.And]: WedgeIcon,
    [NodeType.Or]: VeeIcon,
    [NodeType.Union]: UnionIcon,
    [NodeType.Filter]: FilterIcon,
    [NodeType.Map]: SetMapIcon,
    [NodeType.QueryConstructionValues]: QueryConstructionValuesIcon,
    [NodeType.Call]: CallIcon,
    [ObjectType.Construction]: DotDotIcon,
};

export const getFirst = (block: BinaryOperationBlock) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
            return block.first;
        case NodeType.Contains:
            return block.element;
        case NodeType.Filter:
        case NodeType.Map:
        case NodeType.QueryConstructionValues:
            return block.set;
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
        case NodeType.Union:
            return block.second;
        case NodeType.Contains:
            return block.set;
        case NodeType.Filter:
            return block.filterFunction;
        case NodeType.Map:
            return block.mapperFunction;
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
        case NodeType.Union:
            return nodeToObject({...block, first: newFirst});
        case NodeType.Contains:
            return nodeToObject({...block, element: newFirst});
        case NodeType.Filter:
        case NodeType.Map:
        case NodeType.QueryConstructionValues:
            return nodeToObject({...block, set: newFirst});
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
        case NodeType.Union:
            return nodeToObject({...block, second: newSecond});
        case NodeType.Contains:
            return nodeToObject({...block, set: newSecond});
        case NodeType.Filter:
            return nodeToObject({...block, filterFunction: newSecond});
        case NodeType.Map:
            return nodeToObject({...block, mapperFunction: newSecond});
        case NodeType.QueryConstructionValues:
            return nodeToObject({...block, propertyConstructor: newSecond});
        case NodeType.Call:
            return nodeToObject({...block, with: newSecond});
        case ObjectType.Construction:
            return {...block, value: newSecond};
    }
};
