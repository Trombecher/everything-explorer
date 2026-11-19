import {defaultObject} from "@/model";

import {ObjectHistory} from "../../objects/history";
import {LayoutMode} from "../../objects/layout";
import ObjectView from "../../objects/ObjectView";
import {ObjectSelectionContext} from "../../objects/selection";
import {handleHistoryKeyDown} from "../../objects/undoRedoKeys";
import WidthMeasurer from "../../reuse/WidthMeasurer";
import {createInitialObject2} from "./fixtures";
import Swatch from "./Swatch";

export default () => {
    const objectHistory = new ObjectHistory([createInitialObject2()]);

    return (
        <div
            class="mx-auto my-2 max-w-3xl min-w-0 grow rounded-4xl border border-line-subtle bg-surface-panel p-4"
            tabIndex={0}
            onKeyDown={event => handleHistoryKeyDown(event, objectHistory)}
        >
            <WidthMeasurer class="w-full">
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider
                        value={objectHistory.objectSelection}
                    >
                        <ObjectView
                            indentLeft={false}
                            siblingCount={1}
                            object={objectHistory.object(0)}
                            setObject={newObject => {
                                objectHistory.pushObject(
                                    0,
                                    newObject ?? defaultObject,
                                );
                            }}
                            path={[]}
                            widthBudgetInPixels={widthBudgetInPixels()}
                            replaceParentWithThis={undefined}
                            parentObjectLayoutMode={LayoutMode.Row}
                        />
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
            <Swatch />
        </div>
    );
};
