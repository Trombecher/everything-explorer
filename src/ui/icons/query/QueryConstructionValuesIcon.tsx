import AtomIcon from "lucide-solid/icons/atom";

import ConstructionConstructorIcon from "../constructions/ConstructionConstructorIcon";
import SearchDotIcon from "./SearchDotIcon";

export default () => {
    return (
        <div class="flex items-center">
            <AtomIcon />
            <SearchDotIcon />
            <ConstructionConstructorIcon />
        </div>
    );
};
