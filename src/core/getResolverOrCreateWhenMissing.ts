import {BoundaryContextValue} from "../types/boundary.js";
import {BridgeAPIOptions} from "../types/options.js";
import {ApiNList, APIParams} from "../types/api.js";
import {BridgeResolver} from "../types/bridge.js";
import {PendingResolverBucket, PendingResolverMap} from "../types/maps.js";

export function getResolverOrCreateWhenMissing<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
(apiNList: ApiNList<A, O, N>, contextValue: BoundaryContextValue<A, P, O>, initial: boolean, pendingResolverMap: PendingResolverMap<A, O, P>) {
    let contextValueMap = pendingResolverMap.get(apiNList) as Map<BoundaryContextValue<A, P, O>, PendingResolverBucket<A, O, N>> | undefined;

    if (!contextValueMap) {
        contextValueMap = new Map<BoundaryContextValue<A, P, O>, PendingResolverBucket<A, O, N>>();
        pendingResolverMap.set(apiNList, contextValueMap as unknown as Map<BoundaryContextValue<A, P, O>, PendingResolverBucket<A, O, keyof A>>);
    }

    let bucket = contextValueMap.get(contextValue);

    if (!bucket) {
        bucket = {
            waiters: new Set<BridgeResolver<A, O, N>>()
        };
        contextValueMap.set(contextValue, bucket);
    }

    let resolver = initial ? bucket.initialResolver : undefined;

    if (!resolver) {
        let outerResolve: (_apiNList: typeof apiNList) => void;
        const newPromise = new Promise<typeof apiNList>(resolve => {
            outerResolve = resolve;
        });

        resolver = {
            initial,
            promise: newPromise,
            resolve: outerResolve!
        }

        if (initial) {
            bucket.initialResolver = resolver;
        } else {
            bucket.waiters.add(resolver);
        }
    }


    return {
        resolver,
        contextValueMap,
        bucket,
    };
}
