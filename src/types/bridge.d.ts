import {ApiNList, APIParams, ResolveAPI} from "./api.js";
import {BridgeAPIOptions} from "./options.js";
import {BoundaryContextValue} from "./boundary.js";
import React from "react";
import {CacheInitCbMap, InitializedOnInitMap, PendingResolverMap} from "./maps.js";
import {HookId} from "./tools.js";

export type BridgeRegistry<A extends APIParams, O extends BridgeAPIOptions<A> = BridgeAPIOptions<A>> = {
    [N in keyof A]?: {
        options?: O[N],
        apiNList?: ResolveAPI<A, O, N>,
        /**
         * The hook id of the first useRegister that took ownership of this field
         * when it is in non-multi mode. Used to prevent later useRegister hooks
         * from silently overriding the API of an existing owner.
         */
        ownerId?: HookId,
    }
}

export interface BridgeResolver<A extends APIParams, O extends BridgeAPIOptions<A>, N extends keyof A> {
    initial: boolean;
    promise: Promise<ApiNList<A, O, N>>;
    resolve: (apiNList: ApiNList<A, O, N>) => void;
}

export interface ReactAPIBridge<A extends APIParams, P = any, O extends BridgeAPIOptions<A>> {
    globalContextValue: BoundaryContextValue<A, P, O>,
    BridgeContext: React.Context<BoundaryContextValue<A, P, O>>,
    cacheInitCbMap: CacheInitCbMap<A>,
    initializedOnInitMap: InitializedOnInitMap<A>,
    bridgeOptions: O | undefined,
    pendingResolverMap: PendingResolverMap<A, O, P>
}