import QuoteIcon from "lucide-solid/icons/quote";

import type {EverythingObject} from "@/model";
import {nodeToObject, type LiteralNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";

import {useLayoutOptions} from "../atomNames";
import {
    calculateLiteralNodeInnerObjectWidthBudgetInPixels,
    LayoutMode,
} from "../layout";
import ObjectView from "../ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "../selection";

export default (props: {
    node: LiteralNode;
    path: DeepReadonly<ObjectSelectionPath>;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    widthBudgetInPixels: number;
    layoutMode: LayoutMode;
}) => {
    const objectSelection = useObjectSelection();
    const layoutOptions = useLayoutOptions();

    return (
        <>
            <QuoteIcon />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={props.layoutMode}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject?.(props.node.object);
                    })
                }
                siblingCount={1}
                object={props.node.object}
                setObject={
                    props.setObject
                    && (newObject => {
                        if (newObject === undefined) {
                            // A literal without an object is meaningless, so
                            // remove the whole literal.
                            objectSelection.selectParent();

                            props.setObject?.(undefined);
                        } else {
                            props.setObject?.(
                                nodeToObject({
                                    ...props.node,
                                    object: newObject,
                                }),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={calculateLiteralNodeInnerObjectWidthBudgetInPixels(
                    props.widthBudgetInPixels,
                    layoutOptions,
                )}
            />
        </>
    );
};
