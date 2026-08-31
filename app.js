/**
 * NIKKA - Minimalist Zen ToDo Application
 * Architecture: Clean Vanilla JS with State Management, Web Audio FX & LocalStorage
 */

(function () {
    'use strict';

    // ==========================================================================
    // 1. DATA & CONSTANTS
    // ==========================================================================
    const STORAGE_KEY_TASKS = 'nikka_tasks_en_v1';
    const STORAGE_KEY_THEME = 'nikka_theme_en';
    const STORAGE_KEY_SOUND = 'nikka_sound_en';
    const STORAGE_KEY_STATS = 'nikka_stats_en';

    const ZEN_QUOTES = [
        {
            text: '"A journey of a thousand miles begins with a single step."',
            author: '— Lao Tzu • Ancient Wisdom'
        },
        {
            text: '"Perseverance is power. Small daily efforts compound over time."',
            author: '— Zen Proverb'
        },
        {
            text: '"Treasure every moment, for it can never recur again."',
            author: '— Sen no Rikyū • Master of Tea'
        },
        {
            text: '"Fall seven times, stand up eight. Resilience defines mastery."',
            author: '— Mindful Reflection'
        },
        {
            text: '"Every single day is a good day when you live fully in the present."',
            author: '— Yunmen Wenyan'
        },
        {
            text: '"If you are in a rush, take the roundabout way. Haste makes waste."',
            author: '— Japanese Folk Wisdom'
        },
        {
            text: '"Continuous drops of water hollow out the hardest stone."',
            author: '— Zen Meditation'
        },
        {
            text: '"In the beginner\'s mind there are many possibilities, in the expert\'s mind few."',
            author: '— Shunryu Suzuki'
        },
        {
            text: '"Simplicity is the keynote of all true elegance."',
            author: '— Wabi-Sabi Principle'
        },
        {
            text: '"Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment."',
            author: '— Mindful Teaching'
        }
    ];

    const SAMPLE_TASKS = [
        {
            id: 'sample-1',
            title: 'Brew morning green tea mindfully',
            category: 'health',
            priority: 'low',
            dueDate: getTodayDateString(),
            completed: false,
            pinned: true,
            subtasks: [
                { id: 'sub-1', text: 'Let water cool to 80°C', completed: true },
                { id: 'sub-2', text: 'Steep gently for one quiet minute', completed: false }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'sample-2',
            title: 'Define the 3 most essential goals for this week',
            category: 'work',
            priority: 'high',
            dueDate: getTodayDateString(),
            completed: false,
            pinned: false,
            subtasks: [],
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 'sample-3',
            title: 'Read 15 pages of philosophy & write reflections',
            category: 'study',
            priority: 'medium',
            dueDate: '',
            completed: false,
            pinned: false,
            subtasks: [],
            createdAt: new Date(Date.now() - 7200000).toISOString()
        }
    ];

    // ==========================================================================
    // 2. STATE MANAGEMENT
    // ==========================================================================
    let state = {
        tasks: [],
        currentFilter: 'all',
        categoryFilter: 'all',
        sortBy: 'created-desc',
        searchQuery: '',
        soundEnabled: true,
        theme: 'washi',
        stats: {
            totalCreated: 0,
            completedCount: 0
        },
        quoteIndex: 0,
        // Timer state
        timer: {
            intervalId: null,
            totalSeconds: 25 * 60,
            remainingSeconds: 25 * 60,
            isRunning: false,
            focusedTask: null
        }
    };

    // ==========================================================================
    // 3. DOM ELEMENTS
    // ==========================================================================
    const DOM = {
        taskForm: document.getElementById('taskForm'),
        taskTitleInput: document.getElementById('taskTitleInput'),
        categorySelect: document.getElementById('categorySelect'),
        prioritySelect: document.getElementById('prioritySelect'),
        dueDateInput: document.getElementById('dueDateInput'),
        taskList: document.getElementById('taskList'),
        emptyState: document.getElementById('emptyState'),
        
        // Dates & Wisdom
        mainDateDisplay: document.getElementById('mainDateDisplay'),
        subDateDisplay: document.getElementById('subDateDisplay'),
        quoteTitle: document.getElementById('quoteTitle'),
        quoteAuthor: document.getElementById('quoteAuthor'),
        refreshQuoteBtn: document.getElementById('refreshQuoteBtn'),

        // Progress
        progressBarFill: document.getElementById('progressBarFill'),
        progressStats: document.getElementById('progressStats'),
        progressMessage: document.getElementById('progressMessage'),
        remainingSummary: document.getElementById('remainingSummary'),

        // Badges
        countAll: document.getElementById('countAll'),
        countActive: document.getElementById('countActive'),
        countCompleted: document.getElementById('countCompleted'),

        // Filters & Search
        tabButtons: document.querySelectorAll('.tab-btn'),
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        filterCategory: document.getElementById('filterCategory'),
        sortBy: document.getElementById('sortBy'),
        clearCompletedBtn: document.getElementById('clearCompletedBtn'),

        // Global Controls
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeIcon: document.getElementById('themeIcon'),
        themeLabel: document.getElementById('themeLabel'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundIcon: document.getElementById('soundIcon'),
        zenModeBtn: document.getElementById('zenModeBtn'),
        menuToggleBtn: document.getElementById('menuToggleBtn'),

        // Drawer
        sideDrawer: document.getElementById('sideDrawer'),
        drawerOverlay: document.getElementById('drawerOverlay'),
        closeDrawerBtn: document.getElementById('closeDrawerBtn'),
        statTotalCreated: document.getElementById('statTotalCreated'),
        statCompleted: document.getElementById('statCompleted'),
        statCompletionRate: document.getElementById('statCompletionRate'),
        exportDataBtn: document.getElementById('exportDataBtn'),
        importFileInput: document.getElementById('importFileInput'),
        loadSampleDataBtn: document.getElementById('loadSampleDataBtn'),
        testWoodBtn: document.getElementById('testWoodBtn'),
        testBellBtn: document.getElementById('testBellBtn'),

        // Zen Modal & Timer
        zenModal: document.getElementById('zenModal'),
        closeZenModalBtn: document.getElementById('closeZenModalBtn'),
        zenCurrentTaskTitle: document.getElementById('zenCurrentTaskTitle'),
        zenTimerDisplay: document.getElementById('zenTimerDisplay'),
        timerProgressCircle: document.getElementById('timerProgressCircle'),
        timerToggleBtn: document.getElementById('timerToggleBtn'),
        timerPlayIcon: document.getElementById('timerPlayIcon'),
        timerPlayLabel: document.getElementById('timerPlayLabel'),
        timerResetBtn: document.getElementById('timerResetBtn'),
        presetButtons: document.querySelectorAll('.preset-btn'),

        // Toast
        toastNotification: document.getElementById('toastNotification')
    };

    // ==========================================================================
    // 4. SYNTHESIZED WEB AUDIO (Pure Native Audio FX)
    // ==========================================================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    /**
     * Crisp Japanese wooden clapper (Hyoshigi)
     */
    function playWoodClick() {
        if (!state.soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    /**
     * Zen Singing Bowl (Rin Bell)
     */
    function playZenBell() {
        if (!state.soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const freqs = [528, 1056, 1584];
            const gains = [0.25, 0.12, 0.04];

            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(gains[idx], now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 2.2);
            });
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    // ==========================================================================
    // 5. DATE & WISDOM FORMATTING
    // ==========================================================================
    function getTodayDateString() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }

    function updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const mainFormatted = now.toLocaleDateString('en-US', options);
        const weekNum = getWeekNumber(now);

        if (DOM.mainDateDisplay) DOM.mainDateDisplay.textContent = mainFormatted;
        if (DOM.subDateDisplay) DOM.subDateDisplay.textContent = `Week ${weekNum} • Mindful Focus`;
    }

    function renderQuote(index) {
        state.quoteIndex = (index + ZEN_QUOTES.length) % ZEN_QUOTES.length;
        const item = ZEN_QUOTES[state.quoteIndex];
        DOM.quoteTitle.textContent = item.text;
        DOM.quoteAuthor.textContent = item.author;
    }

    // ==========================================================================
    // 6. TASK CRUD OPERATIONS
    // ==========================================================================
    function saveTasksToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(state.tasks));
            localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(state.stats));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    function loadTasksFromStorage() {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
            if (savedTasks) {
                state.tasks = JSON.parse(savedTasks);
            } else {
                state.tasks = [...SAMPLE_TASKS];
            }

            const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
            if (savedStats) {
                state.stats = JSON.parse(savedStats);
            } else {
                state.stats = {
                    totalCreated: state.tasks.length,
                    completedCount: state.tasks.filter(t => t.completed).length
                };
            }
        } catch (e) {
            console.error('Failed to parse localStorage data:', e);
            state.tasks = [...SAMPLE_TASKS];
        }
    }

    function addTask(title, category, priority, dueDate) {
        const newTask = {
            id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            title: title.trim(),
            category: category || 'personal',
            priority: priority || 'medium',
            dueDate: dueDate || '',
            completed: false,
            pinned: false,
            subtasks: [],
            createdAt: new Date().toISOString()
        };

        state.tasks.unshift(newTask);
        state.stats.totalCreated = (state.stats.totalCreated || 0) + 1;

        saveTasksToStorage();
        render();
        playWoodClick();
        showToast('Task added');
    }

    function toggleTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        if (task.completed) {
            state.stats.completedCount = (state.stats.completedCount || 0) + 1;
            playZenBell();
            showToast('Task completed');
        } else {
            state.stats.completedCount = Math.max(0, (state.stats.completedCount || 0) - 1);
            playWoodClick();
        }

        saveTasksToStorage();
        render();
    }

    function deleteTask(id) {
        const index = state.tasks.findIndex(t => t.id === id);
        if (index === -1) return;

        state.tasks.splice(index, 1);
        saveTasksToStorage();
        render();
        playWoodClick();
        showToast('Task removed');
    }

    function togglePinTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;

        task.pinned = !task.pinned;
        saveTasksToStorage();
        render();
        playWoodClick();
        showToast(task.pinned ? 'Pinned to top' : 'Unpinned');
    }

    function editTaskTitle(id, newTitle) {
        const task = state.tasks.find(t => t.id === id);
        if (!task || !newTitle.trim()) return;

        task.title = newTitle.trim();
        saveTasksToStorage();
        render();
    }

    function addSubtask(taskId, text) {
        if (!text.trim()) return;
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
            id: 'sub-' + Date.now(),
            text: text.trim(),
            completed: false
        });

        saveTasksToStorage();
        render();
        playWoodClick();
    }

    function toggleSubtask(taskId, subtaskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;

        const sub = task.subtasks.find(s => s.id === subtaskId);
        if (!sub) return;

        sub.completed = !sub.completed;
        if (sub.completed) {
            playZenBell();
        } else {
            playWoodClick();
        }

        saveTasksToStorage();
        render();
    }

    function deleteSubtask(taskId, subtaskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;

        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        saveTasksToStorage();
        render();
        playWoodClick();
    }

    function clearCompleted() {
        const beforeCount = state.tasks.length;
        state.tasks = state.tasks.filter(t => !t.completed);
        const diff = beforeCount - state.tasks.length;

        if (diff > 0) {
            saveTasksToStorage();
            render();
            playWoodClick();
            showToast(`Cleared ${diff} completed task${diff > 1 ? 's' : ''}`);
        }
    }

    // ==========================================================================
    // 7. FILTERING & SORTING
    // ==========================================================================
    function getFilteredAndSortedTasks() {
        return state.tasks
            .filter(task => {
                // Status Filter
                if (state.currentFilter === 'active' && task.completed) return false;
                if (state.currentFilter === 'completed' && !task.completed) return false;

                // Category Filter
                if (state.categoryFilter !== 'all' && task.category !== state.categoryFilter) {
                    return false;
                }

                // Search Query Filter
                if (state.searchQuery.trim()) {
                    const q = state.searchQuery.toLowerCase();
                    const titleMatch = task.title.toLowerCase().includes(q);
                    const subtaskMatch = (task.subtasks || []).some(s => s.text.toLowerCase().includes(q));
                    if (!titleMatch && !subtaskMatch) return false;
                }

                return true;
            })
            .sort((a, b) => {
                // Always keep pinned items on top
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;

                if (state.sortBy === 'created-desc') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (state.sortBy === 'created-asc') {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                if (state.sortBy === 'priority-desc') {
                    const map = { high: 3, medium: 2, low: 1 };
                    return (map[b.priority] || 0) - (map[a.priority] || 0);
                }
                if (state.sortBy === 'due-asc') {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                return 0;
            });
    }

    // ==========================================================================
    // 8. RENDERING
    // ==========================================================================
    function render() {
        const filteredTasks = getFilteredAndSortedTasks();
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const active = total - completed;

        // 1. Update Tab Badges
        DOM.countAll.textContent = total;
        DOM.countActive.textContent = active;
        DOM.countCompleted.textContent = completed;

        // 2. Update Harmony Meter
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
        DOM.progressBarFill.style.width = `${completionRate}%`;
        DOM.progressStats.textContent = `${completed} / ${total} completed (${completionRate}%)`;

        if (total === 0) {
            DOM.progressMessage.textContent = 'Begin your day with a calm and clear mind.';
        } else if (completed === total) {
            DOM.progressMessage.textContent = 'All tasks completed. Enjoy your well-earned peace.';
        } else if (completionRate >= 50) {
            DOM.progressMessage.textContent = 'More than halfway through today\'s journey.';
        } else {
            DOM.progressMessage.textContent = 'Step by step with care and focus.';
        }

        DOM.remainingSummary.textContent = `${active} item${active === 1 ? '' : 's'} remaining`;

        // 3. Update Drawer Stats
        DOM.statTotalCreated.textContent = state.stats.totalCreated || total;
        DOM.statCompleted.textContent = state.stats.completedCount || completed;
        DOM.statCompletionRate.textContent = `${completionRate}%`;

        // 4. Render Task List
        DOM.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            DOM.emptyState.style.display = 'flex';
        } else {
            DOM.emptyState.style.display = 'none';

            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}`;
                li.dataset.id = task.id;

                const priorityLabels = {
                    high: 'Urgent',
                    medium: 'Normal',
                    low: 'Calm'
                };

                const categoryLabels = {
                    work: '💼 Work',
                    personal: '🎋 Personal',
                    study: '📖 Study',
                    health: '🍵 Health',
                    creative: '🎨 Creative'
                };

                // Due Date calculation
                let dueBadgeHtml = '';
                if (task.dueDate) {
                    const todayStr = getTodayDateString();
                    let dueClass = '';
                    let dueText = task.dueDate;
                    if (task.dueDate < todayStr && !task.completed) {
                        dueClass = 'overdue';
                        dueText += ' (Overdue)';
                    } else if (task.dueDate === todayStr) {
                        dueClass = 'today';
                        dueText += ' (Today)';
                    }
                    dueBadgeHtml = `
                        <span class="due-badge ${dueClass}">
                            <i data-lucide="calendar"></i>
                            <span>${escapeHtml(dueText)}</span>
                        </span>
                    `;
                }

                // Subtasks HTML
                let subtasksHtml = '';
                const subCount = (task.subtasks || []).length;
                const subDoneCount = (task.subtasks || []).filter(s => s.completed).length;

                if (task.subtasks && task.subtasks.length > 0) {
                    const subListItems = task.subtasks.map(s => `
                        <div class="subtask-item ${s.completed ? 'completed' : ''}" data-subid="${s.id}">
                            <input type="checkbox" class="subtask-checkbox" ${s.completed ? 'checked' : ''}>
                            <span>${escapeHtml(s.text)}</span>
                            <button class="action-icon-btn btn-delete-subtask" title="Remove subtask" style="margin-left:auto; padding:2px;">
                                <i data-lucide="x" style="width:12px; height:12px;"></i>
                            </button>
                        </div>
                    `).join('');

                    subtasksHtml = `
                        <div class="subtasks-section">
                            <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:0.2rem;">
                                Subtasks (${subDoneCount}/${subCount})
                            </div>
                            ${subListItems}
                            <form class="add-subtask-form">
                                <input type="text" class="subtask-input" placeholder="+ Add a subtask..." maxlength="60">
                            </form>
                        </div>
                    `;
                }

                li.innerHTML = `
                    <div class="task-item-main">
                        <button class="custom-checkbox" aria-label="Toggle Complete" title="${task.completed ? 'Mark as active' : 'Mark as completed'}">
                            <i data-lucide="check" class="checkbox-check-icon"></i>
                        </button>
                        
                        <div class="task-content">
                            <div class="task-title" title="Double click to edit">${escapeHtml(task.title)}</div>
                            <div class="task-badges">
                                <span class="category-tag category-${task.category}">
                                    ${categoryLabels[task.category] || task.category}
                                </span>
                                <span class="priority-badge priority-${task.priority}">
                                    ${priorityLabels[task.priority] || task.priority}
                                </span>
                                ${dueBadgeHtml}
                            </div>
                        </div>

                        <div class="task-actions">
                            <button class="action-icon-btn btn-focus" title="Focus on this task">
                                <i data-lucide="timer"></i>
                            </button>
                            <button class="action-icon-btn btn-pin ${task.pinned ? 'is-pinned' : ''}" title="${task.pinned ? 'Unpin' : 'Pin to top'}">
                                <i data-lucide="pin"></i>
                            </button>
                            <button class="action-icon-btn btn-add-sub" title="Add subtask">
                                <i data-lucide="list-plus"></i>
                            </button>
                            <button class="action-icon-btn btn-delete" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    ${subtasksHtml}
                `;

                DOM.taskList.appendChild(li);
            });
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message) {
        DOM.toastNotification.textContent = message;
        DOM.toastNotification.classList.add('show');
        clearTimeout(DOM.toastNotification._timer);
        DOM.toastNotification._timer = setTimeout(() => {
            DOM.toastNotification.classList.remove('show');
        }, 2200);
    }

    // ==========================================================================
    // 9. THEME & SOUND CONTROLS
    // ==========================================================================
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY_THEME, theme);

        if (theme === 'sumi') {
            DOM.themeIcon.setAttribute('data-lucide', 'sun');
            DOM.themeLabel.textContent = 'Light';
            DOM.themeToggleBtn.setAttribute('title', 'Switch to Washi (Light) Theme');
        } else {
            DOM.themeIcon.setAttribute('data-lucide', 'moon');
            DOM.themeLabel.textContent = 'Dark';
            DOM.themeToggleBtn.setAttribute('title', 'Switch to Sumi (Dark) Theme');
        }
        if (window.lucide) window.lucide.createIcons();
    }

    function toggleTheme() {
        const nextTheme = state.theme === 'washi' ? 'sumi' : 'washi';
        setTheme(nextTheme);
        playWoodClick();
    }

    function setSound(enabled) {
        state.soundEnabled = enabled;
        localStorage.setItem(STORAGE_KEY_SOUND, enabled.toString());

        if (enabled) {
            DOM.soundIcon.setAttribute('data-lucide', 'volume-2');
            DOM.soundToggleBtn.classList.remove('muted');
        } else {
            DOM.soundIcon.setAttribute('data-lucide', 'volume-x');
            DOM.soundToggleBtn.classList.add('muted');
        }
        if (window.lucide) window.lucide.createIcons();
    }

    function toggleSound() {
        setSound(!state.soundEnabled);
        if (state.soundEnabled) playWoodClick();
    }

    // ==========================================================================
    // 10. ZEN FOCUS TIMER
    // ==========================================================================
    function openZenModal(taskTitle = null) {
        state.timer.focusedTask = taskTitle;
        DOM.zenCurrentTaskTitle.textContent = taskTitle ? taskTitle : 'Focus on what matters';
        DOM.zenModal.classList.add('active');
        DOM.zenModal.setAttribute('aria-hidden', 'false');
    }

    function closeZenModal() {
        DOM.zenModal.classList.remove('active');
        DOM.zenModal.setAttribute('aria-hidden', 'true');
    }

    function updateTimerUI() {
        const minutes = Math.floor(state.timer.remainingSeconds / 60);
        const seconds = state.timer.remainingSeconds % 60;
        DOM.zenTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const circumference = 565.48;
        const progress = state.timer.remainingSeconds / state.timer.totalSeconds;
        const offset = circumference * (1 - progress);
        DOM.timerProgressCircle.style.strokeDashoffset = offset;
    }

    function toggleTimer() {
        if (state.timer.isRunning) {
            // Pause
            clearInterval(state.timer.intervalId);
            state.timer.isRunning = false;
            DOM.timerPlayLabel.textContent = 'Resume';
            DOM.timerPlayIcon.setAttribute('data-lucide', 'play');
        } else {
            // Start
            getAudioContext();
            state.timer.isRunning = true;
            DOM.timerPlayLabel.textContent = 'Pause';
            DOM.timerPlayIcon.setAttribute('data-lucide', 'pause');

            state.timer.intervalId = setInterval(() => {
                if (state.timer.remainingSeconds > 0) {
                    state.timer.remainingSeconds--;
                    updateTimerUI();
                } else {
                    // Completed session
                    clearInterval(state.timer.intervalId);
                    state.timer.isRunning = false;
                    DOM.timerPlayLabel.textContent = 'Start';
                    DOM.timerPlayIcon.setAttribute('data-lucide', 'play');
                    playZenBell();
                    showToast('Focus session complete. Take a deep breath.');
                }
            }, 1000);
        }
        if (window.lucide) window.lucide.createIcons();
    }

    function resetTimer(seconds = null) {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        if (seconds !== null) {
            state.timer.totalSeconds = seconds;
        }
        state.timer.remainingSeconds = state.timer.totalSeconds;
        DOM.timerPlayLabel.textContent = 'Start';
        DOM.timerPlayIcon.setAttribute('data-lucide', 'play');
        updateTimerUI();
        if (window.lucide) window.lucide.createIcons();
    }

    // ==========================================================================
    // 11. BACKUP, RESTORE & EXPORT
    // ==========================================================================
    function exportDataAsJson() {
        const exportObj = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            tasks: state.tasks,
            stats: state.stats
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `nikka_backup_${getTodayDateString()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Backup file exported');
    }

    function importDataFromJson(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (Array.isArray(parsed.tasks)) {
                    state.tasks = parsed.tasks;
                    if (parsed.stats) state.stats = parsed.stats;
                    saveTasksToStorage();
                    render();
                    playZenBell();
                    showToast('Data restored successfully');
                } else {
                    showToast('Invalid file format');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to import backup');
            }
        };
        reader.readAsText(file);
    }

    function loadSampleData() {
        state.tasks = JSON.parse(JSON.stringify(SAMPLE_TASKS));
        state.stats = {
            totalCreated: state.tasks.length,
            completedCount: 0
        };
        saveTasksToStorage();
        render();
        playZenBell();
        showToast('Sample tasks loaded');
    }

    // ==========================================================================
    // 12. EVENT LISTENERS
    // ==========================================================================
    function setupEventListeners() {
        // Form Submit
        DOM.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = DOM.taskTitleInput.value;
            if (!title.trim()) return;

            const category = DOM.categorySelect.value;
            const priority = DOM.prioritySelect.value;
            const dueDate = DOM.dueDateInput.value;

            addTask(title, category, priority, dueDate);
            DOM.taskTitleInput.value = '';
            DOM.taskTitleInput.focus();
        });

        // Tab Filters
        DOM.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                state.currentFilter = btn.dataset.filter;
                render();
                playWoodClick();
            });
        });

        // Category Filter
        DOM.filterCategory.addEventListener('change', (e) => {
            state.categoryFilter = e.target.value;
            render();
            playWoodClick();
        });

        // Sort By
        DOM.sortBy.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            render();
            playWoodClick();
        });

        // Search Input
        DOM.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            DOM.clearSearchBtn.style.display = state.searchQuery ? 'flex' : 'none';
            render();
        });

        DOM.clearSearchBtn.addEventListener('click', () => {
            DOM.searchInput.value = '';
            state.searchQuery = '';
            DOM.clearSearchBtn.style.display = 'none';
            render();
            playWoodClick();
        });

        // Clear Completed
        DOM.clearCompletedBtn.addEventListener('click', clearCompleted);

        // Quote Refresh
        DOM.refreshQuoteBtn.addEventListener('click', () => {
            renderQuote(state.quoteIndex + 1);
            playWoodClick();
        });

        // Global Buttons
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
        DOM.soundToggleBtn.addEventListener('click', toggleSound);

        // Zen Mode Open / Close
        DOM.zenModeBtn.addEventListener('click', () => {
            openZenModal();
            playWoodClick();
        });
        DOM.closeZenModalBtn.addEventListener('click', closeZenModal);
        DOM.zenModal.addEventListener('click', (e) => {
            if (e.target === DOM.zenModal) closeZenModal();
        });

        // Timer Controls
        DOM.timerToggleBtn.addEventListener('click', toggleTimer);
        DOM.timerResetBtn.addEventListener('click', () => {
            resetTimer();
            playWoodClick();
        });

        DOM.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const minutes = parseInt(btn.dataset.minutes, 10);
                resetTimer(minutes * 60);
                playWoodClick();
            });
        });

        // Drawer Menu Open / Close
        DOM.menuToggleBtn.addEventListener('click', () => {
            DOM.sideDrawer.classList.add('open');
            DOM.sideDrawer.setAttribute('aria-hidden', 'false');
            playWoodClick();
        });
        DOM.closeDrawerBtn.addEventListener('click', () => {
            DOM.sideDrawer.classList.remove('open');
            DOM.sideDrawer.setAttribute('aria-hidden', 'true');
            playWoodClick();
        });
        DOM.drawerOverlay.addEventListener('click', () => {
            DOM.sideDrawer.classList.remove('open');
            DOM.sideDrawer.setAttribute('aria-hidden', 'true');
        });

        // Drawer Actions
        DOM.exportDataBtn.addEventListener('click', exportDataAsJson);
        DOM.importFileInput.addEventListener('change', importDataFromJson);
        DOM.loadSampleDataBtn.addEventListener('click', loadSampleData);
        DOM.testWoodBtn.addEventListener('click', playWoodClick);
        DOM.testBellBtn.addEventListener('click', playZenBell);

        // Delegated Task Actions
        DOM.taskList.addEventListener('click', (e) => {
            const item = e.target.closest('.task-item');
            if (!item) return;
            const taskId = item.dataset.id;

            // Checkbox
            if (e.target.closest('.custom-checkbox')) {
                toggleTask(taskId);
                return;
            }

            // Delete
            if (e.target.closest('.btn-delete')) {
                deleteTask(taskId);
                return;
            }

            // Pin
            if (e.target.closest('.btn-pin')) {
                togglePinTask(taskId);
                return;
            }

            // Focus
            if (e.target.closest('.btn-focus')) {
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                    openZenModal(task.title);
                    playWoodClick();
                }
                return;
            }

            // Add Subtask
            if (e.target.closest('.btn-add-sub')) {
                const subSection = item.querySelector('.subtasks-section');
                if (!subSection) {
                    const task = state.tasks.find(t => t.id === taskId);
                    if (task && (!task.subtasks || task.subtasks.length === 0)) {
                        task.subtasks = [{ id: 'sub-' + Date.now(), text: 'First subtask step', completed: false }];
                        saveTasksToStorage();
                        render();
                    }
                } else {
                    const input = subSection.querySelector('.subtask-input');
                    if (input) input.focus();
                }
                return;
            }

            // Subtask Checkbox
            if (e.target.closest('.subtask-checkbox')) {
                const subItem = e.target.closest('.subtask-item');
                if (subItem) {
                    toggleSubtask(taskId, subItem.dataset.subid);
                }
                return;
            }

            // Delete Subtask
            if (e.target.closest('.btn-delete-subtask')) {
                const subItem = e.target.closest('.subtask-item');
                if (subItem) {
                    deleteSubtask(taskId, subItem.dataset.subid);
                }
                return;
            }
        });

        // Double Click to Edit Title Inline
        DOM.taskList.addEventListener('dblclick', (e) => {
            const titleEl = e.target.closest('.task-title');
            if (!titleEl) return;
            const item = titleEl.closest('.task-item');
            const taskId = item.dataset.id;
            const currentText = titleEl.textContent;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'task-input';
            input.style.borderBottom = '1px solid var(--color-vermilion)';
            input.style.fontSize = '0.95rem';

            titleEl.replaceWith(input);
            input.focus();

            function commitEdit() {
                editTaskTitle(taskId, input.value);
            }

            input.addEventListener('blur', commitEdit);
            input.addEventListener('keydown', (evt) => {
                if (evt.key === 'Enter') {
                    input.removeEventListener('blur', commitEdit);
                    commitEdit();
                } else if (evt.key === 'Escape') {
                    render();
                }
            });
        });

        // Subtask Form Submit
        DOM.taskList.addEventListener('submit', (e) => {
            if (e.target.classList.contains('add-subtask-form')) {
                e.preventDefault();
                const item = e.target.closest('.task-item');
                const taskId = item.dataset.id;
                const input = e.target.querySelector('.subtask-input');
                if (input && input.value.trim()) {
                    addSubtask(taskId, input.value);
                }
            }
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') ||
                ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
                e.preventDefault();
                DOM.searchInput.focus();
            }

            if (e.key === 'Escape') {
                closeZenModal();
                DOM.sideDrawer.classList.remove('open');
                DOM.sideDrawer.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ==========================================================================
    // 13. INITIALIZATION
    // ==========================================================================
    function init() {
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'washi';
        setTheme(savedTheme);

        const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
        setSound(savedSound === null ? true : savedSound === 'true');

        loadTasksFromStorage();
        updateDateDisplay();
        renderQuote(Math.floor(Math.random() * ZEN_QUOTES.length));
        updateTimerUI();
        render();

        setupEventListeners();

        if (DOM.dueDateInput) {
            DOM.dueDateInput.min = getTodayDateString();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
