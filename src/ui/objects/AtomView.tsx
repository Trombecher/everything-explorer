import AtomIcon from "lucide-solid/icons/atom";
import {createEffect, createResource, Suspense} from "solid-js";

import {useAppState} from "@/context";
import {Atom} from "@/model/atoms";

import {
    cacheAtomNames,
    formatAtomNames,
    noteAtomNamesConnection,
} from "./atomNames";

export default (props: {atom: Atom}) => {
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
        <span class="flex items-center gap-1">
            <AtomIcon />
            <Suspense fallback={String(props.atom.value)}>{label()}</Suspense>
        </span>
    );
};
