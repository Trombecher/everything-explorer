const Clipboard = Symbol();
const EmptyClipboard = Symbol();
const ClipboardShortcutHint = Symbol();
const ClipboardSlotName = Symbol();
const DeleteClipboardSlot = Symbol();
const ResizeClipboardPanel = Symbol();

export const clipboardPhrases = {
    Clipboard,
    EmptyClipboard,
    ClipboardShortcutHint,
    ClipboardSlotName,
    DeleteClipboardSlot,
    ResizeClipboardPanel,
} as const;

export type ClipboardTranslationArguments = {
    [Clipboard]: undefined;
    [EmptyClipboard]: undefined;
    [ClipboardShortcutHint]: undefined;
    [ClipboardSlotName]: undefined;
    [DeleteClipboardSlot]: undefined;
    [ResizeClipboardPanel]: undefined;
};
