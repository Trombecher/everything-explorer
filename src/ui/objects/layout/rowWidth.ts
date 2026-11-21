import {ObjectType} from "@/model";
import {NodeType} from "@/model/nodes";

import {objectToBlock, type Block} from "../blocks";
import {escapeCharacterForDisplay} from "../scalarFormatting";
import {
    blockIconWidthInPixels,
    countBarMarginXInPixels,
    functionParameterNameFieldWidthInPixels,
} from "./iconWidths";
import type {LayoutOptions} from "./options";
import {measureStaticText, measureText} from "./textMeasurement";

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

const calculateRowLayoutWidthOfBlockWithoutCache = (
    block: Block,
    options: LayoutOptions,
): number => {
    switch (block.type) {
        case NodeType.Function:
            return rowLayoutWidth(
                [
                    functionParameterNameFieldWidthInPixels,
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
        case NodeType.Equal:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.equals,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Less:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.lessThan,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Contains:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.element),
                        options,
                    ),
                    blockIconWidthInPixels.elementOf,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.And:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.wedge,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Or:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.vee,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Not:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.not,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.operand),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Union:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.union,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Filter:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                    blockIconWidthInPixels.filter,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.filterFunction),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Map:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                    blockIconWidthInPixels.map,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.mapperFunction),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Every:
        case NodeType.Any:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.prefix,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                    blockIconWidthInPixels.colon,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.predicate),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Fold:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                    blockIconWidthInPixels.fold,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.folder),
                        options,
                    ),
                    blockIconWidthInPixels.squarePlay,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.initial),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.QueryAtomsWithProperty:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.atomsWithProperty,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.property),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.QueryAtomsWithConstructor:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.atomsWithConstructor,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.constructor),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.ValuesOf:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.valuesOf,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.HasValue:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.hasValue,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Unwrap:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.unwrap,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.Count:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.countBar
                        + countBarMarginXInPixels * 2,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                    blockIconWidthInPixels.countBar
                        + countBarMarginXInPixels * 2,
                ],
                options,
            );
        case NodeType.QueryConstructionValues:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.set),
                        options,
                    ),
                    blockIconWidthInPixels.queryConstructionValues,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.propertyConstructor),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.QueryConstructions:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.queryConstructions,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.constructor),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.If:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.condition),
                        options,
                    ),
                    Math.max(
                        blockIconWidthInPixels.check
                            + options.block.itemGapInPixels
                            + calculateRowLayoutWidthOfBlock(
                                objectToBlock(block.thenBranch),
                                options,
                            ),
                        blockIconWidthInPixels.x
                            + options.block.itemGapInPixels
                            + calculateRowLayoutWidthOfBlock(
                                objectToBlock(block.otherwiseBranch),
                                options,
                            ),
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
        case NodeType.Call:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.callee),
                        options,
                    ),
                    blockIconWidthInPixels.call,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.with),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.FunctionSelf:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.functionSelf,
                    192 + options.block.itemGapInPixels,
                ],
                options,
            );
        case NodeType.Parameter:
            return rowLayoutWidth(
                [blockIconWidthInPixels.x, 192 + options.block.itemGapInPixels],
                options,
            );
        case ObjectType.Set: {
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.brace,
                    ...block.elements.map(
                        (element, index) =>
                            calculateRowLayoutWidthOfBlock(
                                objectToBlock(element),
                                options,
                            )
                            + (index < block.elements.length - 1
                                ? measureStaticText(",")
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
                [
                    measureStaticText('"')
                        + measureText(block.text)
                        + measureStaticText('"'),
                ],
                options,
            );
        case ObjectType.Character:
            return rowLayoutWidth(
                [
                    measureStaticText("'")
                        + measureText(escapeCharacterForDisplay(block.value))
                        + measureStaticText("'"),
                ],
                options,
            );
        case ObjectType.Byte:
            return rowLayoutWidth(
                [
                    measureStaticText("x"),
                    measureText("FF") + options.block.integerInputPaddingX,
                ],
                options,
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
