# Project TODOs

We one is finished, please remove it from this list.

## Primary

1. Revise some object icons, specifically
    - `QueryConstructionsIcon`
    - `QueryConstructionValuesIcon`
    - `SetMapIcon`
    - `HasValueIcon`
    - `UnwrapIcon`
    - `AtomsWithConstructorIcon`
    - `AtomsWithPropertyIcon`.

    This may need human assistance.

2. For some nodes, backspace and delete hotkeys do not work correctly. It is to
   determine which blocks do not work beforehand.

3. Fix some colors in light mode, e.g. the tab button hover background color is
   one stage too dark. This may be more difficult than it seems, since both in
   light and in dark mode, the app background is darker than the panel
   background color. I don't like "exceptions" with the tailwind `dark:` syntax.
   Ideally all colors should be inverted automatically. But then to implement
   that behaviour, the inversion is not monotone, i.e. `bg-<palette>-100` is
   darker than `bg-white`. Is this a trade-off we are willing to make? How does
   it expand to areas where this would produce unexpected side-effects? What are
   those areas? Linked to (4.)

4. Add a semantic layer of colors
    - (a) maybe one for surface colors,
    - (b) one for primary, and
    - (c) one for danger (?).
    - (d) Also add always-white and stuff.

5. Atom object view ability to search for atoms by their names.

6. Search bar searching atoms by name.

    directly in the explorer). (5.) and (6.) may benefit from this.

## Secondary

100. When editing objects, add a sidebar displaying the behaviour of the
     currently selected object/node. This could be combined with (103.) or

101. The icons in the object view are a little too big, but currently they are
     pixel-perfect (so look the best). The objects may also be too spacy and the
     text is too large for large object expressions.

102. Rethink tab management. Maybe add vertical tabs that can be closed which
     have a tab kind (currently equivalent to the tabs).

103. Scatch pad for temporary objects?

104. A panel

    - (a) showing all the hotkeys for the nodes;
    - (b) and the hotkeys special to that node.
    - (c) Maybe it should also show UI to change the type of the node.

105. A panel serving as a virtual keyboard, for mobile or desktop (touch) that
     provides visual buttons for all current operations.

106. Full text (name) search index into the backend (either in this crate or
