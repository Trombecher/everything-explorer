import QuestionMarkIcon from "lucide-solid/icons/question-mark";

import BraceIcon from "./BraceIcon";

export default () => {
    return (
        <div class="flex items-center">
            <BraceIcon side="left" />
            <BraceIcon side="right" class="ml-1" />
            <QuestionMarkIcon class="-mx-0.5" />
        </div>
    );
};
