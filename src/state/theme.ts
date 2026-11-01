import type {System} from "./common";

export namespace Theme {
    export const Light = Symbol("Theme.Light");
    export const Dark = Symbol("Theme.Dark");
}

export type Theme = typeof Theme.Light | typeof Theme.Dark;

export type ThemeSetting = Theme | typeof System;
