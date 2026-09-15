/**
 * choices.js
 * Рендер интерактивных элементов правой страницы
 */

const Choices = (() => {

    let currentConfirmBtn = null;

    // ── Главный диспетчер ──────────────────────────────────
    function render(rightData, container) {
        container.innerHTML = '';
        Profile.startPageTimer();

        switch (rightData.type) {

            case 'cover-right':
                container.innerHTML = rightData.content;
                break;

            case 'input-name':
                renderNameInput(rightData, container);
                break;

            case 'choice':
                renderChoice(rightData, container);
                break;

            case 'scales':
                renderScales(rightData, container);
                break;

            case 'result-right':
                renderResultRight(container);
                break;

            default:
                break;
        }
    }

    // ── Ввод имени ─────────────────────────────────────────
    function renderNameInput(data, container) {
        container.innerHTML = `
            <div class="choice-section" style="justify-content:center; gap:24px;">
                <p class="choice-prompt">
                    <strong>${data.prompt}</strong>
                    <span style="font-size:0.85em; opacity:0.7;">${data.hint || ''}</span>
                </p>
                <input type="text"
                    id="name-input"
                    placeholder="Имя..."
                    style="
                        background: transparent;
                        border: none;
                        border-bottom: 1px solid rgba(139,105,20,0.5);
                        font-family: Georgia, serif;
                        font-size: 1.2em;
                        color: var(--ink);
                        text-align: center;
                        padding: 8px 16px;
                        width: 100%;
                        outline: none;
                    "
                />
                <button class="choice-confirm ready"
                    id="name-confirm"
                    onclick="Choices.confirmName()">
                    Дальше →
                </button>
            </div>
        `;

        const input = document.getElementById('name-input');
        if (data.nextOnEnter) {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') Choices.confirmName();
            });
        }
        setTimeout(() => input.focus(), 300);
    }

    function confirmName() {
        const input = document.getElementById('name-input');
        const name = input.value.trim() || 'Путник';
        window.PLAYER_NAME = name;

        Profile.recordAnswer({
            questionId: 'player_name',
            freeText: name
        });

        BookEngine.next();
    }

    // ── Выбор из вариантов ─────────────────────────────────
    function renderChoice(data, container) {
        let selectedId = null;
        let hoverTimers = {};

        const section = document.createElement('div');
        section.className = 'choice-section';

        // Подпись
        const prompt = document.createElement('p');
        prompt.className = 'choice-prompt';
        prompt.innerHTML = `<strong>${data.prompt}</strong>
            ${data.hint ? `<span style="font-size:0.82em;opacity:0.65;">${data.hint}</span>` : ''}`;
        section.appendChild(prompt);

        // Список вариантов
        const list = document.createElement('div');
        list.className = 'choices-list';

        data.options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'choice-option';
            card.dataset.id = opt.id;
            card.innerHTML = `
                <span class="choice-icon">${opt.icon}</span>
                <div class="choice-body">
                    <div class="choice-title">${opt.title}</div>
                    ${opt.desc ? `<div class="choice-desc">${opt.desc}</div>` : ''}
                </div>
            `;

            // Клик
            card.addEventListener('click', () => {
                list.querySelectorAll('.choice-option').forEach(c =>
                    c.classList.remove('selected'));
                card.classList.add('selected');
                selectedId = opt.id;

                if (confirmBtn) {
                    confirmBtn.classList.add('ready');
                }
            });

            // Hover tracking
            card.addEventListener('mouseenter', () => {
                hoverTimers[opt.id] = Date.now();
            });
            card.addEventListener('mouseleave', () => {
                if (hoverTimers[opt.id]) {
                    const duration = Date.now() - hoverTimers[opt.id];
                    Profile.recordHover(data.questionId, opt.id, duration);
                    hoverTimers[opt.id] = null;
                }
            });

            list.appendChild(card);
        });

        section.appendChild(list);

        // Кнопка подтверждения
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'choice-confirm';
        confirmBtn.textContent = 'Выбрать →';
        confirmBtn.addEventListener('click', () => {
            if (!selectedId) return;

            const chosen = data.options.find(o => o.id === selectedId);
            Profile.recordAnswer({
                questionId: data.questionId,
                choiceId: selectedId,
                choiceTraits: chosen.traits
            });

            BookEngine.next();
        });

        section.appendChild(confirmBtn);
        container.appendChild(section);
    }

    // ── Шкалы (слайдеры) ──────────────────────────────────
    function renderScales(data, container) {
        const section = document.createElement('div');
        section.className = 'choice-section';

        const prompt = document.createElement('p');
        prompt.className = 'choice-prompt';
        prompt.innerHTML = `<strong>${data.prompt}</strong>`;
        section.appendChild(prompt);

        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'scale-section';

        const scaleValues = {};

        data.scales.forEach(scale => {
            scaleValues[scale.id] = 50; // дефолт — центр

            const item = document.createElement('div');
            item.className = 'scale-item';
            item.innerHTML = `
                <div class="scale-label">${scale.label}</div>
                <div class="scale-track">
                    <div class="scale-end">${scale.leftLabel}</div>
                    <input type="range"
                        class="scale-input"
                        id="scale-${scale.id}"
                        min="0" max="100" value="50"
                        style="flex:1;"
                    />
                    <div class="scale-end">${scale.rightLabel}</div>
                </div>
            `;

            const input = item.querySelector('input');
            input.addEventListener('input', () => {
                scaleValues[scale.id] = parseInt(input.value);
            });

            scaleContainer.appendChild(item);
        });

        section.appendChild(scaleContainer);

        // Кнопка
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'choice-confirm ready';
        confirmBtn.textContent = 'Дальше →';
        confirmBtn.addEventListener('click', () => {

            // Преобразуем значения шкал в очки профиля
            const axisContributions = {};
            data.scales.forEach(scale => {
                const val = scaleValues[scale.id];
                // val: 0-100, центр 50 → вклад от -3 до +3
                const contribution = Math.round((val - 50) / 16.67) * scale.direction;
                axisContributions[scale.axis] =
                    (axisContributions[scale.axis] || 0) + contribution;
            });

            Profile.recordAnswer({
                questionId: data.questionId,
                scales: scaleValues,
                choiceTraits: axisContributions
            });

            BookEngine.next();
        });

        section.appendChild(confirmBtn);
        container.appendChild(section);
    }

    // ── Правая страница результата ─────────────────────────
    function renderResultRight(container) {
        const norm = Profile.getNormalizedScores();
        const archetypeId = Profile.computeArchetype();
        const archetype = Archetypes.get(archetypeId);

        const axes = [
            { key: 'thinking',  leftLabel: 'Действие',    rightLabel: 'Мышление'    },
            { key: 'inner',     leftLabel: 'Внешнее',     rightLabel: 'Внутреннее'  },
            { key: 'solo',      leftLabel: 'Общность',    rightLabel: 'Одиночество' },
            { key: 'creating',  leftLabel: 'Исполнение',  rightLabel: 'Создание'    },
            { key: 'caring',    leftLabel: 'Достижение',  rightLabel: 'Забота'      },
            { key: 'stable',    leftLabel: 'Движение',    rightLabel: 'Стабильность'},
            { key: 'intuitive', leftLabel: 'Логика',      rightLabel: 'Интуиция'    },
            { key: 'spiritual', leftLabel: 'Прагматизм',  rightLabel: 'Смысл'       }
        ];

        const barsHtml = axes.map(a => `
            <div class="result-trait-bar">
                <div class="result-trait-name">${a.leftLabel}</div>
                <div class="result-trait-track">
                    <div class="result-trait-fill"
                         style="width:${norm[a.key] || 50}%">
                    </div>
                </div>
                <div class="result-trait-name" style="text-align:right">
                    ${a.rightLabel}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="result-page">
                <div style="margin-bottom:16px;">
                    <div style="font-size:0.7em; letter-spacing:0.25em;
                                color:var(--accent); text-transform:uppercase;
                                margin-bottom:8px;">
                        Профиль
                    </div>
                    ${barsHtml}
                </div>
                <div style="margin-top:auto; padding-top:12px;
                            border-top: 1px solid rgba(139,105,20,0.2);">
                    <div style="font-size:0.72em; color:var(--ink-light);
                                font-style:italic; margin-bottom:8px;">
                        Направление деятельности:
                    </div>
                    <div style="font-size:0.8em; color:var(--ink); line-height:1.7;">
                        ${archetype.activity}
                    </div>
                </div>
            </div>
        `;
    }

    return {
        render,
        confirmName
    };

})();