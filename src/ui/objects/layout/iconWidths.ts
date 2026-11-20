export const blockIconWidthInPixels = {
    atom: 24,
    atomsWithConstructor: 48,
    atomsWithProperty: 48,
    construction: 24,
    dot: 24,
    elementOf: 24,
    equals: 24,
    filter: 48,
    map: 48,
    plus: 24,
    queryConstructionValues: 48,
    queryConstructions: 48,
    quote: 24,
    union: 24,
    unwrap: 24,
    valuesOf: 48,
    hasValue: 24,
    vee: 24,
    wedge: 24,
    x: 24,
    brace: 12,
    blackboardZ: 24,
    mapsTo: 32,
    call: 40,
    not: 24,
    check: 24,
    lessThan: 24,
    functionSelf: 24,
} as const satisfies Record<string, 12 | 24 | 32 | 40 | 48 | 56 | 64>;

/**
 * Width of the editable function parameter name field, excluding the function
 * block's own padding and gaps.
 */
export const functionParameterNameFieldWidthInPixels = 80;
