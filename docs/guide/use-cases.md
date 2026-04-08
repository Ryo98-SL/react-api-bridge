# Use Cases

## Modal And Drawer Managers

Expose `open()` and `close()` from a local host component and trigger them from anywhere in the same subtree.

This is one of the clearest cases for `react-api-bridge` because the UI action is imperative and often far away from the caller.

## Tree Coordination

Tree nodes often need to:

- ask parents for status
- tell descendants to update
- synchronize local commands without global state

This library fits that pattern well because boundaries and parent lookup map naturally to nested UI structure.

## Wizard Or Stepper Actions

Expose actions like:

- `next()`
- `prev()`
- `validate()`
- `submit()`

This keeps wizard orchestration imperative without moving every action into global state.

## Plugin Or Slot Systems

If each region of the UI has its own local providers, boundaries let you register the same API names safely in multiple places.

That makes it easier to build local plugin containers and repeated sub-app regions.

## Deferred Or Lazy UI

Sometimes the caller is ready before the provider mounts.

`getBridgeAPIAsync()` helps coordinate lazy panels, deferred routes, or conditional providers without custom waiting logic.

## What Makes A Good API Name

Prefer names that describe a capability:

- `modal`
- `treeNode`
- `wizard`
- `drawer`
- `commandPalette`

Avoid generic names like `data`, `handler`, or `manager` unless they really describe a single focused capability.
