/**
 * Resolves the display name of an atom for layout measurement.
 */
export type AtomName = (value: bigint) => string | undefined;

export type LayoutOptions = {
    readonly block: BlockLayoutOptions;

    /**
     * The display name of an atom, or `undefined` if it is not known.
     */
    readonly atomName: AtomName;
};

export type BlockLayoutOptions = {
    readonly itemGapInPixels: number;
    readonly blockBorderWidthInPixels: number;
    readonly blockPaddingLeftInPixels: number;
    readonly blockPaddingRightInPixels: number;
    readonly setElementIndentInPixels: number;
    readonly integerInputPaddingX: number;
};

export const defaultBlockLayoutOptions = {
    blockBorderWidthInPixels: 1,
    blockPaddingLeftInPixels: 4,
    blockPaddingRightInPixels: 4,
    integerInputPaddingX: 8,
    itemGapInPixels: 4,
    setElementIndentInPixels: 16,
} as const satisfies BlockLayoutOptions;
