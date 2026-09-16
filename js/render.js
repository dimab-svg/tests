/**
 * render.js
 * Отрисовка разворотов (левая и правая страницы)
 */

const Renderer = (() => {

    /**
     * Отрисовка разворота.
     * opts.meta === false — не трогать заголовок главы и точки прогресса
     * (используется во время перелистывания: мета обновляется в конце анимации).
     */
    function renderSpread(spreadIndex, opts) {
        opts = opts || {};
        const spread = Story.getSpread(spreadIndex);
        if (!spread) return;

        if (opts.meta !== false) renderMeta(spreadIndex);

        // Нумерация страниц
        const leftPageNum  = spreadIndex * 2 - 1;
        const rightPageNum = spreadIndex * 2;
        document.getElementById('left-page-num').textContent =
            leftPageNum > 0 ? leftPageNum : '';
        document.getElementById('right-page-num').textContent =
            rightPageNum > 0 ? rightPageNum : '';

        // Левая страница
        renderLeftPage(spread.left);

        // Правая страница
        renderRightPage(spread.right);
    }

    // Заголовок главы + точки прогресса (обновляется по окончании листания)
    function renderMeta(spreadIndex) {
        const spread = Story.getSpread(spreadIndex);
        document.getElementById('chapter-title').textContent =
            (spread && spread.chapter) || '';
        updateProgressDots(spreadIndex);
    }

    function renderLeftPage(data) {
        const container = document.getElementById('left-content');

        if (data.type === 'text' || data.type === 'cover-left') {
            container.innerHTML = data.content;
        } else if (data.type === 'result-left') {
            renderResultLeft(container);
        }
    }

    function renderRightPage(data) {
        const container = document.getElementById('right-content');
        Choices.render(data, container);
    }

    // Левая страница результата
    function renderResultLeft(container) {
        const archetypeId = Profile.computeArchetype();
        const archetype   = Archetypes.get(archetypeId);
        const name = window.PLAYER_NAME || 'Путник';

        // Анализ нерешительности
        const slowest = Profile.getSlowestQuestion();
        const hesitationText = slowest && slowest.timeMs > 10000
            ? getHesitationText(slowest.questionId)
            : null;

        container.innerHTML = `
            <div class="result-page">
                <div style="font-size:0.65em; letter-spacing:0.3em;
                            color:var(--accent); text-transform:uppercase;
                            margin-bottom:8px;">
                    ${name} —
                </div>
                <div class="result-archetype-name">${archetype.name}</div>
                <div class="result-archetype-emoji">${archetype.emoji}</div>

                <div class="result-story-text">
                    ${archetype.story}
                </div>

                ${hesitationText ? `
                <div class="story-quote" style="margin-top:12px; font-size:0.78em;">
                    ${hesitationText}
                </div>` : ''}
            </div>
        `;
    }

    function getHesitationText(questionId) {
        const map = {
            'q_world'            : 'Выбор мира дался непросто — возможно, ты чувствуешь себя дома сразу в нескольких стихиях.',
            'q_place'            : 'Выбор места потребовал времени. Возможно, ты ещё в поиске своего пространства.',
            'q_item'             : 'Предмет ты выбирал долго — это зона живого внутреннего диалога.',
            'q_crossroads'       : 'Развилка остановила тебя. Выбор направления — одна из твоих ключевых тем.',
            'q_values'           : 'Ценности — самый сложный вопрос для тебя. Это хорошо: значит, их несколько.',
            'q_gift'             : 'Свой дар ты определял дольше всего. Вопрос о предназначении — открытый для тебя сейчас.'
        };
        return map[questionId] || null;
    }

    function updateProgressDots(current) {
        const total = Story.getTotalSpreads();
        const container = document.getElementById('progress-dots');
        container.innerHTML = '';

        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i < current)  dot.classList.add('done');
            if (i === current) dot.classList.add('current');
            container.appendChild(dot);
        }
    }

    return { renderSpread, renderMeta };

})();


