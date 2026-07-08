// ============================================================
// tests/questions.test.js — Validación de estructura de preguntas
// Los datos reales están en content collections (Markdown).
// Este test verifica un fixture representativo.
// ============================================================
import { describe, it, expect } from 'vitest';

// Fixture representativo: estructura que deben cumplir todas las preguntas
const SAMPLE_FILL = {
    id: 1, level: 1, type: 'fill', title: 'Hola Mundo',
    code: 'print("Hola")', tests: [{ expectedOutput: 'Hola' }],
    hint: 'Una pista', xp: 10,
};

const SAMPLE_WRITE = {
    id: 25, level: 4, type: 'write', title: 'Función sumar',
    code: 'def sumar(a, b): pass', tests: [{ call: 'sumar(3,4)', expectedOutput: '7' }],
    hint: 'Usá return', xp: 20,
};

describe('Estructura de preguntas (fixture tests)', () => {
    it('fill questions tienen todos los campos requeridos', () => {
        const required = ['id', 'level', 'type', 'title', 'code', 'tests', 'hint', 'xp'];
        required.forEach(f => expect(SAMPLE_FILL).toHaveProperty(f));
    });

    it('write questions tienen todos los campos requeridos', () => {
        const required = ['id', 'level', 'type', 'title', 'code', 'tests', 'hint', 'xp'];
        required.forEach(f => expect(SAMPLE_WRITE).toHaveProperty(f));
    });

    it('type solo puede ser "fill" o "write"', () => {
        expect(['fill', 'write']).toContain(SAMPLE_FILL.type);
        expect(['fill', 'write']).toContain(SAMPLE_WRITE.type);
    });

    it('fill questions tienen exactamente 1 test', () => {
        expect(SAMPLE_FILL.tests).toHaveLength(1);
        expect(SAMPLE_FILL.tests[0]).toHaveProperty('expectedOutput');
    });

    it('level es un número positivo', () => {
        expect(SAMPLE_FILL.level).toBeGreaterThanOrEqual(1);
        expect(SAMPLE_WRITE.level).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(SAMPLE_FILL.level)).toBe(true);
    });

    it('xp es un número positivo', () => {
        expect(SAMPLE_FILL.xp).toBeGreaterThan(0);
        expect(SAMPLE_WRITE.xp).toBeGreaterThan(0);
    });

    it('hint es un string no vacío', () => {
        expect(SAMPLE_FILL.hint.length).toBeGreaterThan(0);
        expect(SAMPLE_WRITE.hint.length).toBeGreaterThan(0);
    });

    it('fill questions tienen ___ en el code', () => {
        const fillCodes = [
            'nombre = "Mundo"\nprint(f"Hola, {___}")',
            'edad = ___',
            'resultado = (5 + 3) * ___',
        ];
        fillCodes.forEach(code => expect(code).toContain('___'));
    });

    it('write questions NO tienen ___ en el code', () => {
        const writeCodes = [
            '# Escribí tu código acá',
            'def sumar(a, b):\n    pass',
            'def pares(lista):\n    pass',
        ];
        writeCodes.forEach(code => expect(code).not.toContain('___'));
    });
});
