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

/**
 * The atom names that the currently computed width cache entry depends on.
 */
let nameRecorder: Map<bigint, string | undefined> | undefined;

/**
 * Reads an atom name and records it for the enclosing width cache entry.
 */
const atomNameOf = (
    options: LayoutOptions,
    value: bigint,
): string | undefined => {
    const name = options.atomName(value);
    nameRecorder?.set(value, name);

    return name;
};

const calculateRowLayoutWidthOfBlockWithoutCache = (
    block: Block,
    options: LayoutOptions,
): number => {
    switch (block.type) {
        case NodeType.Function:
            return rowLayoutWidth(
                [
                    functionParameterNameFieldWidthInPixels
                        + options.block.itemGapInPixels
                        + blockIconWidthInPixels.mapsTo,
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
        case NodeType.SetContains:
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
        case NodeType.Xor:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.xor,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.SetUnion:
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
        case NodeType.SetIntersection:
            return rowLayoutWidth(
                [
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.first),
                        options,
                    ),
                    blockIconWidthInPixels.intersection,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.second),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.SetFilter:
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
        case NodeType.SetMap:
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
        case NodeType.SetEvery:
        case NodeType.SetAny:
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
        case NodeType.SetFold:
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
        case NodeType.PropertiesOf:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.propertiesOf,
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
        case NodeType.SetUnwrap:
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
        case NodeType.IsAtom:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.isAtom,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.IsConstruction:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.isConstruction,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.IsComposite:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.isComposite,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.inner),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.SetCount:
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
                        objectToBlock(block.object),
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
        case NodeType.ConstructionConstructor:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.constructionConstructor,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.construction),
                        options,
                    ),
                ],
                options,
            );
        case NodeType.ConstructionValue:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.constructionValue,
                    calculateRowLayoutWidthOfBlock(
                        objectToBlock(block.construction),
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
        case NodeType.NewSet:
            return rowLayoutWidth(
                [
                    blockIconWidthInPixels.hammer
                        + options.block.itemGapInPixels
                        + blockIconWidthInPixels.brace,
                    ...block.items.map(
                        (value, index) =>
                            calculateRowLayoutWidthOfBlock(
                                objectToBlock(value),
                                options,
                            )
                            + (index < block.items.length - 1
                                ? measureStaticText(",")
                                : 0),
                    ),
                    blockIconWidthInPixels.brace,
                ],
                options,
            );
        case NodeType.Parameter:
            return rowLayoutWidth(
                [blockIconWidthInPixels.x, 192 + options.block.itemGapInPixels],
                options,
            );
        case ObjectType.Composite:
        case ObjectType.Set: {
            const collection =
                block.type === ObjectType.Composite
                    ? block.properties
                    : block.items;
            const delimiterWidthInPixels =
                block.type === ObjectType.Composite
                    ? blockIconWidthInPixels.angleBracket
                    : blockIconWidthInPixels.brace;

            return rowLayoutWidth(
                [
                    delimiterWidthInPixels,
                    ...collection.map(
                        (child, index) =>
                            calculateRowLayoutWidthOfBlock(
                                objectToBlock(child),
                                options,
                            )
                            + (index < collection.length - 1
                                ? measureStaticText(",")
                                : 0),
                    ),
                    delimiterWidthInPixels,
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
            const atomName = atomNameOf(options, block.value);

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

type RowLayoutWidthCacheEntry = {
    readonly width: number;

    /**
     * The atom names this width depends on, including the names of nested
     * blocks that were served from the cache.
     */
    readonly names: ReadonlyMap<bigint, string | undefined>;
};

/**
 * (Very important) cache of block widths in row mode.
 */
const rowLayoutWidthCache = new WeakMap<
    LayoutOptions,
    WeakMap<Block, RowLayoutWidthCacheEntry>
>();

const namesAreCurrent = (
    names: ReadonlyMap<bigint, string | undefined>,
    layoutOptions: LayoutOptions,
): boolean => {
    for (const [value, name] of names) {
        if (atomNameOf(layoutOptions, value) !== name) return false;
    }

    return true;
};

export const calculateRowLayoutWidthOfBlock = (
    block: Block,
    layoutOptions: LayoutOptions,
): number => {
    let layoutWidthsCache = rowLayoutWidthCache.get(layoutOptions);

    if (layoutWidthsCache === undefined) {
        layoutWidthsCache = new WeakMap();
        rowLayoutWidthCache.set(layoutOptions, layoutWidthsCache);
    }

    const cachedEntry = layoutWidthsCache.get(block);

    if (
        cachedEntry !== undefined
        && namesAreCurrent(cachedEntry.names, layoutOptions)
    ) {
        return cachedEntry.width;
    }

    const outerRecorder = nameRecorder;
    const names = new Map<bigint, string | undefined>();
    nameRecorder = names;

    try {
        const width = calculateRowLayoutWidthOfBlockWithoutCache(
            block,
            layoutOptions,
        );

        layoutWidthsCache.set(block, {width, names});

        return width;
    } finally {
        nameRecorder = outerRecorder;

        // A parent entry depends on every name its subtree read. Nested cache
        // hits record their names directly into this map; a nested
        // recomputation records into its own map and merges it here.
        if (outerRecorder !== undefined) {
            for (const [value, name] of names) outerRecorder.set(value, name);
        }
    }
};
