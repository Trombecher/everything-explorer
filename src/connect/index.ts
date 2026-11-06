import z from "zod";

import {ObjectType, type EverythingObject, type Statement} from "@/model";
import type {Atom} from "@/model/atoms";

import {
    jsonObjectToObject,
    jsonObjectsSchema,
    objectToJsonObject,
    statementToJsonStatement,
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

        if (!response.ok) throw new Error("error while fetching known atoms");

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
    public async valuesOfObject(
        object: EverythingObject,
    ): Promise<EverythingObject[]> {
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
     * Returns all values `x` such that `constructor x` is a value of `object`.
     */
    public async constructionValuesOfObject(
        object: EverythingObject,
        constructor: EverythingObject,
    ): Promise<EverythingObject[]> {
        const response = await fetch(`${this.url}/api/v1/constructionValues`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                object: objectToJsonObject(object),
                constructor: objectToJsonObject(constructor),
            }),
        });

        if (!response.ok) {
            throw new Error(
                `failed to query construction values (${response.status}): ${await response.text()}`,
            );
        }

        return jsonObjectsSchema
            .parse(await response.json())
            .map(jsonObjectToObject);
    }

    /**
     * Adds the given statement to the knowledge base.
     */
    public async addStatement(statement: Statement): Promise<void> {
        const response = await fetch(`${this.url}/api/v1/addStatement`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(statementToJsonStatement(statement)),
        });

        if (!response.ok) {
            throw new Error(
                `failed to add statement (${response.status}): ${await response.text()}`,
            );
        }
    }

    /**
     * Removes the given statement from the knowledge base.
     */
    public async removeStatement(statement: Statement): Promise<void> {
        const response = await fetch(`${this.url}/api/v1/removeStatement`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(statementToJsonStatement(statement)),
        });

        if (!response.ok) {
            throw new Error(
                `failed to remove statement (${response.status}): ${await response.text()}`,
            );
        }
    }

    /**
     * Returns the path of the knowledge base file the server is serving.
     */
    public async servingPath(): Promise<string> {
        return (await fetch(`${this.url}/api/v1/servingPath`)).text();
    }
}
