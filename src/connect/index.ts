import z from "zod";

import {OBJECT_TYPE_ATOM, type Atom} from "@/model";

const knownAtomsEndpointResponse = z.array(z.string());

export class ConnectionClient {
    public readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public async knownAtoms(limit: number): Promise<Atom[]> {
        const response = await fetch(
            `${this.url}/api/v1/knownAtoms?limit=${limit}`,
        );

        return knownAtomsEndpointResponse
            .parse(await response.json())
            .map(atomString => ({
                type: OBJECT_TYPE_ATOM,
                value: BigInt(atomString),
            }));
    }

    /**
     * Returns the path of the knowledge base file the server is serving.
     */
    public async servingPath(): Promise<string> {
        return (await fetch(`${this.url}/api/v1/servingPath`)).text();
    }
}
