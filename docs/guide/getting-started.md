# Getting Started

## Install

```bash
npm install @ryo-98/react-api-bridge
```

## First Bridge

Start by describing your imperative APIs and creating a bridge.

```tsx
import { createBridge } from '@ryo-98/react-api-bridge';

interface AppAPIs {
  modal: {
    open: (content: string) => void;
    close: () => void;
  };
  wizard: {
    next: () => void;
    prev: () => void;
  };
}

export const bridge = createBridge<AppAPIs>();
```

## Register An API

Use `useRegister()` inside the component that owns the capability.

```tsx
import { useState } from 'react';
import { useRegister } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export function ModalHost() {
  const [content, setContent] = useState<string | null>(null);

  useRegister(bridge, 'modal', () => ({
    open: setContent,
    close: () => setContent(null)
  }), []);

  if (!content) return null;
  return <dialog open>{content}</dialog>;
}
```

## Read An API

Use `useAPI()` anywhere inside the same boundary scope.

```tsx
import { useAPI } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export function OpenModalButton() {
  const modalAPI = useAPI(bridge, 'modal');

  return (
    <button onClick={() => modalAPI.current?.open('Opened from far away')}>
      Open modal
    </button>
  );
}
```

At this point, you already know enough to cover most real-world use cases with this library. The remaining sections are mostly about edge cases: if multiple `useRegister()` calls register the same API key, the **first one to mount becomes the owner** and any later `useRegister()` on that same key is ignored with a `console.warn` instead of silently overriding it. If you want them to coexist as multiple APIs on the same key, jump to the "Multi Instance" section below.

## Add A Boundary

In most cases, you do not need a Boundary. Without one, APIs are registered into the shared global scope. Add a Boundary only when you need local scope isolation, such as preventing APIs from different subtrees from colliding on the same key (which would otherwise trigger the first-registered-wins warning described above). Boundaries create local API scope, which is where the library becomes more useful than plain refs.

```tsx
import { createBoundary } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

const Boundary = createBoundary(bridge);

export function App() {
  return (
    <Boundary>
      <ModalHost />
      <OpenModalButton />
    </Boundary>
  );
}
```

## Access APIs Outside Components

Use `getBridgeAPI()` for direct access outside React components.

```tsx
import { getBridgeAPI } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export function openGlobalModal() {
  const modalAPI = getBridgeAPI(bridge, 'modal');
  modalAPI.current?.open('Triggered outside React');
}
```

## Wait For APIs That Mount Later

Use `getBridgeAPIAsync()` when the target component may not exist yet.

```tsx
import { getBridgeAPIAsync } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export async function openLater() {
  const modalAPI = await getBridgeAPIAsync(bridge, 'modal');
  modalAPI.current?.open('Opened after mount');
}
```

## Multi Instance

If multiple components register the same API key at the same time, the default behavior is **first-registered wins**: the first `useRegister()` to mount takes ownership of that key, and any later `useRegister()` from a different component on the same key is ignored — a `console.warn` is printed instead of silently overriding the existing API. Ownership is released when the owner component unmounts, so the next component to mount can claim it.

If you want them to coexist on the same key instead, mark that key with `isMulti: true` when creating the bridge.

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

Now `useAPI()` returns a collection of refs instead of a single ref, so you can decide how to iterate, filter, or select a specific instance to call.
