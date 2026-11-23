import AtomIcon from "lucide-solid/icons/atom";
import {createComputed} from "solid-js";

import {ObjectType} from "@/model";
import type {Atom} from "@/model/atoms";
import BigIntTextField from "@/ui/reuse/BigIntTextField";

import {useAtomNames} from "./atomNames";
import {createAtomName} from "./createAtomName";

const MAX_ATOM_VALUE = (1n << 128n) - 1n;

export default (props: {
    atom: Atom;
    setAtom: ((newAtom: Atom) => void) | undefined;
}) => {
    const atomNames = useAtomNames();
    const name = createAtomName(() => props.atom);

    const label = () => name() ?? String(props.atom.value);

    createComputed(() => {
        const text = name();
        if (text === undefined) return;

        // Cached for layout measurement. `setName` ignores unchanged names.
        atomNames.setName(props.atom.value, text);
    });

    return (
        <>
            <AtomIcon />
            <BigIntTextField
                value={props.atom.value}
                setValue={
                    props.setAtom
                    && (value => {
                        props.setAtom?.({type: ObjectType.Atom, value});
                    })
                }
                formatValue={() => label()}
                isValid={value => value >= 0n && value <= MAX_ATOM_VALUE}
                title={label()}
            />
        </>
    );
};
