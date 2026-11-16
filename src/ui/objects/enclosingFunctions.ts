import {createContext, useContext, type Accessor} from "solid-js";

/**
 * A function that lexically encloses the object currently being viewed.
 */
export type EnclosingFunction = {readonly parameterName: string | undefined};

export type EnclosingFunctions = Accessor<readonly EnclosingFunction[]>;

/**
 * The enclosing functions from innermost to outermost. Empty at the root of a
 * view.
 */
export const EnclosingFunctionsContext = createContext<EnclosingFunctions>();

const noEnclosingFunctions: readonly EnclosingFunction[] = [];

export const useEnclosingFunctions = (): EnclosingFunctions =>
    useContext(EnclosingFunctionsContext) ?? (() => noEnclosingFunctions);
