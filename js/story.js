/**
 * story.js
 * Полный текст истории — страницы, вопросы, варианты ответов
 *
 * Структура разворота:
 * {
 *   id: 'уникальный_id',
 *   chapter: 'Название главы',          // для верхней панели
 *   left: { type: 'text', content: '' } // левая страница
 *   right: { type: 'choice'|'scale'|'input'|'result', ... }
 * }
 */

const Story = (() => {

    const spreads = [

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 0 — ОБЛОЖКА
        // ════════════════════════════════════════════════════
        {
            id: 'cover',
            chapter: '',
            left: {
                // внутренняя сторона обложки — пустая белая страница
                // (сюда можно позже поместить эпиграф, дарственную надпись и т.п.)
                type: 'cover-left',
                content: ''
            },
            right: {
                type: 'cover-right',
                content: `
                    <div style="height:100%; display:flex; flex-direction:column;
                                justify-content:center; align-items:center; gap:24px;
                                text-align:center;">
                        <p style="font-size:0.82em; line-height:1.9;
                                  color:var(--ink-light); font-style:italic; padding:0 12px;">
                            Эта книга не расскажет чужую историю.<br>
                            Она расскажет твою.<br><br>
                            Каждый выбор на этих страницах —<br>
                            это ты сам.<br><br>
                            Просто читай и выбирай то,<br>
                            что <em>чувствуешь</em> — не то, что кажется правильным.
                        </p>
                        <div style="color:var(--accent); opacity:0.4;
                                    letter-spacing:0.5em; font-size:1em;">
                            ✦ &nbsp; ✦ &nbsp; ✦
                        </div>
                        <p style="font-size:0.72em; color:var(--accent);
                                  letter-spacing:0.2em; opacity:0.6;
                                  animation: pulse 3s ease infinite;">
                            листайте дальше ›
                        </p>
                    </div>
                `
            },
            noQuestion: true  // этот разворот не содержит вопроса
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 1 — ПРОБУЖДЕНИЕ (текст + имя)
        // ════════════════════════════════════════════════════
        {
            id: 'awakening',
            chapter: 'Глава I — Пробуждение',
            left: {
                type: 'text',
                content: `
                    <div class="chapter-heading">Глава I &nbsp;·&nbsp; Пробуждение</div>
                    <div class="story-text">
                        <span class="drop-cap">Т</span>
                        <p>ишина. Потом — свет. Медленный, как рассвет над незнакомым горизонтом.</p>

                        <p>Ты приходишь в себя без спешки. Не вскакиваешь — просто открываешь
                        глаза и лежишь, прислушиваясь к тому, что вокруг.</p>

                        <p>Комната незнакома. Или нет — она <em>знакома</em>, но иначе, чем обычно.
                        Как будто видишь её впервые после долгого отсутствия.</p>

                        <p>На столе — раскрытая книга. На первой странице — только одно слово.
                        Твоё имя. Написанное чьей-то рукой, будто тебя здесь ждали.</p>

                        <div class="ornament">· · ·</div>

                        <p>Ты понимаешь: это начало чего-то. Не путешествия в пространстве —
                        путешествия внутрь. Туда, где живут настоящие ответы.</p>
                    </div>
                `
            },
            right: {
                type: 'input-name',
                prompt: 'Как тебя зовут в этом путешествии?',
                hint: 'Можно своё имя — или то, которым хочется называться здесь',
                inputId: 'player_name',
                nextOnEnter: true
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 2 — МИР ЗА ОКНОМ
        // ════════════════════════════════════════════════════
        {
            id: 'world_window',
            chapter: 'Глава I — Пробуждение',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Ты встаёшь. Подходишь к окну.</p>

                        <p>И вот — мир. <em>Твой</em> мир. Тот, который ты выбрал бы,
                        если бы мог выбирать.</p>

                        <p>Не тот, в котором живёшь сейчас. Не тот, который одобрили бы другие.
                        А тот, от которого у тебя перехватывает дыхание —
                        просто от одного вида.</p>

                        <div class="story-quote">
                            «Место, в котором живёт человек, многое говорит о том,
                            кто он на самом деле.»
                        </div>

                        <p>За окном — пространство. Оно ждёт, пока ты его узнаешь.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_world',
                prompt: 'За окном открывается...',
                hint: 'Выбери то, от чего внутри становится чуть теплее',
                options: [
                    {
                        id: 'field',
                        icon: '🌾',
                        title: 'Бесконечное поле',
                        desc: 'Ветер гнёт траву, горизонт открыт, никаких стен',
                        traits: { inner: -1, solo: 0, thinking: -1, stable: 1,
                                  spiritual: 0, intuitive: 1 }
                    },
                    {
                        id: 'forest',
                        icon: '🌲',
                        title: 'Старый лес',
                        desc: 'Тихо, пахнет хвоей, свет пробивается сквозь кроны',
                        traits: { inner: 2, solo: 1, thinking: 1, stable: 1,
                                  spiritual: 1, intuitive: 1 }
                    },
                    {
                        id: 'mountains',
                        icon: '⛰️',
                        title: 'Горы',
                        desc: 'Высоко, камень, далеко видно — ты над миром',
                        traits: { inner: 1, solo: 2, thinking: 0, stable: -1,
                                  spiritual: 1, intuitive: 0 }
                    },
                    {
                        id: 'sea',
                        icon: '🌊',
                        title: 'Море',
                        desc: 'Волны, горизонт без конца, запах соли',
                        traits: { inner: 0, solo: 0, thinking: -1, stable: -2,
                                  spiritual: 1, intuitive: 2 }
                    },
                    {
                        id: 'desert',
                        icon: '🏜️',
                        title: 'Пустыня',
                        desc: 'Тишина, жара, огромное небо — только ты',
                        traits: { inner: 2, solo: 2, thinking: 1, stable: 0,
                                  spiritual: 2, intuitive: 0 }
                    },
                    {
                        id: 'city',
                        icon: '🏙️',
                        title: 'Живой город',
                        desc: 'Огни, звуки, движение — жизнь кипит',
                        traits: { inner: -2, solo: -2, thinking: 0, stable: 1,
                                  spiritual: -1, intuitive: -1 }
                    },
                    {
                        id: 'space',
                        icon: '✨',
                        title: 'Космос',
                        desc: 'Звёзды, тишина масштаба, бесконечность',
                        traits: { inner: 2, solo: 2, thinking: 2, stable: 0,
                                  spiritual: 2, intuitive: 1 }
                    },
                    {
                        id: 'tundra',
                        icon: '🌨️',
                        title: 'Северная тундра',
                        desc: 'Белое, тихое, суровое — честная земля',
                        traits: { inner: 1, solo: 1, thinking: 0, stable: 1,
                                  spiritual: 1, intuitive: 0 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 3 — ПЕРВОЕ УТРО (уточнение через шкалы)
        // ════════════════════════════════════════════════════
        {
            id: 'morning_feeling',
            chapter: 'Глава I — Пробуждение',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Ты стоишь у окна. Впитываешь этот мир.</p>

                        <p>Утро начинается медленно. Внутри — разные ощущения,
                        которые сложно назвать одним словом.</p>

                        <p>Иногда мы не можем точно сказать — что чувствуем.
                        Только направление: туда или сюда, больше или меньше.</p>

                        <div class="ornament">· · ·</div>

                        <p>Прислушайся к себе прямо сейчас. Не к тому, каким ты должен быть —
                        а к тому, каков ты <em>есть</em> этим утром.</p>
                    </div>
                `
            },
            right: {
                type: 'scales',
                questionId: 'q_morning_scales',
                prompt: 'Каким ты просыпаешься — в целом, обычно?',
                scales: [
                    {
                        id: 'energy',
                        label: 'Уровень энергии с утра',
                        leftLabel: 'Совсем тихий',
                        rightLabel: 'Сразу в действие',
                        axis: 'stable',
                        direction: 1
                    },
                    {
                        id: 'social',
                        label: 'Первое желание утром',
                        leftLabel: 'Побыть одному',
                        rightLabel: 'Увидеть людей',
                        axis: 'solo',
                        direction: -1
                    },
                    {
                        id: 'thoughts',
                        label: 'Куда идут мысли',
                        leftLabel: 'Внутрь, к себе',
                        rightLabel: 'Вовне, к миру',
                        axis: 'inner',
                        direction: -1
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 4 — КОМНАТА (место в мире)
        // ════════════════════════════════════════════════════
        {
            id: 'room_choice',
            chapter: 'Глава I — Пробуждение',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Ты отходишь от окна и оглядываешься.</p>

                        <p>Комната. Это твоё пространство — место, куда ты возвращаешься,
                        когда хочется выдохнуть.</p>

                        <p>У каждого такое место особенное. Кто-то чувствует себя дома
                        в большом доме с людьми. Кто-то — в тихой башне, откуда далеко видно.
                        Кто-то вовсе не держится за одно место.</p>

                        <div class="story-quote">
                            «Скажи мне, где тебе покойно —
                             и я скажу тебе, кто ты.»
                        </div>

                        <p>Это место не обязательно существует. Возможно, ты только
                        ищешь его. Но ты <em>чувствуешь</em> его — и это важнее.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_place',
                prompt: 'Твоё место в этом мире...',
                hint: 'То, где по-настоящему хорошо',
                options: [
                    {
                        id: 'cottage',
                        icon: '🏠',
                        title: 'Небольшой дом',
                        desc: 'Свой угол, всё нужное рядом, тишина',
                        traits: { inner: 1, solo: 1, stable: 2,
                                  caring: 1, creating: 1, thinking: 0 }
                    },
                    {
                        id: 'tower',
                        icon: '🗼',
                        title: 'Башня на холме',
                        desc: 'Видно далеко, один, можно думать',
                        traits: { inner: 2, solo: 2, stable: 1,
                                  caring: -1, creating: 0, thinking: 2 }
                    },
                    {
                        id: 'library',
                        icon: '📚',
                        title: 'Большая библиотека',
                        desc: 'Книги, тишина, бесконечное знание рядом',
                        traits: { inner: 2, solo: 1, stable: 1,
                                  caring: 0, creating: 1, thinking: 2 }
                    },
                    {
                        id: 'workshop',
                        icon: '⚒️',
                        title: 'Мастерская',
                        desc: 'Создаёшь что-то руками, запах дерева или краски',
                        traits: { inner: 1, solo: 1, stable: 2,
                                  caring: 0, creating: 2, thinking: 0 }
                    },
                    {
                        id: 'camp',
                        icon: '🔥',
                        title: 'Лагерь у огня',
                        desc: 'Люди вокруг, разговоры до утра, тепло',
                        traits: { inner: -2, solo: -2, stable: 0,
                                  caring: 2, creating: 0, thinking: -1 }
                    },
                    {
                        id: 'ship',
                        icon: '⛵',
                        title: 'Всё время в пути',
                        desc: 'Нет постоянного места, движение и есть дом',
                        traits: { inner: -1, solo: 0, stable: -3,
                                  caring: 0, creating: 0, thinking: -1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 5 — СТАРАЯ ДОРОГА (текст-переход)
        // ════════════════════════════════════════════════════
        {
            id: 'road_begin',
            chapter: 'Глава II — Дорога',
            left: {
                type: 'text',
                content: `
                    <div class="chapter-heading">Глава II &nbsp;·&nbsp; Дорога</div>
                    <div class="story-text">
                        <span class="drop-cap">З</span>
                        <p>а порогом начинается путь.</p>

                        <p>Ты не знаешь, куда именно ведёт эта дорога. Но ты знаешь,
                        что выйти — нужно. Что-то внутри говорит: <em>пора</em>.</p>

                        <p>Перед выходом ты задерживаешься на мгновение.
                        На столе лежат вещи. Ты можешь взять только одну.</p>

                        <p>Не думай слишком долго. Рука сама потянется к нужному.</p>

                        <div class="ornament">· · ·</div>

                        <p>Иногда то, что мы берём с собой в путь —
                        говорит о нас больше, чем то, что мы оставляем.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_item',
                prompt: 'Ты берёшь с собой...',
                hint: 'Ту вещь, без которой путь был бы неполным',
                options: [
                    {
                        id: 'book',
                        icon: '📖',
                        title: 'Книгу',
                        desc: 'Старую, с пометками на полях',
                        traits: { thinking: 2, inner: 1, creating: 0,
                                  caring: 0, solo: 1, spiritual: 1 }
                    },
                    {
                        id: 'journal',
                        icon: '📓',
                        title: 'Пустой дневник',
                        desc: 'Чтобы записывать то, что увидишь',
                        traits: { thinking: 1, inner: 2, creating: 1,
                                  caring: 0, solo: 1, spiritual: 1 }
                    },
                    {
                        id: 'compass',
                        icon: '🧭',
                        title: 'Компас',
                        desc: 'Всегда знать, где север',
                        traits: { thinking: 1, inner: 0, creating: 0,
                                  caring: 0, solo: 1, stable: 1 }
                    },
                    {
                        id: 'candle',
                        icon: '🕯️',
                        title: 'Свечу',
                        desc: 'Свет там, где темно',
                        traits: { thinking: 0, inner: 1, creating: 0,
                                  caring: 2, solo: 0, spiritual: 2 }
                    },
                    {
                        id: 'tool',
                        icon: '🔧',
                        title: 'Инструмент',
                        desc: 'Починить, построить, сделать',
                        traits: { thinking: 0, inner: -1, creating: 2,
                                  caring: 1, solo: 0, stable: 1 }
                    },
                    {
                        id: 'seeds',
                        icon: '🌱',
                        title: 'Семена',
                        desc: 'Что-то живое, что можно посадить',
                        traits: { thinking: 0, inner: 1, creating: 1,
                                  caring: 2, solo: 0, stable: 2 }
                    },
                    {
                        id: 'instrument',
                        icon: '🎶',
                        title: 'Музыкальный инструмент',
                        desc: 'Потому что без музыки дорога длиннее',
                        traits: { thinking: 0, inner: 1, creating: 2,
                                  caring: 1, solo: 0, intuitive: 2 }
                    },
                    {
                        id: 'nothing',
                        icon: '🤲',
                        title: 'Ничего',
                        desc: 'Налегке — так свободнее',
                        traits: { thinking: -1, inner: 0, creating: 0,
                                  caring: 0, solo: 1, stable: -1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 6 — КАК ТЫ ИДЁШЬ
        // ════════════════════════════════════════════════════
        {
            id: 'walking_style',
            chapter: 'Глава II — Дорога',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Дорога идёт через холмы. Вокруг — тишина и простор.</p>

                        <p>Ты замечаешь, как идёшь. У каждого — своя походка не только
                        ногами, но и мыслями.</p>

                        <p>Кто-то шагает, уже зная следующие двадцать шагов наперёд.
                        Кто-то останавливается у каждого куста — просто посмотреть.
                        Кто-то идёт быстро, потому что цель важнее дороги.</p>

                        <div class="story-quote">
                            «Не так важно, куда ты идёшь —
                             важно, как ты это делаешь.
                             Потому что именно это и есть ты.»
                        </div>
                    </div>
                `
            },
            right: {
                type: 'scales',
                questionId: 'q_walk_style',
                prompt: 'Как ты обычно движешься к цели?',
                scales: [
                    {
                        id: 'speed',
                        label: 'Темп',
                        leftLabel: 'Медленно, вдумчиво',
                        rightLabel: 'Быстро, напролом',
                        axis: 'stable',
                        direction: -1
                    },
                    {
                        id: 'plan',
                        label: 'Подход',
                        leftLabel: 'Сначала план',
                        rightLabel: 'Сначала действие',
                        axis: 'thinking',
                        direction: -1
                    },
                    {
                        id: 'notice',
                        label: 'Внимание',
                        leftLabel: 'Смотрю по сторонам',
                        rightLabel: 'Смотрю вперёд',
                        axis: 'intuitive',
                        direction: 1
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 7 — РАЗВИЛКА
        // ════════════════════════════════════════════════════
        {
            id: 'crossroads',
            chapter: 'Глава II — Дорога',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Развилка. Три дороги.</p>

                        <p>Нет указателей. Нет карты. Только ты, ветер
                        и ощущение, которое сложно объяснить словами.</p>

                        <p>Левая дорога уходит в тень деревьев — там прохладно
                        и тихо. Правая ведёт через открытое поле — видно далеко,
                        но идти долго. Средняя — круто вниз, к реке.
                        Слышно, как она шумит.</p>

                        <div class="ornament">· · ·</div>

                        <p>Ты стоишь и слушаешь себя.</p>

                        <p>Иногда развилки — это не выбор дороги.
                        Это выбор того, что для тебя важнее.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_crossroads',
                prompt: 'Ты идёшь...',
                hint: 'Не думай — куда тянет?',
                options: [
                    {
                        id: 'forest_path',
                        icon: '🌿',
                        title: 'В тень леса',
                        desc: 'Тихо, прохладно, интересно что там',
                        traits: { inner: 2, intuitive: 1, thinking: 1,
                                  solo: 1, spiritual: 1, stable: 1 }
                    },
                    {
                        id: 'open_field',
                        icon: '🌤️',
                        title: 'Через открытое поле',
                        desc: 'Далеко видно, прямо к цели',
                        traits: { inner: -1, intuitive: -1, thinking: 1,
                                  solo: 0, spiritual: 0, stable: 1 }
                    },
                    {
                        id: 'to_river',
                        icon: '💧',
                        title: 'Вниз, к реке',
                        desc: 'Туда, откуда слышен шум воды',
                        traits: { inner: 1, intuitive: 2, thinking: -1,
                                  solo: 0, spiritual: 1, stable: -1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 8 — ВСТРЕЧА НА ПУТИ
        // ════════════════════════════════════════════════════
        {
            id: 'encounter',
            chapter: 'Глава II — Дорога',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>На пути — человек. Он сидит у дороги и не торопится никуда.</p>

                        <p>Ты сбавляешь шаг. Что-то в нём останавливает —
                        не угроза, а скорее вопрос. Незаданный.</p>

                        <p>Люди, которых мы встречаем в пути, редко случайны.
                        Иногда они — зеркало. Иногда — указатель.
                        Иногда просто попутчик.</p>

                        <div class="story-quote">
                            «Кого ты замечаешь в толпе —
                             говорит о том, что важно тебе.»
                        </div>

                        <p>Этот человек смотрит на тебя. Ждёт.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_encounter_person',
                prompt: 'Кто этот человек?',
                hint: 'Выбери того, кто первым возник в воображении',
                options: [
                    {
                        id: 'elder',
                        icon: '👴',
                        title: 'Старый мудрец',
                        desc: 'Молчаливый, смотрит как будто знает о тебе всё',
                        traits: { thinking: 2, inner: 1, caring: 0,
                                  solo: 1, spiritual: 2, intuitive: 1 }
                    },
                    {
                        id: 'child',
                        icon: '🧒',
                        title: 'Потерявшийся ребёнок',
                        desc: 'Смотрит с надеждой, явно нуждается в помощи',
                        traits: { thinking: -1, inner: -1, caring: 3,
                                  solo: -1, spiritual: 1, intuitive: 0 }
                    },
                    {
                        id: 'peer',
                        icon: '🧑',
                        title: 'Ровесник в таком же пути',
                        desc: 'Похож на тебя. Идёт куда-то своё',
                        traits: { thinking: 0, inner: 0, caring: 1,
                                  solo: -1, spiritual: 0, intuitive: 0 }
                    },
                    {
                        id: 'artist',
                        icon: '🎨',
                        title: 'Художник',
                        desc: 'Рисует прямо здесь. Не обращает внимания на мир',
                        traits: { thinking: 0, inner: 1, caring: 0,
                                  solo: 1, creating: 2, intuitive: 1 }
                    },
                    {
                        id: 'merchant',
                        icon: '🧳',
                        title: 'Торговец',
                        desc: 'Деловой, много знает о дорогах и людях',
                        traits: { thinking: 1, inner: -1, caring: 0,
                                  solo: -1, spiritual: -1, stable: 1 }
                    },
                    {
                        id: 'nobody',
                        icon: '🌫️',
                        title: 'Никого',
                        desc: 'Ты предпочитаешь идти одному',
                        traits: { thinking: 0, inner: 2, caring: -1,
                                  solo: 2, spiritual: 1, intuitive: 0 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 9 — РАЗГОВОР / ЧТО ВАЖНО В ЛЮДЯХ
        // ════════════════════════════════════════════════════
        {
            id: 'encounter_talk',
            chapter: 'Глава II — Дорога',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Вы разговариваете. Или молчите — но это тоже разговор.</p>

                        <p>У каждого из нас есть то, что мы замечаем в других
                        в первую очередь. Не внешность — что-то глубже.</p>

                        <p>Это то, что мы ценим сами. То, чего нам
                        может не хватать — или того, чего у нас в избытке.</p>

                        <div class="ornament">· · ·</div>

                        <p>Что ты замечаешь в людях прежде всего?</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_notice_in_people',
                prompt: 'В людях тебя прежде всего притягивает...',
                hint: 'Первое ощущение, без раздумий',
                options: [
                    {
                        id: 'intelligence',
                        icon: '💡',
                        title: 'Ум и глубина',
                        desc: 'С умным человеком интересно молчать',
                        traits: { thinking: 2, inner: 1, spiritual: 0,
                                  intuitive: 0, caring: 0, solo: 1 }
                    },
                    {
                        id: 'kindness',
                        icon: '🤲',
                        title: 'Доброта и тепло',
                        desc: 'Рядом с добрым человеком легче дышать',
                        traits: { thinking: 0, inner: 0, spiritual: 1,
                                  intuitive: 1, caring: 2, solo: -1 }
                    },
                    {
                        id: 'honesty',
                        icon: '⚖️',
                        title: 'Честность',
                        desc: 'Предпочитаю горькую правду сладкой лжи',
                        traits: { thinking: 1, inner: 1, spiritual: 1,
                                  intuitive: 0, caring: 1, solo: 0 }
                    },
                    {
                        id: 'creativity',
                        icon: '🌀',
                        title: 'Творческий огонь',
                        desc: 'Те, кто создаёт — живут по-настоящему',
                        traits: { thinking: 0, inner: 1, creating: 2,
                                  intuitive: 2, caring: 0, solo: 0 }
                    },
                    {
                        id: 'strength',
                        icon: '🏔️',
                        title: 'Сила и надёжность',
                        desc: 'На такого человека можно опереться',
                        traits: { thinking: 0, inner: -1, spiritual: 0,
                                  intuitive: 0, caring: 1, stable: 2 }
                    },
                    {
                        id: 'freedom',
                        icon: '🕊️',
                        title: 'Свобода духа',
                        desc: 'Те, кто живёт по-своему, не оглядываясь',
                        traits: { thinking: 0, inner: 1, stable: -1,
                                  intuitive: 1, caring: -1, solo: 1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 10 — ИСПЫТАНИЕ (глава 3)
        // ════════════════════════════════════════════════════
        {
            id: 'trial_intro',
            chapter: 'Глава III — Испытание',
            left: {
                type: 'text',
                content: `
                    <div class="chapter-heading">Глава III &nbsp;·&nbsp; Испытание</div>
                    <div class="story-text">
                        <span class="drop-cap">П</span>
                        <p>огода меняется. Небо темнеет.</p>

                        <p>Каждый путь имеет место, где становится труднее.
                        Это не наказание — это проверка. Не судьбой — собой.</p>

                        <p>Впереди — препятствие. Ты видишь его издалека
                        и успеваешь подумать, прежде чем столкнуться.</p>

                        <div class="story-quote">
                            «То, как человек встречает трудность,
                             раскрывает его полностью.
                             Не то, кем он хочет казаться —
                             а то, кто он есть.»
                        </div>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_obstacle_type',
                prompt: 'Какое препятствие ты видишь чаще всего в жизни?',
                hint: 'Не в этой истории — в своей настоящей',
                options: [
                    {
                        id: 'inner_doubt',
                        icon: '🌀',
                        title: 'Сомнения внутри',
                        desc: 'Голос, который говорит: ты не сможешь',
                        traits: { inner: 2, thinking: 1, spiritual: 1,
                                  intuitive: 1, stable: -1, caring: 0 }
                    },
                    {
                        id: 'other_people',
                        icon: '👥',
                        title: 'Непонимание людей',
                        desc: 'Тебя не слышат, не принимают, не верят',
                        traits: { inner: 1, thinking: 0, spiritual: 0,
                                  intuitive: 0, solo: 1, caring: 1 }
                    },
                    {
                        id: 'no_resources',
                        icon: '⚖️',
                        title: 'Нехватка ресурсов',
                        desc: 'Времени, денег, сил — того, что нужно для движения',
                        traits: { inner: -1, thinking: 1, spiritual: -1,
                                  intuitive: 0, stable: 1, creating: 0 }
                    },
                    {
                        id: 'no_direction',
                        icon: '🧭',
                        title: 'Потеря направления',
                        desc: 'Не знаешь, куда идти — дорог много, выбор непонятен',
                        traits: { inner: 1, thinking: 0, spiritual: 2,
                                  intuitive: 1, stable: -1, creating: 0 }
                    },
                    {
                        id: 'fear',
                        icon: '🌑',
                        title: 'Страх',
                        desc: 'Знаешь, что делать — но что-то останавливает',
                        traits: { inner: 2, thinking: 0, spiritual: 1,
                                  intuitive: 1, stable: -1, caring: 0 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 11 — КАК РЕАГИРУЕШЬ
        // ════════════════════════════════════════════════════
        {
            id: 'trial_reaction',
            chapter: 'Глава III — Испытание',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Ты стоишь перед трудностью. Пауза.</p>

                        <p>Первая реакция — самая честная. До того, как
                        включается то, каким ты должен быть.</p>

                        <p>Некоторые сразу бросаются вперёд. Некоторые останавливаются
                        и смотрят — долго, внимательно. Некоторые ищут, кто поможет.
                        Некоторые делают вид, что ничего не происходит, и идут дальше.</p>

                        <div class="ornament">· · ·</div>

                        <p>Ни один из этих способов не неправильный.
                        Они просто разные. И каждый — о чём-то говорит.</p>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_reaction',
                prompt: 'Первое, что ты делаешь:',
                options: [
                    {
                        id: 'analyze',
                        icon: '🔍',
                        title: 'Останавливаюсь и анализирую',
                        desc: 'Сначала понять — потом действовать',
                        traits: { thinking: 3, inner: 1, intuitive: -1,
                                  stable: 1, caring: 0, solo: 1 }
                    },
                    {
                        id: 'act',
                        icon: '⚡',
                        title: 'Действую сразу',
                        desc: 'Думать буду потом, сейчас — движение',
                        traits: { thinking: -2, inner: -1, intuitive: 0,
                                  stable: -1, caring: 0, solo: 0 }
                    },
                    {
                        id: 'seek_help',
                        icon: '🤝',
                        title: 'Ищу помощь',
                        desc: 'Один в поле не воин — нужны люди',
                        traits: { thinking: 0, inner: -1, intuitive: 0,
                                  stable: 0, caring: 1, solo: -2 }
                    },
                    {
                        id: 'feel',
                        icon: '🌊',
                        title: 'Прислушиваюсь к ощущениям',
                        desc: 'Интуиция подскажет — если не мешать ей',
                        traits: { thinking: -1, inner: 2, intuitive: 3,
                                  stable: 0, caring: 0, solo: 1 }
                    },
                    {
                        id: 'wait',
                        icon: '⏳',
                        title: 'Жду — само рассосётся или придёт ясность',
                        desc: 'Не всё требует немедленного ответа',
                        traits: { thinking: 0, inner: 1, intuitive: 1,
                                  stable: 2, caring: 0, solo: 1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 12 — ЦЕННОСТИ (глава 4)
        // ════════════════════════════════════════════════════
        {
            id: 'values',
            chapter: 'Глава IV — Что важно',
            left: {
                type: 'text',
                content: `
                    <div class="chapter-heading">Глава IV &nbsp;·&nbsp; Что важно</div>
                    <div class="story-text">
                        <span class="drop-cap">Т</span>
                        <p>ропа выходит на поляну. Здесь хочется остановиться.</p>

                        <p>Ты садишься. Вокруг тихо. И в этой тишине
                        начинают всплывать мысли — не случайные,
                        а важные. Те, которые обычно не успеваешь поймать.</p>

                        <p>Что для тебя по-настоящему важно?
                        Не то, что должно быть важным. Не то, за что
                        хвалят других. А своё — личное, настоящее.</p>

                        <div class="story-quote">
                            «Ценности — это не то, что мы декларируем.
                             Это то, чем мы жертвуем ради другого.»
                        </div>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_values',
                prompt: 'Если пришлось бы выбрать одно — что важнее всего?',
                hint: 'Только одно. Самое главное',
                options: [
                    {
                        id: 'freedom',
                        icon: '🕊️',
                        title: 'Свобода',
                        desc: 'Жить так, как считаю нужным, не оглядываясь',
                        traits: { stable: -2, solo: 2, inner: 1,
                                  thinking: 0, spiritual: 1, caring: -1 }
                    },
                    {
                        id: 'love',
                        icon: '❤️',
                        title: 'Любовь и близость',
                        desc: 'Настоящие отношения — это главное',
                        traits: { stable: 1, solo: -2, inner: 0,
                                  thinking: -1, spiritual: 1, caring: 2 }
                    },
                    {
                        id: 'knowledge',
                        icon: '🔭',
                        title: 'Знание и понимание',
                        desc: 'Понять мир — и себя в нём',
                        traits: { stable: 0, solo: 1, inner: 2,
                                  thinking: 2, spiritual: 1, caring: 0 }
                    },
                    {
                        id: 'creation',
                        icon: '✨',
                        title: 'Создавать что-то своё',
                        desc: 'Оставить след — в вещах, идеях, людях',
                        traits: { stable: 1, solo: 0, inner: 1,
                                  thinking: 0, creating: 3, caring: 0 }
                    },
                    {
                        id: 'help',
                        icon: '🌿',
                        title: 'Помогать другим',
                        desc: 'Смысл — в том, чтобы кому-то было лучше',
                        traits: { stable: 1, solo: -1, inner: 0,
                                  thinking: 0, spiritual: 1, caring: 3 }
                    },
                    {
                        id: 'meaning',
                        icon: '⭐',
                        title: 'Смысл и предназначение',
                        desc: 'Делать то, для чего пришёл',
                        traits: { stable: 0, solo: 1, inner: 2,
                                  thinking: 1, spiritual: 3, caring: 0 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 13 — ДЕТСТВО / КОРНИ
        // ════════════════════════════════════════════════════
        {
            id: 'childhood',
            chapter: 'Глава IV — Что важно',
            left: {
                type: 'text',
                content: `
                    <div class="story-text">
                        <p>Тропа поворачивает. И вдруг — запах детства.
                        Трава, или хлеб, или старое дерево — у каждого свой.</p>

                        <p>Есть что-то, что мы знали в детстве,
                        до того, как нас научили быть правильными.
                        Что-то, к чему тянулись сами — без объяснений.</p>

                        <p>Это важно. Потому что детский выбор —
                        он ближе к природе человека, чем взрослый.</p>

                        <div class="ornament">· · ·</div>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_childhood_joy',
                prompt: 'В детстве тебя больше всего радовало...',
                hint: 'То, что помнишь с удовольствием',
                options: [
                    {
                        id: 'explore',
                        icon: '🗺️',
                        title: 'Исследовать и открывать',
                        desc: 'Новые места, вещи, тайники, эксперименты',
                        traits: { thinking: 1, creating: 0, stable: -1,
                                  solo: 1, intuitive: 1, spiritual: 0 }
                    },
                    {
                        id: 'create',
                        icon: '🎨',
                        title: 'Создавать и мастерить',
                        desc: 'Рисовать, строить, придумывать, лепить',
                        traits: { thinking: 0, creating: 3, stable: 1,
                                  solo: 1, intuitive: 1, spiritual: 0 }
                    },
                    {
                        id: 'dream',
                        icon: '☁️',
                        title: 'Фантазировать и мечтать',
                        desc: 'Свои миры, истории, персонажи в голове',
                        traits: { thinking: 0, creating: 1, stable: -1,
                                  solo: 1, intuitive: 2, spiritual: 2 }
                    },
                    {
                        id: 'play_with',
                        icon: '👫',
                        title: 'Играть с другими',
                        desc: 'Компания, команда, шум и смех',
                        traits: { thinking: -1, creating: 0, stable: 0,
                                  solo: -2, intuitive: 0, spiritual: 0 }
                    },
                    {
                        id: 'read_learn',
                        icon: '📚',
                        title: 'Читать и узнавать новое',
                        desc: 'Книги, энциклопедии, вопросы взрослым',
                        traits: { thinking: 2, creating: 0, stable: 1,
                                  solo: 1, intuitive: 0, spiritual: 1 }
                    },
                    {
                        id: 'nature',
                        icon: '🌳',
                        title: 'Быть на природе',
                        desc: 'Лес, река, животные, земля',
                        traits: { thinking: 0, creating: 0, stable: 1,
                                  solo: 0, intuitive: 2, spiritual: 2 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 14 — ДАР (финал истории)
        // ════════════════════════════════════════════════════
        {
            id: 'gift',
            chapter: 'Глава V — Дар',
            left: {
                type: 'text',
                content: `
                    <div class="chapter-heading">Глава V &nbsp;·&nbsp; Дар</div>
                    <div class="story-text">
                        <span class="drop-cap">П</span>
                        <p>уть подходит к концу. Ты выходишь на высокое место,
                        откуда видно далеко.</p>

                        <p>И в этот момент — тихое понимание.
                        Не мысль, не слово — ощущение.</p>

                        <p>Ты нёс что-то важное всё это время.
                        Не вещь в котомке — что-то другое.
                        То, что есть только у тебя.</p>

                        <p>Это нельзя украсть. Нельзя купить. Нельзя потерять.
                        Оно — часть тебя. И мир нуждается именно в этом.</p>

                        <div class="ornament">✦ · ✦</div>
                    </div>
                `
            },
            right: {
                type: 'choice',
                questionId: 'q_gift',
                prompt: 'Твой главный дар миру — это...',
                hint: 'Не скромничай. Что ты умеешь лучше других?',
                options: [
                    {
                        id: 'understanding',
                        icon: '💡',
                        title: 'Понимание',
                        desc: 'Ты видишь суть — там, где другие видят хаос',
                        traits: { thinking: 2, inner: 1, spiritual: 1,
                                  caring: 0, creating: 0, intuitive: 1 }
                    },
                    {
                        id: 'creating_beauty',
                        icon: '🌸',
                        title: 'Красота',
                        desc: 'Ты делаешь мир красивее — в широком смысле',
                        traits: { thinking: 0, inner: 1, creating: 3,
                                  caring: 1, spiritual: 1, intuitive: 1 }
                    },
                    {
                        id: 'care',
                        icon: '🌿',
                        title: 'Забота',
                        desc: 'Рядом с тобой людям легче — просто от присутствия',
                        traits: { thinking: -1, inner: 0, creating: 0,
                                  caring: 3, spiritual: 1, intuitive: 1 }
                    },
                    {
                        id: 'building',
                        icon: '🏛️',
                        title: 'Созидание',
                        desc: 'Ты строишь то, что остаётся — системы, вещи, порядок',
                        traits: { thinking: 1, inner: 0, creating: 2,
                                  caring: 0, stable: 2, intuitive: -1 }
                    },
                    {
                        id: 'truth',
                        icon: '🔦',
                        title: 'Честность',
                        desc: 'Ты говоришь правду, когда другие молчат',
                        traits: { thinking: 1, inner: 1, creating: 0,
                                  caring: 1, spiritual: 1, solo: 1 }
                    },
                    {
                        id: 'connection',
                        icon: '🕸️',
                        title: 'Связь',
                        desc: 'Ты соединяешь людей — и они начинают двигаться',
                        traits: { thinking: 0, inner: -1, creating: 0,
                                  caring: 2, solo: -2, intuitive: 1 }
                    }
                ]
            }
        },

        // ════════════════════════════════════════════════════
        // РАЗВОРОТ 15 — РЕЗУЛЬТАТ
        // ════════════════════════════════════════════════════
        {
            id: 'result',
            chapter: 'Твоя история',
            left: {
                type: 'result-left'
                // заполняется динамически
            },
            right: {
                type: 'result-right'
                // заполняется динамически
            },
            noQuestion: true,
            isResult: true
        }

    ]; // конец spreads

    function getSpreads() { return spreads; }
    function getSpread(index) { return spreads[index]; }
    function getTotalSpreads() { return spreads.length; }

    return { getSpreads, getSpread, getTotalSpreads };

})();
