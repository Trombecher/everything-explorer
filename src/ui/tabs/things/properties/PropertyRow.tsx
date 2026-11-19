import {Phrase} from "@/i18n/phrases";
import type {EverythingObject} from "@/model";
import {LayoutMode} from "@/ui/objects/layout";
import ObjectView from "@/ui/objects/ObjectView";
import DeleteButton from "@/ui/reuse/DeleteButton";

export default (props: {
    object: EverythingObject;
    index: number;
    siblingCount: number;
    widthBudgetInPixels: number;
    setObject: (newObject: EverythingObject | undefined) => void;
    remove: () => void;
}) => {
    return (
        <div class="flex items-stretch gap-2">
            <div class="grid min-w-0 flex-1">
                <ObjectView
                    indentLeft={false}
                    widthBudgetInPixels={props.widthBudgetInPixels}
                    object={props.object}
                    path={[props.index]}
                    siblingCount={props.siblingCount}
                    replaceParentWithThis={undefined}
                    setObject={props.setObject}
                    parentObjectLayoutMode={LayoutMode.Column}
                />
            </div>
            <DeleteButton
                label={Phrase.RemoveProperty}
                class="self-center"
                onClick={() => props.remove()}
            />
        </div>
    );
};
