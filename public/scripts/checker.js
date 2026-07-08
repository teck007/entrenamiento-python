// ============================================================
// checker.js — Ejecución de Python con Skulpt y validación
// ============================================================

const Checker = (() => {
    let ready = false;
    let readyResolve = null;
    const readyPromise = new Promise((resolve) => { readyResolve = resolve; });

    function init() {
        if (typeof Sk === 'undefined') {
            const check = setInterval(() => {
                if (typeof Sk !== 'undefined') {
                    clearInterval(check);
                    _configure();
                }
            }, 200);
            setTimeout(() => {
                clearInterval(check);
                if (!ready) {
                    console.error('Skulpt no se cargó después de 10 segundos');
                    readyResolve();
                }
            }, 10000);
            return;
        }
        _configure();
    }

    function _configure() {
        if (typeof Sk === 'undefined') return;
        let outputBuffer = '';
        Sk.configure({
            output: (text) => { outputBuffer += text; },
            read: (x) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
                    throw new Error(`Archivo no encontrado: '${x}'`);
                }
                return Sk.builtinFiles['files'][x];
            },
            __future__: Sk.python3,
        });
        ready = true;
        readyResolve();
    }

    async function runCode(code) {
        await readyPromise;
        if (!ready) {
            return { success: false, output: '', error: 'Skulpt no está disponible. Recargá la página.' };
        }

        let outputBuffer = '';
        Sk.configure({
            output: (text) => { outputBuffer += text; },
            read: (x) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
                    throw new Error(`Archivo no encontrado: '${x}'`);
                }
                return Sk.builtinFiles['files'][x];
            },
            __future__: Sk.python3,
        });

        const TIMEOUT_MS = 5000;
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Tiempo de ejecución agotado. ¿Hay un bucle infinito?')), TIMEOUT_MS);
        });

        try {
            await Promise.race([
                Sk.misceval.asyncToPromise(() => {
                    return Sk.importMainWithBody('<stdin>', false, code, true);
                }),
                timeoutPromise,
            ]);
            return { success: true, output: outputBuffer.replace(/\n$/, ''), error: null };
        } catch (e) {
            if (e && e.message && e.message.includes('Tiempo de ejecución agotado')) {
                return { success: false, output: outputBuffer.replace(/\n$/, ''), error: e.message };
            }
            let errorMsg = e.toString()
                .replace('SkulptInternalError: ', '')
                .replace('Traceback (most recent call last):\n  File "<stdin>", line ', 'Error en línea ');
            if (errorMsg.includes('Error en línea')) {
                const lines = errorMsg.split('\n');
                if (lines.length > 1) {
                    errorMsg = lines[0] + '\n' + lines.slice(1).join('\n');
                }
            }
            return { success: false, output: outputBuffer.replace(/\n$/, ''), error: errorMsg };
        }
    }

    async function checkFill(question, userCode) {
        const codeToRun = userCode || question.code;
        const result = await runCode(codeToRun);
        if (!result.success) {
            return {
                passed: false,
                output: result.output,
                expected: question.tests[0].expectedOutput,
                error: result.error,
                details: 'Tu código tiene un error.'
            };
        }
        const actual = result.output.trim();
        const expected = question.tests[0].expectedOutput.trim();
        const passed = actual === expected;
        return { passed, output: actual, expected, error: null, details: passed ? '¡Correcto!' : 'El resultado no es el esperado.' };
    }

    async function checkWrite(question, userCode) {
        const codeToRun = userCode || question.code;
        for (let i = 0; i < question.tests.length; i++) {
            const test = question.tests[i];
            const fullCode = codeToRun + '\n\n' + (test.call ? `print(${test.call})` : '');
            const result = await runCode(fullCode);
            if (!result.success) {
                return { passed: false, output: result.output, error: result.error, testIndex: i, details: `Error en el test ${i + 1}: ${result.error}` };
            }
            const actual = result.output.trim();
            const expected = String(test.expectedOutput).trim();
            if (actual !== expected) {
                return { passed: false, output: actual, expected, error: null, testIndex: i, details: `Test ${i + 1} falló: se esperaba "${expected}" pero se obtuvo "${actual}"` };
            }
        }
        const count = question.tests.length;
        return { passed: true, output: `Todos los tests pasaron (${count}/${count})`, error: null, details: `¡Correcto! Pasaste los ${count} tests.` };
    }

    return { init, readyPromise, runCode, checkFill, checkWrite };
})();

globalThis.Checker = Checker;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checker.init());
} else {
    Checker.init();
}
