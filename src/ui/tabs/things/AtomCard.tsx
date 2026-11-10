import {Button} from "@kobalte/core/button";
import {Show, type Setter} from "solid-js";

import type {Atom} from "@/model/atoms";
import {useAtomName} from "@/ui/objects/useAtomName";

export default (props: {
    atom: Atom;
    isNew: boolean;
    selectedAtom: Atom | undefined;
    setSelectedAtom: Setter<Atom | undefined>;
}) => {
    const name = useAtomName(() => props.atom);

    return (
        <Button
            onClick={() => {
                // Toggle
                if (props.selectedAtom !== props.atom) {
                    props.setSelectedAtom(props.atom);
                } else {
                    props.setSelectedAtom(undefined);
                }
            }}
            class={`flex h-48 w-48 flex-col overflow-hidden rounded-4xl border p-4 text-left ${props.selectedAtom === props.atom ? "border-blue-500 bg-blue-400/20" : "border-neutral-200 bg-neutral-100 hover:bg-neutral-200"}`}
        >
            <Show when={props.isNew}>
                <span class="mb-1 self-center rounded-full bg-blue-400/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-blue-500">
                    New
                </span>
            </Show>
            <span class="block text-center text-lg font-medium">
                {name() ?? String(props.atom.value)}
            </span>
        </Button>
    );
};
