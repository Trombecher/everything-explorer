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
            <circle cx="6" cy="8" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="6" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
};
