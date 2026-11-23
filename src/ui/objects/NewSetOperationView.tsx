import HammerIcon from "lucide-solid/icons/hammer";
import {Index} from "solid-js";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {nodeToObject, type NewSetNode} from "@/model/nodes";

import BraceIcon from "../icons/sets/BraceIcon";
import {
    calculateLayoutModeOfBlock,
    calculateNewSetValueWidthBudgetInPixels,
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
    const appState = useAppState();

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            appState.layoutOptions(),
        );

    const valueWidthBudgetInPixels = (index: number) =>
        calculateNewSetValueWidthBudgetInPixels(
            props.wholeWidthBudgetInPixels,
            layoutMode(),
            appState.layoutOptions(),
            index < props.block.values.length - 1,
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

    const changeValue = (
        index: number,
        newObject: EverythingObject | undefined,
    ) => {
        if (!props.setObject) return;

        if (newObject === undefined) {
            if (props.block.values.length === 1) {
                // A new-set node without values is meaningless, so remove the
                // whole node.
                removeNode();
                return;
            }

            props.setObject(
                nodeToObject({
                    ...props.block,
                    values: props.block.values.filter((_, i) => i !== index),
                }),
            );

            if (index === props.block.values.length - 1) {
                // The selection would point past the last value.
                objectSelection.selectPreviousSibling();
            }
            // Otherwise the selection keeps its index, which now refers to the
            // next value.
        } else {
            props.setObject(
                nodeToObject({
                    ...props.block,
                    values: props.block.values.map((value, i) =>
                        i === index ? newObject : value,
                    ),
                }),
            );
        }
    };

    return (
        <>
            <div
                class="flex items-center"
                style={{
                    gap: `${appState.layoutOptions().block.itemGapInPixels}px`,
                }}
            >
                <HammerIcon />
                <BraceIcon side="left" />
            </div>
            <Index each={props.block.values}>
                {(value, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
                            replaceParentWithThis={
                                props.setObject && (() => replaceWith(value()))
                            }
                            siblingCount={props.block.values.length}
                            object={value()}
                            setObject={
                                props.setObject
                                && (newObject => changeValue(i, newObject))
                            }
                            path={[...props.path, i]}
                            widthBudgetInPixels={valueWidthBudgetInPixels(i)}
                        />
                        {i < props.block.values.length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            <BraceIcon side="right" />
        </>
    );
};
