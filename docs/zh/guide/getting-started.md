# 快速开始

## 安装

```bash
npm install @ryo-98/react-api-bridge
```

## 创建第一个 Bridge

先定义你的命令式 API，再创建 bridge。

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

## 注册 API

在真正拥有这项能力的组件里调用 `useRegister()`。

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

## 读取 API

在同一个 Boundary 作用域内，任何位置都可以通过 `useAPI()` 读取。

```tsx
import { useAPI } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export function OpenModalButton() {
  const modalAPI = useAPI(bridge, 'modal');

  return (
    <button onClick={() => modalAPI.current?.open('从远处打开')}>
      打开弹窗
    </button>
  );
}
```

到这里，你其实已经掌握了这个库的大多数常见用法。后面这些内容主要是在补充边界场景：如果同一个 API key 被多个 `useRegister()` 同时注册，默认会互相覆盖，最后一次更新的 `useRegister()` 会胜出；如果你希望它们不要互相覆盖，而是同时保留多个实例，可以继续看后面的「多实例」部分。

## 加上 Boundary

大多数情况下，你其实不需要 Boundary。不加 Boundary 时，所有 API 都会注册到共享的全局作用域里；只有当你需要局部作用域隔离、避免不同子树里的 API 彼此覆盖时，再加上 Boundary。Boundary 会创建局部 API 作用域，这也是它比普通 `ref` 更有价值的地方。

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

## 在组件外访问 API

在 React 组件外，可以使用 `getBridgeAPI()`。

```tsx
import { getBridgeAPI } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export function openGlobalModal() {
  const modalAPI = getBridgeAPI(bridge, 'modal');
  modalAPI.current?.open('在 React 外触发');
}
```

## 等待稍后挂载的 API

如果目标组件还没出现，可以用 `getBridgeAPIAsync()`。

```tsx
import { getBridgeAPIAsync } from '@ryo-98/react-api-bridge';
import { bridge } from './bridge';

export async function openLater() {
  const modalAPI = await getBridgeAPIAsync(bridge, 'modal');
  modalAPI.current?.open('挂载后打开');
}
```

## 多实例

如果同一个 API key 会被多个组件同时注册，默认行为是互相覆盖，最后一次更新的 `useRegister()` 会胜出。

当你希望它们并存，而不是互相覆盖时，可以在创建 bridge 时把这个 key 标记为 `isMulti: true`。

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

这时 `useAPI()` 读取到的就不再是单个 ref，而是一组 refs。这样你就可以自己决定遍历、过滤，或者挑选其中某一个实例来调用。
