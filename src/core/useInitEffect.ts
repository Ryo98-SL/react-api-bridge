import {useHookId} from "../utils/useHookId";
import {useEffect, useRef} from "react";
import {mountHookInitEffect} from "./mountHookInitEffect";
import {BoundaryContextValue} from "../types/boundary";
import {ResolveInit} from "../types/init";
import {BridgeAPIOptions} from "../types/options";
import {APIParams, ResolveAPI} from "../types/api";
import {CacheInitCbMap, CachedInitCallback, InitializedOnInitMap} from "../types/maps";
import {RefObject} from "react";
import {removeFromMappedSet} from "../utils/mappedSet";


export function useInitEffect<
    A extends APIParams,
    N extends keyof A,
    O extends BridgeAPIOptions<A>,
    P,
    ANL extends ResolveAPI<A, O, N>
>(
    onInit: ResolveInit<A, O, N> | undefined,
    name: N,
    apiNList: ANL,
    contextValue: BoundaryContextValue<A, P, O>,
    cacheInitCbMap: CacheInitCbMap<A>,
    bridgeOptions: O | undefined,
    initializedOnInitMap: InitializedOnInitMap<A>,
) {
    const hookId = useHookId();
    const callbackInfoRef = useRef<CachedInitCallback<A> | undefined>(undefined);

    useEffect(() => {
        if (!onInit) return;
        let cacheCbs = cacheInitCbMap.get(apiNList);
        if (!cacheCbs) {
            cacheCbs = new Map();
            cacheInitCbMap.set(apiNList, cacheCbs);
        }

        const callbackInfo: CachedInitCallback<A> = {
            onInit,
            touchedRefs: new Set<RefObject<A[keyof A]>>()
        };
        callbackInfoRef.current = callbackInfo;
        cacheCbs.set(hookId, callbackInfo);

        const clearInitEffect = mountHookInitEffect(name, onInit, apiNList, hookId, bridgeOptions, initializedOnInitMap, callbackInfo.touchedRefs);

        return () => {
            cacheCbs.delete(hookId);
            if (cacheCbs.size === 0) {
                cacheInitCbMap.delete(apiNList);
            }
            clearInitEffect?.()
            callbackInfo.touchedRefs.forEach((apiRef) => {
                removeFromMappedSet(initializedOnInitMap, apiRef, hookId);
            });
            callbackInfo.touchedRefs.clear();
            callbackInfoRef.current = undefined;
        };
    }, []);

    // update onInit callback
    useEffect(() => {
        if (!onInit || !callbackInfoRef.current) return;
        callbackInfoRef.current.onInit = onInit;
    }, [onInit]);
}


