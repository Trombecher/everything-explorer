import {
    type Accessor,
    createContext,
    createSignal,
    type Setter,
    useContext,
} from "solid-js";

import type {DeepReadonly} from "@/util";

export type ObjectSelectionPath = readonly number[];

export type ObjectSelectionPathInfo = {
    readonly path: ObjectSelectionPath;

    /**
     * This is equal or smaller to the path length.
     */
    readonly effectiveLength: number;
};

export class ObjectSelection {
    public readonly pathInfo: Accessor<ObjectSelectionPathInfo>;
    private readonly setPathInfo: Setter<ObjectSelectionPathInfo>;

    /**
     * The path that should receive focus, or `undefined` if no focus was
     * requested. Requests are consumed by the matching object view.
     */
    public readonly focusRequest: Accessor<
        DeepReadonly<ObjectSelectionPath> | undefined
    >;
    private readonly setFocusRequest: Setter<
        DeepReadonly<ObjectSelectionPath> | undefined
    >;

    constructor(
        pathInfo: Accessor<ObjectSelectionPathInfo>,
        setPathInfo: Setter<ObjectSelectionPathInfo>,
    ) {
        this.pathInfo = pathInfo;
        this.setPathInfo = setPathInfo;

        const [focusRequest, setFocusRequest] = createSignal<
            DeepReadonly<ObjectSelectionPath> | undefined
        >();
        this.focusRequest = focusRequest;
        this.setFocusRequest = setFocusRequest;
    }

    /**
     * Whether `path` is the keyboard cursor. This is independent of the DOM
     * focus: the cursor is remembered so that Tab and keyboard navigation can
     * return to the last object, but only the focused object view is
     * highlighted.
     */
    isCursor(path: DeepReadonly<ObjectSelectionPath>) {
        return (
            path.length === this.pathInfo().effectiveLength
            && path.every((position, i) => position === this.pathInfo().path[i])
        );
    }

    /**
     * The path of the object view at the cursor.
     */
    private cursorPath(): ObjectSelectionPath {
        const {path, effectiveLength} = this.pathInfo();

        return path.slice(0, effectiveLength);
    }

    /**
     * Requests that the object view at the current cursor receives DOM focus.
     */
    requestFocus() {
        const target = this.cursorPath();
        this.setFocusRequest(target);

        // A request for a path that has no object view (e.g. after undoing to
        // a selection that no longer exists) must not leak into a later mount.
        queueMicrotask(() => {
            if (this.focusRequest() === target) this.setFocusRequest(undefined);
        });
    }

    /**
     * Marks the request as handled. Does nothing if another request replaced it
     * in the meantime.
     */
    clearFocusRequest(request: DeepReadonly<ObjectSelectionPath>) {
        if (this.focusRequest() === request) this.setFocusRequest(undefined);
    }

    setPath(path: DeepReadonly<ObjectSelectionPath>) {
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                if (
                    path.every((position, i) => position === pathInfo.path[i])
                ) {
                    // Path is a prefix of existing -> reduce effective length.
                    return {path: pathInfo.path, effectiveLength: path.length};
                }

                // Path is not a prefix -> replace entire path.
                return {path: [...path], effectiveLength: path.length};
            },
        );
    }

    setPathWithEffectiveLength(data: DeepReadonly<ObjectSelectionPathInfo>) {
        if (data.effectiveLength > data.path.length) throw new Error(":/");

        this.setPathInfo({
            effectiveLength: data.effectiveLength,
            path: [...data.path],
        });
    }

    /**
     * Selects the cursor path and moves DOM focus to its object view.
     */
    focusPath(path: DeepReadonly<ObjectSelectionPath>) {
        this.setPath(path);
        this.requestFocus();
    }

    selectParent() {
        // Reduce effective length.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => ({
                path: pathInfo.path,
                effectiveLength: Math.max(pathInfo.effectiveLength - 1, 0),
            }),
        );
        this.requestFocus();
    }

    selectChild(childIndex: number | "previous") {
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const newEffectiveLength = pathInfo.effectiveLength + 1;

                if (
                    pathInfo.effectiveLength < pathInfo.path.length
                    && (childIndex === "previous"
                        || childIndex
                            === this.pathInfo().path[pathInfo.effectiveLength])
                )
                    return {
                        path: pathInfo.path,
                        effectiveLength: newEffectiveLength,
                    };

                return {
                    effectiveLength: newEffectiveLength,
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength),
                        childIndex === "previous" ? 0 : childIndex,
                    ],
                };
            },
        );
        this.requestFocus();
    }

    selectPreviousSibling() {
        // Decrement last.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const current = pathInfo.path[pathInfo.effectiveLength - 1];
                if (current === undefined || current === 0) return pathInfo;

                return {
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength - 1),
                        Math.max(current - 1, 0),
                    ],
                    effectiveLength: pathInfo.effectiveLength,
                };
            },
        );
        this.requestFocus();
    }

    selectSibling(index: number) {
        // Replace the last path position.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                if (pathInfo.effectiveLength === 0) return pathInfo;

                return {
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength - 1),
                        index,
                    ],
                    effectiveLength: pathInfo.effectiveLength,
                };
            },
        );
        this.requestFocus();
    }

    selectNextSibling(siblingCount: number) {
        // Increment last position and discard non-effective tail.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const current = pathInfo.path[pathInfo.effectiveLength - 1];
                if (current === undefined || current === siblingCount - 1)
                    return pathInfo;

                return {
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength - 1),
                        Math.min(current + 1, siblingCount - 1),
                    ],
                    effectiveLength: pathInfo.effectiveLength,
                };
            },
        );
        this.requestFocus();
    }
}

export const ObjectSelectionContext = createContext<
    undefined | ObjectSelection
>();

export const useObjectSelection = () => {
    const objectSelection = useContext(ObjectSelectionContext);
    if (!objectSelection) throw new Error("no object selection context");

    return objectSelection;
};
