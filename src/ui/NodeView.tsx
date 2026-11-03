import BoxIcon from "lucide-solid/icons/box";
import PlusIcon from "lucide-solid/icons/plus";
import type {Setter} from "solid-js";
import {Match, Switch} from "solid-js";

import type {Object} from "@/model";
import type {Node} from "@/model/nodes";
import {NodeType} from "@/model/nodes";
import {variant} from "@/util";

import ObjectView from "./ObjectView";
import MapsToIcon from "./reuse/MapsToIcon";

const NodeView = (props: {node: Node; setObject?: Setter<Object>}) => {
    return (
        <Switch>
            <Match when={variant(props.node, NodeType.Function)}>
                {functionObject => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-violet-700 bg-violet-500 p-1">
                        <i>x</i>
                        <MapsToIcon />
                        <ObjectView object={functionObject().body} />
                    </div>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Plus)}>
                {plusNode => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-lime-700 bg-lime-500 p-1">
                        <ObjectView object={plusNode().first} />
                        <PlusIcon />
                        <ObjectView object={plusNode().second} />
                    </div>
                )}
            </Match>
            <Match when={variant(props.node, NodeType.Literal)}>
                {literalNode => (
                    <div class="flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-400 p-1">
                        <BoxIcon />
                        <ObjectView object={literalNode().object} />
                    </div>
                )}
            </Match>
        </Switch>
    );
};

export default NodeView;
