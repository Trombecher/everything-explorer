import z from "zod";

import {ObjectType, type Atom, type Object} from "@/model";

import {
    jsonObjectToObject,
    jsonObjectsSchema,
    objectToJsonObject,
} from "./wire";

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
                type: ObjectType.Atom,
                value: BigInt(atomString),
            }));
    }

    /**
     * Returns the values of the given object in the knowledge base.
     */
    public async valuesOfObject(object: Object): Promise<Object[]> {
        const response = await fetch(`${this.url}/api/v1/valuesOf`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(objectToJsonObject(object)),
        });

        if (!response.ok) {
            throw new Error(
                `failed to query values of object (${response.status}): ${await response.text()}`,
            );
        }

        return jsonObjectsSchema
            .parse(await response.json())
            .map(jsonObjectToObject);
    }

    /**
     * Returns the path of the knowledge base file the server is serving.
     */
    public async servingPath(): Promise<string> {
        return (await fetch(`${this.url}/api/v1/servingPath`)).text();
    }
}
