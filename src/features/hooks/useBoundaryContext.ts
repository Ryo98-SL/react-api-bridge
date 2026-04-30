import {useContext, useMemo} from "react";
import {BridgeAPIOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {PayloadParameter} from "../../types/tools.js";
import {ReactAPIBridge} from "../../types/bridge.js";
import {BoundaryContextValue} from "../../types/boundary.js";


export function useBoundaryContext<A extends APIParams, O extends BridgeAPIOptions<A>, P>
(apiBridge: ReactAPIBridge<A, P, O>, ...args: PayloadParameter<P>) {
    const payload = args[0] as P;
    const parent = useContext(apiBridge.BridgeContext);
    return useMemo<BoundaryContextValue<A, P, O>>(() => {
        return {
            bridge: {},
            parent,
            payload
        }
    }, []);
}