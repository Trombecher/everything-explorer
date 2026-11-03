import {Match, Switch, type Setter} from "solid-js";

import {ObjectType, type Object} from "@/model";
import {variant} from "@/util";

export default (props: {object: Object; setObject?: Setter<Object>}) => {
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
        </Switch>
    );
};
