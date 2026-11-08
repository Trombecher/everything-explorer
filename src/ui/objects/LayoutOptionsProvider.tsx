import type {JSX} from "solid-js";
import {createEffect, createSignal, on} from "solid-js";

import {useAppState} from "@/context";

import {defaultBlockLayoutOptions, type LayoutOptions} from "./layout";
import {LayoutOptionsContext} from "./layoutOptions";

/**
 * Owns the layout options of the whole object view tree.
 *
 * There is one instance so that all roots share the same layout options
 * identity and therefore the same width cache.
 */
export default (props: {children: JSX.Element}) => {
    const appState = useAppState();

    const [layoutOptions, setLayoutOptions] = createSignal<LayoutOptions>({
        atomNames: new Map(),
        block: defaultBlockLayoutOptions,
    });

    // Atom names belong to a specific knowledge base, so drop them when
    // reconnecting.
    createEffect(
        on(
            appState.connectionClient,
            () => {
                setLayoutOptions(previous =>
                    previous.atomNames.size === 0
                        ? previous
                        : {...previous, atomNames: new Map()},
                );
            },
            {defer: true},
        ),
    );

    const layoutOptionsContext = {get: layoutOptions, set: setLayoutOptions};

    return (
        <LayoutOptionsContext.Provider value={layoutOptionsContext}>
            {props.children}
        </LayoutOptionsContext.Provider>
    );
};
