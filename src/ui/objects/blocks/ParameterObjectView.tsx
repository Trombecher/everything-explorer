import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {EverythingObject} from "@/model";
import {nodeToObject, type ParameterNode} from "@/model/nodes";

import ItalicXIcon from "../../icons/ItalicXIcon";
import Select from "../../reuse/Select";
import {useEnclosingFunctions} from "../enclosingFunctions";

export default (props: {
    node: ParameterNode;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => {
    const appState = useAppState();
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
        const functionDepth = appState.translate(Phrase.FunctionDepth, {
            depth: String(depth),
        });

        const enclosingFunction = enclosingFunctions()[Number(depth)];

        if (!enclosingFunction) {
            return `${functionDepth} (${appState.translate(Phrase.OutOfRange, undefined)})`;
        }

        if (enclosingFunction.parameterName) {
            return `${enclosingFunction.parameterName} (${functionDepth})`;
        }

        return functionDepth;
    };

    return (
        <>
            <ItalicXIcon />
            <Show
                when={enclosingFunctions().length > 0}
                fallback={
                    <span class="italic">
                        {appState.translate(
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
