import {BoundaryContextValue} from "../types/boundary.js";
import {AllAPI, BridgeAPIOptions, UpperOptions} from "../types/options.js";
import {APIParams} from "../types/api.js";

export function getUpperContextValue<A extends APIParams, O extends BridgeAPIOptions<A>, P>(
    start: BoundaryContextValue<A, P, O>,
    shouldForwardYield?: UpperOptions<A, O, P>['shouldForwardYield']
) {
    let parent = start.parent;

    if (!parent || !shouldForwardYield) {
        return parent;
    }

    while (parent) {
        const allAPI = {} as AllAPI<A, O>;
        for (const apiName in parent.bridge) {
            const apiDesc = parent.bridge[apiName as keyof A];
            if (apiDesc) {
                allAPI[apiName as keyof A] = apiDesc.apiNList;
            }
        }

        if (!!shouldForwardYield({
            payload: parent.payload,
            parent: parent.parent,
            allAPI
        })) {
            break;
        }

        parent = parent.parent;
    }

    return parent;
}
