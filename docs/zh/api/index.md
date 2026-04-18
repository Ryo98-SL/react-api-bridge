# API 参考

## 概览

这个库的公开 API 分成四部分：

- Bridge 创建：定义注册表、payload 和每个 key 的行为。
- Components：创建带作用域的 Boundary provider。
- Hooks：在 React 组件内注册、读取和向上查找 API。
- Methods：在 React 组件外读取 API，或者等待 API 稍后注册。

大多数场景先掌握这条主路径就够了：

1. `createBridge()`
2. `createBoundary()`
3. `useRegister()`
4. `useAPI()`

## 通用 Options 类型

### `APIOptions`

```ts
type APIOptions = {
  isMulti?: boolean;
}
```

- `isMulti`：允许同一个 API key 同时保留多个活跃 provider。

### `BridgeAPIOptions<APIs>`

```ts
type BridgeAPIOptions<APIs> = Partial<Record<keyof APIs, APIOptions>>;
```

- 用来配置每个 API key 的行为。
- 传给 `createBridge(...)` 返回出来的第二层函数。

### `BaseOptions<APIs, Options, Payload>`

```ts
type BaseOptions<APIs, Options, Payload> = {
  contextValue?: BoundaryContextValue<APIs, Payload, Options>;
}
```

- `contextValue`：覆盖当前 Boundary 作用域，显式指定另一个 boundary context。

### `GetAPIOptions<APIs, Name, Options, Payload>`

```ts
type GetAPIOptions<APIs, Name, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    onInit?: ResolveInit<APIs, Options, Name>;
  };
```

- `contextValue`：从指定的 Boundary 作用域读取。
- `onInit`：当解析出的 API 可用时执行。

### `UpperOptions<APIs, Options, Payload>`

```ts
type UpperOptions<APIs, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    shouldForwardYield?: (boundaryDetail) => any;
  };
```

- `contextValue`：指定向上查找时的起点 Boundary。
- `shouldForwardYield`：控制最终选中哪一层上级 Boundary。
  它会收到：
  - `payload`：当前候选 Boundary 的 payload。
  - `parent`：再往上的父级 Boundary。
  - `allAPI`：这个候选 Boundary 当前注册的全部 API。

### `GetUpperAPIOptions<APIs, Name, Options, Payload>`

- 它组合了 `GetAPIOptions` 和 `UpperOptions`。
- 同时支持 `contextValue`、`onInit` 和 `shouldForwardYield`。

### `GetAPIAsyncOptions<APIs, Options, Payload>`

```ts
type GetAPIAsyncOptions<APIs, Options, Payload> =
  BaseOptions<APIs, Options, Payload> & {
    initial?: boolean;
  };
```

- `contextValue`：在指定 Boundary 作用域里等待。
- `initial`：默认是 `true`，会复用这个作用域里的初始 waiter；设成 `false` 时，则等待后续一次新的注册。

## Bridge 创建

### `createBridge<APIs, PayloadType>(globalPayload?)(options?)`

创建一个 bridge 实例。

调用方式：

- `createBridge<APIs, PayloadType>(globalPayload?)`：先创建 bridge，并可选地定义全局 payload。
- `(...)(options?)`：再可选地配置每个 API key 的行为，比如 `isMulti: true`。

第一次调用的参数：

- `globalPayload`：可选的全局 payload。在没有 Boundary 时挂在全局作用域上。

第二次调用的参数：

- `options`：可选的 `BridgeAPIOptions<APIs>`，比如给某个 key 配置 `isMulti: true`。

示例：

```ts
const bridge = createBridge<{
  notification: {
    id: string;
    show: (message: string) => void;
  };
}>()({
  notification: { isMulti: true }
});
```

返回值：

- 一个 bridge 对象，后续所有 hook、method 和 Boundary 都围绕它工作。

## Components

### `createBoundary(bridge)`

创建一个用于作用域 API 访问的 Boundary 组件工厂。

参数：

- `bridge`：由 `createBridge(...)` 创建的 bridge。

Boundary props：

- `payload`：挂在这个 Boundary 作用域上的 payload。
- `contextValue`：由 `useBoundaryContext(...)` 创建的现成 Boundary context value。

Boundary ref 的值：

- `payload`：当前 Boundary 的 payload。
- `parent`：父级 Boundary context，如果存在的话。
- `getAPI(name)`：从这个 Boundary 作用域里读取某个 API。

## Hooks

### `useRegister(bridge, name, factory, deps?, options?)`

把组件 API 注册到 `name` 下面。

Options 类型：

- `BaseOptions`

参数：

