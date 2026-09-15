/**
 * book.js
 */

const BookEngine = (() => {

    let currentIndex = 0;
    let isAnimating  = false;
    let isOpen       = false;

    // ── DOM ────────────────────────────────────────────────
    const bookEl     = document.getElementById('book');
    const pageLeftEl = document.getElementById('page-left');
    const pageRightEl= document.getElementById('page-right');
    const spineEl    = document.getElementById('book-spine');
    const shadowEl   = document.getElementById('book-shadow');
    const btnPrev    = document.getElementById('btn-prev');
    const btnNext    = document.getElementById('btn-next');
    const sceneEl    = document.getElementById('book-scene');

    // ── Размеры из CSS-переменных ──────────────────────────
    function cssVar(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim();
    }

    function pageW()  { return parseInt(cssVar('--page-w'));  }
    function pageH()  { return parseInt(cssVar('--page-h'));  }
    function spineW() { return parseInt(cssVar('--spine-w')); }
    function bookFullW() { return pageW() * 2 + spineW(); }

    // ── Позиционирование кнопок и тени ─────────────────────
    // Кнопки цепляются к краям книги, которая центрирована во вьюпорте
    function repositionUI() {
        const vw        = window.innerWidth;
        const bw        = bookEl.offsetWidth;
        const bookLeft  = (vw - bw) / 2;   // левый край книги в px от левого края вьюпорта
        const bookRight = bookLeft + bw;     // правый край книги

        const btnOffset = 16; // отступ кнопки от края книги

        btnPrev.style.left = (bookLeft - 42 - btnOffset) + 'px';
        btnNext.style.left = (bookRight + btnOffset) + 'px';

        // Тень
        shadowEl.style.left  = bookLeft + 'px';
        shadowEl.style.width = bw + 'px';
    }

    // ── Инициализация ──────────────────────────────────────
    function init() {
        setTimeout(() => {
            const l = document.getElementById('loading-screen');
            if (l) l.classList.add('hidden');
        }, 900);

        setupClosedState();
        renderCover();

        window.addEventListener('resize', repositionUI);
    }

    // ════════════════════════════════════════════════════════
    //  ЗАКРЫТАЯ КНИГА
    // ════════════════════════════════════════════════════════
    function setupClosedState() {
        isOpen = false;

        // Ширина = одна страница
        bookEl.style.transition = 'none';
        bookEl.style.width      = pageW() + 'px';

        // Скрываем левую страницу и корешок
        pageLeftEl.style.display  = 'none';
        spineEl.style.display     = 'none';
        btnPrev.style.display     = 'none';
        btnNext.style.display     = 'none';

        // Правая страница — обложка
        pageRightEl.style.display      = 'block';
        pageRightEl.style.borderRadius = '3px 5px 5px 3px';
        pageRightEl.style.boxShadow    =
            '-3px 0 10px rgba(0,0,0,0.35), ' +
            '4px 4px 20px rgba(0,0,0,0.5), ' +
            '1px 0 3px rgba(0,0,0,0.4)';
        pageRightEl.style.cursor       = 'pointer';

        // Позиционируем UI после установки ширины
        setTimeout(repositionUI, 0);

        pageRightEl.addEventListener('click', openBook, { once: true });
    }

    function renderCover() {
        document.getElementById('right-content').innerHTML = `
            <div style="
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(160deg, #2d2008 0%, #1a1208 55%, #0d0a05 100%);
                margin: -44px -40px;
                padding: 44px 40px;
                cursor: pointer;
            ">
                <div style="
                    color: #c8a84b;
                    font-size: 0.52em;
                    letter-spacing: 0.7em;
                    opacity: 0.38;
                    margin-bottom: 30px;
                ">✦ &nbsp; ✦ &nbsp; ✦</div>

                <div style="
                    color: #c8a84b;
                    font-size: 2em;
                    letter-spacing: 0.5em;
                    margin-bottom: 12px;
                    text-align: center;
                    line-height: 1.2;
                ">ПУТЬ</div>

                <div style="
                    color: #c8a84b;
                    font-size: 0.58em;
                    letter-spacing: 0.35em;
                    opacity: 0.48;
                    margin-bottom: 56px;
                    text-align: center;
                ">книга о себе</div>

                <div style="
                    width: 40px;
                    height: 1px;
                    background: rgba(200,168,75,0.25);
                    margin-bottom: 32px;
                "></div>

                <div style="
                    color: #c8a84b;
                    font-size: 0.55em;
                    letter-spacing: 0.25em;
                    opacity: 0.3;
                    animation: pulse 3s ease infinite;
                ">нажмите, чтобы открыть</div>
            </div>
        `;
        document.getElementById('left-page-num').textContent  = '';
        document.getElementById('right-page-num').textContent = '';
    }

    // ════════════════════════════════════════════════════════
    //  ОТКРЫТИЕ КНИГИ
    // ════════════════════════════════════════════════════════
    function openBook() {
        if (isAnimating) return;
        isAnimating = true;
        pageRightEl.style.cursor = 'default';

        const pw = pageW();
        const ph = pageH();

        // Снимаем HTML обложки до того, как страница изменится
        const coverHTML = document.getElementById('right-content').innerHTML;

        // 1. Показываем левую страницу и корешок (пока скрытые)
        pageLeftEl.style.display = 'block';
        pageLeftEl.style.opacity = '0';
        spineEl.style.display    = 'block';
        spineEl.style.opacity    = '0';
        document.getElementById('left-content').innerHTML  = '';
        document.getElementById('left-page-num').textContent = '';

        // 2. Расширяем книгу до разворота
        // Небольшая задержка чтобы браузер успел применить display:block
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bookEl.style.transition = 'width 0.55s cubic-bezier(0.4,0,0.2,1)';
                bookEl.style.width      = bookFullW() + 'px';

                // Плавно появляется левая страница и корешок
                setTimeout(() => {
                    pageLeftEl.style.transition = 'opacity 0.35s ease';
                    pageLeftEl.style.opacity    = '1';
                    spineEl.style.transition    = 'opacity 0.35s ease';
                    spineEl.style.opacity       = '1';
                }, 200);

                // Обновляем позиции кнопок во время расширения
                repositionUI();
                const repoInterval = setInterval(repositionUI, 16);

                // 3. После расширения — запускаем перелистывание обложки
                setTimeout(() => {
                    clearInterval(repoInterval);
                    repositionUI();

                    // Рендерим первый разворот (под летящей обложкой)
                    currentIndex = 0;
                    Renderer.renderSpread(currentIndex);

                    // Создаём летящую обложку
                    const flip = createFlipDiv(coverHTML, '', pw, ph);
                    flip.el.style.left            = pw + spineW() + 'px';
                    flip.el.style.transformOrigin = 'left center';
                    bookEl.appendChild(flip.el);

                    animateFlip({
                        el:       flip.el,
                        front:    flip.front,
                        back:     flip.back,
                        from:     0,
                        to:       -180,
                        duration: 900,
                        onComplete: () => {
                            flip.el.remove();
                            isAnimating = false;
                            isOpen      = true;

                            pageRightEl.style.borderRadius = '0 4px 4px 0';
                            pageRightEl.style.boxShadow    = '';

                            btnNext.style.display = 'block';
                            updateNavButtons();
                            repositionUI();
                        }
                    });

                }, 650);
            });
        });
    }

    // ════════════════════════════════════════════════════════
    //  ЛИСТАНИЕ ВПЕРЁД
    // ════════════════════════════════════════════════════════
    function next() {
        const total = Story.getTotalSpreads();
        if (currentIndex >= total - 1 || isAnimating) return;

        isAnimating = true;

        const nextIndex  = currentIndex + 1;
        const nextSpread = Story.getSpread(nextIndex);
        const pw         = pageW();
        const ph         = pageH();

        // Снимаем текущий правый контент — он будет на лицевой стороне флипа
        const frontHTML = document.getElementById('right-content').innerHTML;

        // Следующий левый контент — на оборотной стороне флипа
        const backHTML  = getLeftHTML(nextSpread);

        // Обновляем реальные страницы на следующий разворот.
        // Правая страница сразу показывает следующий правый контент —
        // он виден из-под летящей страницы.
        currentIndex = nextIndex;
        Renderer.renderSpread(currentIndex);

        // Создаём флип поверх — он закрывает текущую правую страницу
        // и показывает текущий правый контент (frontHTML)
        const flip = createFlipDiv(frontHTML, backHTML, pw, ph);
        flip.el.style.left            = (pw + spineW()) + 'px';
        flip.el.style.transformOrigin = 'left center';
        bookEl.appendChild(flip.el);

        animateFlip({
            el:       flip.el,
            front:    flip.front,
            back:     flip.back,
            from:     0,
            to:       -180,
            duration: 1000,
            onHalf: () => {
                // В момент прохождения 90° — левая страница уже
                // показывает следующий левый контент (Renderer уже отрисовал)
                // Дополнительных действий не нужно
            },
            onComplete: () => {
                flip.el.remove();
                isAnimating = false;
                updateNavButtons();
            }
        });
    }

    // ════════════════════════════════════════════════════════
    //  ЛИСТАНИЕ НАЗАД
    // ════════════════════════════════════════════════════════
    function prev() {
        if (currentIndex <= 0 || isAnimating) return;

        isAnimating = true;

        const prevIndex  = currentIndex - 1;
        const pw         = pageW();
        const ph         = pageH();

        // Снимаем текущий левый контент — на оборотной стороне флипа
        const backHTML  = document.getElementById('left-content').innerHTML;

        // Предыдущий правый контент — на лицевой стороне флипа
        // (страница "возвращается" справа налево)
        const frontHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
            ">
                <span style="
                    color: var(--ink-light);
                    font-size: 0.82em;
                    font-style: italic;
                    opacity: 0.5;
                    line-height: 1.8;
                ">
                    ← предыдущая страница
                </span>
            </div>`;

        // Обновляем реальные страницы на предыдущий разворот
        currentIndex = prevIndex;
        Renderer.renderSpread(currentIndex);

        // Флип стартует слева уже в перевёрнутом положении (-180°)
        // и возвращается к 0°
        const flip = createFlipDiv(frontHTML, backHTML, pw, ph);
        flip.el.style.left            = '0px';
        flip.el.style.transformOrigin = 'right center';
        bookEl.appendChild(flip.el);

        // Инициализируем перевёрнутое положение
        flip.el.style.transform  = 'rotateY(-180deg)';
        flip.front.style.opacity = '0';
        flip.back.style.opacity  = '1';

        animateFlip({
            el:       flip.el,
            front:    flip.front,
            back:     flip.back,
            from:     -180,
            to:       0,
            duration: 1000,
            reverse:  true,
            onComplete: () => {
                flip.el.remove();
                isAnimating = false;
                updateNavButtons();
            }
        });
    }

    // ════════════════════════════════════════════════════════
    //  ЯДРО АНИМАЦИИ ЛИСТАНИЯ
    // ════════════════════════════════════════════════════════
    function animateFlip({
        el, front, back,
        from, to,
        duration,
        reverse    = false,
        onHalf     = null,
        onComplete = null
    }) {
        const startTime  = performance.now();
        const range      = to - from;
        let   halfFired  = false;

        // Убеждаемся что начальное состояние правильное
        if (!reverse) {
            front.style.opacity = '1';
            back.style.opacity  = '0';
        }

        function frame(now) {
            const elapsed = now - startTime;
            const rawP    = Math.min(elapsed / duration, 1);
            const easedP  = easeInOutCubic(rawP);

            const angle = from + range * easedP;

            // Изгиб страницы (максимум в середине)
            const bend = Math.sin(rawP * Math.PI);
            const skew = bend * 5 * (range > 0 ? -1 : 1);

            el.style.transform = `rotateY(${angle}deg) skewY(${skew}deg)`;

            // Тень по краю
            const sh = bend * 18;
            const sd = from < to ? -1 : 1; // направление тени
            el.style.boxShadow =
                `${sd * sh}px 0 ${sh * 1.5}px rgba(0,0,0,${bend * 0.3})`;

            // Переключение видимой стороны в точке 90°
            if (!reverse) {
                // Вперёд: 0 → -180
                if (angle > -90) {
                    front.style.opacity = '1';
                    back.style.opacity  = '0';
                } else {
                    front.style.opacity = '0';
                    back.style.opacity  = '1';
                }
            } else {
                // Назад: -180 → 0
                if (angle < -90) {
                    back.style.opacity  = '1';
                    front.style.opacity = '0';
                } else {
                    back.style.opacity  = '0';
                    front.style.opacity = '1';
                }
            }

            // Событие "прошли половину"
            if (!halfFired && rawP >= 0.5) {
                halfFired = true;
                if (onHalf) onHalf();
            }

            if (rawP < 1) {
                requestAnimationFrame(frame);
            } else {
                // Финальное состояние
                el.style.transform  = `rotateY(${to}deg)`;
                el.style.boxShadow  = 'none';
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(frame);
    }

    // ════════════════════════════════════════════════════════
    //  СОЗДАНИЕ ФЛИП-ЭЛЕМЕНТА
    // ════════════════════════════════════════════════════════
    function createFlipDiv(frontHTML, backHTML, pw, ph) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute;
            top: 0;
            width: ${pw}px;
            height: ${ph}px;
            z-index: 50;
            pointer-events: none;
        `;

        const commonStyle = `
            position: absolute;
            inset: 0;
            overflow: hidden;
            padding: 44px 40px 36px;
            box-sizing: border-box;
            background-color: var(--page-bg);
            background-image: repeating-linear-gradient(
                transparent, transparent 31px,
                rgba(180,160,120,0.15) 31px,
                rgba(180,160,120,0.15) 32px
            );
        `;

        // Лицевая сторона
        const front = document.createElement('div');
        front.style.cssText = commonStyle;
        front.innerHTML = frontHTML;

        // Оборотная сторона (зеркально отражена по X)
        const back = document.createElement('div');
        back.style.cssText = commonStyle + `
            transform: scaleX(-1);
            opacity: 0;
        `;
        back.innerHTML = backHTML;

        el.appendChild(front);
        el.appendChild(back);

        return { el, front, back };
    }

    // ════════════════════════════════════════════════════════
    //  ВСПОМОГАТЕЛЬНЫЕ
    // ════════════════════════════════════════════════════════
    function getLeftHTML(spread) {
        if (!spread || !spread.left) return '';

        if (spread.left.type === 'text' ||
            spread.left.type === 'cover-left') {
            return spread.left.content || '';
        }

        if (spread.left.type === 'result-left') {
            const arch = Archetypes.get(Profile.computeArchetype());
            return `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 14px;
                    text-align: center;
                ">
                    <div style="font-size: 2.8em;">${arch.emoji}</div>
                    <div style="
                        color: var(--accent);
                        font-size: 1.05em;
                        letter-spacing: 0.12em;
                    ">${arch.name}</div>
                </div>`;
        }

        return '';
    }

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function updateNavButtons() {
        const total  = Story.getTotalSpreads();
        const spread = Story.getSpread(currentIndex);
        const hasQuestion = spread && !spread.noQuestion;

        // Кнопка "назад"
        btnPrev.style.display =
            currentIndex <= 0 ? 'none' : 'block';

        // Кнопка "вперёд"
        if (hasQuestion) {
            // Пользователь должен сделать выбор
            btnNext.style.opacity       = '0';
            btnNext.style.pointerEvents = 'none';
        } else if (currentIndex >= total - 1) {
            btnNext.style.opacity       = '0.15';
            btnNext.style.pointerEvents = 'none';
        } else {
            btnNext.style.display       = 'block';
            btnNext.style.opacity       = '1';
            btnNext.style.pointerEvents = 'auto';
        }

        repositionUI();
    }

    function getCurrentIndex() { return currentIndex; }

    document.addEventListener('DOMContentLoaded', init);

    return { next, prev, getCurrentIndex, openBook };

})();
