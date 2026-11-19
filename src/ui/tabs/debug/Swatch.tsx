const Strip = (props: {classes: readonly string[]}) => (
    <div class="flex h-16 items-stretch overflow-hidden rounded-3xl border border-line-subtle">
        {props.classes.map(className => (
            <div class={`grow ${className}`} />
        ))}
    </div>
);

export default () => {
    return (
        <div class="mt-16 flex flex-col gap-2">
            <Strip
                classes={[
                    "bg-white",
                    "bg-neutral-100",
                    "bg-neutral-200",
                    "bg-neutral-300",
                    "bg-neutral-400",
                    "bg-neutral-500",
                    "bg-neutral-600",
                    "bg-neutral-700",
                    "bg-neutral-800",
                    "bg-neutral-900",
                    "bg-black",
                ]}
            />
            <Strip
                classes={[
                    "bg-surface-app",
                    "bg-surface-panel",
                    "bg-surface-raised",
                    "bg-surface-sunken",
                    "bg-surface-hover",
                    "bg-surface-active",
                    "bg-surface-control",
                    "bg-surface-control-hover",
                    "bg-surface-control-active",
                    "bg-primary-subtle",
                    "bg-danger-subtle",
                ]}
            />
            <Strip
                classes={[
                    "bg-primary",
                    "bg-primary-hover",
                    "bg-primary-active",
                    "bg-primary-fg",
                    "bg-on-primary",
                    "bg-danger",
                    "bg-danger-hover",
                    "bg-danger-active",
                    "bg-danger-fg",
                    "bg-on-danger",
                    "bg-scrim",
                    "bg-always-white",
                    "bg-always-black",
                ]}
            />
            <Strip
                classes={[
                    "bg-fg-strong",
                    "bg-fg",
                    "bg-fg-muted",
                    "bg-fg-subtle",
                    "bg-line-emphasis",
                    "bg-line-strong",
                    "bg-line-subtle",
                ]}
            />
        </div>
    );
};
