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

## Add A Boundary

Boundaries create local API scope. This is where the library becomes more useful than plain refs.

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
