import {TextField} from "@kobalte/core/text-field";
import {createComputed, createSignal} from "solid-js";

import {ObjectType, type CharacterObject} from "@/model";

import {
    escapeCharacterForDisplay,
    parseCharacterText,
} from "./scalarFormatting";

export default (props: {
    character: CharacterObject;
    setCharacter: ((newCharacter: CharacterObject) => void) | undefined;
}) => {
    const [text, setText] = createSignal("");
    const [editing, setEditing] = createSignal(false);
    const [invalid, setInvalid] = createSignal(false);

    const displayedText = () =>
        editing() ? text() : escapeCharacterForDisplay(props.character.value);

    createComputed(() => {
        if (!editing()) {
            setText(escapeCharacterForDisplay(props.character.value));
            setInvalid(false);
        }
    });

    return (
        <TextField
            as="span"
            value={displayedText()}
            onChange={newText => {
                setText(newText);
                setInvalid(parseCharacterText(newText) === undefined);
            }}
            validationState={invalid() ? "invalid" : undefined}
            readOnly={!props.setCharacter}
            class="flex items-center"
        >
            <span>'</span>
            <TextField.Input
                spellcheck={false}
                autocomplete="off"
                onFocus={event => {
                    if (!props.setCharacter) return;

                    setText(escapeCharacterForDisplay(props.character.value));
                    setInvalid(false);
                    setEditing(true);
                    event.currentTarget.select();
                }}
                onKeyDown={event => {
                    if (event.isComposing) return;

                    if (event.key === "Enter") {
                        event.currentTarget.blur();
                    } else if (event.key === "Escape") {
                        setText(
                            escapeCharacterForDisplay(props.character.value),
                        );
                        setInvalid(false);
                        event.currentTarget.blur();
                    }
                }}
                onBlur={() => {
                    const character = parseCharacterText(text());

                    if (
                        character !== undefined
                        && props.setCharacter
                        && character !== props.character.value
                    ) {
                        props.setCharacter({
                            type: ObjectType.Character,
                            value: character,
                        });
                    }

                    setEditing(false);
                    setInvalid(false);
                }}
                class="block field-sizing-content text-center focus:min-w-16 data-invalid:outline-2 data-invalid:outline-danger"
            />
            <span>'</span>
        </TextField>
    );
};
