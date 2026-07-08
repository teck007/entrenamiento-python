// ============================================================
// tests/checker.test.js — Unit tests de lógica de validación
// Mockea Skulpt para probar checkFill / checkWrite en aislamiento
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSk() {
    let miscevalResolve;
    const miscevalPromise = new Promise(resolve => { miscevalResolve = resolve; });

    return {
        python3: true,
        builtinFiles: { files: {} },
        configure: vi.fn(),
        misceval: {
            asyncToPromise: vi.fn((fn) => {
                fn();
                return miscevalPromise;
            }),
            _resolve: miscevalResolve,
        },
        importMainWithBody: vi.fn((_, __, code, ___) => {
            return { then: (cb) => cb() };
        }),
        _outputCallback: null,
    };
}

describe('Checker — checkFill', () => {
    let Checker;
    let mockSk;

    beforeEach(async () => {
        vi.resetModules();
        mockSk = createMockSk();
        globalThis.Sk = mockSk;
        globalThis.document = {
            readyState: 'complete',
            addEventListener: vi.fn(),
        };

        await import('../public/scripts/checker.js');
        Checker = globalThis.Checker;
    });

    it('aprueba cuando output coincide exactamente', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) mockSk._outputCallback('Hola');
            return Promise.resolve();
        });

        const question = { tests: [{ expectedOutput: 'Hola' }], code: 'print("Hola")' };
        const result = await Checker.checkFill(question, 'print("Hola")');
        expect(result.passed).toBe(true);
        expect(result.error).toBeNull();
    });

    it('rechaza cuando output no coincide', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) mockSk._outputCallback('Chau');
            return Promise.resolve();
        });

        const question = { tests: [{ expectedOutput: 'Hola' }], code: 'print("Chau")' };
        const result = await Checker.checkFill(question, 'print("Chau")');
        expect(result.passed).toBe(false);
        expect(result.details).toContain('no es el esperado');
    });

    it('tolera whitespace alrededor del output', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) mockSk._outputCallback('  Hola  ');
            return Promise.resolve();
        });

        const question = { tests: [{ expectedOutput: 'Hola' }], code: 'print("Hola")' };
        const result = await Checker.checkFill(question, 'print("Hola")');
        expect(result.passed).toBe(true);
    });

    it('reporta error si Skulpt falla', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            throw new Error('SyntaxError: invalid syntax');
        });

        const question = { tests: [{ expectedOutput: 'Hola' }], code: 'print("Hola"' };
        const result = await Checker.checkFill(question, 'print("Hola"');
        expect(result.passed).toBe(false);
        expect(result.error).toBeTruthy();
    });
});

describe('Checker — checkWrite', () => {
    let Checker;
    let mockSk;

    beforeEach(async () => {
        vi.resetModules();
        mockSk = createMockSk();
        globalThis.Sk = mockSk;
        globalThis.document = {
            readyState: 'complete',
            addEventListener: vi.fn(),
        };

        await import('../public/scripts/checker.js');
        Checker = globalThis.Checker;
    });

    it('aprueba cuando todos los tests pasan', async () => {
        const outputs = ['7', '30'];
        let callIndex = 0;

        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) {
                mockSk._outputCallback(outputs[callIndex] || '');
                callIndex++;
            }
            return Promise.resolve();
        });

        const question = {
            tests: [
                { call: 'sumar(3, 4)', expectedOutput: '7' },
                { call: 'sumar(10, 20)', expectedOutput: '30' },
            ],
            code: 'def sumar(a, b): return a + b',
        };

        const result = await Checker.checkWrite(question, 'def sumar(a, b): return a + b');
        expect(result.passed).toBe(true);
        expect(result.details).toContain('Correcto');
    });

    it('falla en el primer test incorrecto', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        let firstCall = true;
        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) {
                mockSk._outputCallback(firstCall ? '7' : '999');
                firstCall = false;
            }
            return Promise.resolve();
        });

        const question = {
            tests: [
                { call: 'sumar(3, 4)', expectedOutput: '7' },
                { call: 'sumar(10, 20)', expectedOutput: '30' },
            ],
            code: 'def sumar(a, b): return a + b + 999',
        };

        const result = await Checker.checkWrite(question, 'def sumar(a, b): return a + b + 999');
        expect(result.passed).toBe(false);
        expect(result.testIndex).toBe(1);
    });

    it('tolera espacios en tests write', async () => {
        mockSk.configure = vi.fn((config) => {
            mockSk._outputCallback = config.output;
        });
        Checker.init();

        mockSk.misceval.asyncToPromise = vi.fn(() => {
            if (mockSk._outputCallback) mockSk._outputCallback('  7  ');
            return Promise.resolve();
        });

        const question = {
            tests: [{ call: 'sumar(3, 4)', expectedOutput: '7' }],
            code: 'def sumar(a, b): return a + b',
        };

        const result = await Checker.checkWrite(question, 'def sumar(a, b): return a + b');
        expect(result.passed).toBe(true);
    });
});

describe('Checker — runCode', () => {
    let Checker;
    let mockSk;

    beforeEach(async () => {
        vi.resetModules();
        mockSk = createMockSk();
        globalThis.Sk = mockSk;
        globalThis.document = {
            readyState: 'complete',
            addEventListener: vi.fn(),
        };

        await import('../public/scripts/checker.js');
        Checker = globalThis.Checker;
    });

    it('no está listo si Skulpt no se configuró', async () => {
        mockSk.misceval.asyncToPromise = vi.fn(() => Promise.reject(new Error('Not ready')));
        const result = await Checker.runCode('print("test")');
        expect(result).toBeDefined();
    });
});
