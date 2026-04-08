---
layout: home

hero:
  name: React API Bridge
  text: React 的作用域命令式 API 桥
  tagline: 无需 prop drilling，就能在组件树中暴露和调用组件方法，并保留作用域隔离、类型提示、异步注册和多实例能力。
  image:
    src: /react-api-bridge-logo.svg
    alt: react-api-bridge
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/Ryo98-SL/react-api-bridge

features:
  - title: Boundary 作用域
    details: API 按 React 子树隔离，不必把所有能力都暴露成一个全局事件总线。
  - title: 调方法而不是发事件
    details: 拿到的是强类型命令式 API，而不是松散的事件 payload。
  - title: 支持异步等待
    details: 目标组件稍后挂载也没关系，可以直接等待 API 出现。
  - title: 支持多实例
    details: 同一个 API 名可以同时由多个组件提供，适合重复区域和插件化场景。
  - title: 支持父级查找
    details: 既可以读当前子树 API，也可以显式向上查找父级 Boundary。
  - title: TypeScript 友好
    details: 一次定义 API 形状，后续在 hooks 和辅助方法中保持完整类型提示。
---

## 为什么需要它

React 很擅长管理状态，但命令式组件协作经常会变得很别扭：

- 你想在很远的组件里打开一个 Modal
- 你想让某个树节点或步骤组件主动刷新
- 你想触发某个局部子树暴露出来的能力
- 你想在 provider 挂载前就先发起调用

`react-api-bridge` 把这类问题建模为“作用域命令式 API”，而不是“广播事件”。

## 可以怎么理解

你可以把它理解成：

- 可以跨组件树使用的 `ref`
- 面向“能力”而不是普通值的 `Context`
- 一个按 React 子树作用域解析的命令注册表

## 什么时候比事件总线更合适

当你的真实需求是下面这些时，更适合用 `react-api-bridge`：

- “调用这个组件暴露出来的能力”
- “在当前子树里找到离我最近的 provider”
- “有意识地访问父级作用域”
- “等 provider 挂载后再调用”

如果你的真实需求是下面这些，事件总线更合适：

- “通知很多监听者”
- “广播一条事件消息”
- “做标准的 pub/sub”

## 快速示例

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

继续阅读 [快速开始](/zh/guide/getting-started)。
