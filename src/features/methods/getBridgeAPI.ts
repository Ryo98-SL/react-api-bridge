import {getApiDesc} from "../../core/index.js";
import {BoundaryContextValue} from "../../types/boundary.js";
import {BaseOptions, BridgeAPIOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";

export function getBridgeAPI<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, name: N, baseOptions?: BaseOptions<A, O, P>) {

    const contextValue = baseOptions?.contextValue || apiBridge.globalContextValue;
    return getApiDesc<A, N, O>(name, contextValue.bridge , apiBridge.bridgeOptions).apiNList;
}