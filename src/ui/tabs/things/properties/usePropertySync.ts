import {createEffect, createResource, on} from "solid-js";

import {useAppState} from "@/context";
import {objectsEqual, type EverythingObject} from "@/model";
import type {Atom} from "@/model/atoms";
import {ObjectHistory} from "@/ui/objects/history";

export const usePropertySync = (selectedAtom: () => Atom) => {
    const appState = useAppState();

    const clientAndAtom = () => {
        const connectionClient = appState.connectionClient();
        return (
            connectionClient && {connectionClient, selectedAtom: selectedAtom()}
        );
    };

    const [values] = createResource(
        clientAndAtom,
        ({connectionClient, selectedAtom}) =>
            connectionClient.valuesOfObject(selectedAtom),
    );

    /**
     * All properties share one selection and one edit history.
     *
     * Selection paths start with the property index, so at most one property
     * can be selected at a time.
     */
    const history = new ObjectHistory([]);

    /**
     * The object list that is known to match the server. Used to derive the
     * statements that must be added or removed after every edit.
     */
    let syncedObjects = history.objects();

    /**
     * The latest object list that still has to be sent to the server, or
     * `undefined` if the server is up to date.
     *
     * Only the latest list is kept: if the user edits again while a sync is
     * running, the older intermediate state is skipped. Syncing the latest
     * state is enough because the diff is always computed against
     * `syncedObjects`.
     */
    let pendingSync: readonly EverythingObject[] | undefined;
    let syncInProgress = false;

    /**
     * Reconciles the server with `pendingSync`.
     *
     * All requests are serialized through this single async loop. Running them
     * concurrently would interleave add and remove requests, which can leave
     * the server with the wrong statements after rapid edit/undo/redo.
     */
    const syncProperties = () => {
        if (syncInProgress) return;

        const current = clientAndAtom();
        if (!current) {
            pendingSync = undefined;
            return;
        }

        const {connectionClient, selectedAtom} = current;
        syncInProgress = true;

        void (async () => {
            try {
                while (pendingSync) {
                    const target = pendingSync;
                    pendingSync = undefined;

                    if (target === syncedObjects) continue;

                    const previous = syncedObjects;
                    const add = target.filter(
                        object =>
                            !previous.some(other =>
                                objectsEqual(other, object),
                            ),
                    );
                    const remove = previous.filter(
                        object =>
                            !target.some(other => objectsEqual(other, object)),
                    );

                    if (add.length > 0 || remove.length > 0) {
                        await connectionClient.changeStatements(selectedAtom, {
                            add,
                            remove,
                        });
                    }

                    syncedObjects = target;
                }
            } catch (error) {
                console.error("failed to update properties", error);
            } finally {
                syncInProgress = false;

                // An edit that arrived while the failed sync was running is
                // still pending. Try to sync it instead of dropping it.
                if (
                    pendingSync !== undefined
                    && pendingSync !== syncedObjects
                ) {
                    syncProperties();
                }
            }
        })();
    };

    createEffect(() => {
        const loadedValues = values();

        if (!loadedValues) return;

        syncedObjects = loadedValues;
        history.reset(loadedValues);
    });

    createEffect(
        on(history.objects, objects => {
            pendingSync = objects;
            syncProperties();
        }),
    );

    return {history, values};
};
