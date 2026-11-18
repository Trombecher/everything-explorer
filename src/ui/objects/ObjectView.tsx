import {createEffect} from "solid-js";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import type {DeepReadonly} from "@/util";

import {objectToBlock} from "./blocks";
import ObjectViewContent from "./blocks/ObjectViewContent";
import {handleKeyDown} from "./editing/keyboardShortcuts";
import {calculateLayoutModeOfBlock, LayoutMode} from "./layout";
import {
    blockInColumnModeIsItemsCenter,
    objectViewBackgroundClass,
} from "./objectViewAppearance";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export const ObjectView = (props: {
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    /**
     * How many siblings this object view has **INCLUDING ITSELF**.
     */
    siblingCount: number;

    /**
     * Available width for this view's border box in px.
     */
    widthBudgetInPixels: number;

    /**
     * Tries to replace the parent with this object. Selection is handled by
     * this function.
     *
     * The object view calling this function is selected.
     */
    replaceParentWithThis: (() => void) | undefined;

    /**
     * The layout mode of the parent object.
     */
    parentObjectLayoutMode: LayoutMode;

    /**
     * Overrides which sibling the left arrow selects. This is needed for blocks
     * whose children are laid out both vertically and horizontally.
     */
    leftArrowSiblingIndex?: number;

    /**
     * Whether to apply margin-left for indentation.
     */
    indentLeft: boolean;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const block = () => objectToBlock(props.object);
    const blockOptions = () => appState.layoutOptions().block;

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            block(),
            props.widthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <div
            onKeyDown={event =>
                handleKeyDown({
                    event,
                    object: props.object,
                    siblingCount: props.siblingCount,
                    objectSelection: objectSelection,
                    replaceParentWithThis: props.replaceParentWithThis,
                    setObject: props.setObject,
                    parentObjectLayoutMode: props.parentObjectLayoutMode,
                    leftArrowSiblingIndex: props.leftArrowSiblingIndex,
                })
            }
            ref={div => {
                createEffect(() => {
                    if (objectSelection.isSelected(props.path)) {
                        div.focus();
                    }
                });
            }}
            onFocus={() => {
                objectSelection.setPath(props.path);
            }}
            tabIndex={objectSelection.isSelected(props.path) ? 0 : -1}
            data-selected={objectSelection.dataSelected(props.path)}
            style={{
                "margin-left": `${props.indentLeft ? blockOptions().setElementIndentInPixels : 0}px`,
                "border-width": `${blockOptions().blockBorderWidthInPixels}px`,
                gap: `${blockOptions().itemGapInPixels}px`,
                padding: `4px ${blockOptions().blockPaddingRightInPixels}px 4px ${blockOptions().blockPaddingLeftInPixels}px`,
            }}
            class={`flex rounded-xl border-solid border-neutral-400 text-neutral-800 select-none data-selected:border-blue-500 data-selected:bg-blue-500! data-selected:text-always-white ${objectViewBackgroundClass(block().type)} ${layoutMode() === LayoutMode.Column ? `flex-col ${blockInColumnModeIsItemsCenter(block().type) ? "items-center" : "items-start"}` : "items-center"}`}
        >
            <ObjectViewContent
                block={block()}
                path={props.path}
                setObject={props.setObject}
                widthBudgetInPixels={props.widthBudgetInPixels}
                layoutMode={layoutMode()}
            />
        </div>
    );
};

export default ObjectView;
