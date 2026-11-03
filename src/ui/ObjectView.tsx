import {For, Match, Switch, type Setter} from "solid-js";

import {ObjectType, type Object} from "@/model";
import {objectToNode} from "@/model/nodes";
import {variant} from "@/util";

import NodeView from "./NodeView";
import LeftBraceIcon from "./reuse/LeftBraceIcon";

const ObjectView = (props: {object: Object; setObject?: Setter<Object>}) => {
    return (
        <Switch>
            <Match when={variant(props.object, ObjectType.Atom)}>
                {atom => (
                    <div class="text-always-white rounded-lg bg-yellow-600 px-2">
                        @{String(atom().value)}
                    </div>
                )}
            </Match>
            <Match when={variant(props.object, ObjectType.Integer)}>
                {atom => (
                    <div class="text-always-white rounded-lg border border-teal-700 bg-teal-500 px-2">
                        {Number(atom().value)}
                    </div>
                )}
            </Match>
            <Match when={objectToNode(props.object)}>
                {node => <NodeView node={node()} setObject={props.setObject} />}
            </Match>
            <Match when={variant(props.object, ObjectType.Set)}>
                {set => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-yellow-900 bg-yellow-700 p-1">
                        <LeftBraceIcon />
                        <For each={set().elements}>
                            {(element, i) => (
                                <>
                                    {i() > 0 ? "," : ""}
                                    <ObjectView object={element} />
                                </>
                            )}
                        </For>
                        <LeftBraceIcon class="-scale-x-100" />
                    </div>
                )}
            </Match>
            <Match when={variant(props.object, ObjectType.Construction)}>
                {construction => (
                    <div class="text-always-white rounded-lg bg-fuchsia-600">
                        <ObjectView object={construction().constructor} />
                        <ObjectView object={construction().value} />
                    </div>
                )}
            </Match>
        </Switch>
    );
};

export default ObjectView;
