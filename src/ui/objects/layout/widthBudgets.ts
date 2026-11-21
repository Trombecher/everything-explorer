import type {EverythingSet} from "@/model";

import {
    blockIconWidthInPixels,
    countBarMarginXInPixels,
    functionParameterNameFieldWidthInPixels,
} from "./iconWidths";
import {calculateLayoutModeOfBlock, LayoutMode} from "./layoutMode";
import type {LayoutOptions} from "./options";
import {measureStaticText} from "./textMeasurement";

export const calculateSetElementWidthBudgetInPixels = (
    set: EverythingSet,
    widthBudgetInPixelsForSet: number,
    layoutOptions: LayoutOptions,
    elementIndex: number,
): number => {
    switch (
        calculateLayoutModeOfBlock(
            set,
            widthBudgetInPixelsForSet,
            layoutOptions,
        )
    ) {
        case LayoutMode.Column: {
            // {
            //   element,
            //   ...
            // }

            const isNotLastElement = elementIndex < set.elements.length - 1;

            const chrome =
                layoutOptions.block.blockBorderWidthInPixels * 2
                + layoutOptions.block.blockPaddingLeftInPixels
                + layoutOptions.block.blockPaddingRightInPixels
                + layoutOptions.block.setElementIndentInPixels
                + (isNotLastElement ? measureStaticText(",") : 0);

            return Math.max(0, widthBudgetInPixelsForSet - chrome);
        }
        case LayoutMode.Row: {
            // { element, ... }

            // The layout algorithm has determined that this set can be
            // layed out in row mode within the available width budget.
            //
            // Under the second rule of block layout, this means that all descendants
            // must be in row mode and everything fits. Therefore, we can
            // tell each child, it has infinite space because it can't
            // exceed this space.
            return Infinity;
        }
    }
};

export const calculateFunctionBodyWidthBudgetInPixels = (
    widthBudgetInPixelsForFunction: number,
    layoutOptions: LayoutOptions,
) =>
    Math.max(
        0,
        widthBudgetInPixelsForFunction
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - layoutOptions.block.itemGapInPixels * 2
            - blockIconWidthInPixels.mapsTo
            - functionParameterNameFieldWidthInPixels,
    );

export const binaryBlockSlotWidthBudgetInPixels = (
    layoutModeOfBinaryBlock: LayoutMode,
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
) => {
    switch (layoutModeOfBinaryBlock) {
        case LayoutMode.Column:
            return Math.max(
                0,
                widthBudgetInPixels
                    - layoutOptions.block.blockBorderWidthInPixels * 2
                    - layoutOptions.block.blockPaddingLeftInPixels
                    - layoutOptions.block.blockPaddingRightInPixels,
            );
        case LayoutMode.Row:
            // See `calculateSetElementWidthBudgetInPixels`
            // for why this is chosen.
            return Infinity;
    }
};

const ifNodeInnerWidthBudgetInPixels = (
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

export const calculateIfConditionWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutModeOfIf: LayoutMode,
    layoutOptions: LayoutOptions,
): number =>
    layoutModeOfIf === LayoutMode.Row
        ? Infinity
        : ifNodeInnerWidthBudgetInPixels(widthBudgetInPixels, layoutOptions);

export const calculateIfBranchChildWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutModeOfIf: LayoutMode,
    layoutOptions: LayoutOptions,
): number =>
    layoutModeOfIf === LayoutMode.Row
        ? Infinity
        : Math.max(
              0,
              ifNodeInnerWidthBudgetInPixels(widthBudgetInPixels, layoutOptions)
                  - blockIconWidthInPixels.check
                  - layoutOptions.block.itemGapInPixels,
          );

export const calculateNotNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.not
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateQueryAtomsWithPropertyNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.atomsWithProperty
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateQueryConstructionsNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.queryConstructions
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateConstructionConstructorNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.constructionConstructor
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateConstructionValueNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.constructionValue
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateQueryAtomsWithConstructorNodeOperandWidthBudgetInPixels =
    (widthBudgetInPixels: number, layoutOptions: LayoutOptions): number =>
        Math.max(
            0,
            widthBudgetInPixels
                - layoutOptions.block.blockBorderWidthInPixels * 2
                - layoutOptions.block.blockPaddingLeftInPixels
                - layoutOptions.block.blockPaddingRightInPixels
                - blockIconWidthInPixels.atomsWithConstructor
                - layoutOptions.block.itemGapInPixels,
        );

export const calculateValuesOfNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.valuesOf
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateHasValueNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.hasValue
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateUnwrapNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.unwrap
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateIsAtomNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.isAtom
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateIsConstructionNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.isConstruction
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateIsSetNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.isSet
            - layoutOptions.block.itemGapInPixels,
    );

export const calculateCountNodeOperandWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - (blockIconWidthInPixels.countBar + countBarMarginXInPixels * 2)
                * 2
            - layoutOptions.block.itemGapInPixels * 2,
    );

export const calculateLiteralNodeInnerObjectWidthBudgetInPixels = (
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): number =>
    Math.max(
        0,
        widthBudgetInPixels
            - layoutOptions.block.blockBorderWidthInPixels * 2
            - layoutOptions.block.blockPaddingLeftInPixels
            - layoutOptions.block.blockPaddingRightInPixels
            - blockIconWidthInPixels.quote
            - layoutOptions.block.itemGapInPixels,
    );
