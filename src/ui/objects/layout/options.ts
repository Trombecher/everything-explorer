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

export const defaultBlockLayoutOptions = {
    blockBorderWidthInPixels: 1,
    blockPaddingLeftInPixels: 4,
    blockPaddingRightInPixels: 4,
    integerInputPaddingX: 8,
    itemGapInPixels: 8,
    setElementIndentInPixels: 16,
} as const satisfies BlockLayoutOptions;
