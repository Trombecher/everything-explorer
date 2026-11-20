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
                    "bg-surface-app",
                    "bg-surface-panel",
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
            <Strip
                classes={[
                    "bg-obj-functional",
                    "bg-obj-computation",
                    "bg-obj-boolean",
                    "bg-obj-set",
                    "bg-obj-literal",
                    "bg-obj-query",
                    "bg-obj-control",
                    "bg-obj-constructions",
                    "bg-obj-atom",
                    "bg-obj-values",
                ]}
            />
            <div class="mt-2 flex gap-2">
                <div class="flex grow items-center justify-center rounded-3xl bg-surface-app p-8">
                    <div class="size-20 rounded-2xl bg-surface-panel shadow-raised" />
                </div>
                <div class="flex grow items-center justify-center rounded-3xl border border-line-subtle bg-surface-panel p-8">
                    <div class="size-20 rounded-2xl bg-surface-panel shadow-raised" />
                </div>
            </div>
        </div>
    );
};
