import type {Accessor} from "solid-js";
import {createSignal, onCleanup} from "solid-js";

/**
 * Px the resized pane grows or shrinks per arrow key press.
 */
const DEFAULT_KEYBOARD_STEP = 16;

/**
 * Vertical drag handle that resizes the pane next to it.
 *
 * Dragging with the mouse and pressing the arrow keys are both supported. The
 * handle is focusable and announced as a separator to screen readers.
 */
export default (props: {
    /**
     * Label announced by screen readers.
     */
    label: string;

    /**
     * Current width of the resized pane in px.
     */
    width: Accessor<number>;

    /**
     * Called with the new width in px whenever the user resizes.
     */
    setWidth: (width: number) => void;

    /**
     * Lower bound of the width in px.
     */
    minWidth: number;

    /**
     * Upper bound of the width in px. May be reactive.
     */
    maxWidth: number | Accessor<number>;

    /**
     * The side of the separator that the resized pane is on. A pane on the
     * `end` side grows when the separator is dragged left.
     */
    resizedSide?: "start" | "end";

    /**
     * Width change in px per arrow key press.
     */
    keyboardStep?: number;

    class?: string;
}) => {
    const [resizing, setResizing] = createSignal(false);

    let dragOrigin:
        | {pointerX: number; width: number; userSelect: string}
        | undefined;

    const maximumWidth = () =>
        typeof props.maxWidth === "function"
            ? props.maxWidth()
            : props.maxWidth;

    const applyWidth = (width: number) => {
        props.setWidth(
            Math.min(
                Math.max(width, props.minWidth),
                Math.max(props.minWidth, maximumWidth()),
            ),
        );
    };

    const stopResizing = () => {
        if (!dragOrigin) return;

        document.body.style.userSelect = dragOrigin.userSelect;
        dragOrigin = undefined;
        setResizing(false);
    };

    onCleanup(stopResizing);

    return (
        <div
            class={`group flex w-2 shrink-0 cursor-col-resize touch-none items-center justify-center ${props.class ?? ""}`}
            role="separator"
            aria-orientation="vertical"
            aria-label={props.label}
            aria-valuemin={props.minWidth}
            aria-valuemax={Math.max(props.minWidth, maximumWidth())}
            aria-valuenow={Math.round(props.width())}
            tabIndex={0}
            onPointerDown={event => {
                if (event.button !== 0) return;

                event.preventDefault();
                dragOrigin = {
                    pointerX: event.clientX,
                    width: props.width(),
                    userSelect: document.body.style.userSelect,
                };
                document.body.style.userSelect = "none";
                setResizing(true);
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
                if (!dragOrigin) return;

                const pointerDelta = event.clientX - dragOrigin.pointerX;

                applyWidth(
                    dragOrigin.width
                        + (props.resizedSide === "start"
                            ? pointerDelta
                            : -pointerDelta),
                );
            }}
            onPointerUp={event => {
                stopResizing();

                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                }
            }}
            onPointerCancel={stopResizing}
            onKeyDown={event => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                    return;

                event.preventDefault();

                const pointerDelta =
                    (event.key === "ArrowLeft" ? -1 : 1)
                    * (props.keyboardStep ?? DEFAULT_KEYBOARD_STEP);

                applyWidth(
                    props.width()
                        + (props.resizedSide === "start"
                            ? pointerDelta
                            : -pointerDelta),
                );
            }}
        >
            <div
                class={`h-full w-1 rounded-full ${
                    resizing()
                        ? "bg-blue-400"
                        : "bg-neutral-200 group-hover:bg-blue-300 group-focus-visible:bg-blue-300"
                }`}
            />
        </div>
    );
};
