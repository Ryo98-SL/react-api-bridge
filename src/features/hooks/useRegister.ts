import {DependencyList, RefObject, useEffect, useImperativeHandle, useMemo} from "react";
import {getIsMulti, useFinalContextValue, getApiDesc, getResolverOrCreateWhenMissing} from "../../core";
import {useUniqueElementRef} from "../../utils/useUniqueElementRef";
import {tryInvoke} from "../../utils/tryInvoke";
import {OnInit, OnMultiInit} from "../../types/init";
import {BaseOptions, BridgeAPIOptions} from "../../types/options";
import {APIParams} from "../../types/api";
import {ReactAPIBridge} from "../../types/bridge";
import {appendToMappedSet} from "../../utils/mappedSet";

export function useRegister<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, name: N, init: () => A[N], deps?: DependencyList, hookOptions?: BaseOptions<A, O, P>) {

    const isMulti = getIsMulti<A, N>(name, apiBridge.bridgeOptions);
    const contextValue = useFinalContextValue<A,N, O, P>(hookOptions, apiBridge.BridgeContext);
    const {apiNList} = useMemo(() => getApiDesc(name, contextValue!.bridge, apiBridge.bridgeOptions), [name, contextValue]);

    const apiRef = useUniqueElementRef(apiNList);

    useImperativeHandle(apiRef, () => {
        return init();
    }, deps);
    useEffect(() => {
        let clearFns: any[] = [];

        const {
            bucket
        } = getResolverOrCreateWhenMissing(apiNList, contextValue, true, apiBridge.pendingResolverMap);

        bucket.initialResolver?.resolve(apiNList);
        bucket.waiters.forEach((resolver) => {
            resolver.resolve(apiNList);
        });
        bucket.waiters.clear();


        const callbacks = apiBridge.cacheInitCbMap.get(apiNList);
        callbacks?.forEach((initInfo, hookId) => {
            if (apiBridge.initializedOnInitMap.get(apiRef)?.has(hookId)) return;

            initInfo.touchedRefs.add(apiRef);
            clearFns.push(appendToMappedSet(apiBridge.initializedOnInitMap, apiRef, hookId));

            const onInit = initInfo.onInit;
            if (isMulti) {
                const _assertedOnInit = onInit as OnMultiInit<A, keyof A>;
                clearFns.push(_assertedOnInit(apiRef, apiNList as RefObject<A[keyof A]>[]))
            } else {
                const _assertedOnInit = onInit as OnInit<A, keyof A>;
                clearFns.push(_assertedOnInit(apiRef))
            }
        });

        return () => {
            clearFns.forEach(tryInvoke);
            apiBridge.initializedOnInitMap.delete(apiRef);
        }
    }, []);
}
