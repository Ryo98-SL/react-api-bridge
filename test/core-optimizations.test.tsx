import React from 'react';
import {render} from '@testing-library/react';

import createBridge from '../src/bridge';
import {useAPI} from '../src/features/hooks/useAPI';
import {useRegister} from '../src/features/hooks/useRegister';
import {getApiDesc} from '../src/core/getApiDesc';
import {getResolverOrCreateWhenMissing} from '../src/core/getResolverOrCreateWhenMissing';

test('useAPI onInit runs again after consumer remount', () => {
    const bridge = createBridge<{
        modal: {
            open: () => void;
        };
    }>();

    const onInit = jest.fn();

    function Provider() {
        useRegister(bridge, 'modal', () => ({
            open: () => undefined
        }), []);

        return null;
    }

    function Consumer() {
        useAPI(bridge, 'modal', {onInit});
        return null;
    }

    const {rerender} = render(
        <>
            <Provider />
            <Consumer />
        </>
    );

    expect(onInit).toHaveBeenCalledTimes(1);

    rerender(<Provider />);
    rerender(
        <>
            <Provider />
            <Consumer />
        </>
    );

    expect(onInit).toHaveBeenCalledTimes(2);
});

test('getResolverOrCreateWhenMissing reuses the initial resolver and keeps waiters separate', () => {
    const bridge = createBridge<{
        modal: {
            open: () => void;
        };
    }>();

    const {apiNList} = getApiDesc('modal', bridge.globalContextValue.bridge, bridge.bridgeOptions);

    const firstInitial = getResolverOrCreateWhenMissing(apiNList, bridge.globalContextValue, true, bridge.pendingResolverMap);
    const secondInitial = getResolverOrCreateWhenMissing(apiNList, bridge.globalContextValue, true, bridge.pendingResolverMap);
    const waiterOne = getResolverOrCreateWhenMissing(apiNList, bridge.globalContextValue, false, bridge.pendingResolverMap);
    const waiterTwo = getResolverOrCreateWhenMissing(apiNList, bridge.globalContextValue, false, bridge.pendingResolverMap);

    expect(firstInitial.resolver).toBe(secondInitial.resolver);
    expect(firstInitial.bucket.initialResolver).toBe(firstInitial.resolver);
    expect(waiterOne.resolver).not.toBe(waiterTwo.resolver);
    expect(firstInitial.bucket.waiters.size).toBe(2);
});
