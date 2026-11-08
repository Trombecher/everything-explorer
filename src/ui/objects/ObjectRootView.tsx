import {createComputed, createSignal} from "solid-js";

import type {EverythingObject} from "@/model";

import {useAtomNames} from "./atomNames";
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
    const atomNames = useAtomNames();

    const [objectSelection, setObjectSelection] =
        createSignal<ObjectSelectionPathInfo>({effectiveLength: 0, path: []});

    const [layoutOptions, setLayoutOptions] = createSignal<LayoutOptions>({
        atomNames: atomNames.map(),
        block: defaultBlockLayoutOptions,
    });

    createComputed(() => {
        const names = atomNames.map();

        setLayoutOptions(previous =>
            previous.atomNames === names
                ? previous
                : {atomNames: names, block: previous.block},
        );
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
