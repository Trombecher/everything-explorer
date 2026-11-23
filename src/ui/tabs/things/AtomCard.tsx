import {Button} from "@kobalte/core/button";

import type {Atom} from "@/model/atoms";
import {createAtomName} from "@/ui/objects/createAtomName";

export default (props: {
    atom: Atom;
    selectedAtom: Atom | undefined;
    setSelectedAtom: (atom: Atom | undefined) => void;
}) => {
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
            <span class="line-clamp-3 w-full text-sm leading-tight font-medium break-all">
                {name() ?? String(props.atom.value)}
            </span>
        </Button>
    );
};
