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
