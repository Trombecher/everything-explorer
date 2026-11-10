import DotIcon from "lucide-solid/icons/dot";
import EqualIcon from "lucide-solid/icons/equal";
import PlusIcon from "lucide-solid/icons/plus";
import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import {ObjectType, type Construction, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type AndNode,
    type ContainsNode,
    type EqualNode,
    type FilterNode,
    type OrNode,
    type PlusNode,
    type TimesNode,
    type UnionNode,
} from "@/model/nodes";

import DotDotIcon from "../icons/DotDotIcon";
import ElementOfIcon from "../icons/ElementOfIcon";
import FilterIcon from "../icons/FilterIcon";
import UnionIcon from "../icons/UnionIcon";
import VeeIcon from "../icons/VeeIcon";
import WedgeIcon from "../icons/WedgeIcon";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

type BinaryOperationBlock =
    | TimesNode
    | PlusNode
    | EqualNode
    | ContainsNode
    | AndNode
    | OrNode
    | UnionNode
    | FilterNode
    | Construction;

const BlockIcon = {
    [NodeType.Times]: DotIcon,
    [NodeType.Plus]: PlusIcon,
    [NodeType.Equal]: EqualIcon,
    [NodeType.Contains]: ElementOfIcon,
    [NodeType.And]: WedgeIcon,
    [NodeType.Or]: VeeIcon,
    [NodeType.Union]: UnionIcon,
    [NodeType.Filter]: FilterIcon,
    [ObjectType.Construction]: DotDotIcon,
};

const getFirst = (block: BinaryOperationBlock) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
            return block.first;
        case NodeType.Contains:
            return block.element;
        case NodeType.Filter:
            return block.set;
        case ObjectType.Construction:
            return block.constructor;
    }
};

const getSecond = (block: BinaryOperationBlock) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
            return block.second;
        case NodeType.Contains:
            return block.set;
        case NodeType.Filter:
            return block.filterFunction;
        case ObjectType.Construction:
            return block.value;
    }
};

const changeBlockFirst = (
    block: BinaryOperationBlock,
    newFirst: EverythingObject,
) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
            return nodeToObject({...block, first: newFirst});
        case NodeType.Contains:
            return nodeToObject({...block, element: newFirst});
        case NodeType.Filter:
            return nodeToObject({...block, set: newFirst});
        case ObjectType.Construction:
            return {...block, constructor: newFirst};
    }
};

const changeBlockSecond = (
    block: BinaryOperationBlock,
    newSecond: EverythingObject,
) => {
    switch (block.type) {
        case NodeType.Times:
        case NodeType.Plus:
        case NodeType.Equal:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
            return nodeToObject({...block, second: newSecond});
        case NodeType.Contains:
            return nodeToObject({...block, set: newSecond});
        case NodeType.Filter:
            return nodeToObject({...block, filterFunction: newSecond});
        case ObjectType.Construction:
            return {...block, value: newSecond};
    }
};

export default (props: {
    block: BinaryOperationBlock;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const first = () => getFirst(props.block);
    const second = () => getSecond(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <>
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(first());
                    })
                }
                siblingCount={2}
                object={first()}
                setObject={
                    props.setObject
                    && (newFirst => {
                        if (newFirst === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(second());
                        } else {
                            props.setObject?.(
                                changeBlockFirst(props.block, newFirst),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
                )}
            />
            <Dynamic component={BlockIcon[props.block.type]} />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(second());
                    })
                }
                siblingCount={2}
                object={second()}
                setObject={
                    props.setObject
                    && (newSecond => {
                        if (newSecond === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(first());
                        } else {
                            props.setObject?.(
                                changeBlockSecond(props.block, newSecond),
                            );
                        }
                    })
                }
                path={[...props.path, 1]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
                )}
            />
        </>
    );
};
