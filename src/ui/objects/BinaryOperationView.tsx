import DotIcon from "lucide-solid/icons/dot";
import PlusIcon from "lucide-solid/icons/plus";
import {Dynamic} from "solid-js/web";

import {ObjectType, type Construction, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type PlusNode,
    type TimesNode,
} from "@/model/nodes";

import DotDotIcon from "../reuse/DotDotIcon";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
    type LayoutOptions,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

const BlockIcon = {
    [NodeType.Times]: DotIcon,
    [NodeType.Plus]: PlusIcon,
    [ObjectType.Construction]: DotDotIcon,
};

const getFirst = (block: TimesNode | PlusNode | Construction) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
            return block.first;
        case ObjectType.Construction:
            return block.constructor;
    }
};

const getSecond = (block: TimesNode | PlusNode | Construction) => {
    switch (block.type) {
        case NodeType.Plus:
        case NodeType.Times:
            return block.second;
        case ObjectType.Construction:
            return block.value;
    }
};

export default (props: {
    block: TimesNode | PlusNode | Construction;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject) => void) | undefined;
    layoutOptions: LayoutOptions;
}) => {
    const objectSelection = useObjectSelection();

    const first = () => getFirst(props.block);
    const second = () => getSecond(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            props.layoutOptions,
        );

    return (
        <>
            <ObjectView
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
                    props.layoutOptions,
                )}
                layoutOptions={props.layoutOptions}
            />
            <Dynamic component={BlockIcon[props.block.type]} />
            <ObjectView
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
                    props.layoutOptions,
                )}
                layoutOptions={props.layoutOptions}
            />
        </>
    );
};
