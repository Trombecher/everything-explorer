import type {EverythingObject} from "@/model";
import type {NewCompositeNode} from "@/model/nodes";

import type {ObjectSelectionPath} from "../../selection";
import NewCollectionOperationView from "./NewCollectionOperationView";

export default (props: {
    block: NewCompositeNode;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject | undefined) => void) | undefined;
}) => (
    <NewCollectionOperationView
        block={props.block}
        path={props.path}
        wholeWidthBudgetInPixels={props.wholeWidthBudgetInPixels}
        setObject={props.setObject}
    />
);
