# API Reference

## Bridge Creation

### `createBridge<APIs, PayloadType>(globalPayload?, options?)`

Creates a bridge instance.

Use it to define:

- API names
- API shapes
- optional global payload
- optional API options such as multi-instance behavior

## Hooks

### `useRegister(bridge, name, factory, deps, options?)`

Registers a component API under `name`.

### `useAPI(bridge, name, options?)`

Reads the API in the current boundary scope.

### `useUpperAPI(bridge, name, options?)`

Reads a matching API from an upper boundary.

### `useBoundaryPayload(bridge, options?)`

Reads the payload attached to the current boundary.

### `useUpperBoundaryPayload(bridge, options?)`

Reads payload from an upper boundary.

### `useBoundaryContext(bridge, payload?)`

Creates a reusable boundary context value.

### `useTools(bridge, options?)`

Returns helper methods for programmatic access inside components.

## Methods

### `getBridgeAPI(bridge, name, options?)`

Gets an API outside components. By default, it reads from the global scope.

### `getBridgeAPIAsync(bridge, name, options?)`

Waits for an API to be registered and returns it as a promise.

## Components

### `createBoundary(bridge)`

Creates a boundary component factory for scoped API access.

## Notes

- Most consumers should start with `createBridge`, `createBoundary`, `useRegister`, and `useAPI`
- Reach for `useUpperAPI` and `getBridgeAPIAsync` when you need more advanced coordination
- Use `isMulti: true` when one API key needs many active providers
