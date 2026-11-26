import {blockIconWidthInPixels, countBarMarginXInPixels} from "./iconWidths";
import type {LayoutOptions} from "./options";

/**
 * The width available inside a block, excluding its own chrome.
 */
const innerWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels,
    );

/**
 * The width available for the operand of a block with a leading icon.
 */
const iconOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
    iconWidthInPixels: number,
): number =>
    Math.max(
        0,
        innerWidthBudgetInPixels(widthBudgetInPixels, layoutOptions)
            - iconWidthInPixels
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateNotNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.not,
    );

export const calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.atomsWithProperty,
    );

export const calculateQueryConstructionsNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.queryConstructions,
    );

export const calculateConstructionConstructorNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.constructionConstructor,
    );

export const calculateConstructionValueNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.constructionValue,
    );

export const calculateQueryAtomsWithConstructorNodeOperandWidthBudgetInPixels =
    (widthBudgetInPixels: number, layoutOptions: LayoutOptions): number =>
        iconOperandWidthBudgetInPixels(
            widthBudgetInPixels,
            layoutOptions,
            blockIconWidthInPixels.atomsWithConstructor,
        );

export const calculatePropertiesOfNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.propertiesOf,
    );

export const calculateHasValueNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.hasValue,
    );

export const calculateSetUnwrapNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.unwrap,
    );

export const calculateIsAtomNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.isAtom,
    );

export const calculateIsConstructionNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.isConstruction,
    );

export const calculateIsCompositeNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    iconOperandWidthBudgetInPixels(
        widthBudgetInPixels,
        layoutOptions,
        blockIconWidthInPixels.isComposite,
    );

export const calculateSetCountNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        innerWidthBudgetInPixels(widthBudgetInPixels, layoutOptions)
            - (blockIconWidthInPixels.countBar + countBarMarginXInPixels * 2)
                * 2
            - layoutOptions.block.itemGapInPixels * 2,
    );
