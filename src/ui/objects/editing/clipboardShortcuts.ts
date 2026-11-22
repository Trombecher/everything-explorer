import type {EverythingObject} from "@/model";
import type {ClipboardState} from "@/state/app";

/**
 * Maps a physical digit key to a clipboard slot index. `0` addresses the tenth
 * slot.
 */
const slotIndexFromKey = (event: KeyboardEvent): number | undefined => {
    const match = /^(?:Digit|Numpad)([0-9])$/.exec(event.code);
    const digit = match
        ? Number(match[1])
        : /^[0-9]$/.test(event.key)
          ? Number(event.key)
          : undefined;

    if (digit === undefined) return undefined;

    return digit === 0 ? 9 : digit - 1;
};

const isTextInputTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;

    return (
        target.tagName === "INPUT"
        || target.tagName === "TEXTAREA"
        || target.tagName === "SELECT"
        || target.isContentEditable
    );
};

const handled = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    return true;
};

/**
 * Handles the clipboard shortcuts of an object view.
 *
 * The object view owns these shortcuts because it already knows the focused
 * object and how to replace it. The clipboard itself does not know anything
 * about selections.
 */
export const handleClipboardKeyDown = (props: {
    event: KeyboardEvent;
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    clipboard: ClipboardState;
}): boolean => {
    const {event, clipboard} = props;

    if (
        !event.altKey
        || event.metaKey
        || event.shiftKey
        || event.repeat
        || isTextInputTarget(event.target)
    )
        return false;

    if (event.ctrlKey) {
        if (event.code === "KeyN" || event.key.toLowerCase() === "n") {
            clipboard.copyObject(props.object);
            return handled(event);
        }

        return false;
    }

    // Replace the focused object with the object of a slot.
    const index = slotIndexFromKey(event);
    if (index === undefined) return false;

    const slot = clipboard.slots()[index];
    if (!slot || !props.setObject) return false;

    props.setObject(slot.object);
    return handled(event);
};
