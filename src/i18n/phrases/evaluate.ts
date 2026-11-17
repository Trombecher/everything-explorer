const Evaluate = Symbol();
const Result = Symbol();
const EvaluateFailed = Symbol();
const LoadMore = Symbol();
const LazyResultHint = Symbol();
const AllResultsLoaded = Symbol();
const LoadMoreFailed = Symbol();

export const evaluatePhrases = {
    Evaluate,
    Result,
    EvaluateFailed,
    LoadMore,
    LazyResultHint,
    AllResultsLoaded,
    LoadMoreFailed,
} as const;

export type EvaluateTranslationArguments = {
    [Evaluate]: undefined;
    [Result]: undefined;
    [EvaluateFailed]: undefined;
    [LoadMore]: undefined;
    [LazyResultHint]: undefined;
    [AllResultsLoaded]: undefined;
    [LoadMoreFailed]: undefined;
};
