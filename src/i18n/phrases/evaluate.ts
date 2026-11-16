const Evaluate = Symbol();
const Result = Symbol();
const EvaluateFailed = Symbol();

export const evaluatePhrases = {Evaluate, Result, EvaluateFailed} as const;

export type EvaluateTranslationArguments = {
    [Evaluate]: undefined;
    [Result]: undefined;
    [EvaluateFailed]: undefined;
};
