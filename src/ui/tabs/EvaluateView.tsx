import FlaskConicalIcon from "lucide-solid/icons/flask-conical";
import PlayIcon from "lucide-solid/icons/play";
import {createSignal, Show} from "solid-js";

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
    | {readonly kind: "error"; readonly error: string};

const initialSelectionPathInfo: ObjectSelectionPathInfo = {
    effectiveLength: 0,
    path: [],
};

const isFailure = (
    evaluation: Evaluation,
): evaluation is {readonly kind: "error"; readonly error: string} =>
    evaluation.kind === "error";

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

    const evaluate = async () => {
        const connectionClient = appState.connectionClient();
        if (!connectionClient || evaluating()) return;

        setEvaluating(true);

        try {
            const object = await connectionClient.evaluateObject(
                history.object(0),
            );
            setEvaluation({kind: "object", object});
        } catch (error) {
            console.error("failed to evaluate object", error);

            setEvaluation({
                kind: "error",
                error: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setEvaluating(false);
        }
    };

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
                                when={isFailure(evaluation) ? null : evaluation}
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
                        </div>
                    )}
                </Show>
            </div>
        </div>
    );
};
