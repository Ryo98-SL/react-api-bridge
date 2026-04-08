# react-api-bridge

> **Language**: [English](#) | [简体中文](./README.zh-CN.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/Ryo98-SL/react-api-bridge/master/logo/react-api-bridge-logo.svg" alt="react-api-bridge logo" width="200">
</p>

Scoped imperative APIs for React.

`react-api-bridge` lets you expose and call component methods across a React subtree without prop drilling. It is a scoped API registry, not an event bus.

## Docs

- English: https://ryo98-sl.github.io/react-awesome-api-bridge/
- 简体中文: https://ryo98-sl.github.io/react-awesome-api-bridge/zh/

## Install

```bash
npm install @ryo-98/react-api-bridge
```

## Why Use It

- Scope APIs with `Boundary` instead of leaking them globally
- Call typed component methods directly instead of broadcasting events
- Look up current or parent-scope APIs
- Wait for APIs that mount later with async access
- Support multiple providers under the same API name

## Quick Example

```tsx
import { useState } from "react";
import {
  createBridge,
  createBoundary,
  useAPI,
  useRegister,
} from "@ryo-98/react-api-bridge";

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

  useRegister(
    bridge,
    "modal",
    () => ({
      open: (nextContent) => setContent(nextContent),
      close: () => setContent(null),
    }),
    [],
  );

  if (!content) return null;
  return <dialog open>{content}</dialog>;
}

function OpenButton() {
  const modalAPI = useAPI(bridge, "modal");

  return (
    <button onClick={() => modalAPI.current?.open("Hello from anywhere")}>
      Open modal
    </button>
  );
}

export default function App() {
  return (
    <Boundary>
      <ModalHost />
      <OpenButton />
    </Boundary>
  );
}
```

## API Overview

- `createBridge()`
- `createBoundary()`
- `useRegister()`
- `useAPI()`
- `useUpperAPI()`
- `getBridgeAPI()`
- `getBridgeAPIAsync()`

## Use Cases

- Modal, drawer, and toast controllers
- Wizard and tree action coordination
- Locally scoped plugin APIs
- Imperative actions that should not become global state

## License

MIT
