export default (props: {class?: string}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="24"
            viewBox="0 0 12 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            {...props}
        >
            <path d="M3 8C3 4.5 9 4.5 9 8C9 10.5 6 10.5 6 13" />
            <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
};
