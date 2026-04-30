import {ApiNList, APIParams} from "./api.js";
import {RefObject} from "react";
import {HookId} from "./tools.js";
import {BridgeAPIOptions} from "./options.js";
import {BoundaryContextValue} from "./boundary.js";
import {BridgeResolver} from "./bridge.js";

export type InitializedOnInitMap<A extends APIParams> = Map<RefObject<A[keyof A]>, Set<HookId>>;

export interface CachedInitCallback<A extends APIParams> {
    onInit: Function;
    touchedRefs: Set<RefObject<A[keyof A]>>;
}

export type CacheInitCbMap<A extends APIParams> = WeakMap<ApiNList<A, BridgeAPIOptions<A>, keyof A>, Map<HookId, CachedInitCallback<A>>>;

export interface PendingResolverBucket<A extends APIParams, O extends BridgeAPIOptions<A>, N extends keyof A> {
    initialResolver?: BridgeResolver<A, O, N>;
    waiters: Set<BridgeResolver<A, O, N>>;
}

export type PendingResolverMap<A extends APIParams, O extends BridgeAPIOptions<A>, P = any> = Map<ApiNList<A, O, keyof A>, Map<BoundaryContextValue<A, P, O>, PendingResolverBucket<A, O, keyof A>>>;
