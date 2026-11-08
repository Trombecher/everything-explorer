import {createSignal} from "solid-js";

import {defaultObject, type EverythingObject} from "@/model";

import type {ObjectHistory} from "./history";
import {LayoutMode} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection, ObjectSelectionContext} from "./selection";

type ObjectRootViewProps = {widthBudgetInPixels: number} & (
    | {
          object: EverythingObject;
          setObject:
              | ((newObject: EverythingObject | undefined) => void)
              | undefined;
          history?: undefined;
      }
    | {
          /**
           * When provided, the root view is backed by this history. Edits are
           * pushed into it and undo/redo work on it.
           */
          history: ObjectHistory;
      }
);

export default (props: ObjectRootViewProps) => {
    const [selectionPathInfo, setSelectionPathInfo] =
        createSignal<ObjectSelectionPathInfo>({effectiveLength: 0, path: []});

    // Used when the caller owns the object (controlled mode).
    const controlledSelection = new ObjectSelection(
        selectionPathInfo,
        setSelectionPathInfo,
    );

    const objectSelection = () =>
        props.history?.objectSelection ?? controlledSelection;

    const object = (): EverythingObject => {
        if (props.history) return props.history.current().object;

        if (!props.object) throw new Error("root object view has no object");

        return props.object;
    };

    const setObject = (newObject: EverythingObject | undefined) => {
        if (props.history) {
            props.history.push(newObject ?? defaultObject);
        } else {
            props.setObject?.(newObject);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!props.history || !event.ctrlKey) return;

        const key = event.key.toLowerCase();
        const undo = key === "z" && !event.shiftKey;
        const redo = (key === "z" && event.shiftKey) || key === "y";

        if (!undo && !redo) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        if (undo) props.history.undo();
        else props.history.redo();
    };

    return (
        <div
            class={"contents"}
            tabIndex={props.history ? 0 : undefined}
            onKeyDown={handleKeyDown}
        >
            <ObjectSelectionContext.Provider value={objectSelection()}>
                <ObjectView
                    indentLeft={false}
                    widthBudgetInPixels={props.widthBudgetInPixels}
                    object={object()}
                    path={[]}
                    siblingCount={1}
                    replaceParentWithThis={undefined}
                    setObject={setObject}
                    parentObjectLayoutMode={LayoutMode.Row}
                />
            </ObjectSelectionContext.Provider>
        </div>
    );
};
