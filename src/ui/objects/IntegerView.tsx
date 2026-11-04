import {createComputed, createSignal} from "solid-js";

import {ObjectType, type IntegerObject} from "@/model";
import BlackBoardZIcon from "@/ui/reuse/BlackBoardZIcon";

export default (props: {
    integer: IntegerObject;
    setInteger: ((newInteger: IntegerObject) => void) | undefined;
}) => {
    const [text, setText] = createSignal("");
    createComputed(() => setText(String(props.integer.value)));

    return (
        <>
            <BlackBoardZIcon />
            <input
                value={text()}
                readOnly={!props.setInteger}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    }
                }}
                onBlur={
                    props.setInteger &&
                    (() => {
                        try {
                            const newBigInt = BigInt(text());

                            props.setInteger?.({
                                type: ObjectType.Integer,
                                value: newBigInt,
                            });
                        } catch {}
                    })
                }
                onInput={e => {
                    setText(e.currentTarget.value);
                }}
                class="block field-sizing-content pr-2"
            />
        </>
    );
};
