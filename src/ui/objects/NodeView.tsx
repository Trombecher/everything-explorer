import BoxIcon from "lucide-solid/icons/box";
import PlusIcon from "lucide-solid/icons/plus";
import {Match, Switch} from "solid-js";

import {defaultObject} from "@/model";
import type {Node} from "@/model/nodes";
import {NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import MapsToIcon from "../reuse/MapsToIcon";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";

const NodeView = (props: {
    node: Node;
    setNode: ((newNode: Node) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
    childCount: number;
}) => {
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
                                props.setNode &&
                                (newBody => {
                                    props.setNode?.({
                                        ...functionNode(),
                                        body: newBody ?? defaultObject,
                                    });
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
                                props.setNode &&
                                (newFirst => {
                                    props.setNode?.({
                                        ...plusNode(),
                                        first: newFirst ?? defaultObject,
                                    });
                                })
                            }
                            path={[...props.path, 0]}
                        />
                        <PlusIcon />
                        <ObjectView
                            siblingCount={props.childCount}
                            object={plusNode().second}
                            setObject={
                                props.setNode &&
                                (newSecond => {
                                    props.setNode?.({
                                        ...plusNode(),
                                        second: newSecond ?? defaultObject,
                                    });
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
                                props.setNode &&
                                (newObject => {
                                    props.setNode?.({
                                        ...literalNode(),
                                        object: newObject ?? defaultObject,
                                    });
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
