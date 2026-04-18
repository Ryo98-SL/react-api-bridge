# API Reference

## Overview

The public API is split into four parts:

- Bridge creation: define the registry, payload, and per-key behavior.
- Components: create scoped Boundary providers.
- Hooks: register, read, and navigate APIs inside React components.
- Methods: read or wait for APIs outside React components.

For most use cases, start with:

1. `createBridge()`
2. `createBoundary()`
3. `useRegister()`
4. `useAPI()`

## Shared Option Types

### `APIOptions`

```ts
type APIOptions = {
  isMulti?: boolean;
}
```

- `isMulti`: allows one API key to keep multiple active providers at the same time.

### `BridgeAPIOptions<APIs>`

```ts
type BridgeAPIOptions<APIs> = Partial<Record<keyof APIs, APIOptions>>;
```

- Configures per-key bridge behavior.
- Pass it to the function returned by `createBridge(...)`.

### `BaseOptions<APIs, Options, Payload>`

```ts
type BaseOptions<APIs, Options, Payload> = {
  contextValue?: BoundaryContextValue<APIs, Payload, Options>;
}
```

- `contextValue`: overrides the current boundary scope and explicitly targets another boundary context.

### `GetAPIOptions<APIs, Name, Options, Payload>`

```ts
type GetAPIOptions<APIs, Name, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    onInit?: ResolveInit<APIs, Options, Name>;
  };
```

- `contextValue`: read from a specific boundary scope.
- `onInit`: runs when the resolved API becomes available.

### `UpperOptions<APIs, Options, Payload>`

```ts
type UpperOptions<APIs, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    shouldForwardYield?: (boundaryDetail) => any;
  };
```

- `contextValue`: sets the starting boundary for upward lookup.
- `shouldForwardYield`: controls which upper boundary should be selected.
  It receives:
  - `payload`: the current candidate boundary payload.
  - `parent`: the next parent boundary.
  - `allAPI`: all APIs currently registered on that candidate boundary.

### `GetUpperAPIOptions<APIs, Name, Options, Payload>`

- Combines `GetAPIOptions` and `UpperOptions`.
- Supports `contextValue`, `onInit`, and `shouldForwardYield`.

### `GetAPIAsyncOptions<APIs, Options, Payload>`

```ts
type GetAPIAsyncOptions<APIs, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    initial?: boolean;
  };
```

- `contextValue`: waits in a specific boundary scope.
- `initial`: defaults to `true`. Reuses the initial waiting slot for that scope. Set it to `false` to wait for a later registration instead.

## Bridge Creation

### `createBridge<APIs, PayloadType>(globalPayload?)(options?)`

Creates a bridge instance.

Call pattern:

- `createBridge<APIs, PayloadType>(globalPayload?)`: creates the bridge and optionally defines the global payload.
- `(...)(options?)`: optionally configures per-key bridge behavior such as `isMulti: true`.

First call parameters:

- `globalPayload`: optional payload stored on the global scope when no Boundary is used.

Second call parameters:

- `options`: optional `BridgeAPIOptions<APIs>` for per-key behavior such as `isMulti: true`.

Example:

```ts
const bridge = createBridge<{
  notification: {
    id: string;
    show: (message: string) => void;
  };
}>()({
  notification: { isMulti: true }
});
```

Returns:

- A bridge object used by all hooks, methods, and Boundaries created from it.

## Components

### `createBoundary(bridge)`

Creates a boundary component factory for scoped API access.

Parameters:

- `bridge`: the bridge created by `createBridge(...)`.

Boundary props:

- `payload`: the payload attached to this boundary scope.
- `contextValue`: an existing boundary context value created by `useBoundaryContext(...)`.

Boundary ref value:

- `payload`: the payload on this boundary.
- `parent`: the parent boundary context, if any.
- `getAPI(name)`: gets an API from this boundary scope.

## Hooks

### `useRegister(bridge, name, factory, deps?, options?)`

Registers a component API under `name`.

Options type:

- `BaseOptions`

Parameters:

