/**
 * book.js — полная перезапись v3
 */

const BookEngine = (() => {

    // ── Состояние ──────────────────────────────────────────
    let currentIndex = 0;
    let isAnimating  = false;
    let bookState    = 'closed'; // 'closed' | 'opening' | 'open' | 'closing'

    // ── DOM ────────────────────────────────────────────────
    const bookEl      = document.getElementById('book');
    const pageLeftEl  = document.getElementById('page-left');
    const pageRightEl = document.getElementById('page-right');
    const spineEl     = document.getElementById('book-spine');
    const shadowEl    = document.getElementById('book-shadow');
    const btnPrev     = document.getElementById('btn-prev');
    const btnNext     = document.getElementById('btn-next');
    const sceneEl     = document.getElementById('book-scene');

    // ── CSS-переменные ─────────────────────────────────────
    function cssInt(name) {
        const v = getComputedStyle(document.documentElement)
                    .getPropertyValue(name).trim();
        return parseInt(v) || 0;
    }
    function PW()  { return cssInt('--page-w');  }
    function PH()  { return cssInt('--page-h');  }
    function SW()  { return cssInt('--spine-w'); }
    function BW()  { return PW() * 2 + SW();     }

    // ── Позиционирование кнопок относительно книги ─────────
    function repositionUI() {
        const rect = bookEl.getBoundingClientRect();

        // Кнопки — по краям книги
        const gap = 14;
        btnPrev.style.left = (rect.left - 42 - gap) + 'px';
        btnNext.style.left = (rect.right + gap) + 'px';

        // Тень под книгой
        shadowEl.style.left  = rect.left + 'px';
        shadowEl.style.width = rect.width + 'px';
    }

    // ══════════════════════════════════════════════════════
    //  ИНИЦИАЛИЗАЦИЯ
    // ══════════════════════════════════════════════════════
    function init() {
        setTimeout(() => {
            const l = document.getElementById('loading-screen');
            if (l) l.classList.add('hidden');
        }, 900);

        // Закрытая книга — одна страница, центр экрана
        bookEl.style.transition = 'none';
        bookEl.style.width      = PW() + 'px';

        // Скрываем всё кроме правой страницы (обложка)
        pageLeftEl.style.visibility = 'hidden';
        pageLeftEl.style.display    = 'flex';  // держим в потоке!
        spineEl.style.visibility    = 'hidden';
        btnPrev.style.display       = 'none';
        btnNext.style.display       = 'none';

        renderCover();

        // После рендера — позиционируем UI
        requestAnimationFrame(() => {
            repositionUI();
            window.addEventListener('resize', repositionUI);
        });

        pageRightEl.style.cursor = 'pointer';
        pageRightEl.addEventListener('click', openBook, { once: true });
    }

    // ══════════════════════════════════════════════════════
    //  ОБЛОЖКА
    // ══════════════════════════════════════════════════════
    function renderCover() {
        document.getElementById('right-content').innerHTML = `
            <div style="
                height:100%; display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                background:linear-gradient(160deg,#2d2008 0%,#1a1208 55%,#0d0a05 100%);
                margin:-44px -40px; padding:44px 40px; cursor:pointer;
            ">
                <div style="color:#c8a84b;font-size:0.5em;letter-spacing:0.7em;
                            opacity:0.35;margin-bottom:28px;">✦ &nbsp; ✦ &nbsp; ✦</div>
                <div style="color:#c8a84b;font-size:2em;letter-spacing:0.5em;
                            margin-bottom:10px;text-align:center;">ПУТЬ</div>
                <div style="color:#c8a84b;font-size:0.58em;letter-spacing:0.35em;
                            opacity:0.45;margin-bottom:52px;">книга о себе</div>
                <div style="width:36px;height:1px;background:rgba(200,168,75,0.22);
                            margin-bottom:28px;"></div>
                <div style="color:#c8a84b;font-size:0.52em;letter-spacing:0.22em;
                            opacity:0.28;animation:pulse 3s ease infinite;">
                    нажмите, чтобы открыть
                </div>
            </div>`;

        document.getElementById('left-page-num').textContent  = '';
        document.getElementById('right-page-num').textContent = '';
    }

    // ══════════════════════════════════════════════════════
    //  ОТКРЫТИЕ КНИГИ
    //
    //  Алгоритм:
    //  1. Расширяем book до полного разворота — НО левая страница
    //     и корешок прозрачны (visibility:hidden), поэтому визуально
    //     книга пока выглядит как одна страница, просто сдвигается
    //     влево по мере расширения (т.к. flexbox центрирует).
    //  2. После расширения запускаем флип обложки (вправо→влево).
    //  3. После флипа показываем левую страницу и корешок.
    // ══════════════════════════════════════════════════════
    function openBook() {
        if (isAnimating) return;
        isAnimating = true;
        bookState   = 'opening';
        pageRightEl.style.cursor = 'default';

        const pw = PW();
        const ph = PH();
        const sw = SW();

        // Снимаем HTML обложки до изменений
        const coverHTML = document.getElementById('right-content').innerHTML;

        // Левая страница пуста и невидима — держим в потоке для правильной ширины
        document.getElementById('left-content').innerHTML  = '';
        document.getElementById('left-page-num').textContent = '';

        // --- Расширяем книгу ---
        // Важно: transition уже задан в CSS на #book (width 0.55s ease)
        // Левая страница остаётся невидимой во время расширения

        requestAnimationFrame(() => {
            bookEl.style.width = BW() + 'px';

            // Обновляем позиции кнопок каждый кадр во время расширения
            const repoId = setInterval(repositionUI, 16);

            // После расширения (0.55s) — запускаем флип
            setTimeout(() => {
                clearInterval(repoId);
                repositionUI();

                // Рендерим первый разворот на реальных страницах
                // (они пока скрыты visibility:hidden)
                currentIndex = 0;
                Renderer.renderSpread(currentIndex);

                // Создаём флип обложки — стартует поверх правой страницы
                const flip = createFlipDiv(coverHTML, '', pw, ph);
                positionFlipRight(flip.el);
                bookEl.appendChild(flip.el);

                // Запускаем листание обложки
                animateFlip({
                    el: flip.el, front: flip.front, back: flip.back,
                    from: 0, to: -180,
                    duration: 950,
                    origin: 'left',
                    onComplete: () => {
                        flip.el.remove();

                        // Теперь показываем левую страницу и корешок
                        pageLeftEl.style.visibility = 'visible';
                        spineEl.style.visibility    = 'visible';

                        isAnimating = false;
                        bookState   = 'open';
                        pageRightEl.style.borderRadius = '0 4px 4px 0';
                        pageRightEl.style.boxShadow    = '';

                        btnNext.style.display = 'block';
                        updateNavButtons();
                        repositionUI();
                    }
                });

            }, 580);
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЗАКРЫТИЕ КНИГИ (задняя обложка)
    // ══════════════════════════════════════════════════════
    function closeBook() {
        if (isAnimating || bookState !== 'open') return;
        isAnimating = true;
        bookState   = 'closing';

        const pw = PW();
        const ph = PH();

        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';

        // Задняя обложка — тёмная страница
        const backCoverHTML = `
            <div style="
                height:100%; display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                background:linear-gradient(160deg,#1a1208 0%,#0d0a05 100%);
                margin:-44px -40px; padding:44px 40px;
            ">
                <div style="color:#c8a84b;font-size:1.2em;opacity:0.3;
                            margin-bottom:16px;">✦</div>
                <div style="color:#c8a84b;font-size:0.6em;letter-spacing:0.35em;
                            opacity:0.28;">ПУТЬ</div>
            </div>`;

        // Флип: левая страница "перелистывается" вправо
        // Лицевая сторона флипа = текущая левая страница
        const frontHTML = document.getElementById('left-content').innerHTML;

        const flip = createFlipDiv(frontHTML, backCoverHTML, pw, ph);
        positionFlipLeft(flip.el);
        flip.el.style.transformOrigin = 'right center';
        bookEl.appendChild(flip.el);

        animateFlip({
            el: flip.el, front: flip.front, back: flip.back,
            from: 0, to: 180,
            duration: 950,
            origin: 'right',
            onHalf: () => {
                // Скрываем левую страницу и корешок в середине анимации
                pageLeftEl.style.visibility = 'hidden';
                spineEl.style.visibility    = 'hidden';
            },
            onComplete: () => {
                flip.el.remove();

                // Сжимаем книгу до одной страницы
                bookEl.style.width = PW() + 'px';

                // Показываем заднюю обложку на правой странице
                document.getElementById('right-content').innerHTML = backCoverHTML;
                pageRightEl.style.borderRadius = '3px 5px 5px 3px';
                pageRightEl.style.boxShadow    =
                    '-3px 0 10px rgba(0,0,0,0.35),' +
                    '4px 4px 20px rgba(0,0,0,0.5)';

                isAnimating = false;
                bookState   = 'closed';
                repositionUI();
            }
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЛИСТАНИЕ ВПЕРЁД
    // ══════════════════════════════════════════════════════
    function next() {
        const total = Story.getTotalSpreads();
        if (currentIndex >= total - 1 || isAnimating) return;

        // Последний разворот → закрываем книгу
        if (currentIndex === total - 1) {
            closeBook();
            return;
        }

        isAnimating = true;

        const nextIndex  = currentIndex + 1;
        const nextSpread = Story.getSpread(nextIndex);
        const pw = PW(), ph = PH();

        // Контент лицевой стороны флипа = текущая правая страница
        const frontHTML = document.getElementById('right-content').innerHTML;

        // Контент оборотной стороны флипа = ЛЕВАЯ страница следующего разворота
        const backHTML = getLeftHTML(nextSpread);

        // Что будет на правой странице следующего разворота —
        // рендерим ТОЛЬКО правую, левую пока не трогаем
        // (она появится когда флип ляжет)
        const tempIdx = currentIndex;
        currentIndex  = nextIndex;

        // Рендерим следующий разворот полностью — но левую страницу
        // сразу скрываем флипом, а правая будет видна из-под него
        Renderer.renderSpread(currentIndex);

        // Скрываем левую страницу — она появится после анимации
        // (флип несёт на оборотной стороне правильный контент)
        const savedLeftHTML = document.getElementById('left-content').innerHTML;
        document.getElementById('left-content').innerHTML = '';

        // Создаём флип поверх правой страницы
        const flip = createFlipDiv(frontHTML, backHTML, pw, ph);
        positionFlipRight(flip.el);
        bookEl.appendChild(flip.el);

        animateFlip({
            el: flip.el, front: flip.front, back: flip.back,
            from: 0, to: -180,
            duration: 1000,
            origin: 'left',
            onHalf: () => {
                // Оборотная сторона флипа показывает следующий левый контент —
                // реальная левая страница пока пустая, это нормально
            },
            onComplete: () => {
                flip.el.remove();

                // Восстанавливаем левую страницу из оборотной стороны флипа
                document.getElementById('left-content').innerHTML = backHTML;

                isAnimating = false;
                updateNavButtons();
            }
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЛИСТАНИЕ НАЗАД
    // ══════════════════════════════════════════════════════
    function prev() {
        // На первом развороте — закрываем книгу
        if (currentIndex <= 0) {
            closeBookFromFront();
            return;
        }

        if (isAnimating) return;
        isAnimating = true;

        const prevIndex  = currentIndex - 1;
        const pw = PW(), ph = PH();

        // Контент лицевой стороны флипа = ПРАВАЯ страница предыдущего разворота
        // (она "возвращается" с левой стороны на правую)
        // Пока просто пустая — в реальной книге это обратная сторона левой
        const frontHTML = `
            <div style="display:flex;align-items:center;justify-content:center;
                        height:100%;opacity:0.4;">
                <span style="color:var(--ink-light);font-style:italic;font-size:0.8em;">
                    ·
                </span>
            </div>`;

        // Контент оборотной стороны флипа = текущая левая страница
        // (она была правой в предыдущем развороте, теперь "улетает" назад)
        const backHTML = document.getElementById('left-content').innerHTML;

        // Обновляем страницы на предыдущий разворот
        currentIndex = prevIndex;
        Renderer.renderSpread(currentIndex);

        // Скрываем правую страницу — её накроет флип
        // (флип стартует справа в перевёрнутом виде и "раскрывается" влево)
        // Нет — при листании назад флип стартует СЛЕВА и летит вправо

        // Флип стартует с левой позиции, перевёрнутый (-180°)
        // и возвращается к 0° — то есть страница "прилетает" справа налево
        const flip = createFlipDiv(frontHTML, backHTML, pw, ph);
        positionFlipLeft(flip.el);
        flip.el.style.transformOrigin = 'right center';

        // Начальное состояние: перевёрнутый, видна оборотная сторона
        flip.el.style.transform  = 'rotateY(180deg)';
        flip.front.style.opacity = '0';
        flip.back.style.opacity  = '1';

        bookEl.appendChild(flip.el);

        animateFlip({
            el: flip.el, front: flip.front, back: flip.back,
            from: 180, to: 0,
            duration: 1000,
            origin: 'right',
            reverse: true,
            onComplete: () => {
                flip.el.remove();
                isAnimating = false;
                updateNavButtons();
            }
        });
    }

    // Закрытие книги листанием назад (с первой страницы)
    function closeBookFromFront() {
        if (isAnimating) return;
        isAnimating = true;
        bookState   = 'closing';

        const pw = PW(), ph = PH();

        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';

        const frontHTML = document.getElementById('right-content').innerHTML;

        // Флип: правая страница "улетает" обратно вправо (как закрытие)
        const flip = createFlipDiv(frontHTML, '', pw, ph);
        positionFlipRight(flip.el);
        flip.el.style.transformOrigin = 'left center';
        bookEl.appendChild(flip.el);

        animateFlip({
            el: flip.el, front: flip.front, back: flip.back,
            from: 0, to: -180,
            duration: 900,
            origin: 'left',
            onHalf: () => {
                pageLeftEl.style.visibility = 'hidden';
                spineEl.style.visibility    = 'hidden';
            },
            onComplete: () => {
                flip.el.remove();

                // Сжимаем книгу
                bookEl.style.width = PW() + 'px';

                // Восстанавливаем обложку
                renderCover();
                pageRightEl.style.borderRadius = '3px 5px 5px 3px';
                pageRightEl.style.boxShadow    =
                    '-3px 0 10px rgba(0,0,0,0.35),' +
                    '4px 4px 20px rgba(0,0,0,0.5)';
                pageRightEl.style.cursor = 'pointer';

                isAnimating = false;
                bookState   = 'closed';
                currentIndex = 0;
                repositionUI();

                // Снова ждём клика для открытия
                pageRightEl.addEventListener('click', openBook, { once: true });
            }
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЯДРО АНИМАЦИИ
    // ══════════════════════════════════════════════════════
    function animateFlip({
        el, front, back,
        from, to,
        duration,
        origin   = 'left',
        reverse  = false,
        onHalf   = null,
        onComplete = null
    }) {
        const startTime = performance.now();
        const range     = to - from;
        let halfFired   = false;

        function frame(now) {
            const elapsed = now - startTime;
            const rawP    = Math.min(elapsed / duration, 1);
            const easedP  = easeInOutCubic(rawP);
            const angle   = from + range * easedP;

            // Изгиб (максимум в середине)
            const bend = Math.sin(rawP * Math.PI);
            const skew = bend * 4 * (range < 0 ? 1 : -1);

            el.style.transform = `rotateY(${angle}deg) skewY(${skew}deg)`;

            // Тень
            const sh  = bend * 16;
            const dir = (origin === 'left') ? -1 : 1;
            el.style.boxShadow =
                `${dir * sh}px 0 ${sh * 1.8}px rgba(0,0,0,${bend * 0.28})`;

            // Переключение видимой стороны
            // Для вращения вокруг левого края: вперёд 0→-180
            //   при angle > -90 видна лицевая, при angle < -90 — оборотная
            // Для вращения вокруг правого края: назад 180→0
            //   при angle > 90 видна оборотная, при angle < 90 — лицевая

            if (!reverse) {
                if (origin === 'left') {
                    // 0 → -180
                    if (angle > -90) {
                        front.style.opacity = '1';
                        back.style.opacity  = '0';
                    } else {
                        front.style.opacity = '0';
                        back.style.opacity  = '1';
                    }
                } else {
                    // 0 → 180
                    if (angle < 90) {
                        front.style.opacity = '1';
                        back.style.opacity  = '0';
                    } else {
                        front.style.opacity = '0';
                        back.style.opacity  = '1';
                    }
                }
            } else {
                // reverse: 180 → 0
                if (angle > 90) {
                    back.style.opacity  = '1';
                    front.style.opacity = '0';
                } else {
                    back.style.opacity  = '0';
                    front.style.opacity = '1';
                }
            }

            if (!halfFired && rawP >= 0.5) {
                halfFired = true;
                if (onHalf) onHalf();
            }

            if (rawP < 1) {
                requestAnimationFrame(frame);
            } else {
                el.style.transform = `rotateY(${to}deg) skewY(0deg)`;
                el.style.boxShadow = 'none';
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(frame);
    }

    // ══════════════════════════════════════════════════════
    //  СОЗДАНИЕ ФЛИП-ЭЛЕМЕНТА
    // ══════════════════════════════════════════════════════
    function createFlipDiv(frontHTML, backHTML, pw, ph) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute;
            top: 0;
            width: ${pw}px;
            height: ${ph}px;
            z-index: 50;
            pointer-events: none;
            transform-style: preserve-3d;
        `;

        const baseStyle = `
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

        const front = document.createElement('div');
        front.style.cssText = baseStyle;
        front.innerHTML     = frontHTML;

        // Оборотная сторона: зеркально отражена по X чтобы текст читался правильно
        const back = document.createElement('div');
        back.style.cssText = baseStyle + 'transform: scaleX(-1); opacity: 0;';
        back.innerHTML     = backHTML;

        el.appendChild(front);
        el.appendChild(back);

        return { el, front, back };
    }

    // ── Позиционирование флипа ──────────────────────────────
    function positionFlipRight(el) {
        // Поверх правой страницы
        const sw = SW();
        el.style.left = (PW() + sw) + 'px';
        el.style.transformOrigin = 'left center';
    }

    function positionFlipLeft(el) {
        // Поверх левой страницы
        el.style.left = '0px';
        el.style.transformOrigin = 'right center';
    }

    // ══════════════════════════════════════════════════════
    //  ВСПОМОГАТЕЛЬНЫЕ
    // ══════════════════════════════════════════════════════
    function getLeftHTML(spread) {
        if (!spread || !spread.left) return '';
        if (spread.left.type === 'text' ||
            spread.left.type === 'cover-left') {
            return spread.left.content || '';
        }
        if (spread.left.type === 'result-left') {
            const arch = Archetypes.get(Profile.computeArchetype());
            return `
                <div style="display:flex;flex-direction:column;align-items:center;
                            justify-content:center;height:100%;gap:14px;text-

align:center;">
                    <div style="font-size:2.8em;">${arch.emoji}</div>
                    <div style="color:var(--accent);font-size:1.05em;
                                letter-spacing:0.12em;">${arch.name}</div>
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

        // Кнопка "назад" — всегда видна когда книга открыта
        // (на первой странице — закрывает книгу)
        btnPrev.style.display       = 'block';
        btnPrev.style.opacity       = '1';
        btnPrev.style.pointerEvents = 'auto';

        // Кнопка "вперёд"
        if (hasQuestion) {
            btnNext.style.opacity       = '0';
            btnNext.style.pointerEvents = 'none';
        } else if (currentIndex >= total - 1) {
            // Последняя страница — кнопка закрывает книгу
            btnNext.style.display       = 'block';
            btnNext.style.opacity       = '0.6';
            btnNext.style.pointerEvents = 'auto';
        } else {
            btnNext.style.display       = 'block';
            btnNext.style.opacity       = '1';
            btnNext.style.pointerEvents = 'auto';
        }

        repositionUI();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { next, prev, getCurrentIndex: () => currentIndex, closeBook };

})();
