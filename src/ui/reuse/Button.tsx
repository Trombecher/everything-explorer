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

const severityClasses: Record<ButtonSeverity, string> = {
    [ButtonSeverity.Primary]:
        "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
    [ButtonSeverity.Secondary]:
        "bg-surface-control text-fg hover:bg-surface-control-hover active:bg-surface-control-active",
    [ButtonSeverity.Danger]:
        "bg-danger text-on-danger hover:bg-danger-hover active:bg-danger-active",
};

export default (
    props: Parameters<typeof Button>[0] & {severity?: ButtonSeverity},
) => {
    const [severityProps, otherProps] = splitProps(props, ["severity"]);

    return (
        <Button
            {...otherProps}
            class={`cursor-pointer rounded-2xl ${severityClasses[severityProps.severity ?? ButtonSeverity.Primary]} p-1 font-medium active:scale-97 ${otherProps.class ?? ""}`}
        />
    );
};
