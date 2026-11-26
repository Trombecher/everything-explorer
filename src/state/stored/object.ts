import z from "zod";

import {ObjectType, type EverythingObject} from "@/model";

/**
 * The JSON representation of an object in the stored app state.
 *
 * Atom ids and integer values are decimal strings because they may not fit into
 * a JavaScript number without losing precision.
 *
 * This is deliberately separate from the HTTP wire representation: the stored
 * representation must round-trip every object exactly, including integer zero.
 */
export type StoredObject =
    | {readonly type: "atom"; readonly value: string}
    | {readonly type: "integer"; readonly value: string}
    | {readonly type: "character"; readonly value: string}
    | {readonly type: "byte"; readonly value: number}
    | {readonly type: "text"; readonly text: string}
    | {
          readonly type: "construction";
          readonly constructor: StoredObject;
          readonly value: StoredObject;
      }
    | {readonly type: "composite"; readonly properties: readonly StoredObject[]}
    | {readonly type: "set"; readonly items: readonly StoredObject[]}
    | {readonly type: "set"; readonly elements: readonly StoredObject[]};

const decimalIntegerStringSchema = z.string().regex(/^[+-]?[0-9]+$/);

export const storedObjectSchema: z.ZodType<StoredObject> = z.lazy(() =>
    z.union([
        z.object({type: z.literal("atom"), value: decimalIntegerStringSchema}),
        z.object({
            type: z.literal("integer"),
            value: decimalIntegerStringSchema,
        }),
        z.object({type: z.literal("character"), value: z.string()}),
        z.object({
            type: z.literal("byte"),
            value: z.number().int().min(0).max(255),
        }),
        z.object({type: z.literal("text"), text: z.string()}),
        z.object({
            type: z.literal("construction"),
            constructor: storedObjectSchema,
            value: storedObjectSchema,
        }),
        z.object({
            type: z.literal("composite"),
            properties: z.array(storedObjectSchema),
        }),
        z.object({type: z.literal("set"), items: z.array(storedObjectSchema)}),
        // Legacy stored sets were raw structural collections. They are decoded
        // as composites below, not as canonical sets.
        z.object({
            type: z.literal("set"),
            elements: z.array(storedObjectSchema),
        }),
    ]),
);

/**
 * Converts a stored object into the internal object model.
 */
export const storedObjectToObject = (
    stored: StoredObject,
): EverythingObject => {
    switch (stored.type) {
        case "atom":
            return {type: ObjectType.Atom, value: BigInt(stored.value)};
        case "integer":
            return {type: ObjectType.Integer, value: BigInt(stored.value)};
        case "character":
            return {type: ObjectType.Character, value: stored.value};
        case "byte":
            return {type: ObjectType.Byte, value: stored.value};
        case "text":
            return {type: ObjectType.Text, text: stored.text};
        case "construction":
            return {
                type: ObjectType.Construction,
                constructor: storedObjectToObject(stored.constructor),
                value: storedObjectToObject(stored.value),
            };
        case "composite":
            return {
                type: ObjectType.Composite,
                properties: stored.properties.map(storedObjectToObject),
            };
        case "set":
            if ("items" in stored) {
                return {
                    type: ObjectType.Set,
                    items: stored.items.map(storedObjectToObject),
                };
            }

            // Legacy v1 clipboards stored an arbitrary structural collection
            // under `"set"`. That is a composite in the current model.
            return {
                type: ObjectType.Composite,
                properties: stored.elements.map(storedObjectToObject),
            };
    }
};

/**
 * Converts an internal object into its stored representation.
 */
export const objectToStoredObject = (
    object: EverythingObject,
): StoredObject => {
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
                constructor: objectToStoredObject(object.constructor),
                value: objectToStoredObject(object.value),
            };
        case ObjectType.Composite:
            return {
                type: "composite",
                properties: object.properties.map(objectToStoredObject),
            };
        case ObjectType.Set:
            return {type: "set", items: object.items.map(objectToStoredObject)};
    }
};
