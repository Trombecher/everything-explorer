import type {Accessor, Setter} from "solid-js";
import {createSignal} from "solid-js";

import {objectsEqual, type EverythingObject} from "@/model";

import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection} from "./selection";

export type ObjectHistoryEntry = {
    readonly objects: readonly EverythingObject[];
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

const initialSelectionPathInfo: ObjectSelectionPathInfo = {
    effectiveLength: 0,
    path: [],
};

const objectListsEqual = (
    left: readonly EverythingObject[],
    right: readonly EverythingObject[],
): boolean =>
    left.length === right.length
    && left.every((object, i) => objectsEqual(object, right[i]!));

/**
 * An undo/redo history of edits to a list of objects.
 *
 * Every edit pushes a new entry that captures the edited objects together with
 * the selection at that point in time. Undoing moves back to the previous entry
 * and redoing moves forward again. Pushing an edit after undoing discards the
 * entries that could have been redone.
 */
export class ObjectHistory {
    private readonly state: Accessor<ObjectHistoryState>;
    private readonly setState: Setter<ObjectHistoryState>;

    /**
     * The objects of the current entry.
     */
    public readonly objects: Accessor<readonly EverythingObject[]>;

    /**
     * The selection of the current entry. Selection changes only affect the
     * current entry, so other entries keep the selection they had when they
     * were created.
     */
    public readonly objectSelection: ObjectSelection;

    constructor(initialObjects: readonly EverythingObject[]) {
        const [state, setState] = createSignal<ObjectHistoryState>({
            entries: [
                {
                    objects: initialObjects,
                    selectionPathInfo: initialSelectionPathInfo,
                },
            ],
            virtualLength: 1,
        });

        this.state = state;
        this.setState = setState;

        this.objects = () => this.current().objects;

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

    public object(index: number): EverythingObject {
        const object = this.objects()[index];
        if (!object) throw new Error(`no object at index ${index}`);

        return object;
    }

    public canUndo(): boolean {
        return this.state().virtualLength > 1;
    }

    public canRedo(): boolean {
        const state = this.state();

        return state.virtualLength < state.entries.length;
    }

    /**
     * Replaces the object at `index` and pushes the result as a new entry. The
     * current selection is carried over to the new entry.
     */
    public pushObject(index: number, object: EverythingObject) {
        const objects = [...this.objects()];
        if (!objects[index]) throw new Error(`no object at index ${index}`);

        objects[index] = object;
        this.pushObjects(objects);
    }

    /**
     * Pushes an edited object list as a new entry. The current selection is
     * carried over to the new entry. Redoable entries are discarded.
     */
    public pushObjects(objects: readonly EverythingObject[]) {
        if (objectListsEqual(this.objects(), objects)) return;

        this.setState(state => ({
            entries: [
                ...state.entries.slice(0, state.virtualLength),
                {
                    objects,
                    selectionPathInfo: currentEntry(state).selectionPathInfo,
                },
            ],
            virtualLength: state.virtualLength + 1,
        }));
    }

    /**
     * Discards the history and starts over with the given objects.
     */
    public reset(objects: readonly EverythingObject[]) {
        this.setState({
            entries: [{objects, selectionPathInfo: initialSelectionPathInfo}],
            virtualLength: 1,
        });
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
