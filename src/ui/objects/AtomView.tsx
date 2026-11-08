import AtomIcon from "lucide-solid/icons/atom";
import {createEffect} from "solid-js";

import {useAppState} from "@/context";
import {ObjectType} from "@/model";
import type {Atom} from "@/model/atoms";
import BigIntTextField from "@/ui/reuse/BigIntTextField";

import {useAtomNames} from "./atomNames";

const MAX_ATOM_VALUE = (1n << 128n) - 1n;

export default (props: {
    atom: Atom;
    setAtom: ((newAtom: Atom) => void) | undefined;
}) => {
    const appState = useAppState();
    const atomNames = useAtomNames();

    createEffect(() => {
        const connectionClient = appState.connectionClient();
        if (connectionClient) atomNames.ensure(connectionClient, props.atom);
    });

    const label = () => atomNames.displayText(props.atom);

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
