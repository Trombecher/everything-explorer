# Project TODOs / Ideas

We one is finished, please remove it from this list. Some of them are bugs,
general issues, ideas, or drafts.

The numbers in parentheses are stable identifiers, not list numbering. They are
not renumbered when an item is removed, so that references such as "(4.)" in
other items stay valid.

## Primary

- (1) Revise some object icons, specifically

    - `QueryConstructionsIcon`
    - `QueryConstructionValuesIcon`
    - `SetMapIcon`
    - `HasValueIcon`
    - `UnwrapIcon`
    - `AtomsWithConstructorIcon`
    - `SetMapIcon` (is it really that intuitive?)
    - `AtomsWithPropertyIcon`.

    This may need human assistance.

- (2) For some nodes, backspace and delete hotkeys do not work correctly. It is
  to determine which blocks do not work beforehand.

- (5) Atom object view ability to search for atoms by their names.

- (6) Search bar searching atoms by name.

- (11) The trash can icon (remove connection) overflows the connection box in
  the connections view, when connected (`<dot> connected` is added to that
  flex). Also, the padding is off, "local" has less padding to the box border
  than the title and the monospace path. That path should not be monospace. Also
  the connection deletion button should ask (for local connections) whether to
  delete also the knowledge base file, or just the connection. Also when
  connected, the border is too bright of blue and the background does not change
  to a blueish background.

- (13) Decide what to put on the home screen. Release notes? Shortcut buttons
  for recently accessed things?

- (14) Tooltip or message in the properties panel for atoms that do not have any
  properties (just selected via a new random ULID) in the things tab, that once
  you close this panel the atom may not be identifiable and the id will be lost.
  (?)

- (15) The atom properties are not reactive. This leads to objects not appearing
  in the view (when they should, sometimes). Make them reactive with websocket
  (worth?, subscribe / unsubscribe on unmount). Should we just refetch or do
  optimistic updates in the UI? The remote server is mostly trusted and private
  (because we can run code on it), so we can send a little more requests. Add a
  button to refetch or automatic? Reactive via websockets would be really nice
  (then only for server->client updates? or whole apis?).

- (16) Double click on atoms to open their properties in the things view.

- (17) Decide whether to store tab information in the persisted app settings.

- (19) Show app settings file path (with open button) in app settings page.

- (20) Show more app info (either on homescreen or app settings), like commit
  hash, repo URL, project lead, when published and where the web is pulled from
  (just the URL).

- (21) Legal text info with all MIT licenses used in the project from libraries.
  (Is this required?). Maybe show in app settings?

- (22) fix scroll when multiple panels need scroll: independently.

- (23) Incorporate the "cloud" maskot (icon) of the app, maybe in the loading
  screen or in the app title.

- (25) Better UI in Evalute tab for lazy results (paging, skipping results,
  etc.).

- (26) Auto-quote found objects that are not nodes where nodes are expected with
  literal nodes. Configurable, always on, or only on key / button action?

- (27) Better headless testing without tauri for agents, by extracting the
  knowledge server to a separate crate which can run the knowledge server
  headlessly.

- (30) Better UI for the if-node, maybe with arrows that adapt to the layout?
  (then we would need to measure height which I'd like to avoid).

- (31) Add more query nodes in the backend, and then in the frontend.

- (32) Some nodes are still unimplemented in the frontend but in the backend.

- (33) Agent DSL? How do we copy / paste objects? Encode into clipboard and then
  parse? or just virtual clipboard?

- (34) Better UI for parameter nodes and self-nodes.

- (35) Some specializations in the object view are literaly "not implemented".
  Implement them. Among these, the character view.

- (36) Add frontend tests for data validation and transformation, not yet for
  environments and code that need jsdom or browser stuff.

- (37) Better app background.

- (38) SolidJS 2.0 when?

- (39) What is the better TypeScript abstraction layer? For DX or Agent
  Experience?: classes or objects returned by hooks. Both guard/abstract state
  and expose only valid transformations. Maybe we should unify or commit to one
  style?

- (40) SolidJS skill? currently `createEffect`s are used to sync data. VERY BAD
  PRACTISE! `createComputed` if possible!

## Secondary

- (100) When editing objects, add a sidebar displaying the behaviour of the
  currently selected object/node. This could be combined with (103.) or

- (101) The icons in the object view are a little too big, but currently they
  are pixel-perfect (so look the best). The objects may also be too spacy and
  the text is too large for large object expressions.

- (102) Rethink tab management. Maybe add vertical tabs that can be closed which
  have a tab kind (currently equivalent to the tabs).

- (103) Scatch pad for temporary objects?

- (104) A panel

    - (a) showing all the hotkeys for the nodes;
    - (b) and the hotkeys special to that node.
    - (c) Maybe it should also show UI to change the type of the node.

- (105) A panel serving as a virtual keyboard, for mobile or desktop (touch)
  that provides visual buttons for all current operations.

- (106) Full text (name) search index into the backend (either in this crate or
  directly in the explorer). (5.) and (6.) may benefit from this.

- (107) App Ffont selection in the app settings?

- (108) More languages? Spanish? French?

- (109) Add small badges of common atom-properties for some selected set of
  properties for all atoms in the things view. For example a small badge under
  the atom name, indicating that it is a property constructor.

- (110) Interactive graph view of the database. Objects as nodes, directed edge
  means "is" (set inclusion).

- (111) Object normalization button to object views, which normalizes in-memory
  representation of specializations. (?)

- (112) Add a blob storage to the knowledge base. Should knowledge bases always
  have a blob storage? Should it be a separate set of connections? Separate API?
  Separate server? multiple even? Should blobs without references exist? Garbage
  collection or auto-removal if not referenced in the/a knowledge base?

- (113) App-wide action handling (maybe with action/command palette), showing
  key binds and descriptions?

- (114) Configurable hotkeys for actions.

- (115) Knowledge validation (currently unimplemented in the backend).

## Tertiary

- (10001) More views / plugins, like todo cards maybe. Or a calender. Or
  gallery.

- (10002) How do we incorporate (local) AI? MCP? I'd like for the user of
  Everything Explorer to write a prompt and the AI answers based on the stuff it
  queried the knowledge base with.
