import {createResource} from "solid-js";

import {useConnections} from "@/context";

export const createAtomList = () => {
    const connections = useConnections();

    const [atoms] = createResource(
        () => connections.connectionClient(),
        client => client.knownAtoms(100),
    );

    /**
     * The atoms shown in the things tab.
     *
     * `latest` keeps the previous list visible while a new connection is
     * loading instead of flashing an empty grid.
     */
    const displayedAtoms = () => atoms.latest ?? [];

    return {atoms, displayedAtoms};
};
