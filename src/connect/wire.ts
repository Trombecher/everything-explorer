import z from "zod";

import {ObjectType, type EverythingObject as KnowledgeObject} from "@/model";

/**
 * The JSON representation of an object, mirroring `JsonObject` in the Rust
 * server's wire module.
 *
 * Atom ids and integer values are decimal strings because they may not fit into
 * a JavaScript number without losing precision.
 */
export type JsonObject =
    | {readonly type: "atom"; readonly value: string}
    | {readonly type: "integer"; readonly value: string}
    | {readonly type: "character"; readonly value: string}
    | {readonly type: "byte"; readonly value: number}
    | {readonly type: "text"; readonly text: string}
    | {
          readonly type: "construction";
          readonly constructor: JsonObject;
          readonly value: JsonObject;
      }
    | {readonly type: "composite"; readonly properties: readonly JsonObject[]}
    | {readonly type: "set"; readonly items: readonly JsonObject[]};

export const jsonObjectSchema: z.ZodType<JsonObject> = z.lazy(() =>
    z.discriminatedUnion("type", [
        z.object({type: z.literal("atom"), value: z.string()}),
        z.object({type: z.literal("integer"), value: z.string()}),
        z.object({type: z.literal("character"), value: z.string()}),
        z.object({
            type: z.literal("byte"),
            value: z.number().int().min(0).max(255),
        }),
        z.object({type: z.literal("text"), text: z.string()}),
        z.object({
            type: z.literal("construction"),
            constructor: jsonObjectSchema,
            value: jsonObjectSchema,
        }),
        z.object({
            type: z.literal("composite"),
            properties: z.array(jsonObjectSchema),
        }),
        z.object({type: z.literal("set"), items: z.array(jsonObjectSchema)}),
    ]),
);

export const jsonObjectsSchema = z.array(jsonObjectSchema);

/**
 * The JSON representation of an evaluation response, mirroring
 * `JsonEvaluateResponse` in the Rust server's wire module.
 *
 * Lazy set results are represented by a token that addresses a server-side
 * iterator instead of by a materialized set.
 */
export type JsonEvaluateResponse =
    | {readonly kind: "object"; readonly object: JsonObject}
    | {readonly kind: "iterator"; readonly token: number};

export const jsonEvaluateResponseSchema: z.ZodType<JsonEvaluateResponse> =
    z.discriminatedUnion("kind", [
        z.object({kind: z.literal("object"), object: jsonObjectSchema}),
        z.object({
            kind: z.literal("iterator"),
            token: z.number().int().nonnegative(),
        }),
    ]);

/**
 * The JSON representation of a page of a lazy set iterator, mirroring
 * `JsonIteratorPage` in the Rust server's wire module.
 */
export type JsonIteratorPage = {
    readonly objects: readonly JsonObject[];
    readonly exhausted: boolean;
};

export const jsonIteratorPageSchema: z.ZodType<JsonIteratorPage> = z.object({
    objects: z.array(jsonObjectSchema),
    exhausted: z.boolean(),
});

/**
 * The JSON representation of a request to change the statements of one atom,
 * mirroring `JsonChangeStatementsRequest` in the Rust server's wire module.
 */
export type JsonChangeStatementsRequest = {
    readonly atom: string;
    readonly remove: readonly JsonObject[];
    readonly add: readonly JsonObject[];
};

/**
 * Converts a wire object into the internal object model.
 */
export const jsonObjectToObject = (json: JsonObject): KnowledgeObject => {
    switch (json.type) {
        case "atom":
            return {type: ObjectType.Atom, value: BigInt(json.value)};
        case "integer": {
            const value = BigInt(json.value);

            // An integer set never represents zero. The server normalizes it
            // to the zero atom, so do the same here.
            return value === 0n
                ? {type: ObjectType.Atom, value: 0n}
                : {type: ObjectType.Integer, value};
        }
        case "character":
            return {type: ObjectType.Character, value: json.value};
        case "byte":
            return {type: ObjectType.Byte, value: json.value};
        case "text":
            return {type: ObjectType.Text, text: json.text};
        case "construction":
            return {
                type: ObjectType.Construction,
                constructor: jsonObjectToObject(json.constructor),
                value: jsonObjectToObject(json.value),
            };
        case "composite":
            return {
                type: ObjectType.Composite,
                properties: json.properties.map(jsonObjectToObject),
            };
        case "set":
            return {
                type: ObjectType.Set,
                items: json.items.map(jsonObjectToObject),
            };
    }
};

/**
 * Converts an internal object into its wire representation.
 */
export const objectToJsonObject = (object: KnowledgeObject): JsonObject => {
    switch (object.type) {
        case ObjectType.Atom:
            return {type: "atom", value: object.value.toString()};
        case ObjectType.Integer:
            return {type: "integer", value: object.value.toString()};
        case ObjectType.Character:
            return {type: "character", value: object.value};
        case ObjectType.Byte:
            return {type: "byte", value: object.value};
        case ObjectType.Text:
            return {type: "text", text: object.text};
        case ObjectType.Construction:
            return {
                type: "construction",
                constructor: objectToJsonObject(object.constructor),
                value: objectToJsonObject(object.value),
            };
        case ObjectType.Composite:
            return {
                type: "composite",
                properties: object.properties.map(objectToJsonObject),
            };
        case ObjectType.Set:
            return {type: "set", items: object.items.map(objectToJsonObject)};
    }
};
