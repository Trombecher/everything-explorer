import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type HasValueNode,
    type IsAtomNode,
    type IsSetNode,
    type NotNode,
    type QueryAtomsWithConstructorNode,
    type QueryAtomsWithPropertyNode,
    type QueryConstructionsNode,
    type UnwrapNode,
    type ValuesOfNode,
} from "@/model/nodes";

import AtomsWithConstructorIcon from "../icons/AtomsWithConstructorIcon";
import AtomsWithPropertyIcon from "../icons/AtomsWithPropertyIcon";
import HasValueIcon from "../icons/HasValueIcon";
import IsAtomIcon from "../icons/IsAtomIcon";
import IsSetIcon from "../icons/IsSetIcon";
import NotIcon from "../icons/NotIcon";
import QueryConstructionsIcon from "../icons/QueryConstructionsIcon";
import UnwrapIcon from "../icons/UnwrapIcon";
import ValuesOfIcon from "../icons/ValuesOfIcon";
import {
    calculateLayoutModeOfBlock,
    calculateHasValueNodeOperandWidthBudgetInPixels,
    calculateIsAtomNodeOperandWidthBudgetInPixels,
    calculateIsSetNodeOperandWidthBudgetInPixels,
    calculateNotNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithConstructorNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels,
    calculateQueryConstructionsNodeOperandWidthBudgetInPixels,
    calculateUnwrapNodeOperandWidthBudgetInPixels,
    calculateValuesOfNodeOperandWidthBudgetInPixels,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export type UnaryOperationBlock =
    | HasValueNode
    | IsAtomNode
    | IsSetNode
    | NotNode
    | QueryAtomsWithConstructorNode
    | QueryAtomsWithPropertyNode
    | QueryConstructionsNode
    | ValuesOfNode
    | UnwrapNode;

const BlockIcon = {
    [NodeType.HasValue]: HasValueIcon,
    [NodeType.IsAtom]: IsAtomIcon,
    [NodeType.IsSet]: IsSetIcon,
    [NodeType.Not]: NotIcon,
    [NodeType.QueryAtomsWithConstructor]: AtomsWithConstructorIcon,
    [NodeType.QueryAtomsWithProperty]: AtomsWithPropertyIcon,
    [NodeType.QueryConstructions]: QueryConstructionsIcon,
    [NodeType.ValuesOf]: ValuesOfIcon,
    [NodeType.Unwrap]: UnwrapIcon,
};

const operandOf = (block: UnaryOperationBlock): EverythingObject => {
    switch (block.type) {
        case NodeType.HasValue:
            return block.inner;
        case NodeType.IsAtom:
            return block.inner;
        case NodeType.IsSet:
            return block.inner;
        case NodeType.Not:
            return block.operand;
        case NodeType.QueryAtomsWithConstructor:
            return block.constructor;
        case NodeType.QueryAtomsWithProperty:
            return block.property;
        case NodeType.QueryConstructions:
            return block.constructor;
        case NodeType.ValuesOf:
            return block.inner;
        case NodeType.Unwrap:
            return block.set;
    }
};

const withOperand = (
    block: UnaryOperationBlock,
    operand: EverythingObject,
): EverythingObject => {
    switch (block.type) {
        case NodeType.HasValue:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsAtom:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsSet:
            return nodeToObject({...block, inner: operand});
        case NodeType.Not:
            return nodeToObject({...block, operand});
        case NodeType.QueryAtomsWithConstructor:
            return nodeToObject({...block, constructor: operand});
        case NodeType.QueryAtomsWithProperty:
            return nodeToObject({...block, property: operand});
        case NodeType.QueryConstructions:
            return nodeToObject({...block, constructor: operand});
        case NodeType.ValuesOf:
            return nodeToObject({...block, inner: operand});
        case NodeType.Unwrap:
            return nodeToObject({...block, set: operand});
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
            case NodeType.HasValue:
                return calculateHasValueNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsAtom:
                return calculateIsAtomNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsSet:
                return calculateIsSetNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
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
            case NodeType.QueryAtomsWithConstructor:
                return calculateQueryAtomsWithConstructorNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.QueryConstructions:
                return calculateQueryConstructionsNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.ValuesOf:
                return calculateValuesOfNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.Unwrap:
                return calculateUnwrapNodeOperandWidthBudgetInPixels(
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
