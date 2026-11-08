import type {Accessor, Setter} from "solid-js";
import {createSignal} from "solid-js";

import type {EverythingObject} from "@/model";

import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection} from "./selection";

export type ObjectHistoryEntry = {
    readonly object: EverythingObject;
    readonly selectionPathInfo: ObjectSelectionPathInfo;
};

const lastEntry = (
    entries: readonly ObjectHistoryEntry[],
): ObjectHistoryEntry => {
    const last = entries.at(-1);
    if (!last) throw new Error("object history is empty");

    return last;
};

/**
 * An undo history of object edits.
 *
 * Every edit pushes a new entry that captures the edited object together with
 * the selection at that point in time. Undoing drops the newest entry and thus
 * restores the previous object and its selection.
 */
export class ObjectHistory {
    private readonly entries: Accessor<readonly ObjectHistoryEntry[]>;
    private readonly setEntries: Setter<readonly ObjectHistoryEntry[]>;

    /**
     * The selection of the newest entry. Selection changes only affect the
     * newest entry, so older entries keep the selection they had when they were
     * created.
     */
    public readonly objectSelection: ObjectSelection;

    constructor(initialObject: EverythingObject) {
        const [entries, setEntries] = createSignal<
            readonly ObjectHistoryEntry[]
        >([
            {
                object: initialObject,
                selectionPathInfo: {effectiveLength: 0, path: []},
            },
        ]);

        this.entries = entries;
        this.setEntries = setEntries;

        this.objectSelection = new ObjectSelection(
            () => this.current().selectionPathInfo,
            selectionPathInfo => {
                this.updateCurrent(entry => ({
                    ...entry,
                    selectionPathInfo:
                        typeof selectionPathInfo === "function"
                            ? selectionPathInfo(entry.selectionPathInfo)
                            : selectionPathInfo,
                }));
            },
        );
    }

    /**
     * The newest entry. This is the entry currently shown.
     */
    public current(): ObjectHistoryEntry {
        return lastEntry(this.entries());
    }

    public canUndo(): boolean {
        return this.entries().length > 1;
    }

    /**
     * Pushes an edit of the current object. The current selection is carried
     * over to the new entry.
     */
    public push(object: EverythingObject) {
        this.setEntries(entries => [
            ...entries,
            {object, selectionPathInfo: lastEntry(entries).selectionPathInfo},
        ]);
    }

    /**
     * Drops the newest entry, restoring the previous object and selection.
     *
     * Does nothing if there is no previous entry.
     */
    public undo() {
        this.setEntries(entries =>
            entries.length > 1 ? entries.slice(0, -1) : entries,
        );
    }

    private updateCurrent(
        transform: (entry: ObjectHistoryEntry) => ObjectHistoryEntry,
    ) {
        this.setEntries(entries =>
            entries.map((entry, i) =>
                i === entries.length - 1 ? transform(entry) : entry,
            ),
        );
    }
}
