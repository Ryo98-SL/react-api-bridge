import React, {useState} from 'react';
import {render, fireEvent, screen, act} from '@testing-library/react';
import '@testing-library/jest-dom';

import createBridge from '../src/bridge';
import {useRegister} from '../src/features/hooks/useRegister';
import {useAPI} from '../src/features/hooks/useAPI';

type API = {
    foo: {
        whoAmI(): string;
    };
    bar: {
        whoAmI(): string;
    };
};

describe('useRegister owner check (non-multi)', () => {
    test('the second useRegister on the same field does NOT override the first one and emits a warning', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const Bridge = createBridge<API>();

        function Owner() {
            useRegister(Bridge, 'foo', () => ({
                whoAmI() {
                    return 'owner';
                }
            }), []);
            return <div data-testid="owner">owner</div>;
        }

        function LateRegister() {
            useRegister(Bridge, 'foo', () => ({
                whoAmI() {
                    return 'late';
                }
            }), []);
            return <div data-testid="late">late</div>;
        }

        function Reader() {
            const fooApi = useAPI(Bridge, 'foo');
            const [name, setName] = useState('');
            return (
                <div>
                    <button data-testid="read"
                            onClick={() => setName(fooApi.current?.whoAmI() ?? 'null')}>
                        read
                    </button>
                    <span data-testid="name">{name}</span>
                </div>
            );
        }

        function App() {
            return (
                <>
                    <Owner/>
                    <LateRegister/>
                    <Reader/>
                </>
            );
        }

        render(<App/>);

        fireEvent.click(screen.getByTestId('read'));
        // The owner (first useRegister) wins - the late one cannot override.
        expect(screen.getByTestId('name')).toHaveTextContent('owner');

        // A warning was emitted for the conflicting registration.
        expect(warnSpy).toHaveBeenCalled();
        const calledWith = warnSpy.mock.calls.map(c => String(c[0])).join('\n');
        expect(calledWith).toMatch(/already registered by another component/);
        expect(calledWith).toMatch(/foo/);

        warnSpy.mockRestore();
    });

    test('re-mounting the same owner does NOT trigger a warning', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const Bridge = createBridge<API>();

        function Owner() {
            useRegister(Bridge, 'foo', () => ({
                whoAmI() { return 'owner'; }
            }), []);
            return <div>owner</div>;
        }

        function Toggle() {
            const [show, setShow] = useState(true);
            return (
                <>
                    <button data-testid="toggle" onClick={() => setShow(s => !s)}>toggle</button>
                    {show && <Owner/>}
                </>
            );
        }

        render(<Toggle/>);
        // Unmount.
        fireEvent.click(screen.getByTestId('toggle'));
        // Re-mount.
        fireEvent.click(screen.getByTestId('toggle'));

        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    test('after the first owner unmounts, a fresh component can claim ownership', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const Bridge = createBridge<API>();

        function A() {
            useRegister(Bridge, 'foo', () => ({whoAmI() { return 'A'; }}), []);
            return null;
        }

        function B() {
            useRegister(Bridge, 'foo', () => ({whoAmI() { return 'B'; }}), []);
            return null;
        }

        function App() {
            const [showA, setShowA] = useState(true);
            const [showB, setShowB] = useState(false);
            const fooApi = useAPI(Bridge, 'foo');
            const [name, setName] = useState('');
            return (
                <>
                    <button data-testid="toggle-a" onClick={() => setShowA(s => !s)}/>
                    <button data-testid="toggle-b" onClick={() => setShowB(s => !s)}/>
                    <button data-testid="read"
                            onClick={() => setName(fooApi.current?.whoAmI() ?? 'null')}/>
                    <span data-testid="name">{name}</span>
                    {showA && <A/>}
                    {showB && <B/>}
                </>
            );
        }

        render(<App/>);

        fireEvent.click(screen.getByTestId('read'));
        expect(screen.getByTestId('name')).toHaveTextContent('A');

        // A unmounts -> ownership released.
        fireEvent.click(screen.getByTestId('toggle-a'));

        // No registrar means the api is gone.
        fireEvent.click(screen.getByTestId('read'));
        expect(screen.getByTestId('name')).toHaveTextContent('null');

        // B mounts AFTER A is gone -> B successfully claims ownership.
        fireEvent.click(screen.getByTestId('toggle-b'));
        fireEvent.click(screen.getByTestId('read'));
        expect(screen.getByTestId('name')).toHaveTextContent('B');

        // No warning was emitted - this is a clean ownership transfer, not a conflict.
        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });
});

describe('useRegister with isMulti (preserves existing behavior)', () => {
    test('multiple registrations are all kept and no warning is emitted', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const Bridge = createBridge<API>()({
            foo: {isMulti: true},
        });

        function Reg(props: {label: string}) {
            useRegister(Bridge, 'foo', () => ({
                whoAmI() { return props.label; }
            }), []);
            return null;
        }

        function Reader() {
            const fooList = useAPI(Bridge, 'foo');
            const [names, setNames] = useState('');
            return (
                <>
                    <button data-testid="read" onClick={() => {
                        const list = fooList as Array<{current: API['foo'] | null}>;
                        setNames(list.map(r => r.current?.whoAmI() ?? '').join(','));
                    }}/>
                    <span data-testid="names">{names}</span>
                </>
            );
        }

        function App() {
            return (
                <>
                    <Reg label="a"/>
                    <Reg label="b"/>
                    <Reg label="c"/>
                    <Reader/>
                </>
            );
        }

        render(<App/>);
        fireEvent.click(screen.getByTestId('read'));
        expect(screen.getByTestId('names')).toHaveTextContent('a,b,c');
        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });
});
