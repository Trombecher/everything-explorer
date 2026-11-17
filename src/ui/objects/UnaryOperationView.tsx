import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type NotNode,
    type QueryAtomsWithPropertyNode,
    type ValuesOfNode,
} from "@/model/nodes";

import AtomsWithPropertyIcon from "../icons/AtomsWithPropertyIcon";
import NotIcon from "../icons/NotIcon";
import ValuesOfIcon from "../icons/ValuesOfIcon";
import {
    calculateLayoutModeOfBlock,
    calculateNotNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels,
    calculateValuesOfNodeOperandWidthBudgetInPixels,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export type UnaryOperationBlock =
    | NotNode
    | QueryAtomsWithPropertyNode
    | ValuesOfNode;

const BlockIcon = {
    [NodeType.Not]: NotIcon,
    [NodeType.QueryAtomsWithProperty]: AtomsWithPropertyIcon,
    [NodeType.ValuesOf]: ValuesOfIcon,
};

const operandOf = (block: UnaryOperationBlock): EverythingObject => {
    switch (block.type) {
        case NodeType.Not:
            return block.operand;
        case NodeType.QueryAtomsWithProperty:
            return block.property;
        case NodeType.ValuesOf:
            return block.inner;
    }
};

const withOperand = (
    block: UnaryOperationBlock,
    operand: EverythingObject,
): EverythingObject => {
    switch (block.type) {
        case NodeType.Not:
            return nodeToObject({...block, operand});
        case NodeType.QueryAtomsWithProperty:
            return nodeToObject({...block, property: operand});
        case NodeType.ValuesOf:
            return nodeToObject({...block, inner: operand});
    }
};

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

    const operandWidthBudgetInPixels = () => {
        const layoutOptions = appState.layoutOptions();

        switch (props.block.type) {
            case NodeType.Not:
                return calculateNotNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.QueryAtomsWithProperty:
                return calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.ValuesOf:
                return calculateValuesOfNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
        }
    };

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
