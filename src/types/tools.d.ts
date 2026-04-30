import {BoundaryContextValue} from "./boundary.js";

import {ReactAPIBridge} from "./bridge.js";

export type ExtractContextValue<B> = B extends ReactAPIBridge<infer A> ? B extends ReactAPIBridge<A, infer P> ? BoundaryContextValue<A, P> : never : never;
export type HookId = string | symbol;
export type PayloadParameter<T> = undefined extends T ? [payload?: T] : [payload: T];