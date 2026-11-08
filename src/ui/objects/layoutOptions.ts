import type {Accessor, Setter} from "solid-js";
import {createContext, useContext} from "solid-js";

import type {LayoutOptions} from "./layout";

/**
 * Reactive read/write access to the layout options of the enclosing object view
 * tree.
 */
export type LayoutOptionsContextValue = {
    readonly get: Accessor<LayoutOptions>;
    readonly set: Setter<LayoutOptions>;
};

export const LayoutOptionsContext = createContext<LayoutOptionsContextValue>();

export const useLayoutOptions = (): LayoutOptionsContextValue => {
    const layoutOptions = useContext(LayoutOptionsContext);
    if (!layoutOptions) throw new Error("no layout options context");

    return layoutOptions;
};
