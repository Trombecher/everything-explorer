import {createResource, Suspense} from "solid-js";

import {useAppState} from "@/context";
import {ObjectType, type Object} from "@/model";
import {Atom} from "@/model/atoms";

/**
 * Formats the values of the `name` construction of an atom for display.
 */
export const formatAtomNames = (names: readonly Object[]): string =>
    names
        .map(object => {
            if (object.type === ObjectType.Text) return object.text;
            return "<object>";
        })
        .join(", ");

export default (props: {atom: Atom}) => {
    const appState = useAppState();

    const [names] = createResource(
        () => {
            const connectionClient = appState.connectionClient();
            return connectionClient && {connectionClient, atom: props.atom};
        },
        ({connectionClient, atom}) =>
            connectionClient.constructionValuesOfObject(atom, Atom.Name),
    );

    const numericLabel = () => `@${String(props.atom.value)}`;

    const label = () => {
        const atomNames = names();

        if (!atomNames || atomNames.length === 0) return numericLabel();

        return `@${formatAtomNames(atomNames)}`;
    };

    return <Suspense fallback={numericLabel()}>{label()}</Suspense>;
};
