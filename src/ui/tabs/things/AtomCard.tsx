import {Button} from "@kobalte/core/button";
import {Show} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {Atom} from "@/model/atoms";
import {createAtomName} from "@/ui/objects/createAtomName";

export default (props: {
    atom: Atom;
    isNew: boolean;
    selectedAtom: Atom | undefined;
    setSelectedAtom: (atom: Atom | undefined) => void;
}) => {
    const preferences = usePreferences();
    const name = createAtomName(() => props.atom);

    const isSelected = () => props.selectedAtom?.value === props.atom.value;

    return (
        <Button
            onClick={() => {
                // Toggle
                if (!isSelected()) {
                    props.setSelectedAtom(props.atom);
                } else {
                    props.setSelectedAtom(undefined);
                }
            }}
            class={`flex size-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border p-2 text-center ${isSelected() ? "border-primary bg-primary-subtle" : "border-line-strong bg-surface-control hover:bg-surface-control-hover"}`}
        >
            <Show when={props.isNew}>
                <span class="shrink-0 rounded-full bg-primary-subtle px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-primary-fg">
                    {preferences.translate(Phrase.New, undefined)}
                </span>
            </Show>
            <span class="line-clamp-3 w-full text-sm leading-tight font-medium break-all">
                {name() ?? String(props.atom.value)}
            </span>
        </Button>
    );
};
