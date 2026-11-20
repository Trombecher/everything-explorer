import ArrowRightIcon from "lucide-solid/icons/arrow-right";
import {type JSX} from "solid-js";

import LeftBraceIcon from "./LeftBraceIcon";

const NarrowSquareIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            {...props}
        >
            <path d="M4 6H11C13 6 14 7 14 9V15C14 17 13 18 11 18H5C3 18 2 17 2 15V9C2 7 3 6 5 6" />
        </svg>
    );
};

export default () => {
    return (
        <div class="flex items-center">
            <LeftBraceIcon />
            <NarrowSquareIcon />
            <LeftBraceIcon class="-scale-x-100" />
            <ArrowRightIcon class="-ml-0.5" />
            <NarrowSquareIcon class="mr-0.5" />
        </div>
    );
};
