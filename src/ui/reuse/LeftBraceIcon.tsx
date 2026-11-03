export default (props: {class?: string}) => {
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
            {...props}
        >
            <path d="M10 3C2 4 11 10 3 12 11 14 2 20 10 21" />
        </svg>
    );
};
