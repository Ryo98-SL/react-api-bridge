# 核心概念

## Bridge

Bridge 是保存组件 API 的注册表。

```tsx
import { createBridge } from '@ryo-98/react-api-bridge';

interface AppAPIs {
  modal: { open: () => void };
  treeNode: { refresh: () => void };
}

const bridge = createBridge<AppAPIs>();
```

通常只需要在模块顶层创建一次。

## API 注册

`useRegister()` 用来把组件能力暴露到某个名字下面。

```tsx
useRegister(bridge, 'modal', () => ({
  open: () => setOpen(true),
  close: () => setOpen(false)
}), []);
```

这里注册的是命令式 API 对象，不是事件监听器。

## API 读取

`useAPI()` 会读取当前 Boundary 作用域中的 API。

```tsx
const modalAPI = useAPI(bridge, 'modal');
modalAPI.current?.open();
```

返回值很像 `ref`，适合直接调用方法。

## Boundary 作用域

`Boundary` 用来创建局部 API 命名空间。

```tsx
const Boundary = createBoundary(bridge);
```

有了 Boundary 以后：

- 同名 API 可以存在于不同子树
- 子组件会优先解析最近的 provider
- 不需要把所有能力都做成全局单例

## 访问父级 API

当你需要显式向上查找时，可以使用 `useUpperAPI()`。

```tsx
const parentWidget = useUpperAPI(bridge, 'widget');
parentWidget?.current?.refresh();
```

这对嵌套 Boundary 特别有用。

## Boundary Payload

Boundary 不只可以承载局部 API，也可以承载局部数据。

```tsx
const bridge = createBridge<AppAPIs, { theme: string }>({
  theme: 'light'
});

const payload = useBoundaryPayload(bridge);
```

当一个子树既有局部能力，又有局部上下文时，这会很方便。

## 异步注册

有时 consumer 已经存在，但 provider 还没挂载。`getBridgeAPIAsync()` 就是为这个场景准备的。

```tsx
const modalAPI = await getBridgeAPIAsync(bridge, 'modal');
modalAPI.current?.open();
```

这对 lazy UI、延迟挂载区域和条件渲染都很实用。

## 多实例

当同一个 API 名需要被多个组件同时注册时，设置 `isMulti: true`。

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

这时 `useAPI()` 返回的是一组 refs。

## onInit

你也可以用 `onInit` 在 API 首次可用时执行逻辑。

```tsx
const modalAPI = useAPI(bridge, 'modal', {
  onInit: (apiRef) => {
    apiRef.current?.open();
  }
});
```

这很适合做 provider 就绪后的初始化流程。