// ── Архетипы (вынесены отдельно для удобства) ─────────────
const Archetypes = (() => {

    const data = {
        sage: {
            name: 'Мудрец',
            emoji: '📚',
            story: `<p>Ты из тех, кто слышит больше, чем говорит.</p>
                    <p>Твой мир — это глубина, а не ширина. Одна идея, доведённая
                    до сути, стоит тысячи поверхностных шагов. Ты умеешь находить
                    смысл там, где другие видят только факты. Люди это чувствуют —
                    даже когда ты молчишь.</p>
                    <p>Твоя сила часто спрятана. Но когда ты говоришь — слушают.</p>`,
            activity: 'Исследование, наука, обучение, философия, психология, письмо'
        },
        seeker: {
            name: 'Искатель смысла',
            emoji: '🔭',
            story: `<p>Ты в пути — не потому что потерялся, а потому что поиск
                    и есть твой способ жить.</p>
                    <p>Тебя не удовлетворяют готовые ответы. Ты хочешь найти свои —
                    через опыт, через ошибки, через вопросы, которые другие не решаются
                    задать. Это требует смелости. И у тебя она есть.</p>`,
            activity: 'Духовные практики, психология, философия, путешествия, любое направление вглубь'
        },
        creator: {
            name: 'Творец',
            emoji: '🎨',
            story: `<p>Мир для тебя — это материал. Ты видишь не то, что есть,
                    а то, чем это <em>может стать</em>.</p>
                    <p>Когда ты в потоке — время исчезает. Это и есть твоё настоящее место.
                    Твоя сила — в способности создавать из ничего: образы, идеи, вещи, смыслы.</p>`,
            activity: 'Искусство, дизайн, музыка, литература, архитектура, любое созидание'
        },
        guardian: {
            name: 'Хранитель',
            emoji: '🛡️',
            story: `<p>Рядом с тобой — надёжно. Не потому что ты сильный.
                    А потому что ты <em>настоящий</em>.</p>
                    <p>Ты умеешь держать: людей, отношения, традиции — всё то,
                    что важно не терять. Твоя сила незаметна. Но мир без таких,
                    как ты, рассыпается.</p>`,
            activity: 'Медицина, педагогика, социальная работа, управление, право, семья'
        },
        healer: {
            name: 'Целитель',
            emoji: '🌿',
            story: `<p>Ты чувствуешь боль других — иногда раньше, чем они сами.</p>
                    <p>Твоё присутствие само по себе лечит. Не обязательно словами.
                    Просто быть рядом правильным образом — это особый дар,
                    который есть не у всех.</p>`,
            activity: 'Психология, медицина, коучинг, телесные практики, волонтёрство'
        },
        explorer: {
            name: 'Исследователь',
            emoji: '🧭',
            story: `<p>Тебя влечёт то, что ещё не изучено, не описано, не понято.</p>
                    <p>Твой ум устроен так, что скука — это сигнал: пора двигаться.
                    Ты не убегаешь от жизни — ты её ищешь в новых местах и идеях.</p>`,
            activity: 'Путешествия, полевые исследования, журналистика, предпринимательство'
        },
        hermit: {
            name: 'Отшельник',
            emoji: '🕯️',
            story: `<p>Одиночество для тебя — не наказание. Это среда обитания.</p>
                    <p>Ты восстанавливаешься в тишине и истощаешься в толпе.
                    Это не недостаток — это особый тип силы. В глубоком уединении
                    рождается то, что потом меняет многих.</p>`,
            activity: 'Наука, писательство, программирование, духовные практики, исследования'
        },
        leader: {
            name: 'Лидер',
            emoji: '⚖️',
            story: `<p>Ты умеешь видеть общую картину и вести — не приказами, а примером.</p>
                    <p>Люди идут за тобой, потому что чувствуют: ты знаешь, куда.
                    Твоя сила — в умении соединять людей с общей целью.</p>`,
            activity: 'Управление, предпринимательство, политика, организация, наставничество'
        },
        craftsman: {
            name: 'Мастер',
            emoji: '⚒️',
            story: `<p>Ты веришь в конкретный результат. Не в идеи — а в то,
                    что можно взять в руки.</p>
                    <p>Хорошо сделанная вещь говорит сама за себя.
                    Качество для тебя — это уважение к делу.</p>`,
            activity: 'Ремёсла, инженерия, архитектура, кулинария, садоводство, производство'
        },
        dreamer: {
            name: 'Мечтатель',
            emoji: '✨',
            story: `<p>Ты видишь мир таким, каким он <em>мог бы быть</em>.</p>
                    <p>Это делает тебя неудобным для системы — и незаменимым
                    для будущего. Твои идеи опережают время. Это одновременно
                    твоя сила и твоя боль.</p>`,
            activity: 'Футурология, стартапы, концептуальное искусство, изобретения, визионерство'
        },
        warrior: {
            name: 'Воин',
            emoji: '⚡',
            story: `<p>Ты из тех, кто действует — пока другие обсуждают.</p>
                    <p>Твоя сила — в решительности. Ты не ищешь конфликта,
                    но не избегаешь его, когда это необходимо. Твоя прямота —
                    редкое качество в мире полутонов.</p>`,
            activity: 'Спорт, кризисный менеджмент, безопасность, прямые продажи, активизм'
        },
        connector: {
            name: 'Объединитель',
            emoji: '🕸️',
            story: `<p>Ты видишь связи там, где другие видят отдельные точки.</p>
                    <p>Твой главный талант — понять, кому нужен кто, и свести их.
                    Ты — узел сети. Через тебя проходят люди, идеи, возможности.</p>`,
            activity: 'HR, нетворкинг, дипломатия, продюсирование, организация, маркетинг'
        },
        mystic: {
            name: 'Мистик',
            emoji: '🌙',
            story: `<p>Ты живёшь на границе видимого и невидимого.</p>
                    <p>Там, где другие видят случайность — ты видишь паттерн.
                    Там, где другие видят конец — ты видишь переход.
                    Это делает тебя странным для одних и незаменимым для других.</p>`,
            activity: 'Психология глубин, символика, культурология, искусство, духовные практики'
        }
    };

    function get(id) {
        return data[id] || data['seeker'];
    }

    return { get };
})();
