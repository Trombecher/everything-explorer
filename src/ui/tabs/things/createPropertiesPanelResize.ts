import {onCleanup, onMount} from "solid-js";

import {useAppState} from "@/context";

export const MIN_PROPERTIES_PANEL_WIDTH = 240;

/**
 * The atom list is never squeezed below this width when resizing the properties
 * panel.
 */
export const MIN_ATOM_LIST_WIDTH = 280;

export const createPropertiesPanelResize = () => {
    const appState = useAppState();

    let container: HTMLDivElement | undefined;

    const maximumPropertiesPanelWidth = () =>
        Math.max(
            MIN_PROPERTIES_PANEL_WIDTH,
            (container?.getBoundingClientRect().width ?? 0)
                - MIN_ATOM_LIST_WIDTH,
        );

    const clampPropertiesPanelWidth = (width: number) =>
        Math.min(
            Math.max(width, MIN_PROPERTIES_PANEL_WIDTH),
            maximumPropertiesPanelWidth(),
        );

    onMount(() => {
        if (!container) return;

        const observer = new ResizeObserver(() => {
            appState.setPropertiesPanelWidth(clampPropertiesPanelWidth);
        });

        observer.observe(container);

        onCleanup(() => observer.disconnect());
    });

    const setContainer = (el: HTMLDivElement) => {
        container = el;
    };

    return {
        setContainer,
        maximumPropertiesPanelWidth,
        clampPropertiesPanelWidth,
    };
};
