import {Match, Switch} from "solid-js";

import {ObjectType, type Object} from "@/model";
import {variant} from "@/util";

export default (props: {object: Object}) => {
    return (
        <div>
            <Switch>
                <Match when={variant(props.object, ObjectType.Atom)}>
                    {atom => <div>{Number(atom().value)}</div>}
                </Match>
            </Switch>
        </div>
    );
};
