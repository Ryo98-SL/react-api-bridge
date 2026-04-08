# Comparison

## react-api-bridge vs EventEmitter

| EventEmitter | react-api-bridge |
| --- | --- |
| Broadcasts events | Exposes imperative component APIs |
| Consumers receive payloads | Consumers call typed methods |
| Usually global by instance | Scoped by React boundaries |
| Best for pub/sub | Best for component capability access |
| `emit('open')` | `modalAPI.current?.open()` |

Use an event emitter when you want notifications.

Use `react-api-bridge` when you want direct component capabilities.

## react-api-bridge vs Context

Context is excellent for distributing values.

`react-api-bridge` is better when:

- the shared thing is an imperative method set
- the provider and consumer are far apart
- you need local scope instead of one broad provider value
- you want parent lookup or async registration

## react-api-bridge vs forwardRef

`forwardRef` is perfect for direct parent-child access.

`react-api-bridge` helps when:

- the caller is not the direct parent
- many distant components need the same capability
- you want subtree-local APIs
- you need multiple providers under the same API key

## react-api-bridge vs State Managers

State managers model shared state and derived data.

This library models imperative capabilities such as:

- `open()`
- `focus()`
- `refresh()`
- `submit()`
- `expand()`

If your real problem is state synchronization, use a state manager instead.

## When This Library Is A Good Fit

- Modal and drawer control
- Tree or nested view coordination
- Wizard step actions
- Plugin or slot systems
- Local registries inside repeated UI regions

## When It Is Not

- Plain parent-child ref access
- Simple callback props
- Shared data flow with little imperative behavior
- Broad application state modeling
