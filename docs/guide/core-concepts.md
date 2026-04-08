# Core Concepts

## Bridge

A bridge is the registry that holds your component APIs.

```tsx
import { createBridge } from '@ryo-98/react-api-bridge';

interface AppAPIs {
  modal: { open: () => void };
  treeNode: { refresh: () => void };
}

const bridge = createBridge<AppAPIs>();
```

You typically create it once at module scope.

## API Registration

`useRegister()` exposes a component capability under a name.

```tsx
useRegister(bridge, 'modal', () => ({
  open: () => setOpen(true),
  close: () => setOpen(false)
}), []);
```

The registered value is an imperative API object, not an event listener.

## API Access

`useAPI()` reads the API in the current boundary scope.

```tsx
const modalAPI = useAPI(bridge, 'modal');
modalAPI.current?.open();
```

This gives you a ref-like object for direct method calls.

## Boundary Scope

`Boundary` creates a local namespace for APIs.

```tsx
const Boundary = createBoundary(bridge);
```

With boundaries:

- the same API name can exist in different subtrees
- children resolve the nearest matching provider
- you avoid turning everything into a global singleton

## Parent Lookup

Use `useUpperAPI()` when the consumer should intentionally look upward.

```tsx
const parentWidget = useUpperAPI(bridge, 'widget');
parentWidget?.current?.refresh();
```

This is useful when nested boundaries each define their own local APIs.

## Boundary Payload

Boundary payloads let you carry scoped data together with scoped APIs.

```tsx
const bridge = createBridge<AppAPIs, { theme: string }>({
  theme: 'light'
});

const payload = useBoundaryPayload(bridge);
```

Use this when a subtree shares both local capabilities and local metadata.

## Async Registration

Sometimes the consumer exists before the provider mounts. `getBridgeAPIAsync()` solves that.

```tsx
const modalAPI = await getBridgeAPIAsync(bridge, 'modal');
modalAPI.current?.open();
```

This makes the library especially useful for lazy UI regions and deferred rendering.

## Multi Instance

Set `isMulti: true` when many components should register under the same API name.

```tsx
const bridge = createBridge<{
  notification: {
    id: string;
    show: (message: string) => void;
  };
}>()({
  notification: { isMulti: true }
});
```

Now `useAPI()` returns a collection of refs for that API key.

## onInit

You can react when an API becomes available with the `onInit` option.

```tsx
const modalAPI = useAPI(bridge, 'modal', {
  onInit: (apiRef) => {
    apiRef.current?.open();
  }
});
```

This is helpful for initialization flows that should run once the provider is ready.
