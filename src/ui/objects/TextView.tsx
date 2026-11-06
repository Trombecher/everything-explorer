import {TextField} from "@kobalte/core/text-field";
import {createComputed, createSignal} from "solid-js";

import {ObjectType, type TextObject} from "@/model";

export default (props: {
    text: TextObject;
    setText: ((newText: TextObject) => void) | undefined;
}) => {
    const [text, setText] = createSignal("");
    createComputed(() => setText(props.text.text));

    return (
        <TextField
            as="span"
            value={text()}
            onChange={setText}
            readOnly={!props.setText}
            class="flex items-center"
        >
            <span>"</span>
            <TextField.Input
                spellcheck={false}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    }
                }}
                onBlur={() => {
                    if (!props.setText) return;

                    const newText = text();

                    if (newText.length === 0) {
                        // A text object must never be empty.
                        setText(props.text.text);
                        return;
                    }

                    if (newText !== props.text.text) {
                        props.setText({type: ObjectType.Text, text: newText});
                    }
                }}
                class="block field-sizing-content"
            />
            <span>"</span>
        </TextField>
    );
};
