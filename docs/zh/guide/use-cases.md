# 使用场景

## Modal 和 Drawer 管理

把 `open()` 和 `close()` 暴露给局部 host 组件，然后在同一子树的任意位置触发。

这是 `react-api-bridge` 最典型的场景之一，因为 UI 动作本身就是命令式的，而且调用方通常离 provider 很远。

## Tree 联动

树形节点经常需要：

- 向父节点查询状态
- 通知子节点刷新
- 在不引入全局状态的前提下同步局部命令

这个库很适合这种模式，因为 Boundary 和父级查找天然契合嵌套 UI 结构。

## Wizard 或 Stepper

你可以暴露这样的动作：

- `next()`
- `prev()`
- `validate()`
- `submit()`

这样能保持编排逻辑是命令式的，而不用把每一个动作都塞进全局状态。

## 插件系统或 Slot 系统

如果 UI 的不同区域都有各自局部 provider，Boundary 可以让同名 API 在多个区域中安全共存。

这很适合做局部插件容器和重复的子应用区域。

## 延迟或懒加载 UI

有时调用方先就绪，但 provider 还没挂载。

`getBridgeAPIAsync()` 能帮你处理懒加载面板、延迟路由或条件 provider，而不需要自定义等待逻辑。

## 好的 API 命名方式

尽量用能表达“能力”的名字：

- `modal`
- `treeNode`
- `wizard`
- `drawer`
- `commandPalette`

除非真的必要，否则尽量避免 `data`、`handler`、`manager` 这类太泛的命名。
