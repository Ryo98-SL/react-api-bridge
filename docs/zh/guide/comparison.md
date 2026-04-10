# 对比

## 缺口在哪里

React 对数据流已经有比较成熟的答案，但对跨层的功能流还没有对应的标准解法：

| 场景 | React 的答案 |
| --- | --- |
| 数据下传，单层 | props |
| 数据下传，跨层 | Context |
| 功能上传，单层 | useImperativeHandle |
| 功能上传，跨层 | **空白（react-api-bridge 来填补）** |

这也是这个库存在的原因：它为命令式能力提供了一条带作用域、类型安全的跨组件树通路。

## react-api-bridge vs EventEmitter

| EventEmitter | react-api-bridge |
| --- | --- |
| 广播事件 | 暴露命令式组件 API |
| 消费者接收 payload | 消费者直接调用强类型方法 |
| 通常是全局或实例级别 | 按 React Boundary 作用域解析 |
| 更适合 pub/sub | 更适合组件能力访问 |
| `emit('open')` | `modalAPI.current?.open()` |

如果你的需求是通知和广播，用事件总线更自然。

如果你的需求是直接调用组件能力，用 `react-api-bridge` 更贴切。

## react-api-bridge vs Context

Context 很适合分发值。

`react-api-bridge` 更适合这些场景：

- 共享的是一组命令式方法
- provider 和 consumer 距离很远
- 你需要局部作用域而不是一个很大的 provider value
- 你需要父级查找或异步注册

## react-api-bridge vs forwardRef

`forwardRef` 非常适合直接父子访问。

`react-api-bridge` 更适合这些情况：

- 调用方不是直接父组件
- 很多远距离组件都需要同一项能力
- 你希望 API 只在某个子树中可见
- 同一个 API key 需要多个 provider

## react-api-bridge vs 状态管理

状态管理工具主要建模共享状态和派生数据。

这个库建模的是命令式能力，比如：

- `open()`
- `focus()`
- `refresh()`
- `submit()`
- `expand()`

如果你的真实问题是状态同步，那就应该优先使用状态管理。

## 适合用它的情况

- Modal / Drawer 控制
- Tree 或嵌套视图联动
- Wizard 步骤控制
- 插件系统或 slot 系统
- 重复区域中的局部注册表

## 不太适合的情况

- 只是简单的父子 `ref`
- 一个 callback prop 就能解决
- 主要问题是共享数据流
- 你想建模整站状态
