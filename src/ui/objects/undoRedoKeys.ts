import type {ObjectHistory} from "./history";

/**
 * Handles the undo/redo keyboard shortcuts of `history`.
 */
export const handleHistoryKeyDown = (
    event: KeyboardEvent,
    history: ObjectHistory,
) => {
    if (!event.ctrlKey) return;

    const key = event.key.toLowerCase();
    const undo = key === "z" && !event.shiftKey;
    const redo = (key === "z" && event.shiftKey) || key === "y";

    if (!undo && !redo) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (undo) history.undo();
    else history.redo();
};
