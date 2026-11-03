import PlusIcon from "lucide-solid/icons/plus";
import type {Setter} from "solid-js";
import {Match, Switch} from "solid-js";

import {ObjectType, type Object} from "@/model";
import {variant} from "@/util";

import MapsToIcon from "./reuse/MapsToIcon";

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
            <Match when={variant(props.object, ObjectType.Function)}>
                {functionObject => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-violet-700 bg-violet-500 p-1">
                        <i>x</i>
                        <MapsToIcon />
                        <ObjectView object={functionObject().body} />
                    </div>
                )}
            </Match>
            <Match when={variant(props.object, ObjectType.Plus)}>
                {plusObject => (
                    <div class="text-always-white flex items-center gap-1 rounded-lg border border-lime-700 bg-lime-500 p-1">
                        <ObjectView object={plusObject().first} />
                        <PlusIcon />
                        <ObjectView object={plusObject().second} />
                    </div>
                )}
            </Match>
        </Switch>
    );
};

export default ObjectView;
