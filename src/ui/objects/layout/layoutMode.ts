import {NodeType} from "@/model/nodes";

import type {Block} from "../blocks";
import {childCountOfBlock} from "./childCount";
import type {LayoutOptions} from "./options";
import {calculateRowLayoutWidthOfBlock} from "./rowWidth";

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
        // A new-set node with a single value still has three visual parts
        // (hammer, braces and value), so column mode can reduce its width.
        (childCountOfBlock(block) >= 2 || block.type === NodeType.NewSet)
        && calculateRowLayoutWidthOfBlock(block, layoutOptions)
            > widthBudgetInPixels
    ) {
        // The block cannot fit its row layout, and column mode can reduce
        // its width.
        return LayoutMode.Column;
    } else {
        return LayoutMode.Row;
    }
};
