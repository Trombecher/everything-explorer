import {onCleanup, onMount} from "solid-js";

import {useAppState} from "@/context";

export const MIN_CLIPBOARD_PANEL_WIDTH = 260;

/**
 * The main content is never squeezed below this width when resizing the
 * clipboard panel.
 */
export const MIN_MAIN_CONTENT_WIDTH = 420;

export const createClipboardPanelResize = () => {
    const appState = useAppState();

    let container: HTMLDivElement | undefined;

    const maximumClipboardPanelWidth = () =>
        Math.max(
            MIN_CLIPBOARD_PANEL_WIDTH,
            (container?.getBoundingClientRect().width ?? 0)
                - MIN_MAIN_CONTENT_WIDTH,
        );

    const clampClipboardPanelWidth = (width: number) =>
        Math.min(
            Math.max(width, MIN_CLIPBOARD_PANEL_WIDTH),
            maximumClipboardPanelWidth(),
        );

    onMount(() => {
        if (!container) return;

        const observer = new ResizeObserver(() => {
            appState.setClipboardPanelWidth(clampClipboardPanelWidth);
        });

        observer.observe(container);

        onCleanup(() => observer.disconnect());
    });

    const setContainer = (el: HTMLDivElement) => {
        container = el;
    };

    return {setContainer, maximumClipboardPanelWidth, clampClipboardPanelWidth};
};
