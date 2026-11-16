const ParameterName = Symbol();
const NoEnclosingFunction = Symbol();
const OutOfRange = Symbol();
const FunctionDepth = Symbol();
const Self = Symbol();
const NotImplemented = Symbol();
const ObjectPlaceholder = Symbol();

export const objectsPhrases = {
    ParameterName,
    NoEnclosingFunction,
    OutOfRange,
    FunctionDepth,
    Self,
    NotImplemented,
    ObjectPlaceholder,
} as const;

export type ObjectsTranslationArguments = {
    [ParameterName]: undefined;
    [NoEnclosingFunction]: undefined;
    [OutOfRange]: undefined;
    [FunctionDepth]: {depth: string};
    [Self]: undefined;
    [NotImplemented]: undefined;
    [ObjectPlaceholder]: undefined;
};
