import {ObjectType} from ".";
import {CONTAINS_ATOM_VALUE} from "./atomValues";

export type Atom = {
    readonly type: typeof ObjectType.Atom;
    readonly value: bigint;
};

/**
 * The largest possible atom id. Atom ids are unsigned 128-bit integers.
 */
export const MAX_ATOM_ID = (1n << 128n) - 1n;

/**
 * Generates a new atom id from a ULID.
 *
 * A ULID is a 128-bit value made of a 48-bit millisecond timestamp followed by
 * 80 random bits.
 */
export const generateAtomId = (): bigint => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(10));

    let randomness = 0n;
    for (const byte of randomBytes) {
        randomness = (randomness << 8n) | BigInt(byte);
    }

    return (BigInt(Date.now()) << 80n) | randomness;
};

export namespace Atom {
    /**
     * The atom 0 (zero).
     */
    export const Zero = {
        type: ObjectType.Atom,
        value: 2148623498527692884679683682469014909n,
    } as const satisfies Atom;

    /**
     * The property constructor for the next integer.
     */
    export const SuccessorOf = {
        type: ObjectType.Atom,
        value: 2148623541928107461725235547620677496n,
    } as const satisfies Atom;

    /**
     * The property constructor for the previous integer.
     */
    export const PredecessorOf = {
        type: ObjectType.Atom,
        value: 2150448436013648618415526635010123333n,
    } as const satisfies Atom;

    /**
     * The list slot for the first element.
     */
    export const ListItem = {
        type: ObjectType.Atom,
        value: 2148623561006058368074852138222840554n,
    } as const satisfies Atom;

    /**
     * The list slot for the rest of the list.
     */
    export const ListTail = {
        type: ObjectType.Atom,
        value: 2148623576528286069034804554905263388n,
    } as const satisfies Atom;

    /**
     * The property constructor for the code point of a character.
     */
    export const CodePoint = {
        type: ObjectType.Atom,
        value: 2148623592788974381730175331142334217n,
    } as const satisfies Atom;

    /**
     * The atom denoting a bit that is off.
     */
    export const BitOff = {
        type: ObjectType.Atom,
        value: 2148623606609578531456976446246481504n,
    } as const satisfies Atom;

