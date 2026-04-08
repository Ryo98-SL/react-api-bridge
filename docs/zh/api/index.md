# API 参考

## Bridge 创建

### `createBridge<APIs, PayloadType>(globalPayload?, options?)`

创建一个 bridge 实例。

你可以在这里定义：

- API 名称
- API 结构
- 可选的全局 payload
- 可选的 API 配置，比如多实例行为

## Hooks

### `useRegister(bridge, name, factory, deps, options?)`

把组件 API 注册到 `name` 下面。

### `useAPI(bridge, name, options?)`

读取当前 Boundary 作用域里的 API。

### `useUpperAPI(bridge, name, options?)`

从上层 Boundary 读取匹配的 API。

### `useBoundaryPayload(bridge, options?)`

读取当前 Boundary 挂载的 payload。

### `useUpperBoundaryPayload(bridge, options?)`

读取上层 Boundary 的 payload。

### `useBoundaryContext(bridge, payload?)`

创建一个可复用的 Boundary context value。

### `useTools(bridge, options?)`

返回一组适合在组件内使用的辅助方法。

## Methods

### `getBridgeAPI(bridge, name, options?)`

在组件外获取 API。默认从全局作用域读取。

### `getBridgeAPIAsync(bridge, name, options?)`

等待某个 API 被注册，并以 Promise 形式返回。

## Components

### `createBoundary(bridge)`

创建一个用于作用域 API 访问的 Boundary 组件工厂。

## 说明

- 大多数使用者从 `createBridge`、`createBoundary`、`useRegister`、`useAPI` 开始就够了
- 需要更复杂的编排时，再使用 `useUpperAPI` 和 `getBridgeAPIAsync`
- 当一个 API key 需要多个活跃 provider 时，使用 `isMulti: true`
