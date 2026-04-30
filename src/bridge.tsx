import {genOutput} from "./core/genOutput.js";
import {BridgeAPIOptions} from "./types/options.js";
import {APIParams} from "./types/api.js";
import {PayloadParameter} from "./types/tools.js";

const createBridge = <
    A extends APIParams,
    P extends any = any
>(...args: PayloadParameter<P>) => {
    const payload = args[0] as P;

    const output = genOutput<A, P>(payload);
    const currying = <O extends BridgeAPIOptions<A>>(options?: O) => {
        return genOutput<A, P, O>(payload, options);
    };


    return Object.assign(currying, output);
};

export default createBridge;
