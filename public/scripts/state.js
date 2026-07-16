// ============================================================
// state.js — Estado global, persistencia y helpers
// ============================================================

const StateModule = (() => {
    'use strict';

    const STORAGE_KEY = 'pytrainer_progress';
    const THEME_KEY = 'pytrainer_theme';

    const defaultState = {
        currentView: 'dashboard',
        currentLevel: 1,
        currentQuestionIndex: 0,
        xp: 0,
        unlockedLevels: 1,
        answeredQuestions: [],
        hintsUsed: [],
        levelCompletedShown: [],
        theme: 'dark', // 'dark' | 'light'
    };

    let state = { ...defaultState };

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...defaultState, ...parsed };
            }
            // Restore theme from dedicated key (más confiable que el estado)
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                state.theme = savedTheme;
            }
            if (state.unlockedLevels < 1) state.unlockedLevels = 1;
            if (state.currentLevel > state.unlockedLevels) {
                state.currentLevel = state.unlockedLevels;
            }
        } catch (e) {
            console.warn('Error cargando progreso:', e);
            state = { ...defaultState };
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentLevel: state.currentLevel,
                currentQuestionIndex: state.currentQuestionIndex,
                xp: state.xp,
                unlockedLevels: state.unlockedLevels,
                answeredQuestions: state.answeredQuestions,
                hintsUsed: state.hintsUsed,
                levelCompletedShown: state.levelCompletedShown,
                theme: state.theme,
            }));
            localStorage.setItem(THEME_KEY, state.theme);
        } catch (e) {
            console.warn('Error guardando progreso:', e);
        }
    }

    function resetState() {
        state = { ...defaultState };
        saveState();
        // Reset theme too
        document.documentElement.classList.remove('light');
        localStorage.setItem(THEME_KEY, 'dark');
    }

    function getState() { return state; }

    function setState(partial) { Object.assign(state, partial); }

    // ── Theme helpers ────────────────────────────────────────
    function getTheme() { return state.theme; }

    function setTheme(theme) {
        state.theme = theme;
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
        localStorage.setItem(THEME_KEY, theme);
        // Don't save full state on every toggle — just theme key
    }

    function toggleTheme() {
        setTheme(state.theme === 'dark' ? 'light' : 'dark');
        return state.theme;
    }

    // ── Helpers ──────────────────────────────────────────────
    function getQuestionsForLevel(levelId) {
        return window.__QUESTIONS.filter(q => q.level === levelId);
    }

    function getLevelQuestions() {
        return getQuestionsForLevel(state.currentLevel);
    }

    function getCurrentQuestion() {
        const questions = getLevelQuestions();
        return questions[state.currentQuestionIndex] || null;
    }

    function isQuestionAnswered(questionId) {
        return state.answeredQuestions.includes(String(questionId));
    }

    function isHintUsed(questionId) {
        return state.hintsUsed.includes(questionId);
    }

    function getLevelProgress(levelId) {
        const questions = getQuestionsForLevel(levelId);
        if (questions.length === 0) return { completed: 0, total: 0, percent: 0 };
        const completed = questions.filter(q => isQuestionAnswered(q.id)).length;
        return { completed, total: questions.length, percent: Math.round((completed / questions.length) * 100) };
    }

    function getTotalXP() { return state.xp; }

    function getNextLevelXP() {
        const levels = window.__LEVELS;
        const nextLevel = levels.find(l => l.id === state.unlockedLevels + 1);
        if (!nextLevel) return null;
        return nextLevel.xpRequired;
    }

    function canUnlockNextLevel() {
        const levels = window.__LEVELS;
        const nextLevel = levels.find(l => l.id === state.unlockedLevels + 1);
        if (!nextLevel) return false;
        return state.xp >= nextLevel.xpRequired;
    }

    return {
        loadState,
        saveState,
        resetState,
        getState,
        setState,
        getTheme,
        setTheme,
        toggleTheme,
        getQuestionsForLevel,
        getLevelQuestions,
        getCurrentQuestion,
        isQuestionAnswered,
        isHintUsed,
        getLevelProgress,
        getTotalXP,
        getNextLevelXP,
        canUnlockNextLevel,
    };
})();

globalThis.StateModule = StateModule;
