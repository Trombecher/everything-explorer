import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import FlaskConicalIcon from "lucide-solid/icons/flask-conical";
import PlayIcon from "lucide-solid/icons/play";
import {createSignal, onCleanup, Show} from "solid-js";

import type {LazyObjectIterator} from "@/connect";
import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";
import {ObjectHistory} from "@/ui/objects/history";
import {LayoutMode} from "@/ui/objects/layout";
import ObjectView from "@/ui/objects/ObjectView";
import {
    ObjectSelection,
    ObjectSelectionContext,
    type ObjectSelectionPathInfo,
} from "@/ui/objects/selection";
import {handleHistoryKeyDown} from "@/ui/objects/undoRedoKeys";
import Button from "@/ui/reuse/Button";
import WidthMeasurer from "@/ui/reuse/WidthMeasurer";

/**
 * The number of values to request from a lazy evaluation result per page.
 */
const LAZY_PAGE_SIZE = 100;

/**
 * An initial expression that makes it obvious what evaluating does: `1 + 1`.
 */
const createInitialObject = (): EverythingObject =>
    nodeToObject({
        type: NodeType.Plus,
        first: nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        second: nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        rest: [],
    });

type Evaluation =
    | {readonly kind: "object"; readonly object: EverythingObject}
    | {readonly kind: "lazy"}
    | {readonly kind: "error"; readonly error: string};

const initialSelectionPathInfo: ObjectSelectionPathInfo = {
    effectiveLength: 0,
    path: [],
};

const isFailure = (
    evaluation: Evaluation,
): evaluation is {readonly kind: "error"; readonly error: string} =>
    evaluation.kind === "error";

const isObject = (
    evaluation: Evaluation,
): evaluation is {readonly kind: "object"; readonly object: EverythingObject} =>
    evaluation.kind === "object";

const isLazy = (
    evaluation: Evaluation,
): evaluation is {readonly kind: "lazy"} => evaluation.kind === "lazy";

const errorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

