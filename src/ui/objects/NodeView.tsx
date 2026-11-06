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
import {GAP, ICON_WIDTH, LayoutMode, measureText} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

const BinaryOperationView = (props: {
    node: TimesNode | PlusNode;
    icon: JSXElement;
    iconWidth: number;
    path: ObjectSelectionPath;
    childCount: number;
    budget: number;
    layoutModeOfEnclosingObjectView: LayoutMode;
    setObject?: ((newObject: Object) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <ObjectView
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(props.node.first);
                    })
                }
                siblingCount={props.childCount}
                object={props.node.first}
                setObject={
                    props.setObject
                    && (newFirst => {
                        if (newFirst === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(props.node.second);
                        } else {
                            props.setObject?.(
                                nodeToObject({...props.node, first: newFirst}),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={props.budget}
            />
            {props.icon}
            <ObjectView
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(props.node.second);
                    })
                }
                siblingCount={props.childCount}
                object={props.node.second}
                setObject={
                    props.setObject
                    && (newSecond => {
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
                widthBudgetInPixels={
                    props.layoutModeOfEnclosingObjectView === LayoutMode.Column
                        ? props.budget
                        : props.budget - props.iconWidth - GAP
                }
            />
        </>
    );
};

const NodeView = (props: {
    node: Node;
    setObject: ((newObject: Object) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
    childCount: number;

    widthBudgetInPixels: number;

    layoutModeOfEnclosingObjectView: LayoutMode;
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
                                props.setObject
                                && (() => {
                                    if (!props.setObject) return;

                                    objectSelection.selectParent();
                                    props.setObject(functionNode().body);
                                })
                            }
                            siblingCount={props.childCount}
                            object={functionNode().body}
                            setObject={
                                props.setObject
                                && (newBody => {
                                    props.setObject?.(
                                        nodeToObject({
                                            ...functionNode(),
                                            body: newBody ?? defaultObject,
                                        }),
                                    );
                                })
                            }
                            path={[...props.path, 0]}
                            widthBudgetInPixels={
                                props.widthBudgetInPixels
                                - measureText("x")
                                - ICON_WIDTH.mapsTo
                                - 2 * GAP
                            }
                        />
                    </>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Plus)}>
                {plusNode => (
                    <BinaryOperationView
                        icon={<PlusIcon />}
                        iconWidth={ICON_WIDTH.plus}
                        node={plusNode()}
                        childCount={props.childCount}
                        path={props.path}
                        budget={props.widthBudgetInPixels}
                        layoutModeOfEnclosingObjectView={
                            props.layoutModeOfEnclosingObjectView
                        }
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
                                props.setObject
                                && (() => {
                                    if (!props.setObject) return;

                                    objectSelection.selectParent();
                                    props.setObject?.(literalNode().object);
                                })
                            }
                            siblingCount={props.childCount}
                            object={literalNode().object}
                            setObject={
                                props.setObject
                                && (newObject => {
                                    props.setObject?.(
                                        nodeToObject({
                                            ...literalNode(),
                                            object: newObject ?? defaultObject,
                                        }),
                                    );
                                })
                            }
                            path={[...props.path, 0]}
                            widthBudgetInPixels={
                                props.widthBudgetInPixels - ICON_WIDTH.box - GAP
                            }
                        />
                    </>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Times)}>
                {timesNode => (
                    <BinaryOperationView
                        icon={<DotIcon />}
                        iconWidth={ICON_WIDTH.dot}
                        node={timesNode()}
                        childCount={props.childCount}
                        path={props.path}
                        budget={props.widthBudgetInPixels}
                        layoutModeOfEnclosingObjectView={
                            props.layoutModeOfEnclosingObjectView
                        }
                        setObject={props.setObject}
                    />
                )}
            </Match>
        </Switch>
    );
};

export default NodeView;
