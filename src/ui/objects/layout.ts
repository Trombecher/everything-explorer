import type {EverythingSet} from "@/model";
import {ObjectType} from "@/model";
import {NodeType} from "@/model/nodes";

import {objectToBlock, type Block} from "./blocks";

/**
 * The layout mode of a block.
 *
 * # Layout Rules Of Blocks
 *
 * 1. Every object layout defaults to row mode, switches to column mode if it does
 *    not fit in the available width budget.
 * 2. All children of row mode objects must also be layed out in row mode.
 */
export namespace LayoutMode {
    export const Row = Symbol("LayoutMode.Row");
    export const Column = Symbol("LayoutMode.Column");
}

export type LayoutMode = typeof LayoutMode.Column | typeof LayoutMode.Row;

let textMeasurer: HTMLSpanElement | undefined;

const textMeasurerElement = (): HTMLSpanElement => {
    if (textMeasurer) return textMeasurer;

    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.left = "-10000px";
    span.style.top = "0";
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.style.pointerEvents = "none";
    document.body.appendChild(span);

    textMeasurer = span;
    return span;
};

/**
 * Width of a single-line text run in the font of the object views.
 */
const measureText = (text: string): number => {
    const span = textMeasurerElement();
    span.textContent = text;

    const width = span.getBoundingClientRect().width;
    return width;
};

const blockIconWidthInPixels = {
    atom: 24,
    construction: 24,
    constructionConstructor: 24,
    constructionValue: 24,
    dot: 24,
    elementOf: 24,
    equals: 24,
    exists: 24,
    filter: 48,
    forAll: 24,
    map: 48,
    minus: 24,
    plus: 24,
    quote: 24,
    unwrap: 48,
    wedge: 24,
    x: 24,
    brace: 12,
    blackboardZ: 24,
    mapsTo: 48,
} as const satisfies Record<string, 12 | 24 | 32 | 40 | 48 | 56 | 64>;

export type LayoutOptions = {
    readonly block: BlockLayoutOptions;
    readonly atomNames: ReadonlyMap<bigint, string>;
};

export type BlockLayoutOptions = {
    readonly itemGapInPixels: number;
    readonly blockBorderWidthInPixels: number;
    readonly blockPaddingLeftInPixels: number;
    readonly blockPaddingRightInPixels: number;
    readonly setElementIndentInPixels: number;
    readonly integerInputPaddingX: number;
};

const rowLayoutWidth = (
    itemWidthsInPixels: readonly number[],
    options: LayoutOptions,
): number =>
    options.block.blockBorderWidthInPixels
    + options.block.blockPaddingLeftInPixels
    + itemWidthsInPixels.reduce((sum, widthInPixels) => sum + widthInPixels, 0)
    + options.block.itemGapInPixels * Math.max(0, itemWidthsInPixels.length - 1)
    + options.block.blockPaddingRightInPixels
    + options.block.blockBorderWidthInPixels;

/**
 * Text that ObjectView renders for object types that have no view yet.
 */
const NOT_IMPLEMENTED_TEXT = "NOT IMPL";

export const defaultBlockLayoutOptions = {
    blockBorderWidthInPixels: 1,
    blockPaddingLeftInPixels: 4,
    blockPaddingRightInPixels: 4,
    integerInputPaddingX: 8,
    itemGapInPixels: 8,
    setElementIndentInPixels: 16,
} as const satisfies BlockLayoutOptions;

const calculateRowLayoutWidthOfBlockWithoutCache = (
    block: Block,
    options: LayoutOptions,
): number => {
    switch (block.type) {
        case NodeType.Function:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.x,
                    blockIconWidthInPixels.mapsTo,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.body),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Literal:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.quote,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.object),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Plus:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.plus,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Times:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.dot,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case ObjectType.Set: {
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.brace,
                    ...block.elements.map(
                        (element, index) =>
                            calculateRowLayoutWidthOfBlock(element, options)
                            + (index < block.elements.length - 1
                                ? measureText(",")
                                : 0),
                    ),
                    blockIconWidthInPixels.brace,
                ],
                options,
            );
        }
        case ObjectType.Construction:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.construction,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.constructor),
                        options,
                    ),
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.value),
                        options,
                    ),
                ],
                options,
            );
        case ObjectType.Atom:
            const atomName = options.atomNames.get(block.value);

            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.atom,
                    measureText(atomName ?? String(block.value)),
                ],
                options,
            );
        case ObjectType.Integer:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.blackboardZ,
                    measureText(String(block.value))
                        + options.block.integerInputPaddingX,
                ],
                options,
            );
        case ObjectType.Text:
            return rowLayoutWidth(
                [measureText('"') + measureText(block.text) + measureText('"')],
                options,
            );
        case ObjectType.Character:
        case ObjectType.Byte:
            return (
                measureText(NOT_IMPLEMENTED_TEXT)
                + options.block.blockBorderWidthInPixels * 2
                + options.block.blockPaddingLeftInPixels
                + options.block.blockPaddingRightInPixels
            );
    }
};

/**
 * (Very important) cache of block widths in row mode.
 */
const rowLayoutWidthCache = new WeakMap<
    LayoutOptions,
    WeakMap<Block, number>
>();

export const calculateRowLayoutWidthOfBlock = (
    block: Block,
    layoutOptions: LayoutOptions,
): number => {
    let layoutWidthsCache = rowLayoutWidthCache.get(layoutOptions);

    if (layoutWidthsCache === undefined) {
        layoutWidthsCache = new WeakMap();
        rowLayoutWidthCache.set(layoutOptions, layoutWidthsCache);
    }

    const cachedWidth = layoutWidthsCache.get(block);
    if (cachedWidth !== undefined) return cachedWidth;

    const width = calculateRowLayoutWidthOfBlockWithoutCache(
        block,
        layoutOptions,
    );
    layoutWidthsCache.set(block, width);
    return width;
};

export const childCountOfBlock = (block: Block): number => {
    switch (block.type) {
        case ObjectType.Atom:
        case ObjectType.Byte:
        case ObjectType.Character:
        case ObjectType.Integer:
        case ObjectType.Text:
            return 0;
        case NodeType.Function:
        case NodeType.Literal:
            return 1;
        case ObjectType.Construction:
        case NodeType.Plus:
        case NodeType.Times:
            return 2;
        case ObjectType.Set:
            return block.elements.length;
    }
};

/**
 * Calculates the layout mode for the given block, width budget and layout
 * options.
 */
export const calculateLayoutModeOfBlock = (
    block: Block,
    widthBudgetInPixels: number,
    layoutOptions: LayoutOptions,
): LayoutMode => {
    if (widthBudgetInPixels === Infinity) {
        // There is infinite space for this block,
        // so we can just choose row layout.
        return LayoutMode.Row;
    }

    if (
        childCountOfBlock(block) >= 2
        && calculateRowLayoutWidthOfBlock(block, layoutOptions)
            > widthBudgetInPixels
    ) {
        // Block has two or more children and exceeds width budget.
        return LayoutMode.Column;
    } else {
        return LayoutMode.Row;
    }
};

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
                + (isNotLastElement ? measureText(",") : 0);

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
            - measureText("x"),
    );
