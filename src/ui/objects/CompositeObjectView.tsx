import type {EverythingComposite, EverythingObject} from "@/model";
import type {DeepReadonly} from "@/util";

import CollectionObjectView from "./CollectionObjectView";
import type {ObjectSelectionPath} from "./selection";

export default (props: {
    composite: EverythingComposite;
    setComposite:
        | ((newComposite: EverythingObject | undefined) => void)
        | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    widthBudgetInPixels: number;
}) => (
    <CollectionObjectView
        collection={props.composite}
        setCollection={props.setComposite}
        path={props.path}
        widthBudgetInPixels={props.widthBudgetInPixels}
    />
);
