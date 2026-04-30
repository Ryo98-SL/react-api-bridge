import {getApiDesc, getResolverOrCreateWhenMissing} from "../../core/index.js";
import {BridgeAPIOptions, GetAPIAsyncOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";

export function getBridgeAPIAsync<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, name: N, options?: GetAPIAsyncOptions<A, O, P>, bridgeOptions?: O) {

    const {contextValue, initial} = {
        contextValue: apiBridge.globalContextValue,
        initial: true,
        ...options,
    };

    const {apiNList} = getApiDesc<A, N, O>(name, contextValue.bridge, bridgeOptions);
    const {resolver} = getResolverOrCreateWhenMissing(apiNList, contextValue, initial, apiBridge.pendingResolverMap);


    return resolver.promise;
}