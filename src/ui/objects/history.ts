import type {Accessor, Setter} from "solid-js";
import {createSignal} from "solid-js";

import type {EverythingObject} from "@/model";

import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection} from "./selection";

export type ObjectHistoryEntry = {
    readonly object: EverythingObject;
    readonly selectionPathInfo: ObjectSelectionPathInfo;
};

type ObjectHistoryState = {
    readonly entries: readonly ObjectHistoryEntry[];

    /**
     * The number of entries that are part of the current history.
     *
     * The current entry is the one at index `virtualLength - 1`. Any entries
     * after it are redoable and become active again by redoing.
     */
    readonly virtualLength: number;
};

const currentEntry = (state: ObjectHistoryState): ObjectHistoryEntry => {
    const entry = state.entries[state.virtualLength - 1];
    if (!entry) throw new Error("object history is empty");

    return entry;
};

/**
 * An undo/redo history of object edits.
 *
 * Every edit pushes a new entry that captures the edited object together with
 * the selection at that point in time. Undoing moves back to the previous entry
 * and redoing moves forward again. Pushing an edit after undoing discards the
 * entries that could have been redone.
 */
export class ObjectHistory {
    private readonly state: Accessor<ObjectHistoryState>;
    private readonly setState: Setter<ObjectHistoryState>;

    /**
     * The selection of the current entry. Selection changes only affect the
     * current entry, so other entries keep the selection they had when they
     * were created.
     */
    public readonly objectSelection: ObjectSelection;

    constructor(initialObject: EverythingObject) {
        const [state, setState] = createSignal<ObjectHistoryState>({
            entries: [
                {
                    object: initialObject,
                    selectionPathInfo: {effectiveLength: 0, path: []},
                },
            ],
            virtualLength: 1,
        });

        this.state = state;
        this.setState = setState;

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
     * The entry currently shown.
     */
    public current(): ObjectHistoryEntry {
        return currentEntry(this.state());
    }

    public canUndo(): boolean {
        return this.state().virtualLength > 1;
    }

    public canRedo(): boolean {
        const state = this.state();

        return state.virtualLength < state.entries.length;
    }

    /**
     * Pushes an edit of the current object. The current selection is carried
     * over to the new entry. Redoable entries are discarded.
     */
    public push(object: EverythingObject) {
        this.setState(state => ({
            entries: [
                ...state.entries.slice(0, state.virtualLength),
                {
                    object,
                    selectionPathInfo: currentEntry(state).selectionPathInfo,
                },
            ],
            virtualLength: state.virtualLength + 1,
        }));
    }

    /**
     * Moves back to the previous entry. Does nothing if there is none.
     */
    public undo() {
        this.setState(state =>
            state.virtualLength > 1
                ? {...state, virtualLength: state.virtualLength - 1}
                : state,
        );
    }

    /**
     * Moves forward to the next entry. Does nothing if there is none.
     */
    public redo() {
        this.setState(state =>
            state.virtualLength < state.entries.length
                ? {...state, virtualLength: state.virtualLength + 1}
                : state,
        );
    }

    private updateCurrent(
        transform: (entry: ObjectHistoryEntry) => ObjectHistoryEntry,
    ) {
        this.setState(state => ({
            ...state,
            entries: state.entries.map((entry, i) =>
                i === state.virtualLength - 1 ? transform(entry) : entry,
            ),
        }));
    }
}
