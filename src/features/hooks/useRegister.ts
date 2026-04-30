import {DependencyList, MutableRefObject, RefObject, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef} from "react";
import {getIsMulti, useFinalContextValue, getApiDesc, getResolverOrCreateWhenMissing} from "../../core/index.js";
import {useUniqueElementRef} from "../../utils/useUniqueElementRef.js";
import {useHookId} from "../../utils/useHookId.js";
import {tryInvoke} from "../../utils/tryInvoke.js";
import {OnInit, OnMultiInit} from "../../types/init.js";
import {BaseOptions, BridgeAPIOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";
import {appendToMappedSet} from "../../utils/mappedSet.js";

export function useRegister<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, name: N, init: () => A[N], deps?: DependencyList, hookOptions?: BaseOptions<A, O, P>) {

    const isMulti = getIsMulti<A, N>(name, apiBridge.bridgeOptions);
    const contextValue = useFinalContextValue<A,N, O, P>(hookOptions, apiBridge.BridgeContext);
    const {apiNList} = useMemo(() => getApiDesc(name, contextValue!.bridge, apiBridge.bridgeOptions), [name, contextValue]);

    const apiRef = useUniqueElementRef(apiNList);

    // Stable per-component-instance id used as the "owner id" in non-multi mode.
    const hookId = useHookId();

    // Private ref used by `useImperativeHandle` in non-multi mode so that a
    // later useRegister cannot silently overwrite the shared single ref of the
    // first registered component. It is unused (but harmless) in multi mode -
    // multi mode keeps writing to `apiRef`, which is a unique ref already
    // pushed into the shared `apiNList` array.
    const localApiRef = useRef<A[N]>(null);

    // Tracks whether THIS hook instance currently owns the field (non-multi).
    const isOwnerRef = useRef(false);

    // Avoid spamming console.warn on every re-render / StrictMode double-invoke.
    const hasWarnedRef = useRef(false);

    useImperativeHandle((isMulti ? apiRef : localApiRef) as RefObject<A[N]>, () => {
        return init();
    }, deps);

    // Ownership claim & release - runs only on mount / unmount (non-multi mode).
    //
    // The first useRegister to mount for a given (boundary, name) becomes the
    // owner and its hookId is recorded on the bridge entry. Subsequent
    // useRegister calls with a different hookId will NOT overwrite the API and
    // will print a console.warn. When the owning component unmounts, ownership
    // is released and the shared ref is cleared.
    useLayoutEffect(() => {
        if (isMulti) return;

        const entry = contextValue!.bridge[name];
        if (!entry) return;

        if (entry.ownerId === undefined || entry.ownerId === hookId) {
            entry.ownerId = hookId;
            isOwnerRef.current = true;
        } else {
            isOwnerRef.current = false;
            if (!hasWarnedRef.current) {
                hasWarnedRef.current = true;
                // eslint-disable-next-line no-console
                console.warn(
                    `[react-api-bridge] useRegister: the API "${String(name)}" is already registered by another component ` +
                    `(only the first registered component can provide it in non-multi mode). The new registration is ignored ` +
                    `to avoid overriding the existing API. If multiple registrations on the same field are intended, ` +
                    `enable "isMulti: true" in the bridge options for this field.`
                );
            }
        }

        return () => {
            if (isOwnerRef.current) {
                if (entry.ownerId === hookId) {
                    entry.ownerId = undefined;
                }
                (apiNList as MutableRefObject<A[N] | null>).current = null;
                isOwnerRef.current = false;
            }
        };
    }, []);

    // Per-render sync from the private ref to the shared single ref - only the
    // owner writes through. This effect intentionally has no cleanup so that
    // re-rendering the owner does not transiently null out the shared ref.
    useLayoutEffect(() => {
        if (isMulti) return;
        if (isOwnerRef.current) {
            (apiNList as MutableRefObject<A[N] | null>).current = localApiRef.current;
        }
    });

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
