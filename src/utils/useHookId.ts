import {useMemo} from "react";
import {genHookId} from "./genHookId.js";

import {HookId} from "../types/tools.js";

export function useHookId(): HookId {
    return useMemo(() => {
        return process.env.NODE_ENV === 'development' ? genHookId() : Symbol('hookId')
    }, []);
}

