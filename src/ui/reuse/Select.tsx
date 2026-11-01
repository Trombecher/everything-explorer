import {Select} from "@kobalte/core/select";
import CheckIcon from "lucide-solid/icons/check";
import ChevronsUpDownIcon from "lucide-solid/icons/chevrons-up-down";
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
                    class="group flex rounded-xl px-2 py-1 select-none hover:bg-neutral-100"
                >
                    <Select.ItemLabel>
                        {props.stringifyValue(
                            props.idToValue(itemProps.item.rawValue),
                        )}
                    </Select.ItemLabel>
                    <Select.Icon class="ml-auto hidden group-data-selected:block">
                        <CheckIcon />
                    </Select.Icon>
                </Select.Item>
            )}
        >
            <div>
                <Select.Label />
                <Select.Description>{props.description}</Select.Description>
            </div>
            <Select.Trigger class="flex min-w-48 rounded-full border border-neutral-200 bg-neutral-100 p-1 text-left data-expanded:bg-neutral-200">
                <Select.Value<I> class="pl-2">
                    {selected => (
                        <>
                            {props.stringifyValue(
                                props.idToValue(selected.selectedOption()),
                            )}
                        </>
                    )}
                </Select.Value>
                <Select.Icon class="ml-auto">
                    <ChevronsUpDownIcon />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content class="rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg select-none">
                    <h3 class="px-2 py-1 text-sm font-medium text-neutral-600">
                        {props.description}
                    </h3>
                    <Select.Listbox />
                </Select.Content>
            </Select.Portal>
        </Select>
    );
};
