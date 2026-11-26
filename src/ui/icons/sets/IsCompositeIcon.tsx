import QuestionMarkIcon from "lucide-solid/icons/question-mark";

import AngleBracketIcon from "./AngleBracketIcon";

export default () => {
    return (
        <div class="flex items-center">
            <AngleBracketIcon side="left" />
            <AngleBracketIcon side="right" class="ml-1" />
            <QuestionMarkIcon class="-mx-0.5" />
        </div>
    );
};