- `bridge`：目标 bridge。
- `name`：要注册的 API key。
- `factory`：返回这个组件要暴露出去的命令式 API 对象或函数。
- `deps`：传给 `useImperativeHandle` 的依赖数组。变化时会重建 API。
- `options`：可选的 `BaseOptions`。
  - `contextValue`：把注册显式放进指定的 Boundary 作用域。

### `useAPI(bridge, name, options?)`

读取当前 Boundary 作用域里的 API。

Options 类型：

- `GetAPIOptions`

参数：

- `bridge`：目标 bridge。
- `name`：要读取的 API key。
- `options`：可选的 `GetAPIOptions`。
  - `contextValue`：从指定 Boundary 作用域读取。
  - `onInit`：当 API 可用时执行。

### `useUpperAPI(bridge, name, options?)`

从上层 Boundary 读取匹配的 API。

Options 类型：

- `GetUpperAPIOptions`

参数：

- `bridge`：目标 bridge。
- `name`：要读取的 API key。
- `options`：可选的 `GetUpperAPIOptions`。
  - `contextValue`：指定向上查找的起点。
  - `onInit`：当找到并初始化目标 API 时执行。
  - `shouldForwardYield`：控制向上查找继续到哪一层。

### `useBoundaryPayload(bridge, options?)`

读取当前 Boundary 挂载的 payload。

Options 类型：

- `BaseOptions`

参数：

- `bridge`：目标 bridge。
- `options`：可选的 `BaseOptions`。
  - `contextValue`：从指定 Boundary context 读取 payload。

### `useUpperBoundaryPayload(bridge, options?)`

读取上层 Boundary 的 payload。

Options 类型：

- `UpperOptions`

参数：

- `bridge`：目标 bridge。
- `options`：可选的 `UpperOptions`。
  - `contextValue`：指定向上查找的起点。
  - `shouldForwardYield`：控制最终选中哪一层上级 Boundary。

### `useBoundaryContext(bridge, payload?)`

创建一个可复用的 Boundary context value。

参数：

- `bridge`：目标 bridge。
- `payload`：这个新的 Boundary context 要携带的 payload。

返回值：

- 一个 `BoundaryContextValue` 对象，可以传给 `<Boundary contextValue={...} />`，或者其他接受 `contextValue` 的 API。

### `useBoundaryRef(bridge)`

创建一个用于访问 Boundary 实例的 ref。

参数：

- `bridge`：目标 bridge。

返回值：

- 一个 React ref，它的 `.current` 会暴露 `payload`、`parent` 和 `getAPI(name)`。

### `useTools(bridge, options?)`

返回一组适合在组件内使用的辅助方法。

Options 类型：

- `BaseOptions`

参数：

- `bridge`：目标 bridge。
- `options`：可选的 `BaseOptions`。
  - `contextValue`：给返回的所有 helper 指定默认作用域。

返回的 helper：

- `getAPI(name, options?)`：和 `getBridgeAPI` 类似，但默认基于当前组件上下文。
- `getBoundaryPayload(options?)`：读取 Boundary payload。
- `getUpperAPI(name, options?)`：从上层 Boundary 读取 API。
- `getUpperBoundaryPayload(options?)`：从上层 Boundary 读取 payload。
- `getAPIAsync(name, options?)`：和 `getBridgeAPIAsync` 类似，但默认基于当前组件上下文。

## Methods

### `getBridgeAPI(bridge, name, options?)`

在组件外获取 API。默认从全局作用域读取。

Options 类型：

- `BaseOptions`

参数：

- `bridge`：目标 bridge。
- `name`：要读取的 API key。
- `options`：可选的 `BaseOptions`。
  - `contextValue`：从指定 Boundary 作用域读取，而不是从全局作用域读取。

### `getBridgeAPIAsync(bridge, name, options?)`

等待某个 API 被注册，并以 Promise 形式返回。

Options 类型：

- `GetAPIAsyncOptions`

参数：

- `bridge`：目标 bridge。
- `name`：要等待的 API key。
- `options`：可选的 `GetAPIAsyncOptions`。
  - `contextValue`：在指定 Boundary 作用域里等待。
  - `initial`：默认复用初始 waiter；设为 `false` 时，会等待后续一次新的注册。

## 说明

- 大多数使用者从 `createBridge`、`createBoundary`、`useRegister`、`useAPI` 开始就够了
- 需要更复杂的编排时，再使用 `useUpperAPI` 和 `getBridgeAPIAsync`
- 当一个 API key 需要多个活跃 provider 时，使用 `isMulti: true`
- 只有在你需要局部作用域隔离时再加 Boundary；否则 API 默认都解析到共享的全局作用域
