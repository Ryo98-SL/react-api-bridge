---
layout: home

hero:
  name: React API Bridge
  text: Scoped imperative APIs for React
  tagline: Expose component methods anywhere in the tree without prop drilling, while keeping scope, typing, async registration, and multi-instance support.
  image:
    src: /react-api-bridge-logo.svg
    alt: react-api-bridge
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Ryo98-SL/react-api-bridge

features:
  - title: Scoped by Boundary
    details: Keep APIs local to a React subtree instead of leaking everything into a global event bus.
  - title: Call Methods, Not Events
    details: Access typed imperative APIs directly instead of broadcasting loose payloads.
  - title: Async Ready
    details: Wait for an API to appear when the target component mounts later.
  - title: Multi Instance Friendly
    details: Register multiple providers under the same API name when your UI has repeated regions.
  - title: Parent Lookup
    details: Read the current subtree API or explicitly walk upward to a parent boundary.
  - title: Type Safe
    details: Define your API shape once and get typed access across hooks and helpers.
---

## Why It Exists

React already handles state well. The hard part is imperative coordination:

- Open a modal from somewhere deep in the tree
- Tell a tree node or wizard step to refresh itself
- Trigger a capability exposed by a plugin-like subtree
- Access an API that may not be mounted yet

Another way to frame it:

| Scenario | React's answer |
|---|---|
| Passing data down, one level | props |
| Passing data down, across levels | Context |
| Exposing actions upward, one level | useImperativeHandle |
| Exposing actions upward, across levels | **Blank (filled by react-api-bridge)** |

`react-api-bridge` treats these as scoped imperative APIs instead of event broadcasts.

## Mental Model

Think of it as:

- `ref`, but not limited to direct parent-child links
- `Context`, but for imperative capabilities instead of plain values
- a command registry, but scoped to React subtrees

## Better Than An Event Bus When

Use `react-api-bridge` when your real intent is:

- "Call this component capability"
- "Find the local provider in this subtree"
- "Reach a parent scope on purpose"
- "Wait until the provider is mounted"

Use an event bus when your real intent is:

- "Notify many listeners"
- "Broadcast an event payload"
- "Model pub/sub instead of direct capabilities"

## Quick Example

```tsx
import { useState } from 'react';
import {
  createBoundary,
  createBridge,
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
    open: setContent,
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
      <OpenButton />
    </Boundary>
  );
}
```

Continue with the [Getting Started](/guide/getting-started) guide.
