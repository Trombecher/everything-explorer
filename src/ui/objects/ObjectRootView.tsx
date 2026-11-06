import {createSignal} from "solid-js";

import type {Object} from "@/model";

import ObjectView from "./ObjectView";
import type {ObjectSelectionPathInfo} from "./selection";
import {ObjectSelection, ObjectSelectionContext} from "./selection";

export default (props: {
    object: Object;
    budget: number;
    setObject: ((newObject: Object | undefined) => void) | undefined;
}) => {
    const [objectSelection, setObjectSelection] =
        createSignal<ObjectSelectionPathInfo>({effectiveLength: 0, path: []});

    return (
        <ObjectSelectionContext.Provider
            value={new ObjectSelection(objectSelection, setObjectSelection)}
        >
            <ObjectView
                budget={props.budget}
                object={props.object}
                path={[]}
                siblingCount={1}
                replaceParentWithThis={undefined}
                setObject={props.setObject}
            />
        </ObjectSelectionContext.Provider>
    );
};
