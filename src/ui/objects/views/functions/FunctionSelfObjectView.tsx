import RotateCcwIcon from "lucide-solid/icons/rotate-ccw";
import {Show} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {EverythingObject} from "@/model";
import {nodeToObject, type FunctionSelfNode} from "@/model/nodes";

import Select from "../../../reuse/Select";
import {useEnclosingFunctions} from "../../enclosingFunctions";

export default (props: {
    node: FunctionSelfNode;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const preferences = usePreferences();
    const outerEnclosingFunctions = useEnclosingFunctions();

    const enclosingFunctions = outerEnclosingFunctions;

    const options = () => {
        const depth = props.node.depth;
        const values = enclosingFunctions().map((_, index) => BigInt(index));

        if (!values.some(value => value === depth)) {
            // Keep an out-of-range depth selectable so the
            // dropdown can display the current value.
            values.push(depth);
        }

        return values;
    };

    const labelOf = (depth: bigint) => {
        const self = preferences.translate(Phrase.Self, undefined);
        const functionDepth = preferences.translate(Phrase.FunctionDepth, {
            depth: String(depth),
        });

        const enclosingFunction = enclosingFunctions()[Number(depth)];

        if (!enclosingFunction) {
            return `${self} (${functionDepth} (${preferences.translate(Phrase.OutOfRange, undefined)}))`;
        }

        return `${self} (${functionDepth})`;
    };

    return (
        <>
            <RotateCcwIcon />
            <Show
                when={enclosingFunctions().length > 0}
                fallback={
                    <span class="italic">
                        {preferences.translate(
                            Phrase.NoEnclosingFunction,
                            undefined,
                        )}
                    </span>
                }
            >
                <Select<bigint, string>
                    options={options()}
                    value={props.node.depth}
                    onChange={newDepth => {
                        props.setObject?.(
                            nodeToObject({...props.node, depth: newDepth}),
                        );
                    }}
                    idFromValue={value => String(value)}
                    idToValue={id => BigInt(id)}
                    stringifyValue={labelOf}
                    description=""
                    class="w-48"
                />
            </Show>
        </>
    );
};
