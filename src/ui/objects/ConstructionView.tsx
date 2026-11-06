import type {Construction, Object} from "@/model";
import type {DeepReadonly} from "@/util";

import DotDotIcon from "../reuse/DotDotIcon";
import {GAP, ICON_WIDTH} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export default (props: {
    construction: Construction;
    setObject: ((newObject: Object) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    /**
     * Available width for the content of the enclosing object view.
     */
    budget: number;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <span class="flex items-center gap-1">
                <DotDotIcon />
                <ObjectView
                    replaceParentWithThis={
                        props.setObject
                        && (() => {
                            if (!props.setObject) return;

                            objectSelection.selectParent();
                            props.setObject(props.construction.constructor);
                        })
                    }
                    siblingCount={2}
                    object={props.construction.constructor}
                    setObject={newConstructor => {
                        if (newConstructor === undefined) {
                            // Delete constructor -> convert to value

                            objectSelection.selectParent();

                            props.setObject?.(props.construction.value);
                        } else {
                            props.setObject?.({
                                ...props.construction,
                                constructor: newConstructor,
                            });
                        }
                    }}
                    path={[...props.path, 0]}
                    widthBudgetInPixels={props.budget - ICON_WIDTH.dotDot - GAP}
                />
            </span>
            <ObjectView
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(props.construction.value);
                    })
                }
                siblingCount={2}
                object={props.construction.value}
                setObject={newValue => {
                    if (newValue === undefined) {
                        objectSelection.selectParent();

                        props.setObject?.(props.construction.constructor);
                    } else {
                        props.setObject?.({
                            ...props.construction,
                            value: newValue,
                        });
                    }
                }}
                path={[...props.path, 1]}
                widthBudgetInPixels={props.budget}
            />
        </>
    );
};
