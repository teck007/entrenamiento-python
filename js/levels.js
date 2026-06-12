// ============================================================
// levels.js — Definición de niveles y umbrales de XP
// ============================================================

const LEVELS = [
    {
        id: 1,
        title: 'Variables y Tipos',
        subtitle: 'Fundamentos',
        description: 'Aprendé los fundamentos: variables, strings, números y operaciones básicas.',
        icon: '🔤',
        color: 'blue',
        xpRequired: 0,
    },
    {
        id: 2,
        title: 'Condicionales',
        subtitle: 'Control de flujo',
        description: 'Tomá decisiones con if, elif, else y operadores lógicos.',
        icon: '🔀',
        color: 'emerald',
        xpRequired: 70,
    },
    {
        id: 3,
        title: 'Bucles',
        subtitle: 'Iteración',
        description: 'Dominá for, while, range y controlá el flujo de repeticiones.',
        icon: '🔄',
        color: 'violet',
        xpRequired: 160,
    },
    {
        id: 4,
        title: 'Funciones y Listas',
        subtitle: 'Estructuras',
        description: 'Creá funciones reutilizables y trabajá con listas y sus métodos.',
        icon: '📦',
        color: 'amber',
        xpRequired: 270,
    },
    {
        id: 5,
        title: 'POO y Avanzado',
        subtitle: 'Programación Orientada a Objetos',
        description: 'Clases, objetos, métodos, herencia y manejo de excepciones.',
        icon: '🧬',
        color: 'rose',
        xpRequired: 400,
    },
];

const XP_CONFIG = {
    fillQuestion: 10,
    writeQuestion: 20,
    levelCompleteBonus: 30,
    perfectLevelBonus: 50, // todas correctas sin pistas
};
