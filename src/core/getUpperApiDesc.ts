import {getUpperContextValue} from "./getUpperContextValue.js";
import {getApiDesc} from "./getApiDesc.js";
import {BoundaryContextValue} from "../types/boundary.js";
import {BridgeAPIOptions, GetUpperAPIOptions} from "../types/options.js";
import {APIParams} from "../types/api.js";

export function getUpperApiDesc<A extends APIParams, N extends keyof A, O extends BridgeAPIOptions<A>, P>(contextValue: BoundaryContextValue<A, P, O>,
                                                                           _name: N,
                                                                           options: GetUpperAPIOptions<A, N, O, P> | undefined,
                                                                           bridgeOptions: O | undefined
) {
    const parent = getUpperContextValue(options?.contextValue || contextValue, options?.shouldForwardYield);
    if (!parent) return;
    return getApiDesc(_name, parent.bridge, bridgeOptions);
}