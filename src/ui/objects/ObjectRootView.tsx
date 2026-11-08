import {createSignal} from "solid-js";

import type {EverythingObject} from "@/model";

import {defaultBlockLayoutOptions, LayoutMode} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection, ObjectSelectionContext} from "./selection";

export default (props: {
    object: EverythingObject;
    widthBudgetInPixels: number;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const [objectSelection, setObjectSelection] =
        createSignal<ObjectSelectionPathInfo>({effectiveLength: 0, path: []});

    return (
        <ObjectSelectionContext.Provider
            value={new ObjectSelection(objectSelection, setObjectSelection)}
        >
            <ObjectView
                indentLeft={false}
                layoutOptions={{
                    atomNames: new Map(),
                    block: defaultBlockLayoutOptions,
                }}
                widthBudgetInPixels={props.widthBudgetInPixels}
                object={props.object}
                path={[]}
                siblingCount={1}
                replaceParentWithThis={undefined}
                setObject={props.setObject}
                parentObjectLayoutMode={LayoutMode.Row}
            />
        </ObjectSelectionContext.Provider>
    );
};