    /**
     * The atom denoting a bit that is on.
     */
    export const BitOn = {
        type: ObjectType.Atom,
        value: 2148623648901638714578593280489697845n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 0 (the least significant bit).
     */
    export const BitSlot0 = {
        type: ObjectType.Atom,
        value: 2148623657764931307024391951942698252n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 1.
     */
    export const BitSlot1 = {
        type: ObjectType.Atom,
        value: 2148623779289647569021414352435474390n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 2.
     */
    export const BitSlot2 = {
        type: ObjectType.Atom,
        value: 2148623793297509473303838197251962004n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 3.
     */
    export const BitSlot3 = {
        type: ObjectType.Atom,
        value: 2148623803164736660711697141897226232n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 4.
     */
    export const BitSlot4 = {
        type: ObjectType.Atom,
        value: 2148623819303808917979289470225598602n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 5.
     */
    export const BitSlot5 = {
        type: ObjectType.Atom,
        value: 2148623826522742854507738117057019657n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 6.
     */
    export const BitSlot6 = {
        type: ObjectType.Atom,
        value: 2148623834321554672547365012703956257n,
    } as const satisfies Atom;

    /**
     * The bit slot with index 7 (the most significant bit).
     */
    export const BitSlot7 = {
        type: ObjectType.Atom,
        value: 2148623841265101367555509279336886325n,
    } as const satisfies Atom;

    /**
     * The property constructor for set membership.
     */
    export const Contains = {
        type: ObjectType.Atom,
        value: CONTAINS_ATOM_VALUE,
    } as const satisfies Atom;

    export const NodeFunction = {
        type: ObjectType.Atom,
        value: 2148623901005465698003044719488417081n,
    } as const satisfies Atom;

    export const NodeFunctionSelf = {
        type: ObjectType.Atom,
        value: 2148624013653182105587583289980365332n,
    } as const satisfies Atom;

    export const NodeAddFirst = {
        type: ObjectType.Atom,
        value: 2148566534810416742677953060919673357n,
    } as const satisfies Atom;

    export const NodeAddSecond = {
        type: ObjectType.Atom,
        value: 2148566534810416742677953060919673358n,
    } as const satisfies Atom;

    export const NodeLiteral = {
        type: ObjectType.Atom,
        value: 2148623946948209931514052368378168923n,
    } as const satisfies Atom;

    export const NodeEqualFirst = {
        type: ObjectType.Atom,
        value: 2148623984105467336671475554302291443n,
    } as const satisfies Atom;

    export const NodeEqualSecond = {
        type: ObjectType.Atom,
        value: 2150546540588687321716707989954282134n,
    } as const satisfies Atom;

    export const NodeAndFirst = {
        type: ObjectType.Atom,
        value: 2148623952614130968570357528352754483n,
    } as const satisfies Atom;

    export const NodeAndSecond = {
        type: ObjectType.Atom,
        value: 2150546484857217536175129940420364334n,
    } as const satisfies Atom;

    export const NodeOrFirst = {
        type: ObjectType.Atom,
        value: 2148623991617605004082324671379584752n,
    } as const satisfies Atom;

    export const NodeOrSecond = {
        type: ObjectType.Atom,
        value: 2150546471301176810351954476414010805n,
    } as const satisfies Atom;

    export const NodeXorFirst = {
        type: ObjectType.Atom,
        value: 2148623998771243099015849175301884477n,
    } as const satisfies Atom;

    export const NodeXorSecond = {
        type: ObjectType.Atom,
        value: 2150546556818362149014272809860190195n,
    } as const satisfies Atom;

    export const NodeNot = {
        type: ObjectType.Atom,
        value: 2148624004488096373987985726200830300n,
    } as const satisfies Atom;

    export const NodeSetCount = {
        type: ObjectType.Atom,
        value: 2148623971839749022702961541901456532n,
    } as const satisfies Atom;

    export const NodeSetUnionFirst = {
        type: ObjectType.Atom,
        value: 2150602665196451232518504136866676495n,
    } as const satisfies Atom;

    export const NodeSetUnionSecond = {
        type: ObjectType.Atom,
        value: 2150602676477464422271577313769115263n,
    } as const satisfies Atom;

    export const NodeSetIntersectionFirst = {
        type: ObjectType.Atom,
        value: 6105450065514020261664789753451078433n,
    } as const satisfies Atom;

    export const NodeSetIntersectionSecond = {
        type: ObjectType.Atom,
        value: 294371887698077017665747245360098400935n,
    } as const satisfies Atom;

    export const NodeSetFilterSet = {
        type: ObjectType.Atom,
        value: 2150755714608308122129968313720999578n,
    } as const satisfies Atom;

    export const NodeSetFilterFilter = {
        type: ObjectType.Atom,
        value: 2150755715328094057860222292607728283n,
    } as const satisfies Atom;

    export const NodeSetMapSet = {
        type: ObjectType.Atom,
        value: 2150755705084816915741037497738372617n,
    } as const satisfies Atom;

    export const NodeSetMapMapper = {
        type: ObjectType.Atom,
        value: 2150755713297709286586583523030939076n,
    } as const satisfies Atom;

    export const NodeSetFoldSet = {
        type: ObjectType.Atom,
        value: 2166944102906103538111212580396221266n,
    } as const satisfies Atom;

    export const NodeSetFoldFolder = {
        type: ObjectType.Atom,
        value: 2166944102906948913400158817641233982n,
    } as const satisfies Atom;

    export const NodeSetFoldInitial = {
        type: ObjectType.Atom,
        value: 2166944102906490208705196484796567529n,
    } as const satisfies Atom;

    export const NodeSetEverySet = {
        type: ObjectType.Atom,
        value: 2166698849805704507867628297969608633n,
    } as const satisfies Atom;

    export const NodeSetEveryPredicate = {
        type: ObjectType.Atom,
        value: 2166698849806407199650439702292185631n,
    } as const satisfies Atom;

    export const NodeSetAnySet = {
        type: ObjectType.Atom,
        value: 2166698849805453912896075884999506648n,
    } as const satisfies Atom;

    export const NodeSetAnyPredicate = {
        type: ObjectType.Atom,
        value: 2166698849805816631718884425726665751n,
    } as const satisfies Atom;

    export const NodeIfCondition = {
        type: ObjectType.Atom,
        value: 2150756911395278548780220055702389669n,
    } as const satisfies Atom;

    export const NodeIfThen = {
        type: ObjectType.Atom,
        value: 2150756911395360151235546653103149781n,
    } as const satisfies Atom;

    export const NodeIfElse = {
        type: ObjectType.Atom,
        value: 2150756911395636855407117245584275797n,
    } as const satisfies Atom;

    export const NodeLessFirst = {
        type: ObjectType.Atom,
        value: 2150755802916608365774567517427204904n,
    } as const satisfies Atom;

    export const NodeLessSecond = {
        type: ObjectType.Atom,
        value: 2150755809462832010701281576784730955n,
    } as const satisfies Atom;

    export const NodeSetContainsElement = {
        type: ObjectType.Atom,
        value: 2166943953075778840020869770686077619n,
    } as const satisfies Atom;

    export const NodeSetContainsSet = {
        type: ObjectType.Atom,
        value: 2166943953076260545247311619503999088n,
    } as const satisfies Atom;

    export const NodeAtomsWithProperty = {
        type: ObjectType.Atom,
        value: 2166943953075978973796333008418190812n,
    } as const satisfies Atom;

    export const NodePropertiesOf = {
        type: ObjectType.Atom,
        value: 2169866792562131836262938477060325203n,
    } as const satisfies Atom;

    export const NodeHasValue = {
        type: ObjectType.Atom,
        value: 2169868497815503720673833180838489269n,
    } as const satisfies Atom;

    export const NodeSetUnwrapSet = {
        type: ObjectType.Atom,
        value: 2150860435707265317782695126754608091n,
    } as const satisfies Atom;

    export const NodeIsAtom = {
        type: ObjectType.Atom,
        value: 2166698913622186896712941547852179611n,
    } as const satisfies Atom;

    export const NodeIsConstruction = {
        type: ObjectType.Atom,
        value: 2166943953076020814661790508015684296n,
    } as const satisfies Atom;

    export const NodeIsComposite = {
        type: ObjectType.Atom,
        value: 2166944102907011869965838540132997515n,
    } as const satisfies Atom;

    export const NodeConstructorOfConstruction = {
        type: ObjectType.Atom,
        value: 2166944102906855387534895944602332938n,
    } as const satisfies Atom;

    export const NodeValueOfConstruction = {
        type: ObjectType.Atom,
        value: 2166944102906650686418158228301455892n,
    } as const satisfies Atom;

    export const NodeNewSetItem = {
        type: ObjectType.Atom,
        value: 199021041172814012682334153578244309615n,
    } as const satisfies Atom;

    export const NodeConstructionValuesObject = {
        type: ObjectType.Atom,
        value: 2166943953076489335344956167016992222n,
    } as const satisfies Atom;

    export const NodeConstructionValuesPropertyConstructor = {
        type: ObjectType.Atom,
        value: 2166943953075944059533195652762751502n,
    } as const satisfies Atom;

    export const NodeQueryConstructions = {
        type: ObjectType.Atom,
        value: 2169938683744888441848469861984944275n,
    } as const satisfies Atom;

    export const NodeAtomsWithConstructor = {
        type: ObjectType.Atom,
        value: 2169941030578384052544017889355444292n,
    } as const satisfies Atom;

    export const NodeMultiplyFirst = {
        type: ObjectType.Atom,
        value: 2150955291898078111384483788783842606n,
    } as const satisfies Atom;

    export const NodeMultiplySecond = {
        type: ObjectType.Atom,
        value: 2150955291897679523990373018161137292n,
    } as const satisfies Atom;

    export const NodeCallCallee = {
        type: ObjectType.Atom,
        value: 2150967257692765401288058191156339282n,
    } as const satisfies Atom;

    export const NodeCallWith = {
        type: ObjectType.Atom,
        value: 2150967257692538503396115970645049110n,
    } as const satisfies Atom;

    export const NodeParameter = {
        type: ObjectType.Atom,
        value: 2148623964016728126166347458070520202n,
    } as const satisfies Atom;

    export const Name = {
        type: ObjectType.Atom,
        value: 2168675532473521068209426099129078617n,
    } as const satisfies Atom;

    /**
     * Annotation on function nodes that names their parameter.
     */
    export const ParameterName = {
        type: ObjectType.Atom,
        value: 2169830255009180635251211412954087391n,
    } as const satisfies Atom;
}
