# react-api-bridge

> **语言版本**: [English](./README.md) | [简体中文](#)

<p align="center">
  <img src="https://raw.githubusercontent.com/Ryo98-SL/react-api-bridge/master/logo/react-api-bridge-logo.png" alt="react-api-bridge logo" width="200">
</p>

React 的作用域命令式 API 桥。

`react-api-bridge` 可以让你在 React 子树中跨组件暴露和调用方法，而不需要层层传递 props。它本质上是一个带作用域的 API 注册表，不是事件总线。

## 文档

- English: https://ryo98-sl.github.io/react-awesome-api-bridge/
- 简体中文: https://ryo98-sl.github.io/react-awesome-api-bridge/zh/

## 安装

```bash
npm install @ryo-98/react-api-bridge
```

## 适合解决的问题

- 用 `Boundary` 做 API 作用域隔离
- 直接调用强类型组件方法，而不是广播事件
- 支持获取当前或父级作用域 API
- 支持异步等待稍后挂载的 API
- 支持同名 API 的多实例注册

## 快速示例

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
      打开弹窗
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

## API 一览

- `createBridge()`
- `createBoundary()`
- `useRegister()`
- `useAPI()`
- `useUpperAPI()`
- `getBridgeAPI()`
- `getBridgeAPIAsync()`

## 典型场景

- Modal、Drawer、Toast 控制器
- Wizard、Tree 等复杂组件联动
- 局部插件系统 API
- 不适合抽成全局状态的命令式动作

## 许可证

MIT
