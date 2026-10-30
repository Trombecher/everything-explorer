import {Select} from "@kobalte/core/select";
import type {JSXElement} from "solid-js";

export default <T, I extends string>(props: {
    options: readonly T[];
    value: T;
    onChange: (newValue: T) => void;
    idFromValue: (value: T) => I;
    idToValue: (id: I) => T;
    class?: string;
    stringifyValue: (value: T) => string;
    description: JSXElement;
}) => {
    return (
        <Select<I>
            class={props.class}
            options={props.options.map(props.idFromValue)}
            value={props.idFromValue(props.value)}
            onChange={newValue => {
                if (newValue === null) return;

                props.onChange(props.idToValue(newValue));
            }}
            disallowEmptySelection
            itemComponent={itemProps => (
                <Select.Item
                    item={itemProps.item}
                    class="rounded-xl px-2 py-1 select-none hover:bg-neutral-100"
                >
                    <Select.ItemLabel>
                        {props.stringifyValue(
                            props.idToValue(itemProps.item.rawValue),
                        )}
                    </Select.ItemLabel>
                </Select.Item>
            )}
        >
            <div>
                <Select.Label />
                <Select.Description>{props.description}</Select.Description>
            </div>
            <Select.Trigger class="min-w-48 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-left">
                <Select.Value<I>>
                    {selected => (
                        <>
                            {props.stringifyValue(
                                props.idToValue(selected.selectedOption()),
                            )}
                        </>
                    )}
                </Select.Value>
                <Select.Icon />
            </Select.Trigger>

            <Select.Portal>
                <Select.Content class="rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg">
                    <Select.Listbox />
                </Select.Content>
            </Select.Portal>
        </Select>
    );
};
