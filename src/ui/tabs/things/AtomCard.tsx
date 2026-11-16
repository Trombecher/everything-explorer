import {Button} from "@kobalte/core/button";
import {Show, type Setter} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {Atom} from "@/model/atoms";
import {useAtomName} from "@/ui/objects/useAtomName";

export default (props: {
    atom: Atom;
    isNew: boolean;
    selectedAtom: Atom | undefined;
    setSelectedAtom: Setter<Atom | undefined>;
}) => {
    const appState = useAppState();
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
            class={`flex size-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border p-2 text-center ${props.selectedAtom === props.atom ? "border-blue-500 bg-blue-400/20" : "border-neutral-300 bg-neutral-200 hover:bg-neutral-300"}`}
        >
            <Show when={props.isNew}>
                <span class="shrink-0 rounded-full bg-blue-400/20 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-blue-500">
                    {appState.translate(Phrase.New, undefined)}
                </span>
            </Show>
            <span class="line-clamp-3 w-full text-sm leading-tight font-medium break-all">
                {name() ?? String(props.atom.value)}
            </span>
        </Button>
    );
};
