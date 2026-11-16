const Connections = Symbol();
const AddKnowledgeBase = Symbol();
const CreateNewLocal = Symbol();
const ExistingLocal = Symbol();
const RemoteConnection = Symbol();
const AddRemoteConnection = Symbol();
const RemoteConnectionDescription = Symbol();
const Url = Symbol();
const Name = Symbol();
const InvalidRemoteUrl = Symbol();
const RemoteConnectionAlreadyExists = Symbol();
const Local = Symbol();
const Remote = Symbol();
const Connect = Symbol();
const Disconnect = Symbol();
const Connected = Symbol();
const UnnamedConnection = Symbol();
const DeleteConnection = Symbol();
const NoConnectionsYet = Symbol();
const Connection = Symbol();
const ConnectTo = Symbol();
const DisconnectFrom = Symbol();

export const connectionPhrases = {
    Connections,
    AddKnowledgeBase,
    CreateNewLocal,
    ExistingLocal,
    RemoteConnection,
    AddRemoteConnection,
    RemoteConnectionDescription,
    Url,
    Name,
    InvalidRemoteUrl,
    RemoteConnectionAlreadyExists,
    Local,
    Remote,
    Connect,
    Disconnect,
    Connected,
    UnnamedConnection,
    DeleteConnection,
    NoConnectionsYet,
    Connection,
    ConnectTo,
    DisconnectFrom,
} as const;

export type ConnectionTranslationArguments = {
    [Connections]: undefined;
    [AddKnowledgeBase]: undefined;
    [CreateNewLocal]: undefined;
    [ExistingLocal]: undefined;
    [RemoteConnection]: undefined;
    [AddRemoteConnection]: undefined;
    [RemoteConnectionDescription]: undefined;
    [Url]: undefined;
    [Name]: undefined;
    [InvalidRemoteUrl]: undefined;
    [RemoteConnectionAlreadyExists]: undefined;
    [Local]: undefined;
    [Remote]: undefined;
    [Connect]: undefined;
    [Disconnect]: undefined;
    [Connected]: undefined;
    [UnnamedConnection]: undefined;
    [DeleteConnection]: undefined;
    [NoConnectionsYet]: undefined;
    [Connection]: undefined;
    [ConnectTo]: {forName: string};
    [DisconnectFrom]: {forName: string};
};
