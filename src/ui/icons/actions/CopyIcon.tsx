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
            <rect width="11" height="11" x="9" y="9" rx="2" ry="2" />
            <path d="M6 15c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2" />
        </svg>
    );
};
