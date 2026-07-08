// ============================================================
// app.js — Motor principal v3: Dashboard + Sidebar + Monaco
// ============================================================

const App = (() => {
    'use strict';

    const LEVELS = window.__LEVELS;
    const QUESTIONS = window.__QUESTIONS;
    const XP_CONFIG = window.__XP_CONFIG;

    // ── Estado ────────────────────────────────────────────────
    let state = {};
    let monacoEditor = null;
    let monacoLib = null;
    let monacoLoaded = false;
    let currentView = 'dashboard'; // track without side effects

    // ── Easter egg: clics en XP ───────────────────────────────
    let _xpClickCount = 0;
    let _xpClickTimer = null;

    function handleXpEasterEgg() {
        _xpClickCount++;
        if (_xpClickTimer) clearTimeout(_xpClickTimer);
        if (_xpClickCount >= 10) {
            _xpClickCount = 0;
            state.unlockedLevels = LEVELS.length;
            if (state.currentLevel > state.unlockedLevels) {
                state.currentLevel = state.unlockedLevels;
            }
            StateModule.saveState();
            Toast.show('🔓 ¡Todos los niveles desbloqueados!', 'info', 4000);
            renderSidebar();
            renderHeader();
            return;
        }
        _xpClickTimer = setTimeout(() => { _xpClickCount = 0; }, 2000);
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        try { StateModule.loadState(); } catch (e) { console.warn('loadState:', e); }
        state = StateModule.getState();
        // Ensure dashboard exists as view option
        if (!['dashboard', 'levels', 'question'].includes(state.currentView)) {
            state.currentView = 'dashboard';
        }
        currentView = state.currentView;
        try { setupKeyboard(); } catch (e) { console.warn('setupKeyboard:', e); }
        exposeGlobals();
        try { render(); } catch (e) { console.error('render:', e); }
    }

    // Exponer `App` inmediatamente para que los handlers `onclick="App.*"`
    // nunca fallen con "Cannot read properties of undefined", aunque init()
    // se interrumpa por un error.
    exposeGlobals();

    function exposeGlobals() {
        window.App = {
            goToDashboard, selectLevel, goBackToLevels,
            selectQuestion, prevQuestion, nextQuestion,
            handleCheck, showHint, resetCode, resetProgress,
            continueToNextLevel, closeModal, toggleHint,
            handleXpEasterEgg,
        };
    }

    // ── Toast System ──────────────────────────────────────────
    const Toast = {
        _queue: [],
        _timeouts: new Map(),

        show(message, type = 'success', duration = 3000) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const iconMap = {
                success: 'check-circle', error: 'x-circle', info: 'lightbulb', xp: 'star',
            };

            const el = document.createElement('div');
            el.className = `toast toast-${type}`;
            el.innerHTML = `
                <i data-lucide="${iconMap[type] || 'info'}" class="text-lg shrink-0"></i>
                <span class="text-sm text-slate-200 flex-1">${message}</span>
            `;
            container.appendChild(el);
            refreshIcons();

            const tid = setTimeout(() => {
                el.classList.add('removing');
                setTimeout(() => el.remove(), 300);
                this._timeouts.delete(el);
            }, duration);

            this._timeouts.set(el, tid);
        },

        xp(amount) {
            this.show(`+${amount} XP`, 'xp', 2500);
        },

        error(message) {
            this.show(message, 'error', 4000);
        },
    };

    // ── Navegación ────────────────────────────────────────────
    function goToDashboard() {
        disposeMonaco();
        state.currentView = 'dashboard';
        StateModule.saveState();
        render();
    }

    function selectLevel(levelId) {
        const level = LEVELS.find(l => l.id === levelId);
        if (!level || levelId > state.unlockedLevels) return;
        disposeMonaco();
        state.currentLevel = levelId;
        state.currentQuestionIndex = 0;
        state.currentView = 'question';
        StateModule.saveState();
        render();
    }

    function goBackToLevels() {
        disposeMonaco();
        state.currentView = 'levels';
        StateModule.saveState();
        render();
    }

    function selectQuestion(index) {
        const questions = getLevelQuestions();
        if (index < 0 || index >= questions.length) return;
        disposeMonaco();
        state.currentQuestionIndex = index;
        StateModule.saveState();
        render();
    }

    function prevQuestion() {
        if (state.currentQuestionIndex > 0) {
            disposeMonaco();
            state.currentQuestionIndex--;
            StateModule.saveState();
            render();
        }
    }

    function nextQuestion() {
        const questions = getLevelQuestions();
        if (state.currentQuestionIndex < questions.length - 1) {
            disposeMonaco();
            state.currentQuestionIndex++;
            StateModule.saveState();
            render();
        } else {
            goBackToLevels();
        }
    }

    // ── Helpers de datos ─────────────────────────────────────
    function getLevelQuestions() {
        return QUESTIONS.filter(q => q.level === state.currentLevel);
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
        return StateModule.getLevelProgress(levelId);
    }

    function getQuestionNavState() {
        const questions = getLevelQuestions();
        const idx = state.currentQuestionIndex;
        return { first: idx === 0, last: idx === questions.length - 1, current: idx + 1, total: questions.length };
    }

    function canUnlockNextLevel() {
        const nextLevel = LEVELS.find(l => l.id === state.unlockedLevels + 1);
        return nextLevel ? state.xp >= nextLevel.xpRequired : false;
    }

    function getNextLevelXP() {
        const nextLevel = LEVELS.find(l => l.id === state.unlockedLevels + 1);
        return nextLevel ? nextLevel.xpRequired : null;
    }

    function getTotalStats() {
        const total = QUESTIONS.length;
        const answered = state.answeredQuestions.length;
        const completedLevels = LEVELS.filter(l => {
            const p = getLevelProgress(l.id);
            return p.total > 0 && p.completed === p.total;
        }).length;
        const hintsCount = state.hintsUsed.length;
        return { total, answered, completedLevels, hintsCount, xp: state.xp };
    }

    function getLevelColorCode(color) {
        const map = { blue: '#3b82f6', emerald: '#10b981', violet: '#8b5cf6', amber: '#f59e0b', rose: '#f43f5e', cyan: '#06b6d4' };
        return map[color] || '#3b82f6';
    }

    function getLevelColorClass(color) {
        const map = { blue: 'level-blue', emerald: 'level-emerald', violet: 'level-violet', amber: 'level-amber', rose: 'level-rose', cyan: 'level-cyan' };
        return map[color] || 'level-blue';
    }

    function getLevelBorderClass(color) {
        const map = { blue: 'level-border-blue', emerald: 'level-border-emerald', violet: 'level-border-violet', amber: 'level-border-amber', rose: 'level-border-rose', cyan: 'level-border-cyan' };
        return map[color] || 'level-border-blue';
    }

    function getLevelGlowClass(color) {
        const map = { blue: 'level-glow-blue', emerald: 'level-glow-emerald', violet: 'level-glow-violet', amber: 'level-glow-amber', rose: 'level-glow-rose', cyan: 'level-glow-cyan' };
        return map[color] || 'level-glow-blue';
    }

    // ── MONACO EDITOR ────────────────────────────────────────
    async function loadMonaco(containerId, code, readOnly = false) {
        if (monacoLoaded && monacoEditor) {
            monacoEditor.setValue(code);
            // Focus the editor
            monacoEditor.focus();
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Show skeleton
        container.innerHTML = '<div class="monaco-skeleton w-full h-full rounded-lg"></div>';

        try {
            monacoLib = await import('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/+esm');

            // Clear skeleton
            container.innerHTML = '';

            monacoEditor = monacoLib.editor.create(container, {
                value: code,
                language: 'python',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                readOnly: readOnly,
                domReadOnly: readOnly,
            });

            monacoLoaded = true;

            if (!readOnly) {
                // Ctrl+Enter binding (only in editable modes)
                monacoEditor.addAction({
                    id: 'run-code',
                    label: 'Ejecutar código',
                    keybindings: [monacoLib.KeyMod.CtrlCmd | monacoLib.KeyCode.Enter],
                    run: () => handleCheck(),
                });
                monacoEditor.focus();
            }

            // Dynamic height — update on content changes
            monacoEditor.onDidChangeModelContent(() => updateMonacoHeight());
            updateMonacoHeight();
        } catch (e) {
            console.warn('Monaco falló, usando textarea:', e);
            container.innerHTML = '';
            const textarea = document.getElementById('code-editor');
            if (textarea) {
                textarea.classList.remove('hidden');
                textarea.value = code;
            }
        }
    }

    function updateMonacoHeight() {
        if (!monacoEditor) return;
        const container = document.getElementById('monaco-container');
        if (!container) return;
        const model = monacoEditor.getModel();
        if (!model) return;
        const question = getCurrentQuestion();
        const minHeight = question?.type === 'write' ? 200 : 80;
        const lineCount = model.getLineCount();
        const lineHeight = 20;
        const padding = 24;
        const newHeight = Math.max(minHeight, lineCount * lineHeight + padding);
        container.style.height = newHeight + 'px';
        monacoEditor.layout();
    }

    function disposeMonaco() {
        if (monacoEditor) {
            monacoEditor.dispose();
            monacoEditor = null;
            monacoLoaded = false;
        }
    }

    function getEditorCode() {
        if (monacoEditor) return monacoEditor.getValue();
        const editor = document.getElementById('code-editor');
        return editor ? editor.value : '';
    }

    function setEditorCode(code) {
        if (monacoEditor) monacoEditor.setValue(code);
        else {
            const editor = document.getElementById('code-editor');
            if (editor) editor.value = code;
        }
    }

    // ── CHECKER ──────────────────────────────────────────────
    async function handleCheck() {
        const question = getCurrentQuestion();
        if (!question) return;

        const resultArea = document.getElementById('result-area');
        const checkBtn = document.getElementById('check-btn');
        if (!resultArea || !checkBtn) return;

        const userCode = getEditorCode();

        checkBtn.disabled = true;
        checkBtn.innerHTML = '<span class="inline-block animate-pulse"><i data-lucide="hourglass"></i></span> Ejecutando...';
        resultArea.innerHTML = '<div class="text-slate-500 italic text-sm">Ejecutando código...</div>';

        let result;
        if (question.type === 'fill') result = await Checker.checkFill(question, userCode);
        else if (question.type === 'write') result = await Checker.checkWrite(question, userCode);
        else if (question.type === 'predict') {
            const predInput = document.getElementById('predict-input');
            const userPrediction = predInput ? predInput.value : '';
            result = await Checker.checkPredict(question, userPrediction);
        }

        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i data-lucide="play"></i> Ejecutar';

        if (result.passed) {
            if (!isQuestionAnswered(question.id)) {
                state.answeredQuestions.push(String(question.id));
                state.xp += question.xp;
                StateModule.saveState();
            }

            const progress = getLevelProgress(state.currentLevel);
            const levelComplete = progress.completed === progress.total;
            const showLevelComplete = levelComplete && !state.levelCompletedShown.includes(state.currentLevel);

            renderResult(result, 'success');
            Toast.xp(question.xp);

            if (showLevelComplete) {
                state.levelCompletedShown.push(state.currentLevel);
                if (canUnlockNextLevel()) {
                    state.unlockedLevels++;
                    StateModule.saveState();
                }
                setTimeout(() => showLevelCompleteModal(), 800);
            }
        } else {
            renderResult(result, 'error');
            const editorEl = document.getElementById('monaco-container') || document.getElementById('code-editor');
            if (editorEl) {
                editorEl.classList.add('animate-shake');
                setTimeout(() => editorEl.classList.remove('animate-shake'), 500);
            }
        }

        renderSidebar();
        renderHeader();
        refreshIcons();
    }

    // ── HINT ─────────────────────────────────────────────────
    function toggleHint() {
        const content = document.getElementById('hint-content');
        const btn = document.getElementById('hint-btn');
        if (!content || !btn) return;

        const isOpen = content.classList.contains('open');
        content.classList.toggle('open');
        btn.innerHTML = `<i data-lucide="lightbulb"></i> ${isOpen ? 'Ocultar pista' : 'Mostrar pista'}`;
        refreshIcons();

        // Mark as used when first opened
        const question = getCurrentQuestion();
        if (!isOpen && question && !isHintUsed(question.id)) {
            state.hintsUsed.push(question.id);
            StateModule.saveState();
        }

        // Update Monaco height after hint toggle
        setTimeout(updateMonacoHeight, 350);
    }

    function showHint() {
        // Legacy — open the toggle
        const content = document.getElementById('hint-content');
        const btn = document.getElementById('hint-btn');
        if (content && !content.classList.contains('open')) {
            toggleHint();
        }
    }

    // ── RESET CODE ───────────────────────────────────────────
    function resetCode() {
        const question = getCurrentQuestion();
        if (!question) return;

        if (question.type === 'predict') {
            const predInput = document.getElementById('predict-input');
            if (predInput) predInput.value = '';
        } else {
            setEditorCode(question.code);
        }

        const resultArea = document.getElementById('result-area');
        if (resultArea) resultArea.innerHTML = '<div class="text-slate-500 italic text-sm">Ejecutá tu código para ver el resultado acá.</div>';
        // Close hint
        const content = document.getElementById('hint-content');
        const btn = document.getElementById('hint-btn');
        if (content) content.classList.remove('open');
        if (btn) { btn.innerHTML = '<i data-lucide="lightbulb"></i> Mostrar pista'; }
        refreshIcons();
    }

    // ── MODAL ────────────────────────────────────────────────
    function showLevelCompleteModal() {
        const level = LEVELS.find(l => l.id === state.currentLevel);
        const nextLevel = LEVELS.find(l => l.id === state.currentLevel + 1);
        const progress = getLevelProgress(state.currentLevel);

        state.xp += XP_CONFIG.levelCompleteBonus;
        StateModule.saveState();

        const modal = document.createElement('div');
        modal.id = 'level-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in';
        modal.innerHTML = `
            <div class="glass-panel rounded-2xl p-8 max-w-md mx-4 text-center animate-slide-up shadow-2xl">
                <div class="text-5xl mb-4"><i data-lucide="party-popper" class="inline-block" style="width:48px;height:48px"></i></div>
                <h2 class="text-2xl font-bold text-slate-100 mb-2">¡Nivel completado!</h2>
                <p class="text-slate-400 mb-1">${escapeHtml(level.title)}</p>
                <p class="text-emerald-400 font-semibold text-lg mb-4">${progress.completed}/${progress.total} preguntas correctas</p>
                <div class="flex items-center justify-center gap-2 text-yellow-400 mb-6">
                    <i data-lucide="star" class="inline-block" style="width:28px;height:28px"></i>
                    <span class="font-bold text-xl">+${XP_CONFIG.levelCompleteBonus} XP</span>
                </div>
                ${nextLevel ? `
                    <p class="text-slate-300 mb-2">¡Nuevo nivel: <strong>${escapeHtml(nextLevel.title)}</strong>!</p>
                    <p class="text-sm text-slate-500 mb-6">${escapeHtml(nextLevel.description)}</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="App.continueToNextLevel()" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">Siguiente nivel →</button>
                        <button onclick="App.closeModal()" class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2.5 rounded-lg font-semibold transition-all">Seguir practicando</button>
                    </div>
                ` : `
                    <p class="text-yellow-400 font-bold text-lg mb-6">¡Completaste TODOS los niveles! <i data-lucide="trophy" class="inline-block text-yellow-400" style="width:22px;height:22px"></i></p>
                    <button onclick="App.closeModal()" class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">¡Volver al inicio!</button>
                `}
            </div>`;
        document.body.appendChild(modal);
        refreshIcons();

        Toast.xp(XP_CONFIG.levelCompleteBonus);
    }

    function continueToNextLevel() {
        const modal = document.getElementById('level-modal');
        if (modal) modal.remove();
        disposeMonaco();
        if (state.currentLevel < LEVELS.length) {
            state.currentLevel++;
            state.currentQuestionIndex = 0;
        state.currentView = 'question';
            StateModule.saveState();
            render();
        } else {
            window.removeEventListener('resize', updateMonacoHeight);
        }

        // Focus the predict input after render
        if (state.currentView === 'question') {
            const question = getCurrentQuestion();
            if (question && question.type === 'predict') {
                setTimeout(() => {
                    const input = document.getElementById('predict-input');
                    if (input) input.focus();
                }, 300);
            }
        }
    }

    function closeModal() {
        const modal = document.getElementById('level-modal');
        if (modal) modal.remove();
        render();
    }

    function resetProgress() {
        if (confirm('¿Estás seguro? Todo tu progreso se borrará.')) {
            disposeMonaco();
            StateModule.resetState();
            state = StateModule.getState();
            state.currentView = 'dashboard';
            render();
        }
    }

    // ── RENDER PRINCIPAL ─────────────────────────────────────
    function render() {
        const prevView = currentView;
        currentView = state.currentView;

        renderSidebar();
        renderHeader();

        const main = document.getElementById('main-content');
        if (!main) return;

        // Animation class based on navigation direction
        const animClass = getTransitionClass(prevView, currentView);

        if (state.currentView === 'dashboard') {
            main.innerHTML = `<div class="${animClass}">${renderDashboard()}</div>`;
        } else if (state.currentView === 'levels') {
            main.innerHTML = `<div class="${animClass}">${renderLevelSelect()}</div>`;
        } else {
            main.innerHTML = `<div class="${animClass}">${renderQuestionView()}</div>`;
        }

        refreshIcons();

        // Post-render hooks
        if (state.currentView === 'question') {
            const question = getCurrentQuestion();
            if (!question) return;

            loadMonaco('monaco-container', question.code, question.type === 'predict');

            // Update Monaco height on resize
            window.addEventListener('resize', updateMonacoHeight);
        } else {
            window.removeEventListener('resize', updateMonacoHeight);
        }
    }

    function getTransitionClass(from, to) {
        // Simple direction-based animation
        const views = ['dashboard', 'levels', 'question'];
        const fromIdx = views.indexOf(from);
        const toIdx = views.indexOf(to);
        if (from === to || fromIdx === -1 || toIdx === -1) return 'animate-fade-in';
        return toIdx > fromIdx ? 'animate-slide-in-right' : 'animate-slide-in-left';
    }

    // ── SIDEBAR ──────────────────────────────────────────────
    function renderSidebar() {
        const nav = document.getElementById('sidebar-items');
        const footer = document.getElementById('sidebar-footer');
        if (!nav) return;

        // Dashboard item
        const isDashboard = state.currentView === 'dashboard';
        nav.innerHTML = `
            <div class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${isDashboard ? 'active' : ''}"
                 onclick="App.goToDashboard()" role="button">
                <i data-lucide="home" class="shrink-0 sidebar-icon" style="width:20px;height:20px"></i>
                <span class="sidebar-text text-sm font-medium ${isDashboard ? 'text-blue-300' : 'text-slate-300'}">Dashboard</span>
            </div>
            <div class="border-t border-slate-700/20 my-2"></div>
            ${LEVELS.map(level => {
                const isUnlocked = level.id <= state.unlockedLevels;
                const progress = getLevelProgress(level.id);
                const isActive = state.currentView !== 'dashboard' && state.currentLevel === level.id;
                const isComplete = progress.total > 0 && progress.completed === progress.total;

                let cls = 'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ';
                if (isActive) cls += `active ${getLevelColorClass(level.color)} `;
                else if (!isUnlocked) cls += 'opacity-40 cursor-not-allowed ';
                else cls += 'hover:bg-slate-700/30 ';

                const color = getLevelColorCode(level.color);
                const pct = progress.percent;

                return `
                    <div class="${cls}" onclick="${isUnlocked ? `App.selectLevel(${level.id})` : ''}" role="button">
                        ${isComplete
                            ? '<i data-lucide="check-circle" class="shrink-0 sidebar-icon text-emerald-400" style="width:18px;height:18px"></i>'
                            : `<i data-lucide="${level.icon}" class="shrink-0 sidebar-icon" style="width:18px;height:18px"></i>`}
                        <div class="flex-1 min-w-0 sidebar-text">
                            <div class="flex items-center justify-between">
                                <span class="text-sm ${isActive ? 'text-slate-100 font-medium' : isUnlocked ? 'text-slate-300' : 'text-slate-500'} truncate">
                                    ${escapeHtml(level.title)}
                                </span>
                                ${isUnlocked ? `<span class="text-xs text-slate-500 ml-1">${progress.completed}/${progress.total}</span>` : ''}
                            </div>
                            ${isUnlocked ? `
                                <div class="sidebar-progress-wrap mt-1">
                                    <div class="sidebar-progress">
                                        <div class="sidebar-progress-fill" style="width:${pct}%;background:${color}"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>`;
            }).join('')}
        `;

        // Sidebar footer
        if (footer) {
            const nextXP = getNextLevelXP();
            footer.innerHTML = `
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="star" class="text-yellow-400" style="width:16px;height:16px"></i>
                    <span class="sidebar-xp-text text-yellow-400 font-semibold text-sm" onclick="App.handleXpEasterEgg()" style="cursor:pointer" title="Hacé clic 10 veces rápido para desbloquear todo">${state.xp} XP</span>
                    ${nextXP ? `<span class="sidebar-xp-text text-slate-500 text-xs ml-auto">${state.xp}/${nextXP}</span>` : ''}
                </div>
                ${nextXP ? `
                    <div class="sidebar-progress mb-2">
                        <div class="sidebar-progress-fill" style="width:${Math.min(100, Math.round((state.xp / nextXP) * 100))}%;background:#facc15"></div>
                    </div>
                ` : ''}
                <button onclick="App.resetProgress()" class="sidebar-xp-text text-xs text-slate-600 hover:text-red-400 transition-colors w-full text-left"><i data-lucide="refresh-cw" style="width:12px;height:12px" class="inline-block mr-1"></i>Reiniciar progreso</button>
            `;
        }
        refreshIcons();
    }

    // ── HEADER ───────────────────────────────────────────────
    function renderHeader() {
        const header = document.getElementById('app-header');
        if (!header) return;

        const level = LEVELS.find(l => l.id === state.currentLevel);
        const stats = getTotalStats();

        let centerHtml = '';
        if (state.currentView === 'dashboard') {
            centerHtml = `<span class="text-slate-200 font-semibold">Dashboard</span>`;
        } else if (state.currentView === 'question' && level) {
            const progress = getLevelProgress(state.currentLevel);
            centerHtml = `
                <i data-lucide="${level.icon}" style="width:18px;height:18px" class="text-slate-400"></i>
                <span class="text-slate-200 font-medium text-sm">${escapeHtml(level.title)}</span>
                <span class="text-slate-500 text-xs">${progress.completed}/${progress.total}</span>`;
        } else if (state.currentView === 'levels') {
            centerHtml = `<span class="text-slate-200 font-semibold">Niveles</span>`;
        }

        header.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    ${centerHtml}
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 text-sm">
                        <i data-lucide="star" class="text-yellow-400" style="width:16px;height:16px"></i>
                        <span class="text-yellow-400 font-semibold">${state.xp} XP</span>
                        <div class="hidden sm:block bg-slate-700 rounded-full h-2 w-20">
                            ${(() => {
                                const nextXP = getNextLevelXP();
                                if (nextXP) {
                                    const pct = Math.min(100, Math.round((state.xp / nextXP) * 100));
                                    return `<div class="bg-yellow-400 h-2 rounded-full transition-all duration-500" style="width:${pct}%"></div>`;
                                }
                                return '';
                            })()}
                        </div>
                    </div>
                    ${state.currentView !== 'dashboard' ? `
                        <button onclick="App.goToDashboard()" class="text-xs text-slate-500 hover:text-slate-300 transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                            <i data-lucide="bar-chart-3" style="width:14px;height:14px"></i> Dashboard
                        </button>
                    ` : ''}
                </div>
            </div>`;
        refreshIcons();
    }

    // ── DASHBOARD ────────────────────────────────────────────
    function renderDashboard() {
        const stats = getTotalStats();
        const pct = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;

        return `
            <div class="max-w-3xl mx-auto py-8 px-4 lg:px-6">
                <!-- Hero -->
                <div class="mb-8 animate-fade-in-up">
                    <h1 class="text-3xl font-bold text-slate-100 mb-2">
                        ${stats.answered > 0 ? '<i data-lucide="hand" class="inline-block" style="width:32px;height:32px"></i> ¡Bienvenido de vuelta!' : '<i data-lucide="code-2" class="inline-block" style="width:32px;height:32px"></i> ¡Empezá a aprender Python!'}
                    </h1>
                    <p class="text-slate-400">
                        ${stats.answered > 0
                            ? `Tenés <span class="text-yellow-400 font-semibold">${stats.xp} XP</span> · ${stats.answered}/${stats.total} preguntas respondidas · ${stats.completedLevels}/${LEVELS.length} niveles completados`
                            : 'Resolvé ejercicios interactivos y aprendé Python paso a paso'}
                    </p>
                </div>

                <!-- Stats Cards -->
                <div class="stat-cards grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    ${[
                        { icon: 'star', value: stats.xp, label: 'XP Total', color: 'text-yellow-400' },
                        { icon: 'check-circle', value: `${stats.answered}/${stats.total}`, label: 'Preguntas', color: 'text-emerald-400' },
                        { icon: 'trophy', value: `${stats.completedLevels}/${LEVELS.length}`, label: 'Niveles', color: 'text-blue-400' },
                        { icon: 'lightbulb', value: stats.hintsCount, label: 'Pistas usadas', color: 'text-violet-400' },
                    ].map(card => `
                        <div class="stat-card glass-card rounded-xl p-4 text-center">
                            <i data-lucide="${card.icon}" class="inline-block mb-1" style="width:28px;height:28px;stroke-width:1.5"></i>
                            <div class="text-xl font-bold ${card.color}">${card.value}</div>
                            <div class="text-xs text-slate-500 mt-0.5">${card.label}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Overall Progress -->
                <div class="glass-panel rounded-xl p-5 mb-8">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-sm font-semibold text-slate-200">Progreso general</h2>
                        <span class="text-sm text-slate-400">${pct}%</span>
                    </div>
                    <div class="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-1000" style="width:${pct}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500 mt-2">
                        <span>${stats.answered} completadas</span>
                        <span>${stats.total} total</span>
                    </div>
                </div>

                <!-- Level Timeline -->
                <h2 class="text-lg font-semibold text-slate-200 mb-4">Tus niveles</h2>
                <div class="space-y-3">
                    ${LEVELS.map((level, idx) => {
                        const isUnlocked = level.id <= state.unlockedLevels;
                        const progress = getLevelProgress(level.id);
                        const isComplete = progress.total > 0 && progress.completed === progress.total;
                        const color = getLevelColorCode(level.color);
                        const borderCls = getLevelBorderClass(level.color);
                        const glowCls = getLevelGlowClass(level.color);
                        const isCurrent = level.id === state.currentLevel && state.currentView === 'question';

                        let statusIcon = 'lock';
                        let statusLabel = 'Bloqueado';
                        if (isComplete) { statusIcon = 'check-circle'; statusLabel = 'Completado'; }
                        else if (isUnlocked) { statusIcon = 'play'; statusLabel = 'Disponible'; }

                        return `
                            <div class="glass-card rounded-xl p-4 ${isUnlocked ? 'cursor-pointer hover:bg-slate-700/30 transition-all' : 'opacity-50'} ${isComplete ? glowCls : ''} ${isCurrent ? 'ring-2 ' + borderCls : ''}"
                                 ${isUnlocked ? `onclick="App.selectLevel(${level.id})" role="button"` : ''}>
                                <div class="flex items-center gap-4">
                                    <!-- Progress Ring -->
                                    <div class="relative shrink-0">
                                        <svg width="44" height="44" class="transform -rotate-90">
                                            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(71,85,105,0.4)" stroke-width="3"/>
                                            ${isUnlocked ? `
                                                <circle cx="22" cy="22" r="18" fill="none" stroke="${color}" stroke-width="3"
                                                    stroke-dasharray="${2 * Math.PI * 18}" stroke-dashoffset="${2 * Math.PI * 18 * (1 - progress.percent / 100)}"
                                                    class="progress-ring-circle"/>
                                            ` : ''}
                                        </svg>
                                        <span class="absolute inset-0 flex items-center justify-center"><i data-lucide="${level.icon}" style="width:16px;height:16px"></i></span>
                                    </div>
                                    <!-- Info -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold text-slate-200 text-sm">${escapeHtml(level.title)}</h3>
                                            <span class="text-xs px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-900/40 text-emerald-300' : isUnlocked ? 'bg-blue-900/40 text-blue-300' : 'bg-slate-800 text-slate-500'}">${statusLabel}</span>
                                        </div>
                                        <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(level.subtitle)}</p>
                                        ${isUnlocked ? `
                                            <div class="flex items-center gap-2 mt-2">
                                                <div class="flex-1 bg-slate-700/50 rounded-full h-1.5">
                                                    <div class="h-1.5 rounded-full transition-all duration-700" style="width:${progress.percent}%;background:${color}"></div>
                                                </div>
                                                <span class="text-xs text-slate-500">${progress.completed}/${progress.total}</span>
                                            </div>
                                        ` : `
                                            <div class="text-xs text-slate-600 mt-1">Requiere ${level.xpRequired} XP</div>
                                        `}
                                    </div>
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    // ── LEVEL SELECT ─────────────────────────────────────────
    function renderLevelSelect() {
        return `
            <div class="max-w-4xl mx-auto py-6 px-4">
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-slate-100 mb-1"><i data-lucide="code-2" class="inline-block" style="width:28px;height:28px"></i> PyTrainer</h1>
                    <p class="text-slate-400 text-sm">Seleccioná un nivel para practicar</p>
                    <p class="text-yellow-400 font-semibold text-sm mt-1"><i data-lucide="star" class="inline-block" style="width:16px;height:16px"></i> ${state.xp} XP totales</p>
                </div>
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    ${LEVELS.map(level => {
                        const isUnlocked = level.id <= state.unlockedLevels;
                        const progress = getLevelProgress(level.id);
                        const isComplete = progress.total > 0 && progress.completed === progress.total;
                        const color = getLevelColorCode(level.color);
                        const borderCls = getLevelBorderClass(level.color);
                        const glowCls = getLevelGlowClass(level.color);

                        let cardClasses = 'level-card rounded-xl p-5 border transition-all relative overflow-hidden ';
                        if (!isUnlocked) cardClasses += 'locked bg-slate-800/30 border-slate-700/30 ';
                        else if (isComplete) cardClasses += `bg-slate-800/60 ${borderCls} ${glowCls} `;
                        else cardClasses += `bg-slate-800/60 border-slate-700/40 hover:border-slate-500 `;

                        return `
                            <div class="${cardClasses}" ${isUnlocked ? `onclick="App.selectLevel(${level.id})" role="button"` : ''}>
                                ${isComplete ? '<div class="absolute top-2 right-2 text-emerald-400"><i data-lucide="check-circle" style="width:22px;height:22px"></i></div>' : ''}
                                ${!isUnlocked ? '<div class="absolute top-2 right-2 text-slate-600"><i data-lucide="lock" style="width:22px;height:22px"></i></div>' : ''}
                                <div class="flex items-center gap-3 mb-3">
                                    <i data-lucide="${level.icon}" style="width:32px;height:32px" class="shrink-0"></i>
                                    <div>
                                        <h3 class="font-semibold text-slate-100">${escapeHtml(level.title)}</h3>
                                        <p class="text-xs text-slate-500">${escapeHtml(level.subtitle)}</p>
                                    </div>
                                </div>
                                <p class="text-sm text-slate-400 mb-3 line-clamp-2">${escapeHtml(level.description)}</p>
                                ${isUnlocked ? `
                                    <div class="flex items-center gap-2 text-xs">
                                        <div class="flex-1 bg-slate-700/50 rounded-full h-2">
                                            <div class="h-2 rounded-full transition-all duration-500" style="width:${progress.percent}%;background:${color}"></div>
                                        </div>
                                        <span class="text-slate-400 whitespace-nowrap">${progress.completed}/${progress.total}</span>
                                    </div>
                                ` : `
                                    <div class="text-xs text-slate-600">Requiere ${level.xpRequired} XP · Tenés ${state.xp}</div>
                                `}
                                ${isComplete ? `<div class="mt-2 text-xs text-emerald-400">Completado <i data-lucide="sparkles" class="inline-block" style="width:12px;height:12px"></i></div>` : ''}
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    // ── QUESTION VIEW ────────────────────────────────────────
    function renderQuestionView() {
        const question = getCurrentQuestion();
        if (!question) return '<div class="text-center text-slate-400 py-12 animate-fade-in">No hay preguntas en este nivel.</div>';

        const nav = getQuestionNavState();
        const answered = isQuestionAnswered(question.id);
        let typeLabel, typeColor, typeDot;
        if (question.type === 'fill') {
            typeLabel = 'Completar código';
            typeColor = 'text-blue-400 border-blue-700/30 bg-blue-900/20';
            typeDot = '<i data-lucide="text-cursor-input" style="width:14px;height:14px" class="inline-block align-middle"></i>';
        } else if (question.type === 'write') {
            typeLabel = 'Escribir código';
            typeColor = 'text-violet-400 border-violet-700/30 bg-violet-900/20';
            typeDot = '<i data-lucide="pencil" style="width:14px;height:14px" class="inline-block align-middle"></i>';
        } else {
            typeLabel = 'Predecir salida';
            typeColor = 'text-cyan-400 border-cyan-700/30 bg-cyan-900/20';
            typeDot = '<i data-lucide="scan-eye" style="width:14px;height:14px" class="inline-block align-middle"></i>';
        }
        const hintAlreadyUsed = isHintUsed(question.id);

        return `
            <div class="max-w-4xl mx-auto py-4 px-4 lg:px-6 flex flex-col" style="min-height: calc(100vh - 64px);">
                <!-- Info Bar -->
                <div class="flex items-center justify-between mb-4 shrink-0">
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${typeColor}">${typeDot} ${typeLabel}</span>
                        <span class="text-slate-500 text-xs">${nav.current}/${nav.total}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        ${answered ? '<span class="text-emerald-400 text-xs font-medium inline-flex items-center gap-1"><i data-lucide="check-circle" style="width:14px;height:14px"></i> Completada</span>' : ''}
                        <span class="text-yellow-400 text-xs font-semibold bg-yellow-900/20 px-2 py-1 rounded-full">+${question.xp} XP</span>
                    </div>
                </div>

                <!-- Title + Description -->
                <h2 class="text-lg font-bold text-slate-100 mb-1 shrink-0">${escapeHtml(question.title)}</h2>
                <p class="text-sm text-slate-400 mb-4 shrink-0">${escapeHtml(question.description)}</p>

                <!-- Monaco Editor -->
                <div class="rounded-xl border border-slate-700/50 overflow-hidden mb-3 flex flex-col">
                    <div class="flex items-center justify-between bg-slate-800/80 px-4 py-2 border-b border-slate-700/30 shrink-0">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                            <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                            <span class="text-slate-500 text-xs ml-2 font-mono">main.py</span>
                        </div>
                        <button onclick="App.resetCode()" class="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-700/50 inline-flex items-center gap-1"><i data-lucide="refresh-cw" style="width:12px;height:12px"></i> Reiniciar</button>
                    </div>
                    <div id="monaco-container" class="min-h-[80px]"></div>
                    <textarea id="code-editor" class="code-editor w-full bg-slate-950 text-slate-100 p-4 border-0 resize-y min-h-[160px] hidden"
                        spellcheck="false" autocomplete="off">${escapeHtml(question.code)}</textarea>
                </div>

                ${question.type === 'predict' ? `
                <!-- Predict Input -->
                <div class="mb-3 shrink-0">
                    <label for="predict-input" class="text-sm text-slate-300 font-medium mb-1.5 block">
                        <i data-lucide="help-circle" style="width:16px;height:16px" class="inline-block align-text-bottom mr-1"></i>
                        ¿Cuál es la salida del programa?
                    </label>
                    <input id="predict-input" type="text"
                        class="w-full bg-slate-800/60 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
                        placeholder="Escribí acá la salida que esperás..."
                        autocomplete="off" spellcheck="false">
                </div>
                ` : ''}

                <!-- Actions Row -->
                <div class="flex items-center gap-3 mb-3 shrink-0 flex-wrap">
                    <button id="check-btn" onclick="App.handleCheck()"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-wait">
                        <i data-lucide="play" style="width:16px;height:16px"></i> Ejecutar
                    </button>
                    <button id="hint-btn" onclick="App.toggleHint()"
                        class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 bg-transparent hover:bg-slate-700/30 text-slate-400 hover:text-slate-300 border border-transparent hover:border-slate-600/30">
                        <i data-lucide="lightbulb" style="width:14px;height:14px"></i> ${hintAlreadyUsed ? 'Ocultar pista' : 'Mostrar pista'}
                    </button>
                    <span class="text-xs text-slate-600 ml-auto hidden sm:block">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter para ejecutar</span>
                </div>

                <!-- Hint Area (collapsible) -->
                <div id="hint-content" class="hint-content mb-3 ${hintAlreadyUsed ? 'open' : ''}">
                    <div class="glass-panel rounded-lg p-4 border-l-4 border-blue-500/50">
                        <div class="flex items-center gap-2 text-blue-300 font-semibold text-sm mb-1">
                            <i data-lucide="lightbulb" style="width:16px;height:16px"></i> Pista
                        </div>
                        <p class="text-slate-300 text-sm whitespace-pre-line">${escapeHtml(question.hint)}</p>
                    </div>
                </div>

                <!-- Result Area -->
                <div id="result-area" class="glass-card rounded-xl p-4 min-h-[56px] mb-3 shrink-0">
                    <div class="text-slate-500 italic text-sm">Ejecutá tu código para ver el resultado acá.</div>
                </div>

                <!-- Bottom Navigation -->
                <div class="flex items-center justify-between py-3 border-t border-slate-700/20 shrink-0">
                    <button onclick="App.prevQuestion()" ${nav.first ? 'disabled' : ''}
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-700/30 disabled:hover:border-slate-600/30 disabled:hover:shadow-none">
                        ← Anterior
                    </button>
                    <div class="question-nav-dots flex gap-1">
                        ${Array.from({ length: Math.min(nav.total, 15) }, (_, i) => `
                            <button onclick="App.selectQuestion(${i})"
                                class="w-7 h-7 rounded text-xs font-medium transition-all ${i === state.currentQuestionIndex ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
                                ${i + 1}
                            </button>`).join('')}
                        ${nav.total > 15 ? '<span class="text-slate-600 text-xs self-center">...</span>' : ''}
                    </div>
                    <button onclick="App.nextQuestion()"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10">
                        ${nav.last ? 'Volver a niveles' : 'Siguiente'} →
                    </button>
                </div>
            </div>`;
    }

    // ── RESULT RENDER ────────────────────────────────────────
    function renderResult(result, type) {
        const resultArea = document.getElementById('result-area');
        if (!resultArea) return;

        if (type === 'success') {
            resultArea.innerHTML = `
                <div class="animate-fade-in">
                    <div class="flex items-center gap-3 mb-2">
                        <svg class="checkmark" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="25" fill="none"/>
                            <path fill="none" d="M14 27l7 7 16-16"/>
                        </svg>
                        <span class="text-emerald-400 font-bold">¡Correcto!</span>
                    </div>
                    ${result.userAnswer !== undefined ? `<div class="text-xs text-slate-500 mt-1">Tu respuesta: <span class="font-mono text-slate-300">${escapeHtml(result.userAnswer)}</span></div>` : ''}
                    ${result.output ? `<div class="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-slate-300 mt-1">${escapeHtml(result.output)}</div>` : ''}
                </div>`;
        } else {
            let extra = '';
            if (result.error) extra += `<div class="bg-red-900/20 rounded-lg p-3 font-mono text-sm text-red-300 mt-2">${escapeHtml(result.error)}</div>`;
            if (result.expected) {
                extra += `<div class="text-xs text-slate-500 mt-1">Esperado: <span class="font-mono text-emerald-300">${escapeHtml(result.expected)}</span></div>`;
                if (result.userAnswer !== undefined) {
                    extra += `<div class="text-xs text-slate-500 mt-0.5">Tu respuesta: <span class="font-mono text-amber-300">${escapeHtml(result.userAnswer) || '(vacío)'}</span></div>`;
                }
                if (result.output) {
                    extra += `<div class="text-xs text-slate-500 mt-0.5">Salida real: <span class="font-mono text-slate-300">${escapeHtml(result.output)}</span></div>`;
                }
            }
            resultArea.innerHTML = `
                <div class="animate-fade-in">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="x" class="text-red-400" style="width:20px;height:20px"></i>
                        <span class="text-red-400 font-semibold text-sm">${(result.details || 'Incorrecto').replace(/[❌✅]\s*/g, '')}</span>
                    </div>
                    ${result.output && !result.expected ? `<div class="bg-slate-900/50 rounded-lg p-3 font-mono text-sm text-slate-400 mt-1">Output: ${escapeHtml(result.output)}</div>` : ''}
                    ${extra}
                    <p class="text-slate-500 text-xs mt-2"><i data-lucide="lightbulb" style="width:12px;height:12px" class="inline-block"></i> Revisá la lógica e intentá de nuevo</p>
                </div>`;
        }
    }

    // ── KEYBOARD ─────────────────────────────────────────────
    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (state.currentView === 'question') {
                    e.preventDefault();
                    handleCheck();
                }
            }
            if (e.key === 'Escape') {
                const modal = document.getElementById('level-modal');
                if (modal) closeModal();
            }
        });
    }

    // ── LUCIDE ───────────────────────────────────────────────
    function refreshIcons() {
        if (window.__lucideCreateIcons) {
            window.__lucideCreateIcons();
        }
    }

    // ── UTILIDADES ───────────────────────────────────────────
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ── INIT ─────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return window.App;
})();
