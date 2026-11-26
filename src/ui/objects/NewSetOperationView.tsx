import HammerIcon from "lucide-solid/icons/hammer";
import {Index} from "solid-js";

import type {EverythingObject} from "@/model";
import {nodeToObject, type NewSetNode} from "@/model/nodes";

import BraceIcon from "../icons/sets/BraceIcon";
import {useLayoutOptions} from "./atomNames";
import {
    calculateLayoutModeOfBlock,
    calculateNewSetItemWidthBudgetInPixels,
    LayoutMode,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: NewSetNode;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const layoutOptions = useLayoutOptions();

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            layoutOptions,
        );

    const itemWidthBudgetInPixels = (index: number) =>
        calculateNewSetItemWidthBudgetInPixels(
            props.wholeWidthBudgetInPixels,
            layoutMode(),
            layoutOptions,
            index < props.block.items.length - 1,
        );

    const removeNode = () => {
        objectSelection.selectParent();

        props.setObject?.(undefined);
    };

    const replaceWith = (object: EverythingObject) => {
        if (!props.setObject) return;

        objectSelection.selectParent();
        props.setObject(object);
    };

    const changeItem = (
        index: number,
        newObject: EverythingObject | undefined,
    ) => {
        if (!props.setObject) return;

        if (newObject === undefined) {
            if (props.block.items.length === 1) {
                // A new-set node without items is meaningless, so remove the
                // whole node.
                removeNode();
                return;
            }

            props.setObject(
                nodeToObject({
                    ...props.block,
                    items: props.block.items.filter((_, i) => i !== index),
                }),
            );

            if (index === props.block.items.length - 1) {
                // The selection would point past the last item.
                objectSelection.selectPreviousSibling();
            }
            // Otherwise the selection keeps its index, which now refers to the
            // next item.
        } else {
            props.setObject(
                nodeToObject({
                    ...props.block,
                    items: props.block.items.map((item, i) =>
                        i === index ? newObject : item,
                    ),
                }),
            );
        }
    };

    return (
        <>
            <div
                class="flex items-center"
                style={{gap: `${layoutOptions.block.itemGapInPixels}px`}}
            >
                <HammerIcon />
                <BraceIcon side="left" />
            </div>
            <Index each={props.block.items}>
                {(item, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
                            replaceParentWithThis={
                                props.setObject && (() => replaceWith(item()))
                            }
                            siblingCount={props.block.items.length}
                            object={item()}
                            setObject={
                                props.setObject
                                && (newObject => changeItem(i, newObject))
                            }
                            path={[...props.path, i]}
                            widthBudgetInPixels={itemWidthBudgetInPixels(i)}
                        />
                        {i < props.block.items.length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            <BraceIcon side="right" />
        </>
    );
};
