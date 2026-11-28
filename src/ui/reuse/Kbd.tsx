import type {JSX} from "solid-js";
import {splitProps} from "solid-js";

/**
 * Renders a single key of a keyboard shortcut.
 */
export default (props: JSX.HTMLAttributes<HTMLElement>) => {
    const [local, otherProps] = splitProps(props, ["class"]);

    return (
        <kbd
            class={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md border border-line-subtle bg-surface-control px-1 font-mono text-[11px] leading-none text-fg-muted ${local.class ?? ""}`}
            {...otherProps}
        />
    );
};
