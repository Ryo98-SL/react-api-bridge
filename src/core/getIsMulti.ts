import {BridgeAPIOptions} from "../types/options.js";
import {APIParams} from "../types/api.js";

export const getIsMulti = <A extends APIParams, N extends keyof A>
(name: N, bridgeOptions: BridgeAPIOptions<A> | undefined) => {
    return bridgeOptions?.[name]?.isMulti
}