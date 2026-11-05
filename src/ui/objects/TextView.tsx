import {createComputed, createSignal} from "solid-js";

import {ObjectType, type TextObject} from "@/model";

export default (props: {
    text: TextObject;
    setText: ((newText: TextObject) => void) | undefined;
}) => {
    const [text, setText] = createSignal("");
    createComputed(() => setText(props.text.text));

    return (
        <span class="flex items-center">
            <span>"</span>
            <input
                value={text()}
                readOnly={!props.setText}
                spellcheck={false}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    }
                }}
                onBlur={
                    props.setText
                    && (() => {
                        const newText = text();

                        if (newText.length === 0) {
                            // A text object must never be empty.
                            setText(props.text.text);
                            return;
                        }

                        if (newText !== props.text.text) {
                            props.setText?.({
                                type: ObjectType.Text,
                                text: newText,
                            });
                        }
                    })
                }
                onInput={e => {
                    setText(e.currentTarget.value);
                }}
                class="block field-sizing-content"
            />
            <span>"</span>
        </span>
    );
};