- `bridge`: the target bridge.
- `name`: the API key to register.
- `factory`: returns the imperative API object or function exposed by this component.
- `deps`: dependency list passed to `useImperativeHandle`. Rebuilds the API when these values change.
- `options`: optional `BaseOptions`.
  - `contextValue`: registers into a specific boundary scope.

### `useAPI(bridge, name, options?)`

Reads the API in the current boundary scope.

Options type:

- `GetAPIOptions`

Parameters:

- `bridge`: the target bridge.
- `name`: the API key to read.
- `options`: optional `GetAPIOptions`.
  - `contextValue`: reads from a specific boundary scope.
  - `onInit`: runs once the API becomes available.

### `useUpperAPI(bridge, name, options?)`

Reads a matching API from an upper boundary.

Options type:

- `GetUpperAPIOptions`

Parameters:

- `bridge`: the target bridge.
- `name`: the API key to read.
- `options`: optional `GetUpperAPIOptions`.
  - `contextValue`: chooses the starting boundary.
  - `onInit`: runs once the resolved upper API becomes available.
  - `shouldForwardYield`: controls how far the upward lookup continues.

### `useBoundaryPayload(bridge, options?)`

Reads the payload attached to the current boundary.

Options type:

- `BaseOptions`

Parameters:

- `bridge`: the target bridge.
- `options`: optional `BaseOptions`.
  - `contextValue`: reads payload from a specific boundary context.

### `useUpperBoundaryPayload(bridge, options?)`

Reads payload from an upper boundary.

Options type:

- `UpperOptions`

Parameters:

- `bridge`: the target bridge.
- `options`: optional `UpperOptions`.
  - `contextValue`: chooses the starting boundary.
  - `shouldForwardYield`: controls which upper boundary is selected.

### `useBoundaryContext(bridge, payload?)`

Creates a reusable boundary context value.

Parameters:

- `bridge`: the target bridge.
- `payload`: the payload for the new boundary context value.

Returns:

- A `BoundaryContextValue` object that can be passed into `<Boundary contextValue={...} />` or any API that accepts `contextValue`.

### `useBoundaryRef(bridge)`

Creates a ref for a Boundary component.

Parameters:

- `bridge`: the target bridge.

Returns:

- A React ref whose `.current` exposes `payload`, `parent`, and `getAPI(name)`.

### `useTools(bridge, options?)`

Returns helper methods for programmatic access inside components.

Options type:

- `BaseOptions`

Parameters:

- `bridge`: the target bridge.
- `options`: optional `BaseOptions`.
  - `contextValue`: sets the default boundary scope for all returned helpers.

Returned helpers:

- `getAPI(name, options?)`: reads an API like `getBridgeAPI`, but defaults to the current component scope.
- `getBoundaryPayload(options?)`: reads boundary payload.
- `getUpperAPI(name, options?)`: reads an API from an upper boundary.
- `getUpperBoundaryPayload(options?)`: reads payload from an upper boundary.
- `getAPIAsync(name, options?)`: waits for an API like `getBridgeAPIAsync`, but defaults to the current component scope.

## Methods

### `getBridgeAPI(bridge, name, options?)`

Gets an API outside components. By default, it reads from the global scope.

Options type:

- `BaseOptions`

Parameters:

- `bridge`: the target bridge.
- `name`: the API key to read.
- `options`: optional `BaseOptions`.
  - `contextValue`: reads from a specific boundary scope instead of the global scope.

### `getBridgeAPIAsync(bridge, name, options?)`

Waits for an API to be registered and returns it as a promise.

Options type:

- `GetAPIAsyncOptions`

Parameters:

- `bridge`: the target bridge.
- `name`: the API key to wait for.
- `options`: optional `GetAPIAsyncOptions`.
  - `contextValue`: waits in a specific boundary scope.
  - `initial`: reuses the initial waiter by default, or waits for a later registration when set to `false`.

## Notes

- Most consumers should start with `createBridge`, `createBoundary`, `useRegister`, and `useAPI`
- Reach for `useUpperAPI` and `getBridgeAPIAsync` when you need more advanced coordination
- Use `isMulti: true` when one API key needs many active providers
- Add Boundary only when you need local scope isolation; otherwise APIs resolve from the shared global scope
