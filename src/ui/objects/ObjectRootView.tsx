import {createSignal} from "solid-js";

import type {EverythingObject} from "@/model";

import {
    defaultBlockLayoutOptions,
    LayoutMode,
    type LayoutOptions,
} from "./layout";
import {LayoutOptionsContext} from "./layoutOptions";
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

    const [layoutOptions, setLayoutOptions] = createSignal<LayoutOptions>({
        atomNames: new Map(),
        block: defaultBlockLayoutOptions,
    });

    const layoutOptionsContext = {get: layoutOptions, set: setLayoutOptions};

    return (
        <ObjectSelectionContext.Provider
            value={new ObjectSelection(objectSelection, setObjectSelection)}
        >
            <LayoutOptionsContext.Provider value={layoutOptionsContext}>
                <ObjectView
                    indentLeft={false}
                    widthBudgetInPixels={props.widthBudgetInPixels}
                    object={props.object}
                    path={[]}
                    siblingCount={1}
                    replaceParentWithThis={undefined}
                    setObject={props.setObject}
                    parentObjectLayoutMode={LayoutMode.Row}
                />
            </LayoutOptionsContext.Provider>
        </ObjectSelectionContext.Provider>
    );
};
