import CheckIcon from "lucide-solid/icons/check";
import XIcon from "lucide-solid/icons/x";

import {defaultObject, type EverythingObject} from "@/model";
import {nodeToObject, type IfNode} from "@/model/nodes";

import {useLayoutOptions} from "../../atomNames";
import {
    calculateIfBranchChildWidthBudgetInPixels,
    calculateIfConditionWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
    LayoutMode,
} from "../../layout";
import ObjectView from "../../ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "../../selection";

const IfBranchRow = (props: {
    icon: "check" | "x";
    object: EverythingObject;
    path: ObjectSelectionPath;
    widthBudgetInPixels: number;
    replaceParentWithThis: (() => void) | undefined;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    leftArrowSiblingIndex: number | undefined;
}) => {
    // One row of the stacked branches, with its icon in front of the child.
    const layoutOptions = useLayoutOptions();

    const itemGap = () => `${layoutOptions.block.itemGapInPixels}px`;

    return (
        <div class="flex items-center" style={{gap: itemGap()}}>
            {props.icon === "check" ? <CheckIcon /> : <XIcon />}
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={LayoutMode.Column}
                replaceParentWithThis={props.replaceParentWithThis}
                siblingCount={3}
                object={props.object}
                setObject={props.setObject}
                path={props.path}
                widthBudgetInPixels={props.widthBudgetInPixels}
                leftArrowSiblingIndex={props.leftArrowSiblingIndex}
            />
        </div>
    );
};

export default (props: {
    block: IfNode;
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

    const itemGap = () => `${layoutOptions.block.itemGapInPixels}px`;

    const replaceWith = (object: EverythingObject) => {
        if (!props.setObject) return;

        objectSelection.selectParent();
        props.setObject(object);
    };

    const changeChild = (
        key: "condition" | "thenBranch" | "otherwiseBranch",
        newObject: EverythingObject | undefined,
    ) => {
        // Deleting a child replaces it with the empty object instead of
        // removing the if node.
        props.setObject?.(
            nodeToObject({...props.block, [key]: newObject ?? defaultObject}),
        );
    };

    return (
        <>
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => replaceWith(props.block.condition))
                }
                siblingCount={3}
                object={props.block.condition}
                setObject={
                    props.setObject
                    && (newObject => changeChild("condition", newObject))
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={calculateIfConditionWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutMode(),
                    layoutOptions,
                )}
            />
            <div class="flex flex-col items-start" style={{gap: itemGap()}}>
                <IfBranchRow
                    icon="check"
                    object={props.block.thenBranch}
                    path={[...props.path, 1]}
                    widthBudgetInPixels={calculateIfBranchChildWidthBudgetInPixels(
                        props.wholeWidthBudgetInPixels,
                        layoutMode(),
                        layoutOptions,
                    )}
                    replaceParentWithThis={
                        props.setObject
                        && (() => replaceWith(props.block.thenBranch))
                    }
                    setObject={
                        props.setObject
                        && (newObject => changeChild("thenBranch", newObject))
                    }
                    leftArrowSiblingIndex={
                        layoutMode() === LayoutMode.Row ? 0 : undefined
                    }
                />
                <IfBranchRow
                    icon="x"
                    object={props.block.otherwiseBranch}
                    path={[...props.path, 2]}
                    widthBudgetInPixels={calculateIfBranchChildWidthBudgetInPixels(
                        props.wholeWidthBudgetInPixels,
                        layoutMode(),
                        layoutOptions,
                    )}
                    replaceParentWithThis={
                        props.setObject
                        && (() => replaceWith(props.block.otherwiseBranch))
                    }
                    setObject={
                        props.setObject
                        && (newObject =>
                            changeChild("otherwiseBranch", newObject))
                    }
                    leftArrowSiblingIndex={
                        layoutMode() === LayoutMode.Row ? 0 : undefined
                    }
                />
            </div>
        </>
    );
};
