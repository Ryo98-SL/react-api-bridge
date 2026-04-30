import {useFinalContextValue} from "../../core/index.js";
import {BaseOptions, BridgeAPIOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";

export function useBoundaryPayload<A extends APIParams, O extends BridgeAPIOptions<A>, P>(apiBridge: ReactAPIBridge<A, P, O>, hookOptions?: BaseOptions<A, O, P>) {
    const contextValue = useFinalContextValue(hookOptions, apiBridge.BridgeContext);
    return contextValue.payload;
}