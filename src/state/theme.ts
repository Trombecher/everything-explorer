import type {System} from "./common";

export namespace Theme {
    export const Light = Symbol();
    export const Dark = Symbol();
}

export type Theme = typeof Theme.Light | typeof Theme.Dark;

export type ThemeSetting = Theme | typeof System;
