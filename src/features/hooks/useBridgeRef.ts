import {useRef} from "react";
import {BoundaryAPI} from "../../types/boundary.js";
import {BridgeAPIOptions} from "../../types/options.js";
import {APIParams} from "../../types/api.js";
import {ReactAPIBridge} from "../../types/bridge.js";

export function useBoundaryRef<A extends APIParams, O extends BridgeAPIOptions<A>, P>(apiBridge: ReactAPIBridge<A, P, O>) {
    return useRef<BoundaryAPI<A, O, P>>(null);
}