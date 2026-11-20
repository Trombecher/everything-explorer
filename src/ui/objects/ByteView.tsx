import {TextField} from "@kobalte/core/text-field";
import {createComputed, createSignal} from "solid-js";

import {ObjectType, type ByteObject} from "@/model";

import {formatByteValue, parseByteText} from "./scalarFormatting";

export default (props: {
    byte: ByteObject;
    setByte: ((newByte: ByteObject) => void) | undefined;
}) => {
    const [text, setText] = createSignal("");
    const [editing, setEditing] = createSignal(false);
    const [invalid, setInvalid] = createSignal(false);

    const displayedText = () =>
        editing() ? text() : formatByteValue(props.byte.value);

    createComputed(() => {
        if (!editing()) {
            setText(formatByteValue(props.byte.value));
            setInvalid(false);
        }
    });

    return (
        <TextField
            as="span"
            value={displayedText()}
            onChange={newText => {
                setText(newText);
                setInvalid(parseByteText(newText) === undefined);
            }}
            validationState={invalid() ? "invalid" : undefined}
            readOnly={!props.setByte}
            class="flex items-center"
        >
            <span>x</span>
            <TextField.Input
                spellcheck={false}
                autocomplete="off"
                onFocus={event => {
                    if (!props.setByte) return;

                    setText(formatByteValue(props.byte.value));
                    setInvalid(false);
                    setEditing(true);
                    event.currentTarget.select();
                }}
                onKeyDown={event => {
                    if (event.isComposing) return;

                    if (event.key === "Enter") {
                        event.currentTarget.blur();
                    } else if (event.key === "Escape") {
                        setText(formatByteValue(props.byte.value));
                        setInvalid(false);
                        event.currentTarget.blur();
                    }
                }}
                onBlur={() => {
                    const byte = parseByteText(text());

                    if (
                        byte !== undefined
                        && props.setByte
                        && byte !== props.byte.value
                    ) {
                        props.setByte({type: ObjectType.Byte, value: byte});
                    }

                    setEditing(false);
                    setInvalid(false);
                }}
                class="block field-sizing-content pr-2 text-center focus:min-w-10 data-invalid:outline-2 data-invalid:outline-danger"
            />
        </TextField>
    );
};
