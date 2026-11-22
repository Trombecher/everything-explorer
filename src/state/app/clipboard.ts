import type {Accessor} from "solid-js";

import type {EverythingObject} from "@/model";
import type {DeepReadonly} from "@/util";

import type {AppStateStore} from "./internal";
import type {ClipboardSlot} from "./types";

export type ClipboardState = {
    readonly slots: Accessor<DeepReadonly<readonly ClipboardSlot[]>>;

    /**
     * Inserts a new first slot with the given object and pushes all existing
     * slots down. The smallest unused default name is assigned.
     */
    copyObject(object: EverythingObject): void;

    renameSlot(index: number, name: string): void;

    deleteSlot(index: number): void;
};

const defaultSlotName = (
    slots: DeepReadonly<readonly ClipboardSlot[]>,
): string => {
    const names = new Set(slots.map(slot => slot.name));

    let number = 1;
    while (names.has(`Slot ${number}`)) number++;

    return `Slot ${number}`;
};

/**
 * The virtual clipboard.
 *
 * This module only owns the clipboard data. Which object is copied or replaced
 * is decided by the object views that handle the clipboard shortcuts.
 */
export const createClipboardState = (store: AppStateStore): ClipboardState => ({
    slots: () => store.state.clipboard,

    copyObject(object) {
        store.commit(draft => {
            draft.clipboard.unshift({
                name: defaultSlotName(draft.clipboard),
                object,
            });
        });
    },

    renameSlot(index, name) {
        const trimmed = name.trim();
        const slot = store.state.clipboard[index];
        if (trimmed.length === 0 || !slot || slot.name === trimmed) return;

        store.commit(draft => {
            const draftSlot = draft.clipboard[index];
            if (draftSlot) draftSlot.name = trimmed;
        });
    },

    deleteSlot(index) {
        if (!store.state.clipboard[index]) return;

        store.commit(draft => {
            draft.clipboard.splice(index, 1);
        });
    },
});
