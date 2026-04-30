import {useFinalContextValue, getUpperContextValue} from "../../core/index.js";
import {useMemo} from "react";
import {BridgeAPIOptions, UpperOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";

function useUpperBoundaryPayload<A extends APIParams, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, hookOptions?: UpperOptions<A, O, P>) {
    const {shouldForwardYield} = hookOptions || {};
    const contextValue = useFinalContextValue(hookOptions, apiBridge.BridgeContext);

    const boundaryContextValue = useMemo(() => {
        return getUpperContextValue(contextValue, shouldForwardYield);
    }, []);

    return boundaryContextValue?.payload
}

export { useUpperBoundaryPayload };