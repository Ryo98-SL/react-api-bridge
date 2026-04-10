# Why

React already has strong answers for data flow, but not for cross-level action flow:

| Scenario | React's answer |
| --- | --- |
| Passing data down, one level | props |
| Passing data down, across levels | Context |
| Exposing actions upward, one level | useImperativeHandle |
| Exposing actions upward, across levels | **Blank (filled by react-api-bridge)** |

This is the gap `react-api-bridge` tries to close.

## A Real Case

Imagine three nested components:

- `Page`
- `FormSection`
- `SearchInput`

`SearchInput` exposes imperative methods like `focus()` and `clear()` with `useImperativeHandle()`.

The problem: `Page` wants to call those methods, but `SearchInput` is buried under `FormSection`.

## Without react-api-bridge

To make that work, the middle layer has to participate in ref plumbing even though it does not own the capability.

```tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

type SearchInputAPI = {
  focus: () => void;
  clear: () => void;
};

const SearchInput = forwardRef<SearchInputAPI>(function SearchInput(_, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = '';
    }
  }), []);

  return <input ref={inputRef} placeholder="Search..." />;
});

const FormSection = forwardRef<SearchInputAPI>(function FormSection(_, ref) {
  return <SearchInput ref={ref} />;
});

export default function Page() {
  const searchInputRef = useRef<SearchInputAPI | null>(null);

  return (
    <>
      <button onClick={() => searchInputRef.current?.focus()}>
        Focus inner input
      </button>
      <button onClick={() => searchInputRef.current?.clear()}>
        Clear inner input
      </button>

      <FormSection ref={searchInputRef} />
    </>
  );
}
```

The pain points are:

- `FormSection` must be rewritten just to pass a ref through
- every extra layer means more `forwardRef` or `ref` plumbing
- the real intent is "call this capability", but the code becomes "thread this ref through the tree"
- when the tree changes during refactoring, you often have to revisit multiple files and remove or repair old ref-forwarding code
- this coupling also makes compound component style APIs more awkward, because intermediate structure starts to matter too much

You may argue this preserves a strict and explicit ownership path. In practice, that trade-off often fits data and state better than imperative APIs. A forwarded ref is not shared state, and the maintenance cost can easily outweigh the architectural neatness.

In React 19, `ref` becomes a normal prop, so some ceremony improves. But the ref still has to travel through every intermediate component, and refactoring the tree can still leave cleanup work behind.

## With react-api-bridge

With `react-api-bridge`, the inner component registers its capability once, and the outer component reads it directly from the local boundary scope.

```tsx
import { useRef } from 'react';
import {
  createBoundary,
  createBridge,
  useAPI,
  useRegister
} from '@ryo-98/react-api-bridge';

interface AppAPIs {
  searchInput: {
    focus: () => void;
    clear: () => void;
  };
}

const bridge = createBridge<AppAPIs>();
const Boundary = createBoundary(bridge);

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useRegister(bridge, 'searchInput', () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = '';
    }
  }), []);

  return <input ref={inputRef} placeholder="Search..." />;
}

function FormSection() {
  return <SearchInput />;
}

function Toolbar() {
  const searchInputAPI = useAPI(bridge, 'searchInput');

  return (
    <>
      <button onClick={() => searchInputAPI.current?.focus()}>
        Focus inner input
      </button>
      <button onClick={() => searchInputAPI.current?.clear()}>
        Clear inner input
      </button>
    </>
  );
}

export default function Page() {
  return (
    <Boundary>
      <Toolbar />
      <FormSection />
    </Boundary>
  );
}
```

What gets better:

- `FormSection` stays a plain `() => {}` component
- the API shape is declared once and stays type-safe
- the caller asks for a capability instead of manually tunneling a ref
- deeper trees do not require more wrapper ceremony
- refactoring intermediate layers does not force you to chase ref wiring across unrelated files
- the approach is friendlier to compound component patterns, because the capability is resolved by scope instead of fragile structural forwarding

## The Core Idea

`react-api-bridge` does not replace `ref` or `useImperativeHandle`.

It removes the repetitive wiring required when that imperative capability must cross component boundaries on purpose.
