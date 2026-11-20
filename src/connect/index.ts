import z from "zod";

import {ObjectType, type EverythingObject} from "@/model";
import type {Atom} from "@/model/atoms";

import {
    jsonEvaluateResponseSchema,
    jsonIteratorPageSchema,
    jsonObjectToObject,
    jsonObjectsSchema,
    objectToJsonObject,
    type JsonChangeStatementsRequest,
} from "./wire";

const knownAtomsEndpointResponse = z.array(z.string());

/**
 * The result of evaluating an object.
 *
 * A lazy set is represented by a server-side iterator. Use
 * {@link LazyObjectIterator.next} to fetch its values page by page.
 */
export type EvaluationResult =
    | {readonly kind: "object"; readonly object: EverythingObject}
    | {readonly kind: "iterator"; readonly iterator: LazyObjectIterator};

export type LazyObjectIteratorPage = {
    readonly objects: EverythingObject[];
    readonly exhausted: boolean;
};

/**
 * A lazy set iterator that lives on the knowledge server.
 *
 * The iterator captures the knowledge it was created from, so changing the
 * knowledge base does not affect an ongoing iteration. It is deleted on the
 * server when it is exhausted or when {@link delete} is called.
 */
export class LazyObjectIterator {
    public constructor(
        private readonly url: string,
        private readonly token: number,
    ) {}

    /**
     * Fetches up to `limit` values, discarding `skip` values first.
     *
     * When the returned page reports `exhausted`, the iterator has been deleted
     * on the server and the token must not be used again.
     */
    public async next(
        limit: number,
        skip = 0,
    ): Promise<LazyObjectIteratorPage> {
        const response = await fetch(`${this.url}/api/v1/iteratorValues`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token: this.token, skip, limit}),
        });

        if (!response.ok) {
            throw new Error(
                `failed to fetch iterator values (${response.status}): ${await response.text()}`,
            );
        }

        const page = jsonIteratorPageSchema.parse(await response.json());

        return {
            objects: page.objects.map(jsonObjectToObject),
            exhausted: page.exhausted,
        };
    }

    /**
     * Deletes the iterator on the server.
     *
     * This is idempotent: deleting an already deleted iterator succeeds.
     */
    public async delete(): Promise<void> {
        const response = await fetch(`${this.url}/api/v1/deleteIterator`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token: this.token}),
        });

        if (!response.ok) {
            throw new Error(
                `failed to delete iterator (${response.status}): ${await response.text()}`,
            );
        }
    }
}

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
     * Evaluates the given object in the knowledge base.
     *
     * If the result is a lazy set, the server returns a token instead of
     * materializing the set. The returned iterator can then be paged through.
     */
    public async evaluateObject(
        object: EverythingObject,
    ): Promise<EvaluationResult> {
        const response = await fetch(`${this.url}/api/v1/evaluate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(objectToJsonObject(object)),
        });

        if (!response.ok) {
            throw new Error(
                `failed to evaluate object (${response.status}): ${await response.text()}`,
            );
        }

        const result = jsonEvaluateResponseSchema.parse(await response.json());

        switch (result.kind) {
            case "object":
                return {
                    kind: "object",
                    object: jsonObjectToObject(result.object),
                };
            case "iterator":
                return {
                    kind: "iterator",
                    iterator: new LazyObjectIterator(this.url, result.token),
                };
        }
    }

    /**
     * Changes the values of the given atom in one batch.
     *
     * The removed objects are applied before the added objects. If the same
     * canonical object occurs in both lists, it remains a value of the atom.
     */
    public async changeStatements(
        atom: Atom,
        changes: {
            readonly add: readonly EverythingObject[];
            readonly remove: readonly EverythingObject[];
        },
    ): Promise<void> {
        const body: JsonChangeStatementsRequest = {
            atom: atom.value.toString(),
            add: changes.add.map(objectToJsonObject),
            remove: changes.remove.map(objectToJsonObject),
        };

        const response = await fetch(`${this.url}/api/v1/changeStatements`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(
                `failed to change statements (${response.status}): ${await response.text()}`,
            );
        }
    }

    /**
     * Compacts the knowledge base, dropping the change log.
     */
    public async compact(): Promise<void> {
        const response = await fetch(`${this.url}/api/v1/compact`, {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(
                `failed to compact knowledge base (${response.status}): ${await response.text()}`,
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
