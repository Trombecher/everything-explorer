import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {nodeToObject, type NotNode} from "@/model/nodes";

import NotIcon from "../icons/NotIcon";
import {
    calculateLayoutModeOfBlock,
    calculateNotNodeOperandWidthBudgetInPixels,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: NotNode;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const operand = () => props.block.operand;

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <>
            <NotIcon />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(operand());
                    })
                }
                siblingCount={1}
                object={operand()}
                setObject={
                    props.setObject
                    && (newOperand => {
                        if (newOperand === undefined) {
                            // A not node without an operand is meaningless,
                            // so remove the whole node.
                            objectSelection.selectParent();

                            props.setObject?.(undefined);
                        } else {
                            props.setObject?.(
                                nodeToObject({
                                    ...props.block,
                                    operand: newOperand,
                                }),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={calculateNotNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
                )}
            />
        </>
    );
};
