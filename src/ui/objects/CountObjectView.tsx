import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {nodeToObject, type CountNode} from "@/model/nodes";

import {
    calculateCountNodeOperandWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "./layout";
import {blockIconWidthInPixels} from "./layout/iconWidths";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: CountNode;
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

    const removeNode = () => {
        objectSelection.selectParent();

        props.setObject?.(undefined);
    };

    const replaceWith = (object: EverythingObject) => {
        if (!props.setObject) return;

        objectSelection.selectParent();
        props.setObject(object);
    };

    const changeInner = (newObject: EverythingObject | undefined) => {
        if (newObject === undefined) {
            // A count node without its inner object is meaningless,
            // so remove the whole node.
            removeNode();
        } else {
            props.setObject?.(nodeToObject({...props.block, inner: newObject}));
        }
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
                widthBudgetInPixels={calculateCountNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
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
