import HammerIcon from "lucide-solid/icons/hammer";
import {Index} from "solid-js";

import type {EverythingObject} from "@/model";
import {
    type NewCompositeNode,
    type NewSetNode,
    NodeType,
    nodeToObject,
} from "@/model/nodes";

import AngleBracketIcon from "../icons/sets/AngleBracketIcon";
import BraceIcon from "../icons/sets/BraceIcon";
import {useLayoutOptions} from "./atomNames";
import {
    calculateLayoutModeOfBlock,
    calculateNewCollectionChildWidthBudgetInPixels,
    LayoutMode,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

/**
 * The shared view for nodes that construct a collection from their children:
 * `NewSet` and `NewComposite`. They differ only in their delimiters and in
 * whether their children are set items or composite properties.
 */
export default (props: {
    block: NewSetNode | NewCompositeNode;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const layoutOptions = useLayoutOptions();

    const children = () =>
        props.block.type === NodeType.NewSet
            ? props.block.items
            : props.block.properties;

    const withChildren = (
        children: readonly EverythingObject[],
    ): EverythingObject =>
        props.block.type === NodeType.NewSet
            ? nodeToObject({...props.block, items: children})
            : nodeToObject({...props.block, properties: children});

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            layoutOptions,
        );

    const childWidthBudgetInPixels = (index: number) =>
        calculateNewCollectionChildWidthBudgetInPixels(
            props.wholeWidthBudgetInPixels,
            layoutMode(),
            layoutOptions,
            index < children().length - 1,
        );

    const leftDelimiter = () =>
        props.block.type === NodeType.NewSet ? (
            <BraceIcon side="left" />
        ) : (
            <AngleBracketIcon side="left" />
        );

    const rightDelimiter = () =>
        props.block.type === NodeType.NewSet ? (
            <BraceIcon side="right" />
        ) : (
            <AngleBracketIcon side="right" />
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

    const changeChild = (
        index: number,
        newObject: EverythingObject | undefined,
    ) => {
        if (!props.setObject) return;

        if (newObject === undefined) {
            if (children().length === 1) {
                // A new-set or new-composite node without children is
                // meaningless, so remove the whole node.
                removeNode();
                return;
            }

            props.setObject(
                withChildren(children().filter((_, i) => i !== index)),
            );

            if (index === children().length - 1) {
                // The selection would point past the last child.
                objectSelection.selectPreviousSibling();
            }
            // Otherwise the selection keeps its index, which now refers to the
            // next child.
        } else {
            props.setObject(
                withChildren(
                    children().map((child, i) =>
                        i === index ? newObject : child,
                    ),
                ),
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
                {leftDelimiter()}
            </div>
            <Index each={children()}>
                {(child, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
                            replaceParentWithThis={
                                props.setObject && (() => replaceWith(child()))
                            }
                            siblingCount={children().length}
                            object={child()}
                            setObject={
                                props.setObject
                                && (newObject => changeChild(i, newObject))
                            }
                            path={[...props.path, i]}
                            widthBudgetInPixels={childWidthBudgetInPixels(i)}
                        />
                        {i < children().length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            {rightDelimiter()}
        </>
    );
};
