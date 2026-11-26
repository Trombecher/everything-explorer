export default (props: {side: "left" | "right"; class?: string}) => {
    const className = () =>
        props.side === "right"
            ? `${props.class ?? ""} -scale-x-100`.trim()
            : props.class;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="24"
            viewBox="0 0 12 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={className()}
        >
            <path d="M9 4 3 12l6 8" />
        </svg>
    );
};
