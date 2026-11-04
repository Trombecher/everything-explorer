import BoxIcon from "lucide-solid/icons/box";
import PlusIcon from "lucide-solid/icons/plus";
import {Match, Switch} from "solid-js";

import type {Object} from "@/model";
import {defaultObject} from "@/model";
import type {Node} from "@/model/nodes";
import {nodeToObject, NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import MapsToIcon from "../reuse/MapsToIcon";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

const NodeView = (props: {
    node: Node;
    setObject: ((newObject: Object) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
    childCount: number;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <Switch>
            <Match when={variant(props.node, NodeType.Function)}>
                {functionNode => (
                    <>
                        <i>x</i>
                        <MapsToIcon />
                        <ObjectView
                            siblingCount={props.childCount}
                            object={functionNode().body}
                            setObject={
                                props.setObject &&
                                (newBody => {
                                    props.setObject?.(
                                        nodeToObject({
                                            ...functionNode(),
                                            body: newBody ?? defaultObject,
                                        }),
                                    );
                                })
                            }
                            path={[...props.path, 0]}
                        />
                    </>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Plus)}>
                {plusNode => (
                    <>
                        <ObjectView
                            siblingCount={props.childCount}
                            object={plusNode().first}
                            setObject={
                                props.setObject &&
                                (newFirst => {
                                    if (newFirst === undefined) {
                                        objectSelection.selectParent();

                                        props.setObject?.(plusNode().second);
                                    } else {
                                        props.setObject?.(
                                            nodeToObject({
                                                ...plusNode(),
                                                first: newFirst,
                                            }),
                                        );
                                    }
                                })
                            }
                            path={[...props.path, 0]}
                        />
                        <PlusIcon />
                        <ObjectView
                            siblingCount={props.childCount}
                            object={plusNode().second}
                            setObject={
                                props.setObject &&
                                (newSecond => {
                                    if (newSecond === undefined) {
                                        objectSelection.selectParent();

                                        props.setObject?.(plusNode().first);
                                    } else {
                                        props.setObject?.(
                                            nodeToObject({
                                                ...plusNode(),
                                                second: newSecond,
                                            }),
                                        );
                                    }
                                })
                            }
                            path={[...props.path, 1]}
                        />
                    </>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Literal)}>
                {literalNode => (
                    <>
                        <BoxIcon />
                        <ObjectView
                            siblingCount={props.childCount}
                            object={literalNode().object}
                            setObject={
                                props.setObject &&
                                (newObject => {
                                    props.setObject?.(
                                        nodeToObject({
                                            ...literalNode(),
                                            object: newObject ?? defaultObject,
                                        }),
                                    );
                                })
                            }
                            path={[...props.path, 0]}
                        />
                    </>
                )}
            </Match>
        </Switch>
    );
};

export default NodeView;
