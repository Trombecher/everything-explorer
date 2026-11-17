import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type NotNode,
    type QueryAtomsWithPropertyNode,
} from "@/model/nodes";

import AtomsWithPropertyIcon from "../icons/AtomsWithPropertyIcon";
import NotIcon from "../icons/NotIcon";
import {
    calculateLayoutModeOfBlock,
    calculateNotNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export type UnaryOperationBlock = NotNode | QueryAtomsWithPropertyNode;

const BlockIcon = {
    [NodeType.Not]: NotIcon,
    [NodeType.QueryAtomsWithProperty]: AtomsWithPropertyIcon,
};

const operandOf = (block: UnaryOperationBlock): EverythingObject =>
    block.type === NodeType.Not ? block.operand : block.property;

const withOperand = (
    block: UnaryOperationBlock,
    operand: EverythingObject,
): EverythingObject =>
    nodeToObject(
        block.type === NodeType.Not
            ? {...block, operand}
            : {...block, property: operand},
    );

export default (props: {
    block: UnaryOperationBlock;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const operand = () => operandOf(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            appState.layoutOptions(),
        );

    const operandWidthBudgetInPixels = () =>
        props.block.type === NodeType.Not
            ? calculateNotNodeOperandWidthBudgetInPixels(
                  props.wholeWidthBudgetInPixels,
                  appState.layoutOptions(),
              )
            : calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels(
                  props.wholeWidthBudgetInPixels,
                  appState.layoutOptions(),
              );

    return (
        <>
            <Dynamic component={BlockIcon[props.block.type]} />
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
                            // A unary node without an operand is meaningless,
                            // so remove the whole node.
                            objectSelection.selectParent();

                            props.setObject?.(undefined);
                        } else {
                            props.setObject?.(
                                withOperand(props.block, newOperand),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={operandWidthBudgetInPixels()}
            />
        </>
    );
};
