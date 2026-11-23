import {createMemo} from "solid-js";

import {useAppState, useClipboard} from "@/context";
import type {EverythingObject} from "@/model";
import type {DeepReadonly} from "@/util";

import {objectToBlock} from "./blocks";
import ObjectViewContent from "./blocks/ObjectViewContent";
import {handleClipboardKeyDown} from "./editing/clipboardShortcuts";
import {handleKeyDown} from "./editing/keyboardShortcuts";
import {objectPathKey} from "./focus";
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
    const clipboard = useClipboard();

    const block = () => objectToBlock(props.object);
    const blockOptions = () => appState.layoutOptions().block;

    const widthBudget = createMemo(() => props.widthBudgetInPixels);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            block(),
            widthBudget(),
            appState.layoutOptions(),
        );

    return (
        <div
            onKeyDown={event => {
                // Enter/Escape finish editing a value input. The input's own
                // handler commits and may blur it; return focus to this object
                // view so the selection and keyboard navigation stay active.
                if (
                    (event.key === "Enter" || event.key === "Escape")
                    && !event.isComposing
                    && event.target instanceof HTMLInputElement
                    && event.target.closest("[data-object-view]")
                        === event.currentTarget
                ) {
                    event.currentTarget.focus();
                    return;
                }

                if (
                    handleClipboardKeyDown({
                        event,
                        object: props.object,
                        setObject: props.setObject,
                        clipboard,
                    })
                )
                    return;

                handleKeyDown({
                    event,
                    object: props.object,
                    siblingCount: props.siblingCount,
                    objectSelection: objectSelection,
                    replaceParentWithThis: props.replaceParentWithThis,
                    setObject: props.setObject,
                    parentObjectLayoutMode: props.parentObjectLayoutMode,
                    leftArrowSiblingIndex: props.leftArrowSiblingIndex,
                });
            }}
            onFocusIn={event => {
                // `focusin` bubbles, so only the innermost object view of the
                // focused element updates the cursor.
                if (
                    event.target.closest("[data-object-view]")
                    === event.currentTarget
                ) {
                    objectSelection.setPath(props.path);
                }
            }}
            data-object-view=""
            data-object-path={objectPathKey(props.path)}
            tabIndex={objectSelection.isCursor(props.path) ? 0 : -1}
            style={{
                "margin-left": `${props.indentLeft ? blockOptions().setElementIndentInPixels : 0}px`,
                "border-width": `${blockOptions().blockBorderWidthInPixels}px`,
                gap: `${blockOptions().itemGapInPixels}px`,
                padding: `4px ${blockOptions().blockPaddingRightInPixels}px 4px ${blockOptions().blockPaddingLeftInPixels}px`,
            }}
            class={`flex rounded-xl border-solid border-line-emphasis text-fg outline-none select-none ${objectViewBackgroundClass(block().type)} ${layoutMode() === LayoutMode.Column ? `flex-col ${blockInColumnModeIsItemsCenter(block().type) ? "items-center" : "items-start"}` : "items-center"}`}
        >
            <ObjectViewContent
                block={block()}
                path={props.path}
                setObject={props.setObject}
                widthBudgetInPixels={widthBudget()}
                layoutMode={layoutMode()}
            />
        </div>
    );
};

export default ObjectView;
