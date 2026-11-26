import SquarePlayIcon from "lucide-solid/icons/square-play";

import {defaultObject, type EverythingObject} from "@/model";
import {nodeToObject, type SetFoldNode} from "@/model/nodes";

import FoldIcon from "../../../icons/query/FoldIcon";
import {useLayoutOptions} from "../../atomNames";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "../../layout";
import ObjectView from "../../ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "../../selection";

export default (props: {
    block: SetFoldNode;
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

    const replaceWith = (object: EverythingObject) => {
        if (!props.setObject) return;

        objectSelection.selectParent();
        props.setObject(object);
    };

    const changeChild = (
        key: "set" | "folder" | "initial",
        newObject: EverythingObject | undefined,
    ) => {
        // Deleting a child replaces it with the empty object instead of
        // removing the fold node.
        props.setObject?.(
            nodeToObject({...props.block, [key]: newObject ?? defaultObject}),
        );
    };

    const childWidthBudgetInPixels = () =>
        binaryBlockSlotWidthBudgetInPixels(
            layoutMode(),
            props.wholeWidthBudgetInPixels,
            layoutOptions,
        );

    return (
        <>
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject && (() => replaceWith(props.block.set))
                }
                siblingCount={3}
                object={props.block.set}
                setObject={
                    props.setObject
                    && (newObject => changeChild("set", newObject))
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={childWidthBudgetInPixels()}
            />
            <FoldIcon />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject && (() => replaceWith(props.block.folder))
                }
                siblingCount={3}
                object={props.block.folder}
                setObject={
                    props.setObject
                    && (newObject => changeChild("folder", newObject))
                }
                path={[...props.path, 1]}
                widthBudgetInPixels={childWidthBudgetInPixels()}
            />
            <SquarePlayIcon />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject && (() => replaceWith(props.block.initial))
                }
                siblingCount={3}
                object={props.block.initial}
                setObject={
                    props.setObject
                    && (newObject => changeChild("initial", newObject))
                }
                path={[...props.path, 2]}
                widthBudgetInPixels={childWidthBudgetInPixels()}
            />
        </>
    );
};
