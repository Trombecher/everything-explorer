import BoxIcon from "lucide-solid/icons/box";
import DotIcon from "lucide-solid/icons/dot";
import PlusIcon from "lucide-solid/icons/plus";
import type {JSXElement} from "solid-js";
import {Match, Switch} from "solid-js";

import type {Object} from "@/model";
import {defaultObject} from "@/model";
import type {Node, PlusNode, TimesNode} from "@/model/nodes";
import {nodeToObject, NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import MapsToIcon from "../reuse/MapsToIcon";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

const BinaryOperationView = (props: {
    node: TimesNode | PlusNode;
    icon: JSXElement;
    path: ObjectSelectionPath;
    childCount: number;
    setObject?: ((newObject: Object) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <ObjectView
                replaceParentWithThis={
                    props.setObject &&
                    (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(props.node.first);
                    })
                }
                siblingCount={props.childCount}
                object={props.node.first}
                setObject={
                    props.setObject &&
                    (newFirst => {
                        if (newFirst === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(props.node.second);
                        } else {
                            props.setObject?.(
                                nodeToObject({
                                    ...props.node,
                                    first: newFirst,
                                }),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
            />
            {props.icon}
            <ObjectView
                replaceParentWithThis={
                    props.setObject &&
                    (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(props.node.second);
                    })
                }
                siblingCount={props.childCount}
                object={props.node.second}
                setObject={
                    props.setObject &&
                    (newSecond => {
                        if (newSecond === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(props.node.first);
                        } else {
                            props.setObject?.(
                                nodeToObject({
                                    ...props.node,
                                    second: newSecond,
                                }),
                            );
                        }
                    })
                }
                path={[...props.path, 1]}
            />
        </>
    );
};

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
                            replaceParentWithThis={
                                props.setObject &&
                                (() => {
                                    if (!props.setObject) return;

                                    objectSelection.selectParent();
                                    props.setObject(functionNode().body);
                                })
                            }
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
                    <BinaryOperationView
                        icon={<PlusIcon />}
                        node={plusNode()}
                        childCount={props.childCount}
                        path={props.path}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Literal)}>
                {literalNode => (
                    <>
                        <BoxIcon />
                        <ObjectView
                            replaceParentWithThis={
                                props.setObject &&
                                (() => {
                                    if (!props.setObject) return;

                                    objectSelection.selectParent();
                                    props.setObject?.(literalNode().object);
                                })
                            }
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
            <Match when={variant(props.node, NodeType.Times)}>
                {timesNode => (
                    <BinaryOperationView
                        icon={<DotIcon />}
                        node={timesNode()}
                        childCount={props.childCount}
                        path={props.path}
                        setObject={props.setObject}
                    />
                )}
            </Match>
        </Switch>
    );
};

export default NodeView;
