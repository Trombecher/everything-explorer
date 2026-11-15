export type DeepReadonly<T> = T extends (...args: any[]) => any
    ? T
    : T extends Date | RegExp
      ? T
      : T extends Map<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U>>
          : T extends Promise<infer U>
            ? Promise<DeepReadonly<U>>
            : T extends readonly unknown[]
              ? {readonly [K in keyof T]: DeepReadonly<T[K]>}
              : T extends object
                ? {readonly [K in keyof T]: DeepReadonly<T[K]>}
                : T;

/**
 * Narrows a discriminated union value by checking its type variant.
 *
 * This is a type-safe variant guard that checks if an object with a `type`
 * property matches a specific variant, and returns the object with narrowed
 * type if it does.
 *
 * When the value's `type` discriminant equals the given variant, the object is
 * returned with its type narrowed to that variant so its variant-specific
 * payload is accessible. If the discriminants differ, `undefined` is returned,
 * so callers should narrow with a truthiness check.
 *
 * @typeParam O - The object type, must have a `type` property
 * @typeParam T - The specific variant type to check for (inferred from valid
 *   type values of O)
 * @param obj - The object to narrow, which has a discriminant `type` property
 * @param variant - The variant type to check for
 * @returns The object narrowed to the specific variant type, or `undefined` if
 *   the type doesn't match
 */
export const variant = <O extends {type: unknown}, T extends O["type"]>(
    obj: O,
    variant: T,
): (O & {type: T}) | undefined => {
    if (obj.type === variant) return obj as O & {type: T};
    return undefined;
};
