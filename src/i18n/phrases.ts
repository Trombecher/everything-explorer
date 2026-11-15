export namespace Phrase {
    type RequireArgsForEveryPhrase<
        A extends Record<Phrase, object | undefined>,
    > = A;

    export type TranslationArguments = RequireArgsForEveryPhrase<{
        [AppSettings]: undefined;
        [Compact]: undefined;
        [Greeting]: {forName: string};
        [InstanceProperties]: undefined;
        [Connections]: undefined;
        [AddKnowledgeBase]: undefined;
        [CreateNewLocal]: undefined;
        [ExistingLocal]: undefined;
        [RemoteConnection]: undefined;
        [Local]: undefined;
        [Remote]: undefined;
        [Connect]: undefined;
        [Disconnect]: undefined;
        [Connected]: undefined;
        [UnnamedConnection]: undefined;
        [DeleteConnection]: undefined;
        [NoConnectionsYet]: undefined;
        [Things]: undefined;
        [German]: undefined;
        [English]: undefined;
        [System]: undefined;
        [Language]: undefined;
        [Version]: undefined;
        [Home]: undefined;
        [Light]: undefined;
        [Dark]: undefined;
        [Theme]: undefined;
        [WelcomeBack]: undefined;
        [Debug]: undefined;
    }>;

    export const AppSettings = Symbol();
    export const Compact = Symbol();
    export const Greeting = Symbol();
    export const InstanceProperties = Symbol();
    export const Connections = Symbol();
    export const AddKnowledgeBase = Symbol();
    export const CreateNewLocal = Symbol();
    export const ExistingLocal = Symbol();
    export const RemoteConnection = Symbol();
    export const Local = Symbol();
    export const Remote = Symbol();
    export const Connect = Symbol();
    export const Disconnect = Symbol();
    export const Connected = Symbol();
    export const UnnamedConnection = Symbol();
    export const DeleteConnection = Symbol();
    export const NoConnectionsYet = Symbol();
    export const Things = Symbol();
    export const German = Symbol();
    export const English = Symbol();
    export const System = Symbol();
    export const Language = Symbol();
    export const Version = Symbol();
    export const Dark = Symbol();
    export const Light = Symbol();
    export const Theme = Symbol();
    export const Home = Symbol();
    export const WelcomeBack = Symbol();
    export const Debug = Symbol();
}

export type Phrase =
    | typeof Phrase.AppSettings
    | typeof Phrase.Compact
    | typeof Phrase.Greeting
    | typeof Phrase.InstanceProperties
    | typeof Phrase.Connections
    | typeof Phrase.AddKnowledgeBase
    | typeof Phrase.CreateNewLocal
    | typeof Phrase.ExistingLocal
    | typeof Phrase.RemoteConnection
    | typeof Phrase.Local
    | typeof Phrase.Remote
    | typeof Phrase.Connect
    | typeof Phrase.Disconnect
    | typeof Phrase.Connected
    | typeof Phrase.UnnamedConnection
    | typeof Phrase.DeleteConnection
    | typeof Phrase.NoConnectionsYet
    | typeof Phrase.Things
    | typeof Phrase.German
    | typeof Phrase.English
    | typeof Phrase.System
    | typeof Phrase.Language
    | typeof Phrase.Version
    | typeof Phrase.Dark
    | typeof Phrase.Light
    | typeof Phrase.Theme
    | typeof Phrase.Home
    | typeof Phrase.WelcomeBack
    | typeof Phrase.Debug;
