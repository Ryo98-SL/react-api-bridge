# 为什么需要它

React 对数据流已经有比较成熟的方案，但对跨层的功能流还没有对应的标准解法：

| 场景      | React 的答案                    |
| ------- | ---------------------------- |
| 数据下传，单层 | props                        |
| 数据下传，跨层 | Context                      |
| 功能上传，单层 | useImperativeHandle          |
| 功能上传，跨层 | **空白（react-api-bridge 来填补）** |

`react-api-bridge` 试图补上的，就是这块缺口。

## 一个真实场景

假设有三个层层嵌套的组件：

- `Page`
- `FormSection`
- `SearchInput`

其中 `SearchInput` 通过 `useImperativeHandle()` 暴露了 `focus()` 和 `clear()` 这样的命令式方法。

问题在于：`Page` 想调用这些方法，但 `SearchInput` 被包在 `FormSection` 里面。

## 不使用 react-api-bridge

为了让最外层调到最内层，中间层即使根本不拥有这项能力，也得参与 ref 传递。

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
        聚焦最内层输入框
      </button>
      <button onClick={() => searchInputRef.current?.clear()}>
        清空最内层输入框
      </button>

      <FormSection ref={searchInputRef} />
    </>
  );
}
```

这种写法的问题在于：

- `FormSection` 明明只是中间层，却要为了传 ref 被改写
- 每多一层嵌套，就多一层 `forwardRef` 或 `ref` 传递
- 你的真实需求是“调用这个能力”，代码却变成了“把 ref 一层层穿过去”
- 一旦中间层和最内层的层级关系在迭代中发生变化，往往还要回头去不同文件里清理、修补那些分散的 ref 转发代码
- 这种结构耦合也不利于实现 Compound Component 模式，因为中间层结构会被迫参与能力转发

你可能会说，这样做保证了更严格、更显式的单向来源关系。但在实际开发里，这个原则往往更适合数据和状态，不太适合命令式 API。`forwardRef` 传递的并不是数据或状态，而是能力引用；很多时候，这份维护成本远大于它带来的结构“整洁感”。

到了 React 19，`ref` 会变成普通 prop，确实能少写一点 `forwardRef` 仪式代码。但 ref 仍然需要穿过每一层中间组件，组件树重构时也依然要处理遗留下来的转发链。

## 使用 react-api-bridge

有了 `react-api-bridge`，最内层组件只需要注册一次能力，最外层组件就可以在当前 Boundary 作用域里直接读取它。

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
        聚焦最内层输入框
      </button>
      <button onClick={() => searchInputAPI.current?.clear()}>
        清空最内层输入框
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

这样带来的好处是：

- `FormSection` 可以继续保持最普通的 `() => {}` 组件写法
- API 形状只声明一次，整个调用链都保持类型安全
- 调用方表达的是“我要这个能力”，而不是“我得把 ref 一路传下去”
- 组件树再深，也不会持续增加包装和转发的样板代码
- 中间层重构时，不需要回头追着清理分散在不同文件里的 ref 绑定代码
- 对 Compound Component （复合组件）模式也更友好，因为能力解析依赖作用域，而不是脆弱的结构转发链

## 核心区别

`react-api-bridge` 不是要替代 `ref` 或 `useImperativeHandle`。

它解决的是另一类问题：当命令式能力需要有意识地跨过多个组件边界时，如何避免重复、乏味、容易出错的中间层传递。
