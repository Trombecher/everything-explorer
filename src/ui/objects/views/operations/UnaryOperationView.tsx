import {Dynamic} from "solid-js/web";

import {defaultObject, type EverythingObject} from "@/model";
import {
    nodeToObject,
    NodeType,
    type ConstructionConstructorNode,
    type ConstructionValueNode,
    type HasASetItemNode,
    type IsAtomNode,
    type IsConstructionNode,
    type IsCompositeNode,
    type IsNodeNode,
    type NotNode,
    type QueryAtomsWithConstructorNode,
    type QueryAtomsWithPropertyNode,
    type QueryConstructionsNode,
    type SetUnwrapNode,
    type PropertiesOfNode,
} from "@/model/nodes";

import AtomsWithConstructorIcon from "../../../icons/atoms/AtomsWithConstructorIcon";
import AtomsWithPropertyIcon from "../../../icons/atoms/AtomsWithPropertyIcon";
import IsAtomIcon from "../../../icons/atoms/IsAtomIcon";
import ConstructionConstructorIcon from "../../../icons/constructions/ConstructionConstructorIcon";
import ConstructionValueIcon from "../../../icons/constructions/ConstructionValueIcon";
import IsConstructionIcon from "../../../icons/constructions/IsConstructionIcon";
import NotIcon from "../../../icons/math/NotIcon";
import HasASetItemIcon from "../../../icons/query/HasASetItemIcon";
import QueryConstructionsIcon from "../../../icons/query/QueryConstructionsIcon";
import SearchValuesIcon from "../../../icons/query/SearchValuesIcon";
import IsCompositeIcon from "../../../icons/sets/IsCompositeIcon";
import IsNodeIcon from "../../../icons/sets/IsNodeIcon";
import UnwrapIcon from "../../../icons/sets/UnwrapIcon";
import {useLayoutOptions} from "../../atomNames";
import {
    calculateLayoutModeOfBlock,
    calculateConstructionConstructorNodeOperandWidthBudgetInPixels,
    calculateConstructionValueNodeOperandWidthBudgetInPixels,
    calculateHasASetItemNodeOperandWidthBudgetInPixels,
    calculateIsAtomNodeOperandWidthBudgetInPixels,
    calculateIsConstructionNodeOperandWidthBudgetInPixels,
    calculateIsCompositeNodeOperandWidthBudgetInPixels,
    calculateIsNodeNodeOperandWidthBudgetInPixels,
    calculateNotNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithConstructorNodeOperandWidthBudgetInPixels,
    calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels,
    calculateQueryConstructionsNodeOperandWidthBudgetInPixels,
    calculateSetUnwrapNodeOperandWidthBudgetInPixels,
    calculatePropertiesOfNodeOperandWidthBudgetInPixels,
} from "../../layout";
import ObjectView from "../../ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "../../selection";

export type UnaryOperationBlock =
    | ConstructionConstructorNode
    | ConstructionValueNode
    | HasASetItemNode
    | IsAtomNode
    | IsConstructionNode
    | IsCompositeNode
    | IsNodeNode
    | NotNode
    | QueryAtomsWithConstructorNode
    | QueryAtomsWithPropertyNode
    | QueryConstructionsNode
    | PropertiesOfNode
    | SetUnwrapNode;

const BlockIcon = {
    [NodeType.ConstructionConstructor]: ConstructionConstructorIcon,
    [NodeType.ConstructionValue]: ConstructionValueIcon,
    [NodeType.HasASetItem]: HasASetItemIcon,
    [NodeType.IsAtom]: IsAtomIcon,
    [NodeType.IsConstruction]: IsConstructionIcon,
    [NodeType.IsComposite]: IsCompositeIcon,
    [NodeType.IsNode]: IsNodeIcon,
    [NodeType.Not]: NotIcon,
    [NodeType.QueryAtomsWithConstructor]: AtomsWithConstructorIcon,
    [NodeType.QueryAtomsWithProperty]: AtomsWithPropertyIcon,
    [NodeType.QueryConstructions]: QueryConstructionsIcon,
    [NodeType.PropertiesOf]: SearchValuesIcon,
    [NodeType.SetUnwrap]: UnwrapIcon,
};

const operandOf = (block: UnaryOperationBlock): EverythingObject => {
    switch (block.type) {
        case NodeType.ConstructionConstructor:
            return block.construction;
        case NodeType.ConstructionValue:
            return block.construction;
        case NodeType.HasASetItem:
            return block.inner;
        case NodeType.IsAtom:
            return block.inner;
        case NodeType.IsConstruction:
            return block.inner;
        case NodeType.IsComposite:
            return block.inner;
        case NodeType.IsNode:
            return block.inner;
        case NodeType.Not:
            return block.operand;
        case NodeType.QueryAtomsWithConstructor:
            return block.constructor;
        case NodeType.QueryAtomsWithProperty:
            return block.property;
        case NodeType.QueryConstructions:
            return block.constructor;
        case NodeType.PropertiesOf:
            return block.inner;
        case NodeType.SetUnwrap:
            return block.set;
    }
};

const withOperand = (
    block: UnaryOperationBlock,
    operand: EverythingObject,
): EverythingObject => {
    switch (block.type) {
        case NodeType.ConstructionConstructor:
            return nodeToObject({...block, construction: operand});
        case NodeType.ConstructionValue:
            return nodeToObject({...block, construction: operand});
        case NodeType.HasASetItem:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsAtom:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsConstruction:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsComposite:
            return nodeToObject({...block, inner: operand});
        case NodeType.IsNode:
            return nodeToObject({...block, inner: operand});
        case NodeType.Not:
            return nodeToObject({...block, operand});
        case NodeType.QueryAtomsWithConstructor:
            return nodeToObject({...block, constructor: operand});
        case NodeType.QueryAtomsWithProperty:
            return nodeToObject({...block, property: operand});
        case NodeType.QueryConstructions:
            return nodeToObject({...block, constructor: operand});
        case NodeType.PropertiesOf:
            return nodeToObject({...block, inner: operand});
        case NodeType.SetUnwrap:
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
    const layoutOptions = useLayoutOptions();

    const operand = () => operandOf(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            layoutOptions,
        );

    const operandWidthBudgetInPixels = () => {
        switch (props.block.type) {
            case NodeType.ConstructionConstructor:
                return calculateConstructionConstructorNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.ConstructionValue:
                return calculateConstructionValueNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.HasASetItem:
                return calculateHasASetItemNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsAtom:
                return calculateIsAtomNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsConstruction:
                return calculateIsConstructionNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsComposite:
                return calculateIsCompositeNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.IsNode:
                return calculateIsNodeNodeOperandWidthBudgetInPixels(
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
            case NodeType.PropertiesOf:
                return calculatePropertiesOfNodeOperandWidthBudgetInPixels(
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                );
            case NodeType.SetUnwrap:
                return calculateSetUnwrapNodeOperandWidthBudgetInPixels(
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
                        // Deleting the operand replaces it with the empty
                        // object instead of removing the unary node, so the
                        // surrounding chain stays intact.
                        props.setObject?.(
                            withOperand(
                                props.block,
                                newOperand ?? defaultObject,
                            ),
                        );
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={operandWidthBudgetInPixels()}
            />
        </>
    );
};
