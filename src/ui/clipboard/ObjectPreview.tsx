import {createSignal} from "solid-js";

import type {EverythingObject} from "@/model";
import type {DeepReadonly} from "@/util";

import {LayoutMode} from "../objects/layout";
import ObjectView from "../objects/ObjectView";
import {
    ObjectSelection,
    ObjectSelectionContext,
    type ObjectSelectionPathInfo,
} from "../objects/selection";
import WidthMeasurer from "../reuse/WidthMeasurer";

/**
 * A selection that never matches a rendered path. Together with `inert`, this
 * keeps a preview from stealing focus or becoming an editable object.
 */
const nonMatchingSelection: ObjectSelectionPathInfo = {
    path: [],
    effectiveLength: 1,
};

export default (props: {object: DeepReadonly<EverythingObject>}) => {
    const [pathInfo, setPathInfo] = createSignal(nonMatchingSelection);
    const selection = new ObjectSelection(pathInfo, setPathInfo);

    return (
        <div
            class="overflow-hidden rounded-xl"
            ref={element => {
                element.inert = true;
            }}
        >
            <WidthMeasurer class="min-w-0">
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider value={selection}>
                        <ObjectView
                            indentLeft={false}
                            siblingCount={1}
                            object={props.object}
                            setObject={undefined}
                            path={[]}
                            widthBudgetInPixels={widthBudgetInPixels()}
                            replaceParentWithThis={undefined}
                            parentObjectLayoutMode={LayoutMode.Row}
                        />
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
        </div>
    );
};
