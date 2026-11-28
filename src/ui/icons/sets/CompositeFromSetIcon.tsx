import ArrowRightIcon from "lucide-solid/icons/arrow-right";

import AngleBracketIcon from "./AngleBracketIcon";
import BraceIcon from "./BraceIcon";

export default () => {
    return (
        <div class="flex items-center">
            <BraceIcon side="left" />
            <BraceIcon side="right" />
            <ArrowRightIcon />
            <AngleBracketIcon side="left" />
            <AngleBracketIcon side="right" />
        </div>
    );
};
