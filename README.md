# react-api-bridge
> **Language**: [English](#) | [简体中文](./README.zh-CN.md)

Scoped imperative APIs for React.

Expose component methods anywhere in the tree without prop drilling. Unlike an event bus, `react-api-bridge` gives you direct typed APIs with scope control, parent lookup, async registration, and multi-instance support.

<img src="./logo/react-api-bridge-logo.svg" alt="react-api-bridge logo" width="200" height="auto">

## Why This Exists

React gives you great tools for state flow, but imperative component actions are still awkward when:

- You need to call a component method from far away in the tree
- `forwardRef` only works for direct parent-child relationships
- Context starts carrying too many callbacks
- An event bus feels too global and too unstructured

`react-api-bridge` solves that by turning component methods into a scoped registry of imperative APIs.

## What It Is

- A registry for component imperative APIs
- Tree-scoped access through `Boundary`
- Direct method calls instead of event broadcasting
- Type-safe APIs with full TypeScript inference
- Async-friendly when the target component is not mounted yet

## What It Is Not

- Not a state manager
- Not a replacement for Context value sharing
- Not an event emitter clone
- Not limited to parent-child ref chains

## Why It Is Different From EventEmitter

| EventEmitter | react-api-bridge |
| --- | --- |
| Broadcasts events | Exposes direct component APIs |
| Consumers react to payloads | Consumers call typed methods |
| Usually global per emitter instance | Scoped by React boundaries |
| Great for notifications | Great for imperative coordination |
| `emit('open')` | `modalAPI.current?.open()` |

If your mental model is "I want to call a component capability", this library is usually a better fit than an event bus.

## Installation

```bash
npm install @ryo-98/react-api-bridge
```

## Quick Example

Open a modal from anywhere in the same subtree, without prop drilling.

```tsx
import { useState } from 'react';
import {
    createBridge,
    createBoundary,
    useAPI,
    useRegister
} from '@ryo-98/react-api-bridge';

interface AppAPIs {
    modal: {
        open: (content: string) => void;
        close: () => void;
    };
}

const bridge = createBridge<AppAPIs>();
const Boundary = createBoundary(bridge);

function ModalHost() {
    const [content, setContent] = useState<string | null>(null);

    useRegister(bridge, 'modal', () => ({
        open: (nextContent) => setContent(nextContent),
        close: () => setContent(null)
    }), []);

    if (!content) return null;
    return <dialog open>{content}</dialog>;
}

function OpenButton() {
    const modalAPI = useAPI(bridge, 'modal');

    return (
        <button onClick={() => modalAPI.current?.open('Hello from anywhere')}>
            Open modal
        </button>
    );
}

export default function App() {
    return (
        <Boundary>
            <ModalHost />
            <section>
                <OpenButton />
            </section>
        </Boundary>
    );
}
```

## When To Use It

`react-api-bridge` is a strong fit when you need:

- Modal, drawer, toast, or command palettes controlled from many places
- Tree or form-wizard coordination across deep component hierarchies
- Plugin or slot systems with local API visibility
- Direct imperative actions without extra re-render noise
- Access to APIs that may mount later

## Core Strengths

### 1. Scoped Access With Boundaries

Boundaries act like scopes. The same API name can exist in different subtrees without leaking globally.

```tsx
import { createBoundary } from '@ryo-98/react-api-bridge';

const Boundary = createBoundary(bridge);

function App() {
    return (
        <>
            <WidgetProvider name="global" />

            <Boundary>
                <WidgetProvider name="local" />
                <WidgetConsumer /> {/* sees "local" */}
            </Boundary>

            <WidgetConsumer /> {/* sees "global" */}
        </>
    );
}
```

### 2. Parent Lookup

Sometimes you want the current subtree API. Sometimes you want the parent one.

```tsx
import { useAPI, useUpperAPI } from '@ryo-98/react-api-bridge';

function NestedConsumer() {
    const currentAPI = useAPI(bridge, 'widget');
    const parentAPI = useUpperAPI(bridge, 'widget');

    return (
        <button onClick={() => parentAPI?.current?.refresh()}>
            Refresh parent widget
        </button>
    );
}
```

### 3. Async Registration

Wait for an API to become available instead of building your own polling or deferred event logic.

```tsx
import { getBridgeAPIAsync } from '@ryo-98/react-api-bridge';

async function openWhenReady() {
    const modalAPI = await getBridgeAPIAsync(bridge, 'modal');
    modalAPI.current?.open('Loaded later');
}
```

### 4. Multi-Instance APIs

Register multiple components under the same API name.

```tsx
const bridge = createBridge<{
    notification: {
        id: string;
        show: (message: string) => void;
    };
}>()({
    notification: { isMulti: true }
});

function NotificationPanel({ id }: { id: string }) {
    useRegister(bridge, 'notification', () => ({
        id,
        show: (message) => console.log(id, message)
    }), [id]);
}

function ShowAll() {
    const notifications = useAPI(bridge, 'notification');

    return (
        <button onClick={() => {
            notifications.forEach(api => api.current?.show('hello'));
        }}>
            Show all
        </button>
    );
}
```

### 5. Boundary Payloads

Attach payload data to a boundary and read it anywhere inside that scope.

```tsx
import {
    createBridge,
    createBoundary,
    useBoundaryPayload
} from '@ryo-98/react-api-bridge';

const bridge = createBridge<{
    panel: { refresh: () => void };
}, { theme: string }>({
    theme: 'light'
});

const Boundary = createBoundary(bridge);

function Screen() {
    return (
        <Boundary payload={{ theme: 'dark' }}>
            <Panel />
        </Boundary>
    );
}

function Panel() {
    const payload = useBoundaryPayload(bridge);
    return <div>{payload.theme}</div>;
}
```

## Mental Model

Think of this library as:

- `ref`, but not limited to direct parents
- `Context`, but for imperative capabilities instead of plain values
- a command registry, but scoped to React subtrees

## Common Use Cases

- Modal and drawer managers
- Tree node coordination
- Wizard or stepper actions
- Locally scoped plugin systems
- Cross-cutting UI actions that should not become global state

## Best Practices

- Create bridges at module scope
- Keep each API focused on one capability
- Check `apiRef.current` before calling methods
- Use `Boundary` when you need local scope instead of global access
- Use `isMulti: true` only when multiple active providers are expected
- Prefer descriptive API names such as `modal`, `treeNode`, or `wizard`

## When Not To Use It

Do not reach for this library when:

- You only need parent-child refs
- Shared state is a better abstraction than imperative methods
- A plain callback prop is enough
- A normal Context provider already models the problem well

## API Reference

### Bridge Creation

- `createBridge<APIs, PayloadType>(globalPayload?, options?)`

### Hooks

- `useRegister(bridge, name, factory, deps, options?)`
- `useAPI(bridge, name, options?)`
- `useUpperAPI(bridge, name, options?)`
- `useBoundaryPayload(bridge, options?)`
- `useUpperBoundaryPayload(bridge, options?)`
- `useBoundaryContext(bridge, payload?)`
- `useTools(bridge, options?)`

### Methods

- `getBridgeAPI(bridge, name, options?)`
- `getBridgeAPIAsync(bridge, name, options?)`

### Components

- `createBoundary(bridge)`

## FAQ

**Why not just use EventEmitter?**

Because this library models APIs, not events. You call component capabilities directly, and scope them with React boundaries.

**Why not just use Context?**

Context is great for value distribution. This library is better when the thing you want to share is an imperative capability such as `open`, `focus`, `refresh`, `expand`, or `submit`.

**Why not just use `forwardRef`?**

`forwardRef` is excellent for direct parent-child access. This library helps when the caller and provider are far apart or live in scoped subtrees.

## License

MIT
