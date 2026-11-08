import AtomIcon from "lucide-solid/icons/atom";
import {createEffect} from "solid-js";

import {ObjectType} from "@/model";
import type {Atom} from "@/model/atoms";
import BigIntTextField from "@/ui/reuse/BigIntTextField";

import {useLayoutOptions} from "./layoutOptions";
import {useAtomName} from "./useAtomName";

const MAX_ATOM_VALUE = (1n << 128n) - 1n;

export default (props: {
    atom: Atom;
    setAtom: ((newAtom: Atom) => void) | undefined;
}) => {
    const layoutOptions = useLayoutOptions();
    const name = useAtomName(() => props.atom);

    const label = () => name() ?? String(props.atom.value);

    createEffect(() => {
        const text = name();
        if (text === undefined) return;

        const value = props.atom.value;

        layoutOptions.set(previous =>
            previous.atomNames.get(value) === text
                ? previous
                : {
                      ...previous,
                      atomNames: new Map(previous.atomNames).set(value, text),
                  },
        );
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
