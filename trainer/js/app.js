// ============================================================
// app.js — Motor principal: estado, renderizado, eventos
// ============================================================

const App = (() => {
    'use strict';

    // ============================================================
    // ESTADO
    // ============================================================
    const STORAGE_KEY = 'pytrainer_progress';

    const defaultState = {
        currentView: 'levels',     // 'levels' | 'question'
        currentLevel: 1,
        currentQuestionIndex: 0,
        xp: 0,
        unlockedLevels: 1,
        answeredQuestions: [],     // ['1-1', '1-3', ...]
        hintsUsed: [],            // [1, 2, ...]
        levelCompletedShown: [],  // [1, 2, ...]
    };

    let state = { ...defaultState };

    // ============================================================
    // PERSISTENCIA
    // ============================================================
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...defaultState, ...parsed };
            }
            // Asegurar que unlockedLevels sea al menos 1
            if (state.unlockedLevels < 1) state.unlockedLevels = 1;
            // Nivel actual siempre debe estar desbloqueado
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
            }));
        } catch (e) {
            console.warn('Error guardando progreso:', e);
        }
    }

    function resetProgress() {
        state = { ...defaultState };
        saveState();
        render();
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function getQuestionsForLevel(levelId) {
        return QUESTIONS.filter(q => q.level === levelId);
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
        return {
            completed,
            total: questions.length,
            percent: Math.round((completed / questions.length) * 100),
        };
    }

    function getTotalXP() {
        return state.xp;
    }

    function getNextLevelXP() {
        const currentLevel = LEVELS.find(l => l.id === state.unlockedLevels);
        const nextLevel = LEVELS.find(l => l.id === state.unlockedLevels + 1);
        if (!nextLevel) return null; // ya en el último nivel
        return nextLevel.xpRequired;
    }

    function canUnlockNextLevel() {
        const nextLevel = LEVELS.find(l => l.id === state.unlockedLevels + 1);
        if (!nextLevel) return false;
        return state.xp >= nextLevel.xpRequired;
    }

    // ============================================================
    // ACCIONES
    // ============================================================
    function selectLevel(levelId) {
        const level = LEVELS.find(l => l.id === levelId);
        if (!level) return;
        if (levelId > state.unlockedLevels) return;

        state.currentLevel = levelId;
        state.currentQuestionIndex = 0;
        state.currentView = 'question';
        saveState();
        render();
    }

    function goBackToLevels() {
        state.currentView = 'levels';
        render();
    }

    function selectQuestion(index) {
        const questions = getLevelQuestions();
        if (index < 0 || index >= questions.length) return;
        state.currentQuestionIndex = index;
        saveState();
        render();
    }

    function prevQuestion() {
        if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex--;
            saveState();
            render();
        }
    }

    function nextQuestion() {
        const questions = getLevelQuestions();
        if (state.currentQuestionIndex < questions.length - 1) {
            state.currentQuestionIndex++;
            saveState();
            render();
        } else {
            // Última pregunta — volver a la selección de niveles
            goBackToLevels();
        }
    }

    function getQuestionNavState() {
        const questions = getLevelQuestions();
        const idx = state.currentQuestionIndex;
        return {
            first: idx === 0,
            last: idx === questions.length - 1,
            current: idx + 1,
            total: questions.length,
        };
    }

    // ============================================================
    // CHECKER
    // ============================================================
    async function handleCheck() {
        const question = getCurrentQuestion();
        if (!question) return;

        const editor = document.getElementById('code-editor');
        if (!editor) return;

        const resultArea = document.getElementById('result-area');
        const checkBtn = document.getElementById('check-btn');
        if (!resultArea || !checkBtn) return;

        const userCode = editor.value;

        // Mostrar estado de carga
        checkBtn.disabled = true;
        checkBtn.innerHTML = '⏳ Ejecutando...';
        resultArea.innerHTML = '<div class="text-slate-400">Ejecutando código...</div>';

        let result;
        if (question.type === 'fill') {
            result = await Checker.checkFill(question, userCode);
        } else {
            result = await Checker.checkWrite(question, userCode);
        }

        checkBtn.disabled = false;
        checkBtn.innerHTML = '▶ Ejecutar';

        // Mostrar resultado
        if (result.passed) {
            // Marcar como respondida
            if (!isQuestionAnswered(question.id)) {
                state.answeredQuestions.push(String(question.id));
                state.xp += question.xp;
                saveState();
            }

            // Verificar si el nivel está completo
            const progress = getLevelProgress(state.currentLevel);
            const levelComplete = progress.completed === progress.total;
            const showLevelComplete = levelComplete && !state.levelCompletedShown.includes(state.currentLevel);

            renderResult(result, 'success');

            // XP popup
            showXPPopup(question.xp);

            // Nivel completado
            if (showLevelComplete) {
                state.levelCompletedShown.push(state.currentLevel);
                unlockNextLevelIfNeeded();
                setTimeout(() => showLevelCompleteModal(), 800);
            }
        } else {
            renderResult(result, 'error');
            // Shake al editor para feedback visual
            editor.classList.add('animate-shake');
            setTimeout(() => editor.classList.remove('animate-shake'), 500);
        }

        // Actualizar header y navegación
        renderHeader();
        renderLevelNav();
        renderQuestionNav();
    }

    function showXPPopup(xp) {
        const existing = document.querySelector('.xp-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'xp-popup text-3xl font-bold text-yellow-400';
        popup.textContent = `+${xp} XP`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1500);
    }

    function unlockNextLevelIfNeeded() {
        if (canUnlockNextLevel()) {
            state.unlockedLevels++;
            saveState();
        }
    }

    function showLevelCompleteModal() {
        const level = LEVELS.find(l => l.id === state.currentLevel);
        const nextLevel = LEVELS.find(l => l.id === state.currentLevel + 1);
        const progress = getLevelProgress(state.currentLevel);

        let modalHtml = `
            <div id="level-modal" class="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in">
                <div class="bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center animate-slide-up border border-slate-700 shadow-2xl">
                    <div class="text-5xl mb-4">🎉</div>
                    <h2 class="text-2xl font-bold text-slate-100 mb-2">¡Nivel completado!</h2>
                    <p class="text-slate-400 mb-1">${level.title}</p>
                    <p class="text-emerald-400 font-semibold text-lg mb-4">${progress.completed}/${progress.total} preguntas correctas</p>
                    <div class="flex items-center justify-center gap-2 text-yellow-400 mb-6">
                        <span class="text-2xl">⭐</span>
                        <span class="font-bold text-xl">+${XP_CONFIG.levelCompleteBonus} XP</span>
                    </div>
                    ${nextLevel ? `
                        <p class="text-slate-300 mb-2">¡Nivel desbloqueado: <strong>${nextLevel.title}</strong>!</p>
                        <p class="text-sm text-slate-500 mb-6">${nextLevel.description}</p>
                        <div class="flex gap-3 justify-center">
                            <button onclick="App.continueToNextLevel()" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">
                                Siguiente nivel →
                            </button>
                            <button onclick="App.closeModal()" class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2.5 rounded-lg font-semibold transition-all">
                                Seguir practicando
                            </button>
                        </div>
                    ` : `
                        <p class="text-yellow-400 font-bold text-lg mb-6">¡Completaste TODOS los niveles! 🏆</p>
                        <button onclick="App.closeModal()" class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">
                            ¡Volver al inicio!
                        </button>
                    `}
                </div>
            </div>`;

        // Agregar XP de bonus
        state.xp += XP_CONFIG.levelCompleteBonus;
        saveState();

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
    }

    // Expuestas globalmente para onclick
    window.App = {};
    window.App.continueToNextLevel = function() {
        const modal = document.getElementById('level-modal');
        if (modal) modal.remove();
        if (state.currentLevel < LEVELS.length) {
            selectLevel(state.currentLevel + 1);
        } else {
            goBackToLevels();
        }
    };
    window.App.closeModal = function() {
        const modal = document.getElementById('level-modal');
        if (modal) modal.remove();
        render();
    };
    window.App.resetProgress = function() {
        if (confirm('¿Estás seguro? Todo tu progreso se borrará.')) {
            resetProgress();
        }
    };

    function renderResult(result, type) {
        const resultArea = document.getElementById('result-area');
        if (!resultArea) return;

        if (type === 'success') {
            resultArea.innerHTML = `
                <div class="animate-fade-in">
                    <div class="flex items-center gap-3 mb-3">
                        <svg class="checkmark" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="25" fill="none"/>
                            <path fill="none" d="M14 27l7 7 16-16"/>
                        </svg>
                        <span class="text-emerald-400 font-bold text-lg">¡Correcto!</span>
                        <span class="text-yellow-400 font-semibold ml-auto">+${getCurrentQuestion().xp} XP</span>
                    </div>
                    ${result.output ? `<div class="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-slate-300">${escapeHtml(result.output)}</div>` : ''}
                </div>
            `;
        } else {
            let errorDetail = '';
            if (result.error) {
                errorDetail = `<div class="bg-red-900/30 rounded-lg p-3 font-mono text-sm text-red-300 mt-2">${escapeHtml(result.error)}</div>`;
            }
            resultArea.innerHTML = `
                <div class="animate-fade-in">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-red-400 text-2xl">✗</span>
                        <span class="text-red-400 font-bold text-lg">${result.details || 'Incorrecto'}</span>
                    </div>
                    ${result.output ? `<div class="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-slate-300">Output: ${escapeHtml(result.output)}</div>` : ''}
                    ${result.expected ? `<div class="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-emerald-300 mt-1">Esperado: ${escapeHtml(result.expected)}</div>` : ''}
                    ${errorDetail}
                    <p class="text-slate-400 text-sm mt-3">💡 Intentá de nuevo. Revisá la sintaxis y la lógica.</p>
                </div>
            `;
        }
    }

    // ============================================================
    // HINT
    // ============================================================
    function showHint() {
        const question = getCurrentQuestion();
        if (!question) return;

        // Marcar hint como usada
        if (!isHintUsed(question.id)) {
            state.hintsUsed.push(question.id);
            saveState();
        }

        const hintArea = document.getElementById('hint-area');
        if (hintArea) {
            hintArea.innerHTML = `
                <div class="animate-fade-in bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                    <div class="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                        <span>💡</span> Pista
                    </div>
                    <p class="text-slate-300 text-sm whitespace-pre-line">${escapeHtml(question.hint)}</p>
                </div>
            `;
        }
    }

    // ============================================================
    // RESET CODE
    // ============================================================
    function resetCode() {
        const question = getCurrentQuestion();
        if (!question) return;
        const editor = document.getElementById('code-editor');
        if (editor) {
            editor.value = question.code;
            // Limpiar resultado y hint
            const resultArea = document.getElementById('result-area');
            const hintArea = document.getElementById('hint-area');
            if (resultArea) resultArea.innerHTML = '<div class="text-slate-500 italic">Ejecutá tu código para ver el resultado acá.</div>';
            if (hintArea) hintArea.innerHTML = '';
        }
    }

    // ============================================================
    // RENDER
    // ============================================================
    function render() {
        renderHeader();

        const main = document.getElementById('main-content');
        if (!main) return;

        if (state.currentView === 'levels') {
            main.innerHTML = renderLevelSelect();
        } else {
            main.innerHTML = renderQuestionView();
        }

        renderLevelNav();

        // Post-render hooks
        if (state.currentView === 'question') {
            setupEditorAutoResize();
            // Mostrar hint si ya fue usada
            const question = getCurrentQuestion();
            if (question && isHintUsed(question.id)) {
                const hintArea = document.getElementById('hint-area');
                if (hintArea) {
                    hintArea.innerHTML = `
                        <div class="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <div class="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                                <span>💡</span> Pista
                            </div>
                            <p class="text-slate-300 text-sm whitespace-pre-line">${escapeHtml(question.hint)}</p>
                        </div>`;
                }
            }
            // Mostrar resultado si ya fue respondida
            if (question && isQuestionAnswered(question.id)) {
                const resultArea = document.getElementById('result-area');
                if (resultArea) {
                    resultArea.innerHTML = `
                        <div class="flex items-center gap-3 text-emerald-400">
                            <span>✅</span>
                            <span class="font-semibold">Completada</span>
                            <span class="text-yellow-400 ml-auto">+${question.xp} XP</span>
                        </div>`;
                }
            }
        }
    }

    function renderHeader() {
        const header = document.getElementById('app-header');
        if (!header) return;

        const level = LEVELS.find(l => l.id === state.currentLevel);
        const progress = getLevelProgress(state.currentLevel);
        const totalXP = getTotalXP();
        const nextXP = getNextLevelXP();

        let xpBar = '';
        if (nextXP !== null) {
            const currentLevelXP = LEVELS.find(l => l.id === state.unlockedLevels)?.xpRequired || 0;
            const progressInLevel = totalXP - currentLevelXP;
            const needed = nextXP - currentLevelXP;
            const xpPercent = Math.min(100, Math.round((progressInLevel / needed) * 100));
            xpBar = `
                <div class="flex items-center gap-2 text-sm">
                    <span class="text-yellow-400 font-semibold whitespace-nowrap">⭐ ${totalXP} XP</span>
                    <div class="flex-1 bg-slate-700 rounded-full h-2 max-w-[120px]">
                        <div class="bg-yellow-400 h-2 rounded-full transition-all duration-500" style="width:${xpPercent}%"></div>
                    </div>
                    <span class="text-slate-400 text-xs whitespace-nowrap">${nextXP} XP</span>
                </div>`;
        } else {
            xpBar = `<span class="text-yellow-400 font-semibold">⭐ ${totalXP} XP</span>`;
        }

        header.innerHTML = `
            <div class="flex items-center justify-between flex-wrap gap-2">
                <button onclick="App.goBackToLevels()" class="flex items-center gap-2 text-slate-100 hover:text-white transition-colors">
                    <span class="text-2xl">🐍</span>
                    <span class="font-bold text-lg hidden sm:inline">PyTrainer</span>
                </button>
                <div class="flex items-center gap-4 flex-wrap">
                    ${level ? `
                        <div class="flex items-center gap-2 text-sm">
                            <span class="text-slate-400">${level.icon}</span>
                            <span class="text-slate-200 font-medium">${level.title}</span>
                            ${state.currentView === 'question' ? `
                                <span class="text-slate-500 text-xs">${progress.completed}/${progress.total}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${xpBar}
                    <button onclick="App.resetProgress()" class="text-slate-500 hover:text-red-400 text-xs transition-colors" title="Reiniciar progreso">🔄</button>
                </div>
            </div>
            ${state.currentView === 'question' ? `
                <div class="mt-2 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style="width:${progress.percent}%"></div>
                </div>
            ` : ''}
        `;
    }

    function renderLevelSelect() {
        let html = `
            <div class="animate-fade-in">
                <div class="text-center mb-8 mt-4">
                    <h1 class="text-3xl font-bold text-slate-100 mb-2">🐍 PyTrainer</h1>
                    <p class="text-slate-400">Aprendé Python paso a paso resolviendo ejercicios</p>
                    <p class="text-yellow-400 font-semibold mt-1">⭐ ${state.xp} XP totales</p>
                </div>
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                    ${LEVELS.map(level => {
                        const isUnlocked = level.id <= state.unlockedLevels;
                        const progress = getLevelProgress(level.id);
                        const isActive = level.id === state.currentLevel;

                        let cardClasses = 'level-card rounded-xl p-5 border transition-all ';
                        if (!isUnlocked) {
                            cardClasses += 'locked bg-slate-800/50 border-slate-700/50 ';
                        } else if (isActive) {
                            cardClasses += 'bg-slate-800 border-emerald-600/50 ring-1 ring-emerald-600/30 ';
                        } else {
                            cardClasses += 'bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer ';
                        }

                        let lockIcon = '';
                        if (!isUnlocked) {
                            lockIcon = '<span class="text-slate-600 text-2xl">🔒</span>';
                        } else if (progress.completed === progress.total && progress.total > 0) {
                            lockIcon = '<span class="text-emerald-400 text-xl">✅</span>';
                        }

                        return `
                            <div class="${cardClasses}" 
                                 ${isUnlocked ? `onclick="App.selectLevel(${level.id})"` : ''}
                                 role="${isUnlocked ? 'button' : ''}">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-3xl">${level.icon}</span>
                                    ${lockIcon}
                                </div>
                                <h3 class="text-lg font-semibold text-slate-100 mb-1">${level.title}</h3>
                                <p class="text-xs text-slate-500 mb-2">${level.subtitle}</p>
                                <p class="text-sm text-slate-400 mb-3">${level.description}</p>
                                ${isUnlocked ? `
                                    <div class="flex items-center gap-2 text-xs">
                                        <div class="flex-1 bg-slate-700 rounded-full h-1.5">
                                            <div class="bg-emerald-500 h-1.5 rounded-full transition-all" style="width:${progress.percent}%"></div>
                                        </div>
                                        <span class="text-slate-400 whitespace-nowrap">${progress.completed}/${progress.total}</span>
                                    </div>
                                ` : `
                                    <div class="text-xs text-slate-600">Requiere ${level.xpRequired} XP</div>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>
                ${state.xp > 0 ? `<div class="text-center mt-8"><p class="text-xs text-slate-600">Tu progreso se guarda automáticamente en el navegador.</p></div>` : ''}
            </div>
        `;

        return html;
    }

    function renderQuestionView() {
        const question = getCurrentQuestion();
        if (!question) {
            return `<div class="text-center text-slate-400 py-12">No hay preguntas en este nivel.</div>`;
        }

        const nav = getQuestionNavState();
        const progress = getLevelProgress(state.currentLevel);
        const answered = isQuestionAnswered(question.id);
        const typeLabel = question.type === 'fill' ? 'Completar código' : 'Escribir código';

        return `
            <div class="animate-fade-in max-w-4xl mx-auto">
                <!-- Cabecera de pregunta -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-sm ${answered ? 'text-emerald-400' : 'text-blue-400'} font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            ${typeLabel}
                        </span>
                        <span class="text-slate-500 text-sm">${nav.current}/${nav.total}</span>
                    </div>
                    <span class="text-yellow-400 text-sm font-semibold">${question.xp} XP</span>
                </div>

                <!-- Título y descripción -->
                <h2 class="text-xl font-bold text-slate-100 mb-2">${escapeHtml(question.title)}</h2>
                <p class="text-slate-400 mb-4">${escapeHtml(question.description)}</p>

                <!-- Editor de código -->
                <div class="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden mb-4">
                    <div class="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-red-500"></span>
                            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span class="text-slate-500 text-xs ml-2">main.py</span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="App.resetCode()" class="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-700" title="Reiniciar código">🔄 Reiniciar</button>
                        </div>
                    </div>
                    <textarea id="code-editor" class="code-editor w-full bg-slate-950 text-slate-100 p-4 border-0 resize-y min-h-[160px]" 
                        spellcheck="false" 
                        autocomplete="off"
                        data-original="${escapeAttr(question.code)}"
                    >${escapeHtml(question.code)}</textarea>
                </div>

                <!-- Botones de acción -->
                <div class="flex items-center gap-3 mb-4 flex-wrap">
                    <button id="check-btn" onclick="App.handleCheck()" 
                        class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                        <span>▶</span> Ejecutar
                    </button>
                    <button onclick="App.showHint()" 
                        class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-1">
                        💡 Pista
                    </button>
                    ${answered ? `<span class="text-emerald-400 text-sm font-medium">✅ Completada</span>` : ''}
                </div>

                <!-- Área de hint -->
                <div id="hint-area" class="mb-4"></div>

                <!-- Resultado -->
                <div id="result-area" class="bg-slate-800/80 rounded-xl p-4 border border-slate-700 min-h-[60px] mb-6">
                    <div class="text-slate-500 italic text-sm">Ejecutá tu código para ver el resultado acá.</div>
                </div>

                <!-- Navegación entre preguntas -->
                <div class="flex items-center justify-between">
                    <button onclick="App.prevQuestion()" ${nav.first ? 'disabled' : ''}
                        class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all ${nav.first ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'}">
                        ← Anterior
                    </button>
                    <div class="flex gap-1">
                        ${Array.from({ length: nav.total }, (_, i) => `
                            <button onclick="App.selectQuestion(${i})" 
                                class="w-8 h-8 rounded text-xs font-medium transition-all ${i === state.currentQuestionIndex ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
                                ${i + 1}
                            </button>
                        `).join('')}
                    </div>
                    <button onclick="App.nextQuestion()"
                        class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all text-slate-300 hover:bg-slate-800">
                        ${nav.last ? 'Volver a niveles' : 'Siguiente'} →
                    </button>
                </div>
            </div>
        `;
    }

    function renderQuestionNav() {
        // Actualiza solo el nav numérico si existe (cuando cambia de pregunta sin rerender completo)
        const navContainer = document.getElementById('question-nav');
        if (!navContainer) return;
        // No necesitamos actualizar porque render() ya lo hace completo
    }

    function renderLevelNav() {
        const nav = document.getElementById('level-nav');
        if (!nav) return;

        // Mostrar solo los niveles disponibles
        let html = `
            <div class="flex items-center justify-center gap-2 py-4 overflow-x-auto">
                <button onclick="App.goBackToLevels()" 
                    class="text-sm text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 whitespace-nowrap">
                    🏠 Niveles
                </button>
                ${LEVELS.map(level => {
                    const isUnlocked = level.id <= state.unlockedLevels;
                    const progress = getLevelProgress(level.id);
                    const isActive = level.id === state.currentLevel;
                    const isComplete = progress.total > 0 && progress.completed === progress.total;

                    let cls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ';
                    if (isActive) {
                        cls += 'bg-blue-600/20 text-blue-300 border border-blue-600/30 ';
                    } else if (isUnlocked && isComplete) {
                        cls += 'text-emerald-400 hover:bg-slate-800 ';
                    } else if (isUnlocked) {
                        cls += 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 ';
                    } else {
                        cls += 'text-slate-700 cursor-not-allowed ';
                    }

                    return `
                        <button onclick="App.selectLevel(${level.id})" ${!isUnlocked ? 'disabled' : ''}
                            class="${cls}">
                            ${isUnlocked && isComplete ? '✅' : level.icon}
                            <span class="hidden sm:inline">${level.title}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        nav.innerHTML = html;
    }

    // ============================================================
    // UTILIDADES
    // ============================================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        if (!text) return '';
        return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function setupEditorAutoResize() {
        const editor = document.getElementById('code-editor');
        if (!editor) return;

        editor.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        // Trigger inicial
        setTimeout(() => {
            editor.style.height = 'auto';
            editor.style.height = (editor.scrollHeight) + 'px';
        }, 50);
    }

    // ============================================================
    // TECLADO
    // ============================================================
    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter o Cmd+Enter para ejecutar
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (state.currentView === 'question') {
                    e.preventDefault();
                    handleCheck();
                }
            }
            // Escape para cerrar modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('level-modal');
                if (modal) {
                    App.closeModal();
                }
            }
        });
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    function init() {
        loadState();
        setupKeyboard();

        // Exponer funciones para onclick
        window.App.selectLevel = selectLevel;
        window.App.goBackToLevels = goBackToLevels;
        window.App.selectQuestion = selectQuestion;
        window.App.prevQuestion = prevQuestion;
        window.App.nextQuestion = nextQuestion;
        window.App.handleCheck = handleCheck;
        window.App.showHint = showHint;
        window.App.resetCode = resetCode;

        render();
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API pública para debugging
    // Devolvemos window.App para que const App === window.App,
    // y los onclick="App.xxx()" encuentren las funciones.
    window.App.getState = () => ({ ...state });
    return window.App;
})();
