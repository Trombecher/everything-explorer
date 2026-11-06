import z from "zod";

import {
    ObjectType,
    type Object as KnowledgeObject,
    type Statement,
} from "@/model";

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
    | {readonly type: "set"; readonly elements: readonly JsonObject[]};

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
        z.object({type: z.literal("set"), elements: z.array(jsonObjectSchema)}),
    ]),
);

export const jsonObjectsSchema = z.array(jsonObjectSchema);

/**
 * The JSON representation of a statement, mirroring `JsonStatement` in the
 * Rust server's wire module.
 */
export type JsonStatement = {
    readonly atom: string;
    readonly object: JsonObject;
};

export const jsonStatementSchema: z.ZodType<JsonStatement> = z.object({
    atom: z.string(),
    object: jsonObjectSchema,
});

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
            if (json.text.length === 0) {
                throw new Error("a text set must not be empty");
            }

            return {type: ObjectType.Text, text: json.text};
        case "construction":
            return {
                type: ObjectType.Construction,
                constructor: jsonObjectToObject(json.constructor),
                value: jsonObjectToObject(json.value),
            };
        case "set":
            return {
                type: ObjectType.Set,
                elements: json.elements.map(jsonObjectToObject),
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
        case ObjectType.Set:
            return {
                type: "set",
                elements: object.elements.map(objectToJsonObject),
            };
    }
};

/**
 * Converts a wire statement into the internal statement model.
 */
export const jsonStatementToStatement = (
    json: JsonStatement,
): Statement => ({
    atom: {type: ObjectType.Atom, value: BigInt(json.atom)},
    object: jsonObjectToObject(json.object),
});

/**
 * Converts an internal statement into its wire representation.
 */
export const statementToJsonStatement = (
    statement: Statement,
): JsonStatement => ({
    atom: statement.atom.value.toString(),
    object: objectToJsonObject(statement.object),
});