export default () => {
    const appState = useAppState();

    const history = new ObjectHistory([createInitialObject()]);

    /**
     * The result of the last evaluation, kept until the object is edited again.
     */
    const [evaluation, setEvaluation] = createSignal<Evaluation | undefined>(
        undefined,
    );

    const [evaluating, setEvaluating] = createSignal(false);

    const [lazyIterator, setLazyIterator] = createSignal<
        LazyObjectIterator | undefined
    >();
    const [lazyObjects, setLazyObjects] = createSignal<
        readonly EverythingObject[]
    >([]);
    const [lazyExhausted, setLazyExhausted] = createSignal(false);
    const [lazyLoading, setLazyLoading] = createSignal(false);
    const [lazyError, setLazyError] = createSignal<string | undefined>();

    /**
     * Drops the current lazy result and deletes its server-side iterator.
     */
    const clearLazyResult = () => {
        const iterator = lazyIterator();

        setLazyIterator(undefined);
        setLazyObjects([]);
        setLazyExhausted(false);
        setLazyLoading(false);
        setLazyError(undefined);

        if (iterator) {
            iterator
                .delete()
                .catch(error =>
                    console.error("failed to delete lazy iterator", error),
                );
        }
    };

    /**
     * Requests the next page of the current lazy result.
     */
    const loadMore = async () => {
        const iterator = lazyIterator();
        if (!iterator || lazyLoading() || lazyExhausted()) return;

        setLazyLoading(true);
        setLazyError(undefined);

        try {
            const page = await iterator.next(LAZY_PAGE_SIZE);

            // The result may have been replaced while the request was in flight.
            if (lazyIterator() !== iterator) return;

            setLazyObjects(objects => [...objects, ...page.objects]);
            setLazyExhausted(page.exhausted);
        } catch (error) {
            if (lazyIterator() === iterator) {
                console.error("failed to load more lazy results", error);
                setLazyError(errorMessage(error));
            }
        } finally {
            if (lazyIterator() === iterator) setLazyLoading(false);
        }
    };

    const evaluate = async () => {
        const connectionClient = appState.connectionClient();
        if (!connectionClient || evaluating()) return;

        setEvaluating(true);
        clearLazyResult();
        setEvaluation(undefined);

        try {
            const result = await connectionClient.evaluateObject(
                history.object(0),
            );

            if (result.kind === "object") {
                setEvaluation({kind: "object", object: result.object});
            } else {
                setLazyIterator(result.iterator);
                setEvaluation({kind: "lazy"});

                // Load the first page immediately so the result is not empty.
                await loadMore();
            }
        } catch (error) {
            console.error("failed to evaluate object", error);

            setEvaluation({kind: "error", error: errorMessage(error)});
        } finally {
            setEvaluating(false);
        }
    };

    onCleanup(clearLazyResult);

    const [resultSelectionPathInfo, setResultSelectionPathInfo] = createSignal(
        initialSelectionPathInfo,
    );

    const resultSelection = new ObjectSelection(
        resultSelectionPathInfo,
        setResultSelectionPathInfo,
    );

    return (
        <div class="flex min-w-0 grow py-2">
            <div
                class="mx-auto flex w-full max-w-3xl min-w-0 grow flex-col gap-3 self-start rounded-4xl border border-neutral-200 bg-white p-4 dark:bg-neutral-100"
                tabIndex={0}
                onKeyDown={event => handleHistoryKeyDown(event, history)}
            >
                <div class="flex items-center gap-2">
                    <FlaskConicalIcon class="shrink-0" />
                    <h2 class="text-xl font-semibold text-black">
                        {appState.translate(Phrase.Evaluate, undefined)}
                    </h2>
                </div>

                <WidthMeasurer class="min-w-0">
                    {widthBudgetInPixels => (
                        <ObjectSelectionContext.Provider
                            value={history.objectSelection}
                        >
                            <ObjectView
                                indentLeft={false}
                                siblingCount={1}
                                object={history.object(0)}
                                setObject={newObject => {
                                    clearLazyResult();
                                    setEvaluation(undefined);

                                    history.pushObject(
                                        0,
                                        newObject ?? defaultObject,
                                    );
                                }}
                                path={[]}
                                widthBudgetInPixels={widthBudgetInPixels()}
                                replaceParentWithThis={undefined}
                                parentObjectLayoutMode={LayoutMode.Row}
                            />
                        </ObjectSelectionContext.Provider>
                    )}
                </WidthMeasurer>

                <div class="flex items-center gap-2">
                    <Button
                        class="flex items-center gap-1"
                        disabled={evaluating() || !appState.isConnected()}
                        onClick={() => void evaluate()}
                    >
                        <PlayIcon />
                        <span class="pr-1">
                            {appState.translate(Phrase.Evaluate, undefined)}
                        </span>
                    </Button>
                </div>

                <Show when={evaluation()} keyed>
                    {evaluation => (
                        <div class="flex flex-col gap-2 border-t border-neutral-200 pt-3">
                            <h3 class="font-semibold text-black">
                                {appState.translate(Phrase.Result, undefined)}
                            </h3>
                            <Show
                                when={isFailure(evaluation) ? evaluation : null}
                            >
                                {failure => (
                                    <div class="text-red-600">
                                        <div>
                                            {appState.translate(
                                                Phrase.EvaluateFailed,
                                                undefined,
                                            )}
                                        </div>
                                        <div class="mt-1 font-mono text-xs whitespace-pre-wrap text-neutral-600">
                                            {failure().error}
                                        </div>
                                    </div>
                                )}
                            </Show>
                            <Show
                                when={isObject(evaluation) ? evaluation : null}
                            >
                                {success => (
                                    <WidthMeasurer class="min-w-0">
                                        {widthBudgetInPixels => (
                                            <ObjectSelectionContext.Provider
                                                value={resultSelection}
                                            >
                                                <ObjectView
                                                    indentLeft={false}
                                                    siblingCount={1}
                                                    object={success().object}
                                                    setObject={undefined}
                                                    path={[0]}
                                                    widthBudgetInPixels={widthBudgetInPixels()}
                                                    replaceParentWithThis={
                                                        undefined
                                                    }
                                                    parentObjectLayoutMode={
                                                        LayoutMode.Row
                                                    }
                                                />
                                            </ObjectSelectionContext.Provider>
                                        )}
                                    </WidthMeasurer>
                                )}
                            </Show>
                            <Show when={isLazy(evaluation) ? evaluation : null}>
                                {_lazy => (
                                    <div class="flex flex-col gap-2">
                                        <div class="text-sm text-neutral-500">
                                            {appState.translate(
                                                Phrase.LazyResultHint,
                                                undefined,
                                            )}
                                        </div>
                                        <WidthMeasurer class="min-w-0">
                                            {widthBudgetInPixels => (
                                                <ObjectSelectionContext.Provider
                                                    value={resultSelection}
                                                >
                                                    <ObjectView
                                                        indentLeft={false}
                                                        siblingCount={1}
                                                        object={{
                                                            type: ObjectType.Set,
                                                            elements:
                                                                lazyObjects(),
                                                        }}
                                                        setObject={undefined}
                                                        path={[0]}
                                                        widthBudgetInPixels={widthBudgetInPixels()}
                                                        replaceParentWithThis={
                                                            undefined
                                                        }
                                                        parentObjectLayoutMode={
                                                            LayoutMode.Row
                                                        }
                                                    />
                                                </ObjectSelectionContext.Provider>
                                            )}
                                        </WidthMeasurer>
                                        <div class="flex flex-wrap items-center gap-2">
                                            <Show when={!lazyExhausted()}>
                                                <Button
                                                    class="flex items-center gap-1"
                                                    disabled={
                                                        lazyLoading()
                                                        || !appState.isConnected()
                                                    }
                                                    onClick={() =>
                                                        void loadMore()
                                                    }
                                                >
                                                    <ChevronDownIcon />
                                                    <span class="pr-1">
                                                        {appState.translate(
                                                            Phrase.LoadMore,
                                                            undefined,
                                                        )}
                                                    </span>
                                                </Button>
                                            </Show>
                                            <Show when={lazyLoading()}>
                                                <span class="text-sm text-neutral-500">
                                                    {appState.translate(
                                                        Phrase.Loading,
                                                        undefined,
                                                    )}
                                                </span>
                                            </Show>
                                            <Show when={lazyExhausted()}>
                                                <span class="text-sm text-neutral-500">
                                                    {appState.translate(
                                                        Phrase.AllResultsLoaded,
                                                        undefined,
                                                    )}
                                                </span>
                                            </Show>
                                        </div>
                                        <Show when={lazyError()}>
                                            {error => (
                                                <div class="text-red-600">
                                                    <div>
                                                        {appState.translate(
                                                            Phrase.LoadMoreFailed,
                                                            undefined,
                                                        )}
                                                    </div>
                                                    <div class="mt-1 font-mono text-xs whitespace-pre-wrap text-neutral-600">
                                                        {error()}
                                                    </div>
                                                </div>
                                            )}
                                        </Show>
                                    </div>
                                )}
                            </Show>
                        </div>
                    )}
                </Show>
            </div>
        </div>
    );
};
