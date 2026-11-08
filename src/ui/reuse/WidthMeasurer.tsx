import type {JSXElement} from "solid-js";
import {createSignal, onCleanup, onMount} from "solid-js";

/**
 * Measures the width of its container and passes it to `children`.
 *
 * Use this to measure a whole list once instead of measuring every item.
 */
export default (props: {
    class?: string;
    children: (widthInPixels: number) => JSXElement;
}) => {
    const [width, setWidth] = createSignal(Number.POSITIVE_INFINITY);

    let container: HTMLDivElement | undefined;

    onMount(() => {
        if (!container) return;

        const updateWidth = () => {
            const width = container?.getBoundingClientRect().width ?? 0;

            if (width > 0) setWidth(width);
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(container);

        onCleanup(() => resizeObserver.disconnect());
    });

    return (
        <div
            class={props.class}
            ref={el => {
                container = el;
            }}
        >
            {props.children(width())}
        </div>
    );
};
