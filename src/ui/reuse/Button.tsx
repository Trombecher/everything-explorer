import {Button} from "@kobalte/core/button";
import {splitProps} from "solid-js";

export namespace ButtonSeverity {
    export const Primary = Symbol();
    export const Secondary = Symbol();
    export const Danger = Symbol();
}

export type ButtonSeverity =
    | typeof ButtonSeverity.Primary
    | typeof ButtonSeverity.Secondary
    | typeof ButtonSeverity.Danger;

export default (
    props: Parameters<typeof Button>[0] & {severity?: ButtonSeverity},
) => {
    const [severityProps, otherProps] = splitProps(props, ["severity"]);

    return (
        <Button
            {...otherProps}
            class={`cursor-pointer rounded-2xl ${severityProps.severity === ButtonSeverity.Danger ? "bg-red-400 text-black hover:bg-red-500 active:bg-red-600 dark:text-white" : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 dark:text-black"} px-3 py-1 font-medium active:scale-97 ${props.class}`}
        />
    );
};
