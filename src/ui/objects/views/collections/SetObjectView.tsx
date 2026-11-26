import type {EverythingObject, EverythingSet} from "@/model";
import type {DeepReadonly} from "@/util";

import type {ObjectSelectionPath} from "../../selection";
import CollectionObjectView from "./CollectionObjectView";

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
