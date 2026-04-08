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

## 加上 Boundary

Boundary 会创建局部 API 作用域，这也是它比普通 `ref` 更有价值的地方。

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
