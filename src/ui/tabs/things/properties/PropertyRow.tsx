import {Button as KobalteButton} from "@kobalte/core/button";
import XIcon from "lucide-solid/icons/x";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {EverythingObject} from "@/model";
import {LayoutMode} from "@/ui/objects/layout";
import ObjectView from "@/ui/objects/ObjectView";

export default (props: {
    object: EverythingObject;
    index: number;
    siblingCount: number;
    widthBudgetInPixels: number;
    setObject: (newObject: EverythingObject | undefined) => void;
    remove: () => void;
}) => {
    const appState = useAppState();

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
            <KobalteButton
                class="shrink-0 self-center rounded-2xl p-2 text-fg-muted hover:bg-danger-subtle hover:text-danger-fg"
                title={appState.translate(Phrase.RemoveProperty, undefined)}
                aria-label={appState.translate(
                    Phrase.RemoveProperty,
                    undefined,
                )}
                onClick={() => props.remove()}
            >
                <XIcon />
            </KobalteButton>
        </div>
    );
};
