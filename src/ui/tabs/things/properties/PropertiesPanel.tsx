import {Button as KobalteButton} from "@kobalte/core/button";
import PlusIcon from "lucide-solid/icons/plus";
import TablePropertiesIcon from "lucide-solid/icons/table-properties";
import XIcon from "lucide-solid/icons/x";
import {Index, Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {defaultObject} from "@/model";
import type {Atom} from "@/model/atoms";
import {ObjectSelectionContext} from "@/ui/objects/selection";
import {handleHistoryKeyDown} from "@/ui/objects/undoRedoKeys";
import {useAtomName} from "@/ui/objects/useAtomName";
import Button from "@/ui/reuse/Button";
import WidthMeasurer from "@/ui/reuse/WidthMeasurer";

import CopyAtomIdButton from "./CopyAtomIdButton";
import PropertyRow from "./PropertyRow";
import {usePropertySync} from "./usePropertySync";

/**
 * Horizontal space taken by the per-property remove button and the gap before
 * it, in px.
 */
const REMOVE_BUTTON_SPACE = 48;

export default (props: {selectedAtom: Atom; close: () => void}) => {
    const appState = useAppState();
    const name = useAtomName(() => props.selectedAtom);
    const {history, values} = usePropertySync(() => props.selectedAtom);

    const addProperty = () => {
        if (!appState.connectionClient()) return;

        // A fresh object so it is not confused with any other property.
        history.pushObjects([...history.objects(), {...defaultObject}]);
    };

    const removeProperty = (index: number) => {
        history.pushObjects(history.objects().filter((_, i) => i !== index));
    };

    return (
        <div
            class="relative flex size-full flex-col gap-2 rounded-4xl border border-line-subtle bg-surface-panel p-2"
            tabIndex={0}
            onKeyDown={event => {
                handleHistoryKeyDown(event, history);

                // Up/down navigation from the panel itself (e.g. right after
                // opening it) selects the first/last property. Navigation
                // between selected properties is handled by the object views.
                if (
                    event.target !== event.currentTarget
                    || event.ctrlKey
                    || event.metaKey
                    || event.altKey
                )
                    return;

                const propertyCount = history.objects().length;
                if (propertyCount === 0) return;

                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    history.objectSelection.setPath([0]);
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    history.objectSelection.setPath([propertyCount - 1]);
                }
            }}
        >
            <div class="flex items-center gap-2 p-2">
                <TablePropertiesIcon />
                <h2 class="text-xl font-semibold text-fg-strong">
                    {appState.translate(Phrase.PropertiesOf, undefined)}{" "}
                    <span class="font-bold text-primary-fg italic">
                        {name() ?? String(props.selectedAtom.value)}
                    </span>
                </h2>
            </div>
            <KobalteButton
                class="absolute top-2 right-2 rounded-2xl p-2 hover:bg-surface-hover"
                onClick={() => {
                    props.close();
                }}
            >
                <XIcon />
            </KobalteButton>

            <div class="flex flex-wrap items-center gap-2 px-2">
                <Button
                    class="flex w-fit gap-0.5"
                    disabled={values() === undefined}
                    onClick={addProperty}
                >
                    <PlusIcon />
                    <span class="pr-1">
                        {appState.translate(Phrase.AddProperty, undefined)}
                    </span>
                </Button>
                <CopyAtomIdButton atom={props.selectedAtom} />
            </div>

            <WidthMeasurer class="flex flex-col gap-2 px-2">
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider
                        value={history.objectSelection}
                    >
                        <Show
                            when={values()}
                            fallback={
                                <>
                                    {appState.translate(
                                        Phrase.LoadingProperties,
                                        undefined,
                                    )}
                                </>
                            }
                        >
                            <Index each={history.objects()}>
                                {(object, index) => (
                                    <PropertyRow
                                        object={object()}
                                        index={index}
                                        siblingCount={history.objects().length}
                                        widthBudgetInPixels={Math.max(
                                            widthBudgetInPixels()
                                                - REMOVE_BUTTON_SPACE,
                                            0,
                                        )}
                                        setObject={newObject => {
                                            if (newObject === undefined) {
                                                removeProperty(index);
                                                return;
                                            }

                                            history.pushObject(
                                                index,
                                                newObject,
                                            );
                                        }}
                                        remove={() => removeProperty(index)}
                                    />
                                )}
                            </Index>
                        </Show>
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
        </div>
    );
};
