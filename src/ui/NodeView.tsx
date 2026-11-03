import PlusIcon from "lucide-solid/icons/plus";
import type {Setter} from "solid-js";
import {Match, Switch} from "solid-js";

import {ObjectType} from "@/model";
import type {Node} from "@/model/nodes";
import {NodeType} from "@/model/nodes";
import {variant} from "@/util";

import ObjectView from "./ObjectView";
import MapsToIcon from "./reuse/MapsToIcon";

const NodeView = (props: {node: Node; setNode?: Setter<Node>}) => {
    return (
        <Switch>
            <Match when={variant(props.node, NodeType.Function)}>
                {functionObject => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-violet-700 bg-violet-500 p-1">
                        <i>x</i>
                        <MapsToIcon />
                        <NodeView node={functionObject().body} />
                    </div>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Plus)}>
                {plusNode => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-lime-700 bg-lime-500 p-1">
                        <NodeView node={plusNode().first} />
                        <PlusIcon />
                        <NodeView node={plusNode().second} />
                    </div>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Literal)}>
                {literalNode => <ObjectView object={literalNode().object} />}
            </Match>
        </Switch>
    );
};

export default NodeView;
