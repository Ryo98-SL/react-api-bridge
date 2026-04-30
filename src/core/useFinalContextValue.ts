import {useContext} from "react";
import {BoundaryContextValue} from "../types/boundary.js";
import {BridgeAPIOptions, GetUpperAPIOptions} from "../types/options.js";
import {APIParams} from "../types/api.js";

export const useFinalContextValue =
    <A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>
    (
        options: GetUpperAPIOptions<A, N, O, P> | undefined,
        bridgeContext: React.Context<BoundaryContextValue<A, P, O>>
    ) => {
        const {contextValue: _outerContextValue} = options || {};
        const ownContextValue = useContext(bridgeContext);
        return _outerContextValue || ownContextValue;
    }