import AtomIcon from "lucide-solid/icons/atom";
import {createEffect, createResource} from "solid-js";

import {useAppState} from "@/context";
import {ObjectType} from "@/model";
import {Atom} from "@/model/atoms";
import BigIntTextField from "@/ui/reuse/BigIntTextField";

import {
    cacheAtomNames,
    formatAtomNames,
    noteAtomNamesConnection,
} from "./atomNames";

const MAX_ATOM_VALUE = (1n << 128n) - 1n;

export default (props: {
    atom: Atom;
    setAtom: ((newAtom: Atom) => void) | undefined;
}) => {
    const appState = useAppState();

    const [names] = createResource(
        () => {
            const connectionClient = appState.connectionClient();
            return connectionClient && {connectionClient, atom: props.atom};
        },
        ({connectionClient, atom}) => {
            noteAtomNamesConnection(connectionClient.url);

            return connectionClient.constructionValuesOfObject(atom, Atom.Name);
        },
    );

    createEffect(() => {
        const atomNames = names();

        if (atomNames) cacheAtomNames(props.atom, atomNames);
    });

    const label = () => {
        const atomNames = names();

        if (!atomNames || atomNames.length === 0) {
            return String(props.atom.value);
        }

        return formatAtomNames(atomNames);
    };

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
