import {useAppState} from "@/context";
import {defaultObject, type EverythingObject} from "@/model";
import {nodeToObject, type FunctionNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";

import MapsToIcon from "../../icons/MapsToIcon";
import {
    useEnclosingFunctions,
    EnclosingFunctionsContext,
} from "../enclosingFunctions";
import {calculateFunctionBodyWidthBudgetInPixels, LayoutMode} from "../layout";
import ObjectView from "../ObjectView";
import ParameterNameField from "../ParameterNameField";
import {useObjectSelection, type ObjectSelectionPath} from "../selection";

export default (props: {
    node: FunctionNode;
    path: DeepReadonly<ObjectSelectionPath>;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    widthBudgetInPixels: number;
    /**
     * The layout mode of the function block itself.
     */
    layoutMode: LayoutMode;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();
    const outerEnclosingFunctions = useEnclosingFunctions();

    const enclosingFunctionsForBody = () => [
        {parameterName: props.node.parameterName},
        ...outerEnclosingFunctions(),
    ];

    return (
        <>
            <ParameterNameField
                name={props.node.parameterName}
                setName={
                    props.setObject
                    && (newName => {
                        props.setObject?.(
                            nodeToObject({
                                ...props.node,
                                parameterName: newName,
                            }),
                        );
                    })
                }
            />
            <MapsToIcon />
            <EnclosingFunctionsContext.Provider
                value={enclosingFunctionsForBody}
            >
                <ObjectView
                    indentLeft={false}
                    parentObjectLayoutMode={props.layoutMode}
                    replaceParentWithThis={
                        props.setObject
                        && (() => {
                            if (!props.setObject) return;

                            objectSelection.selectParent();
                            props.setObject(props.node.body);
                        })
                    }
                    siblingCount={1}
                    object={props.node.body}
                    setObject={
                        props.setObject
                        && (newBody => {
                            props.setObject?.(
                                nodeToObject({
                                    ...props.node,
                                    body: newBody ?? defaultObject,
                                }),
                            );
                        })
                    }
                    path={[...props.path, 0]}
                    widthBudgetInPixels={calculateFunctionBodyWidthBudgetInPixels(
                        props.widthBudgetInPixels,
                        appState.layoutOptions(),
                    )}
                />
            </EnclosingFunctionsContext.Provider>
        </>
    );
};
