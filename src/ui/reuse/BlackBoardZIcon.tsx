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
            <path d="M6 4h11.5a.5.5 0 01.387.817L10 20" />
            <path d="M6.114 19 14 4" />
            <path d="M6.114 19.183a.5.5 0 00.387.817H18" />
        </svg>
    );
};
