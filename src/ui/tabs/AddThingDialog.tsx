import {Dialog} from "@kobalte/core/dialog";
import {TextField} from "@kobalte/core/text-field";
import PlusIcon from "lucide-solid/icons/plus";
import {createMemo, createSignal, Show} from "solid-js";

import {ObjectType} from "@/model";
import {generateAtomId, MAX_ATOM_ID, type Atom} from "@/model/atoms";

import Button from "../reuse/Button";

const DECIMAL_INTEGER_PATTERN = /^\d+$/;

export default (props: {disabled: boolean; onAdd: (atom: Atom) => void}) => {
    const [open, setOpen] = createSignal(false);
    const [text, setText] = createSignal("");

    let input: HTMLInputElement | undefined;

    const parsedAtom = createMemo((): Atom | undefined => {
        const trimmed = text().trim();

        if (!DECIMAL_INTEGER_PATTERN.test(trimmed)) return undefined;

        const value = BigInt(trimmed);
        if (value > MAX_ATOM_ID) return undefined;

        return {type: ObjectType.Atom, value};
    });

    const regenerate = () => {
        setText(generateAtomId().toString());
        input?.focus();
        input?.select();
    };

    const confirm = () => {
        const atom = parsedAtom();
        if (!atom) return;

        props.onAdd(atom);
        setOpen(false);
    };

    return (
        <Dialog
            open={open()}
            onOpenChange={(isOpen: boolean) => {
                // Start every dialog with a fresh id.
                if (isOpen) setText(generateAtomId().toString());

                setOpen(isOpen);
            }}
        >
            <Dialog.Trigger
                disabled={props.disabled}
                class="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-500 px-3 py-1 font-medium text-white hover:bg-blue-600 active:scale-97 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
            >
                <PlusIcon />
                Add thing
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay class="fixed inset-0 z-50 bg-[#00000066]" />
                <Dialog.Content
                    onOpenAutoFocus={event => {
                        event.preventDefault();
                        input?.focus();
                        input?.select();
                    }}
                    class="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-4xl border border-neutral-200 bg-white p-4 shadow-xl"
                >
                    <Dialog.Title class="text-2xl font-semibold text-black">
                        Add a thing
                    </Dialog.Title>
                    <Dialog.Description class="text-base text-neutral-600">
                        Atom ids are opaque, globally unique identifiers and
                        should not describe the thing. The thing is only saved
                        once it has at least one property.
                    </Dialog.Description>

                    <TextField
                        value={text()}
                        onChange={setText}
                        validationState={parsedAtom() ? undefined : "invalid"}
                    >
                        <TextField.Label class="mb-1 block text-base font-medium text-neutral-700">
                            Atom id
                        </TextField.Label>
                        <TextField.Input
                            ref={element => (input = element)}
                            inputmode="numeric"
                            spellcheck={false}
                            onKeyDown={event => {
                                if (event.key !== "Enter") return;

                                event.preventDefault();
                                confirm();
                            }}
                            class="block w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-3 py-2 font-mono text-base text-black data-invalid:outline-2 data-invalid:outline-red-500"
                        />
                    </TextField>

                    <Show when={!parsedAtom()}>
                        <p class="text-base text-red-500">
                            The atom id must be a non-negative integer that fits
                            into 128 bits.
                        </p>
                    </Show>

                    <div class="mt-1 flex items-center gap-2">
                        <Button class="text-lg" onClick={regenerate}>
                            Generate
                        </Button>
                        <div class="grow" />
                        <Dialog.CloseButton class="cursor-pointer rounded-2xl bg-neutral-200 px-3 py-1 text-lg font-medium text-neutral-700 hover:bg-neutral-300 active:scale-97">
                            Cancel
                        </Dialog.CloseButton>
                        <Button
                            class="text-lg"
                            disabled={!parsedAtom()}
                            onClick={confirm}
                        >
                            Add
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};
