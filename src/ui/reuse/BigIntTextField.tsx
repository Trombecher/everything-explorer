import {TextField} from "@kobalte/core/text-field";
import {createComputed, createSignal} from "solid-js";

const DECIMAL_INTEGER_PATTERN = /^[+-]?\d+$/;

const parseDecimalInteger = (
    text: string,
    isValid: ((value: bigint) => boolean) | undefined,
): bigint | undefined => {
    const trimmed = text.trim();

    if (!DECIMAL_INTEGER_PATTERN.test(trimmed)) return undefined;

    try {
        const value = BigInt(trimmed);
        return isValid && !isValid(value) ? undefined : value;
    } catch {
        return undefined;
    }
};

export default (props: {
    value: bigint;
    setValue: ((newValue: bigint) => void) | undefined;

    /**
     * Text shown while the field is not being edited. Defaults to the decimal
     * representation of the value.
     */
    formatValue?: (value: bigint) => string;

    /**
     * Additional validation applied after parsing. Invalid input is shown with
     * a red outline and is not committed.
     */
    isValid?: (value: bigint) => boolean;

    title?: string;
    inputClass?: string;
}) => {
    const [text, setText] = createSignal("");
    const [editing, setEditing] = createSignal(false);
    const [invalid, setInvalid] = createSignal(false);

    const displayedText = () =>
        editing()
            ? text()
            : (props.formatValue?.(props.value) ?? String(props.value));

    createComputed(() => {
        if (!editing()) {
            setText(String(props.value));
            setInvalid(false);
        }
    });

    const updateValidation = (newText: string) => {
        setInvalid(parseDecimalInteger(newText, props.isValid) === undefined);
    };

    return (
        <TextField
            value={displayedText()}
            onChange={newText => {
                setText(newText);
                updateValidation(newText);
            }}
            validationState={invalid() ? "invalid" : undefined}
            readOnly={!props.setValue}
            class="block min-w-0"
        >
            <TextField.Input
                spellcheck={false}
                title={props.title}
                onFocus={() => {
                    if (!props.setValue) return;

                    setText(String(props.value));
                    setInvalid(false);
                    setEditing(true);
                }}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        // Focus object.
                        e.currentTarget.parentElement?.parentElement?.focus();
                    } else if (e.key === "Escape") {
                        setText(String(props.value));
                        setInvalid(false);
                        e.currentTarget.blur();
                    }
                }}
                onBlur={() => {
                    const value = parseDecimalInteger(text(), props.isValid);

                    if (
                        value !== undefined
                        && props.setValue
                        && value !== props.value
                    ) {
                        props.setValue(value);
                    }

                    setEditing(false);
                    setInvalid(false);
                }}
                class={`block field-sizing-content data-invalid:outline data-invalid:outline-2 data-invalid:outline-red-500 ${props.inputClass ?? ""}`}
            />
        </TextField>
    );
};
