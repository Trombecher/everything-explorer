import QuestionMarkIcon from "lucide-solid/icons/question-mark";

import LeftBraceIcon from "./LeftBraceIcon";

export default () => {
    return (
        <div class="flex items-center">
            <LeftBraceIcon />
            <LeftBraceIcon class="ml-1 -scale-x-100" />
            <QuestionMarkIcon class="-mx-0.5" />
        </div>
    );
};
