import {TextField} from "@kobalte/core/text-field";
import {createComputed, createSignal} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";

export default (props: {
    name: string | undefined;
    setName: ((newName: string | undefined) => void) | undefined;
}) => {
    const preferences = usePreferences();

    const [text, setText] = createSignal("");
    createComputed(() => setText(props.name ?? ""));

    const commit = () => {
        if (!props.setName) return;

        const newName = text().trim();

        if (newName === (props.name ?? "")) {
            setText(props.name ?? "");
            return;
        }

        props.setName(newName.length === 0 ? undefined : newName);
    };

    return (
        <TextField
            value={text()}
            onChange={setText}
            readOnly={!props.setName}
            class="w-20 shrink-0"
        >
            <TextField.Input
                spellcheck={false}
                placeholder="x"
                title={preferences.translate(Phrase.ParameterName, undefined)}
                aria-label={preferences.translate(
                    Phrase.ParameterName,
                    undefined,
                )}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                        setText(props.name ?? "");
                        e.currentTarget.blur();
                    }
                }}
                onBlur={commit}
                class="block w-full rounded-full border border-line-strong bg-surface-sunken px-2 py-0.5 text-center text-fg placeholder:text-fg-subtle focus:outline-2 focus:outline-primary"
            />
        </TextField>
    );
};
