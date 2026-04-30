import {getIsMulti} from "./getIsMulti.js";
import {RefObject} from "react";
import {tryInvoke} from "../utils/tryInvoke.js";
import {OnInit, OnMultiInit, ResolveInit} from "../types/init.js";
import {BridgeAPIOptions} from "../types/options.js";
import {APIParams, ResolveAPI} from "../types/api.js";
import {InitializedOnInitMap} from "../types/maps.js";
import {HookId} from "../types/tools.js";
import {appendToMappedSet} from "../utils/mappedSet.js";

export function mountHookInitEffect<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, ANL extends ResolveAPI<A, O, N>>
(name: N, onInit: ResolveInit<A, O, N> | undefined, apiNList: ANL, hookId: HookId, bridgeOptions: O | undefined, initializedOnInitMap: InitializedOnInitMap<A>, touchedRefs: Set<RefObject<A[keyof A]>>) {
    if (!onInit) return;
    const isMulti = getIsMulti<A, N>(name, bridgeOptions) ?? false;
    const involvedApiList: RefObject<A[N]>[] = [];

    let deferFn: (() => void) | undefined;
    if (apiNList && !isMulti) {
        const _assertedApi = apiNList as RefObject<A[N]>;
        //Currently, no api exist, no need to call onInit
        if (!_assertedApi.current) return;
        const _assertedOnInit = onInit as OnInit<A, N>;

        deferFn = () => {
            return _assertedOnInit(_assertedApi)
        }

        involvedApiList.push(_assertedApi)
    } else if (apiNList && isMulti) {
        const _assertedApiList = apiNList as RefObject<A[N]>[];
        //Currently, no api exist, no need to call onInit
        if (!_assertedApiList.length) return;
        const _assertedOnInit = onInit as OnMultiInit<A, N>;

        deferFn = () => {
            return _assertedOnInit(undefined, _assertedApiList);
        }

        involvedApiList.push(..._assertedApiList);
    } else {
        throw new Error('This might the internal Error of react-api-bridge');
    }


    let clearFns: any[] = [];

    if (involvedApiList.some((apiRef) => !initializedOnInitMap.get(apiRef)?.has(hookId))) {
        clearFns.push(
            deferFn?.(),
            ...involvedApiList.map((apiRef) => {
                touchedRefs.add(apiRef as RefObject<A[keyof A]>);
                return appendToMappedSet(initializedOnInitMap, apiRef as RefObject<A[keyof A]>, hookId);
            })
        )
    }

    return () => {
        clearFns.forEach(tryInvoke);
    }
}
