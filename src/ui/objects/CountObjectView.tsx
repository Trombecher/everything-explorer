import {defaultObject, type EverythingObject} from "@/model";
import {nodeToObject, type SetCountNode} from "@/model/nodes";

import {useLayoutOptions} from "./atomNames";
import {
    calculateSetCountNodeOperandWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "./layout";
import {blockIconWidthInPixels} from "./layout/iconWidths";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: SetCountNode;
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

    const changeInner = (newObject: EverythingObject | undefined) => {
        // Deleting the inner object replaces it with the empty object instead
        // of removing the count node.
        props.setObject?.(
            nodeToObject({...props.block, inner: newObject ?? defaultObject}),
        );
    };

    const barStyle = {width: `${blockIconWidthInPixels.countBar}px`};

    return (
        <>
            <div
                aria-hidden="true"
                class="mx-0.5 shrink-0 self-stretch rounded-full bg-current [corner-shape:round]"
                style={barStyle}
            />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject && (() => replaceWith(props.block.inner))
                }
                siblingCount={1}
                object={props.block.inner}
                setObject={
                    props.setObject && (newObject => changeInner(newObject))
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={calculateSetCountNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                )}
            />
            <div
                aria-hidden="true"
                class="mx-0.5 shrink-0 self-stretch rounded-full bg-current [corner-shape:round]"
                style={barStyle}
            />
        </>
    );
};
