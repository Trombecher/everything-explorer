import HammerIcon from "lucide-solid/icons/hammer";
import {Index} from "solid-js";

import type {EverythingObject} from "@/model";
import {nodeToObject, type NewCompositeNode} from "@/model/nodes";

import AngleBracketIcon from "../icons/sets/AngleBracketIcon";
import {useLayoutOptions} from "./atomNames";
import {
    calculateLayoutModeOfBlock,
    calculateNewCollectionChildWidthBudgetInPixels,
    LayoutMode,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: NewCompositeNode;
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

    const propertyWidthBudgetInPixels = (index: number) =>
        calculateNewCollectionChildWidthBudgetInPixels(
            props.wholeWidthBudgetInPixels,
            layoutMode(),
            layoutOptions,
            index < props.block.properties.length - 1,
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

    const changeProperty = (
        index: number,
        newObject: EverythingObject | undefined,
    ) => {
        if (!props.setObject) return;

        if (newObject === undefined) {
            if (props.block.properties.length === 1) {
                // A new-composite node without properties is meaningless, so
                // remove the whole node.
                removeNode();
                return;
            }

            props.setObject(
                nodeToObject({
                    ...props.block,
                    properties: props.block.properties.filter(
                        (_, i) => i !== index,
                    ),
                }),
            );

            if (index === props.block.properties.length - 1) {
                // The selection would point past the last property.
                objectSelection.selectPreviousSibling();
            }
            // Otherwise the selection keeps its index, which now refers to the
            // next property.
        } else {
            props.setObject(
                nodeToObject({
                    ...props.block,
                    properties: props.block.properties.map((property, i) =>
                        i === index ? newObject : property,
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
                <AngleBracketIcon side="left" />
            </div>
            <Index each={props.block.properties}>
                {(property, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
                            replaceParentWithThis={
                                props.setObject
                                && (() => replaceWith(property()))
                            }
                            siblingCount={props.block.properties.length}
                            object={property()}
                            setObject={
                                props.setObject
                                && (newObject => changeProperty(i, newObject))
                            }
                            path={[...props.path, i]}
                            widthBudgetInPixels={propertyWidthBudgetInPixels(i)}
                        />
                        {i < props.block.properties.length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            <AngleBracketIcon side="right" />
        </>
    );
};
