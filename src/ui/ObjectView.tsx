import {Match, Switch} from "solid-js";

import {ObjectType, type Object} from "@/model";
import {variant} from "@/util";

const ObjectView = (props: {object: Object}) => {
    return (
        <Switch>
            <Match when={variant(props.object, ObjectType.Atom)}>
                {atom => (
                    <div class="rounded-lg bg-yellow-600 px-2 text-white">
                        @{String(atom().value)}
                    </div>
                )}
            </Match>
            <Match when={variant(props.object, ObjectType.Integer)}>
                {atom => (
                    <div class="rounded-lg border border-teal-700 bg-teal-500 px-2 text-white">
                        {Number(atom().value)}
                    </div>
                )}
            </Match>
            <Match when={variant(props.object, ObjectType.Function)}>
                {f => (
                    <div class="rounded-lg border border-violet-700 bg-violet-500 p-1 text-white">
                        <ObjectView object={f().body} />
                    </div>
                )}
            </Match>
        </Switch>
    );
};

export default ObjectView;
