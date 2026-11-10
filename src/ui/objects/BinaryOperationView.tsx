import DotIcon from "lucide-solid/icons/dot";
import EqualIcon from "lucide-solid/icons/equal";
import PlusIcon from "lucide-solid/icons/plus";
import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import {ObjectType, type Construction, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type EqualNode,
    type PlusNode,
    type TimesNode,
} from "@/model/nodes";

import DotDotIcon from "../reuse/DotDotIcon";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

const BlockIcon = {
    [NodeType.Times]: DotIcon,
    [NodeType.Plus]: PlusIcon,
    [NodeType.Equal]: EqualIcon,
    [ObjectType.Construction]: DotDotIcon,
};

const getFirst = (block: TimesNode | PlusNode | EqualNode | Construction) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
            return block.first;
        case ObjectType.Construction:
            return block.constructor;
    }
};

const getSecond = (block: TimesNode | PlusNode | EqualNode | Construction) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
            return block.second;
        case ObjectType.Construction:
            return block.value;
    }
};

export default (props: {
    block: TimesNode | PlusNode | EqualNode | Construction;
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
                            switch (props.block.type) {
                                case NodeType.Plus:
                                case NodeType.Times:
                                case NodeType.Equal:
                                    props.setObject?.(
                                        nodeToObject({
                                            ...props.block,
                                            first: newFirst,
                                        }),
                                    );
                                    break;
                                case ObjectType.Construction:
                                    props.setObject?.({
                                        ...props.block,
                                        constructor: newFirst,
                                    });
                                    break;
                            }
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
                            switch (props.block.type) {
                                case NodeType.Times:
                                case NodeType.Plus:
                                case NodeType.Equal:
                                    props.setObject?.(
                                        nodeToObject({
                                            ...props.block,
                                            second: newSecond,
                                        }),
                                    );
                                    break;
                                case ObjectType.Construction:
                                    props.setObject?.({
                                        ...props.block,
                                        value: newSecond,
                                    });
                                    break;
                            }
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
