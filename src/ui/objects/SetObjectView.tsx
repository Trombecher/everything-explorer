import type {EverythingObject, EverythingSet} from "@/model";
import type {DeepReadonly} from "@/util";

import CollectionObjectView from "./CollectionObjectView";
import type {ObjectSelectionPath} from "./selection";

export default (props: {
    set: EverythingSet;
    setSet: ((newSet: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    widthBudgetInPixels: number;
}) => (
    <CollectionObjectView
        collection={props.set}
        setCollection={props.setSet}
        path={props.path}
        widthBudgetInPixels={props.widthBudgetInPixels}
    />
);
