import {createContext, useContext} from "solid-js";
import {createStore, type SetStoreFunction} from "solid-js/store";

import type {DeepReadonly} from "@/util";

export type ObjectSelectionPath = number[];

export type ObjectSelectionPathInfo = {
    path: ObjectSelectionPath;

    /**
     * This is equal or smaller to the path length.
     */
    effectiveLength: number;
};

export class ObjectSelection {
    public readonly pathInfo: DeepReadonly<ObjectSelectionPathInfo>;
    private readonly setPathInfo: SetStoreFunction<ObjectSelectionPathInfo>;

    constructor() {
        const [pathInfo, setPathInfo] = createStore<ObjectSelectionPathInfo>({
            effectiveLength: 0,
            path: [],
        });

        this.pathInfo = pathInfo;
        this.setPathInfo = setPathInfo;
    }

    isSelected(path: DeepReadonly<ObjectSelectionPath>) {
        return (
            path.length === this.pathInfo.effectiveLength &&
            path.every((position, i) => position === this.pathInfo.path[i])
        );
    }

    dataSelected(path: DeepReadonly<ObjectSelectionPath>): "" | undefined {
        return this.isSelected(path) ? "" : undefined;
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

    selectParent() {
        // Reduce effective length.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => ({
                path: pathInfo.path,
                effectiveLength: Math.max(pathInfo.effectiveLength - 1, 0),
            }),
        );
    }

    selectChild(childIndex: number | "previous") {
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const newEffectiveLength = pathInfo.effectiveLength + 1;

                if (
                    pathInfo.effectiveLength < pathInfo.path.length &&
                    (childIndex === "previous" ||
                        childIndex ===
                            this.pathInfo.path[pathInfo.effectiveLength])
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
