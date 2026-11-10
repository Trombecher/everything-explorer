export default (props: {class?: string}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            {...props}
        >
            <path d="M18 5C11 5 6 8 6 12s5 7 12 7" />
            <path d="M7 12h11" />
        </svg>
    );
};
