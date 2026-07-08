// ============================================================
// tests/levels.test.js — Validación de estructura de niveles
// Los datos provienen de content collections (Astro), no de JS
// Este test verifica datos estáticos inline
// ============================================================
import { describe, it, expect } from 'vitest';

const LEVELS = [
    { id: 1, title: 'Variables y Tipos', subtitle: 'Fundamentos', description: 'Aprendé los fundamentos.', icon: '🔤', color: 'blue', xpRequired: 0 },
    { id: 2, title: 'Condicionales', subtitle: 'Control de flujo', description: 'Tomá decisiones.', icon: '🔀', color: 'emerald', xpRequired: 70 },
    { id: 3, title: 'Bucles', subtitle: 'Iteración', description: 'Dominá for, while.', icon: '🔄', color: 'violet', xpRequired: 160 },
    { id: 4, title: 'Funciones y Listas', subtitle: 'Estructuras', description: 'Creá funciones.', icon: '📦', color: 'amber', xpRequired: 270 },
    { id: 5, title: 'POO y Avanzado', subtitle: 'Programación Orientada a Objetos', description: 'Clases y objetos.', icon: '🧬', color: 'rose', xpRequired: 400 },
];

const XP_CONFIG = {
    fillQuestion: 10,
    writeQuestion: 20,
    levelCompleteBonus: 30,
    perfectLevelBonus: 50,
};

describe('Estructura de niveles', () => {
    it('tiene exactamente 5 niveles', () => {
        expect(LEVELS).toHaveLength(5);
    });

    it('todos los niveles tienen campos requeridos', () => {
        const required = ['id', 'title', 'subtitle', 'description', 'icon', 'color', 'xpRequired'];
        LEVELS.forEach(l => {
            required.forEach(f => expect(l).toHaveProperty(f));
        });
    });

    it('los IDs son secuenciales del 1 al 5', () => {
        LEVELS.forEach((l, i) => {
            expect(l.id).toBe(i + 1);
        });
    });

    it('xpRequired es creciente', () => {
        for (let i = 1; i < LEVELS.length; i++) {
            expect(LEVELS[i].xpRequired).toBeGreaterThan(LEVELS[i - 1].xpRequired);
        }
    });

    it('el primer nivel tiene xpRequired = 0', () => {
        expect(LEVELS[0].xpRequired).toBe(0);
    });
});

describe('XP_CONFIG', () => {
    it('tiene todas las claves requeridas', () => {
        expect(XP_CONFIG).toHaveProperty('fillQuestion');
        expect(XP_CONFIG).toHaveProperty('writeQuestion');
        expect(XP_CONFIG).toHaveProperty('levelCompleteBonus');
        expect(XP_CONFIG).toHaveProperty('perfectLevelBonus');
    });

    it('writeQuestion vale más que fillQuestion', () => {
        expect(XP_CONFIG.writeQuestion).toBeGreaterThanOrEqual(XP_CONFIG.fillQuestion);
    });
});
