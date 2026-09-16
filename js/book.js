/**
 * book.js — движок книги-листалки
 *
 * Принципы:
 *  1. #book ВСЕГДА имеет ширину полного разворота. Закрытая книга — это
 *     просто сдвиг контейнера влево (translateX), а не изменение width.
 *     Поэтому при открытии ничего не «прыгает».
 *  2. Ось вращения — ровно линия сгиба (середина книги). Корешок больше не
 *     элемент вёрстки, а лёгкое затемнение («углубление») поверх разворота.
 *  3. Содержимое страницы, которое должно появиться ТОЛЬКО после анимации,
 *     закрыто слоем-призраком (ghost) — копией старой страницы.
 *  4. Обложка — жёсткая: своя анимация (без изгиба, с «подъёмом» листа
 *     и тяжёлой тенью). Обычные страницы — гибкие: изгиб + затенение.
 */

const BookEngine = (() => {

    // ── Настройки ───────────────────────────────────────────
    const TURN_MS  = 900;    // обычная страница (гибкая)
    const COVER_MS = 1250;   // жёсткая обложка
    const SLIDE_MS = 420;    // узкий экран — одной страницей

    const ST_CLOSED = 'closed', ST_OPEN = 'open', ST_BUSY = 'busy';

    let state   = ST_CLOSED;
    let index   = 0;
    let closedK = 1;                 // 1 — закрыта, 0 — раскрыта

    // ── DOM ─────────────────────────────────────────────────
    const bookEl     = document.getElementById('book');
    const pageLeftEl = document.getElementById('page-left');
    const pageRightEl= document.getElementById('page-right');
    const grooveEl   = document.getElementById('book-groove');
    const shadowEl   = document.getElementById('book-shadow');
    const btnPrev    = document.getElementById('btn-prev');
    const btnNext    = document.getElementById('btn-next');
    const sceneEl    = document.getElementById('book-scene');

    // ── Геометрия (кешируется) ──────────────────────────────
    const GEO = { pw: 0, ph: 0, bw: 0, hid: 0, s: 1 };

    function isSingle() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    function fitScale() {
        const w = GEO.bw || bookEl.offsetWidth;
        if (!w) return 1;
        const avail = window.innerWidth - (isSingle() ? 24 : 130);
        return Math.min(1, avail / w);
    }

    function measure() {
        GEO.pw  = pageRightEl.offsetWidth;
        GEO.ph  = pageRightEl.offsetHeight;
        GEO.bw  = bookEl.offsetWidth;
        GEO.hid = GEO.bw - GEO.pw;      // пустая (невидимая) часть слева в закрытом виде
        GEO.s   = fitScale();
    }

    function closedOffset() { return -GEO.hid / 2; }

    // Сдвиг книги: k = 1 (закрыта) … 0 (раскрыта)
    function applyShift(k) {
        closedK = k;
        const tx = closedOffset() * k * GEO.s;
        bookEl.style.transform = `translateX(${tx.toFixed(2)}px) scale(${GEO.s})`;
        // тень едет вместе с книгой (она внутри #book)
        shadowEl.style.left  = (GEO.hid * k).toFixed(1) + 'px';
        shadowEl.style.width = (GEO.pw + GEO.hid * (1 - k)).toFixed(1) + 'px';
        shadowEl.style.opacity = (1 - 0.3 * k).toFixed(2);
    }

    // ── Оформление обложки ──────────────────────────────────
    const COVER_FACE = `
        <div class="cover-face">
            <div class="cover-stars">✦ &nbsp; ✦ &nbsp; ✦</div>
            <div class="cover-title">ПУТЬ</div>
            <div class="cover-sub">книга о себе</div>
            <div class="cover-rule"></div>
            <div class="cover-hint">нажмите, чтобы открыть</div>
        </div>`;

    const BACK_COVER_INSIDE = `
        <div class="cover-face cover-face--back">
            <div class="cover-rule"></div>
            <div class="cover-stars">✦</div>
            <div class="cover-hint">путь продолжается</div>
        </div>`;

    function coverPageHTML() {
        return `<div class="page-inner">${COVER_FACE}</div>`;
    }

    function renderCover() {
        document.getElementById('right-content').innerHTML   = COVER_FACE;
        document.getElementById('left-content').innerHTML    = '';
        document.getElementById('left-page-num').textContent  = '';
        document.getElementById('right-page-num').textContent = '';
        document.getElementById('chapter-title').textContent  = '';
        document.getElementById('progress-dots').innerHTML    = '';
    }

    // Финальный разворот — внутренняя сторона задней обложки
    function appendBackCover() {
        const spreads = Story.getSpreads();
        const last    = spreads[spreads.length - 1];
        if (!last || last.id === 'back-cover') return;
        spreads.push({
            id: 'back-cover',
            chapter: '',
            left:  { type: 'text', content: '' },
            right: { type: 'cover-right', content: BACK_COVER_INSIDE },
            noQuestion: true,
            isBackCover: true
        });
    }

    // ── Слои: копия страницы и лист перелистывания ──────────
    function innerHTMLOf(pageEl) {
        const inner = pageEl.querySelector('.page-inner');
        return inner ? inner.outerHTML : '';
    }

    // Неподвижная копия страницы (призрак) — держит СТАРОЕ содержимое
    function makeGhost(innerHTML, side) {
        const el = document.createElement('div');
        el.className = 'book-layer is-ghost';
        el.style.left   = (side === 'right' ? GEO.hid : 0) + 'px';
        el.style.width  = GEO.pw + 'px';
        el.style.height = GEO.ph + 'px';
        el.style.zIndex = '40';
        el.innerHTML    = innerHTML;
        return el;
    }

    // Летящий лист: front виден до 90°, back — после
    function makeLeaf(frontHTML, backHTML, side) {
        const el = document.createElement('div');
        el.className = 'book-layer flip-leaf';
        el.style.left   = (side === 'right' ? GEO.hid : 0) + 'px';
        el.style.width  = GEO.pw + 'px';
        el.style.height = GEO.ph + 'px';
        el.style.zIndex = '50';
        el.style.transformOrigin = side === 'right' ? 'left center' : 'right center';

        const front = document.createElement('div');
        front.className = 'flip-face ' + (side === 'right' ? 'page-right' : 'page-left');
        front.innerHTML = frontHTML;

        const back = document.createElement('div');
        back.className = 'flip-face flip-face--back ' + (side === 'right' ? 'page-left' : 'page-right');
        back.innerHTML = backHTML;

        const shade = document.createElement('div');
        shade.className = 'flip-shade';

        el.appendChild(front);
        el.appendChild(back);
        el.appendChild(shade);

        return { el, front, back, shade };
    }

    // ── Ядро анимации перелистывания ────────────────────────
    function animateFlip(o) {
        const { leaf, from, to, duration, rigid, onProgress, onComplete } = o;
        const start   = performance.now();
        const range   = to - from;
        const dirSign = range > 0 ? 1 : -1;   // +1 — лист идёт слева направо

        function setFaces(angle) {
            const showBack = Math.abs(angle) > 90;
            leaf.front.style.opacity = showBack ? '0' : '1';
            leaf.back.style.opacity  = showBack ? '1' : '0';
        }
        setFaces(from);

        function frame(now) {
            const raw  = Math.min((now - start) / duration, 1);
            const e    = easeInOutCubic(raw);
            const angle = from + range * e;
            const bend  = Math.sin(raw * Math.PI);   // 0 → 1 → 0

            if (rigid) {
                // жёсткая обложка: не гнётся, слегка приподнимается над разворотом
                const lift = bend * 46;
                leaf.el.style.transform =
                    `translateZ(${lift.toFixed(1)}px) rotateY(${angle.toFixed(2)}deg)`;
            } else {
                // гибкая страница: лёгкий изгиб
                const skew = bend * 4.5 * -dirSign;
                leaf.el.style.transform =
                    `rotateY(${angle.toFixed(2)}deg) skewY(${skew.toFixed(2)}deg)`;
            }

            // тень, которую лист бросает на разворот
            const sh = bend * (rigid ? 40 : 24);
            leaf.el.style.boxShadow =
                `${(-dirSign * sh * 0.45).toFixed(1)}px 0 ${sh.toFixed(1)}px ` +
                `rgba(0,0,0,${(bend * (rigid ? 0.45 : 0.30)).toFixed(3)})`;

            // затенение по плоскости листа («вымячивание» бумаги)
            const a  = bend * (rigid ? 0.14 : 0.34);
            leaf.shade.style.background = dirSign > 0
                ? `linear-gradient(to right, rgba(0,0,0,${a.toFixed(3)}) 0%, rgba(0,0,0,0) 62%)`
                : `linear-gradient(to left,  rgba(0,0,0,${a.toFixed(3)}) 0%, rgba(0,0,0,0) 62%)`;

            setFaces(angle);
            if (onProgress) onProgress(e, raw);

            if (raw < 1) {
                requestAnimationFrame(frame);
            } else {
                leaf.el.style.transform      = `rotateY(${to}deg)`;
                leaf.el.style.boxShadow      = 'none';
                leaf.shade.style.background  = 'transparent';
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(frame);
    }

    // Листание на узком экране — простой сдвиг страницы
    function slide(el, fromX, toX, duration, onComplete, fadeOut) {
        const start = performance.now();
        el.style.transform = `translateX(${fromX}px)`;
        function frame(now) {
            const raw = Math.min((now - start) / duration, 1);
            const e   = easeOutCubic(raw);
            el.style.transform = `translateX(${(fromX + (toX - fromX) * e).toFixed(1)}px)`;
            if (fadeOut) el.style.opacity = (1 - 0.85 * e).toFixed(3);
            if (raw < 1) requestAnimationFrame(frame);
            else if (onComplete) onComplete();
        }
        requestAnimationFrame(frame);
    }

    // ── Состояния ───────────────────────────────────────────
    function begin() {
        state = ST_BUSY;
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
    }

    function endAsOpen() {
        state = ST_OPEN;
        updateNav();
    }

    // ══════════════════════════════════════════════════════
    //  ОТКРЫТИЕ КНИГИ (жёсткая обложка)
    // ══════════════════════════════════════════════════════
    function openBook() {
        if (state !== ST_CLOSED) return;
        begin();

        const coverHTML = innerHTMLOf(pageRightEl);   // обложка, как нарисована сейчас
        bookEl.classList.remove('is-closed');

        // Разворот под обложкой готовится заранее: правая страница откроется
        // по мере того, как обложка уходит влево.
        measure();
        Renderer.renderSpread(index, { meta: false });
        const backHTML = innerHTMLOf(pageLeftEl);     // внутренняя сторона обложки

        if (isSingle()) {
            const ghost = makeGhost(coverHTML, 'right');
            bookEl.appendChild(ghost);
            slide(ghost, 0, -GEO.pw, SLIDE_MS, () => {
                ghost.remove();
                pageLeftEl.style.visibility = 'visible';
                Renderer.renderMeta(index);
                endAsOpen();
            }, true);
            return;
        }

        const leaf = makeLeaf(coverHTML, backHTML, 'right');
        bookEl.appendChild(leaf.el);

        animateFlip({
            leaf,
            from: 0, to: -180,
            duration: COVER_MS,
            rigid: true,
            // книга плавно уезжает вправо simultaneously с обложкой
            onProgress: (e) => applyShift(1 - e),
            onComplete: () => {
                pageLeftEl.style.visibility = 'visible';  // показываем разворот
                leaf.el.remove();                         // и убираем обложку
                Renderer.renderMeta(index);
                endAsOpen();
            }
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЗАКРЫТИЕ КНИГИ (левая стопка перекидывается вправо)
    // ══════════════════════════════════════════════════════
    function closeBook() {
        if (state !== ST_OPEN) return;
        begin();
        measure();

        const frontHTML = innerHTMLOf(pageLeftEl);  // верхний лист левой стопки
        const backHTML  = coverPageHTML();          // сверху окажется обложка

        // Под стопкой — стол: левая страница гаснет сразу (её закрывает лист)
        pageLeftEl.style.visibility = 'hidden';

        if (isSingle()) {
            const ghost = makeGhost(backHTML, 'right');
            ghost.style.transform = `translateX(${-GEO.pw}px)`;
            bookEl.appendChild(ghost);
            slide(ghost, -GEO.pw, 0, SLIDE_MS, () => {
                ghost.remove();
                afterClose();
            }, false);
            return;
        }

        const leaf = makeLeaf(frontHTML, backHTML, 'left');
        bookEl.appendChild(leaf.el);

        animateFlip({
            leaf,
            from: 0, to: 180,
            duration: COVER_MS,
            rigid: true,
            onProgress: (e) => applyShift(e),
            onComplete: () => {
                renderCover();          // правая страница снова обложка
                leaf.el.remove();       // убираем лист — под ним уже обложка
                afterClose();
            }
        });
    }

    function afterClose() {
        bookEl.classList.add('is-closed');
        applyShift(1);
        state = ST_CLOSED;
        updateNav();
    }

    // ══════════════════════════════════════════════════════
    //  ЛИСТАНИЕ ВПЕРЁД (лист идёт справа налево)
    // ══════════════════════════════════════════════════════
    function turnForward() {
        if (state !== ST_OPEN) return;
        if (index >= Story.getTotalSpreads() - 1) return;
        begin();
        measure();

        const nextIndex = index + 1;

        const frontHTML = innerHTMLOf(pageRightEl);  // текущая правая — лицо листа
        const ghostHTML = innerHTMLOf(pageLeftEl);   // текущая левая — остаётся до конца

        index = nextIndex;
        Renderer.renderSpread(index, { meta: false });
        const backHTML = innerHTMLOf(pageLeftEl);    // новая левая — оборот листа

        if (isSingle()) {
            const ghost = makeGhost(ghostHTML, 'right');
            bookEl.appendChild(ghost);
            slide(ghost, 0, -GEO.pw, SLIDE_MS, () => {
                ghost.remove(); endTurn();
            }, true);
            return;
        }

        // призрак держит старую левую страницу до конца анимации
        const ghost = makeGhost(ghostHTML, 'left');
        bookEl.appendChild(ghost);

        const leaf = makeLeaf(frontHTML, backHTML, 'right');
        bookEl.appendChild(leaf.el);

        animateFlip({
            leaf, from: 0, to: -180, duration: TURN_MS, rigid: false,
            onComplete: () => { ghost.remove(); leaf.el.remove(); endTurn(); }
        });
    }

    // ══════════════════════════════════════════════════════
    //  ЛИСТАНИЕ НАЗАД (лист идёт слева направо)
    // ══════════════════════════════════════════════════════
    function turnBackward() {
        if (state !== ST_OPEN) return;
        if (index <= 0) return;
        begin();
        measure();

        const prevIndex = index - 1;

        const frontHTML = innerHTMLOf(pageLeftEl);   // текущая левая — лицо листа
        const ghostHTML = innerHTMLOf(pageRightEl);  // текущая правая — остаётся до конца

        index = prevIndex;
        Renderer.renderSpread(index, { meta: false });
        const backHTML = innerHTMLOf(pageRightEl);   // правая прошлого разворота

        if (isSingle()) {
            const ghost = makeGhost(ghostHTML, 'right');
            bookEl.appendChild(ghost);
            slide(ghost, 0, GEO.pw, SLIDE_MS, () => {
                ghost.remove(); endTurn();
            }, true);
            return;
        }

        const ghost = makeGhost(ghostHTML, 'right');
        bookEl.appendChild(ghost);

        const leaf = makeLeaf(frontHTML, backHTML, 'left');
        bookEl.appendChild(leaf.el);

        animateFlip({
            leaf, from: 0, to: 180, duration: TURN_MS, rigid: false,
            onComplete: () => { ghost.remove(); leaf.el.remove(); endTurn(); }
        });
    }

    function endTurn() {
        Renderer.renderMeta(index);   // заголовок и точки — только после анимации
        endAsOpen();
    }

    // ══════════════════════════════════════════════════════
    //  НАВИГАЦИЯ
    // ══════════════════════════════════════════════════════
    function next() {
        if (state === ST_CLOSED) { openBook(); return; }
        if (state !== ST_OPEN) return;
        if (index >= Story.getTotalSpreads() - 1) { closeBook(); return; }
        turnForward();
    }

    function prev() {
        if (state !== ST_OPEN) return;
        if (index <= 0) { closeBook(); return; }   // назад с первого разворота — закрыть
        turnBackward();
    }

    function repositionUI() {
        const vw    = window.innerWidth;
        const rect  = bookEl.getBoundingClientRect();
        const pad   = (state === ST_CLOSED) ? GEO.hid * GEO.s : 0;
        const left  = rect.left + pad;
        const right = rect.right;
        const size  = 42, off = 16;

        btnPrev.style.left = clamp(left  - size - off, 4, vw - size - 4) + 'px';
        btnNext.style.left = clamp(right + off,        4, vw - size - 4) + 'px';
    }

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function updateNav() {
        if (state !== ST_OPEN) {
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
            return;
        }
        const total  = Story.getTotalSpreads();
        const spread = Story.getSpread(index);
        const hasQuestion = spread && !spread.noQuestion;
        const atEnd = index >= total - 1;

        // «назад» есть всегда: на первом развороте он закрывает книгу
        btnPrev.style.display = 'block';
        btnPrev.textContent   = '‹';
        btnPrev.title         = index === 0 ? 'Закрыть книгу' : 'Предыдущий разворот';

        if (hasQuestion) {
            btnNext.style.display = 'none';       // пока не сделан выбор
        } else {
            btnNext.style.display = 'block';
            btnNext.textContent   = atEnd ? '✕' : '›';
            btnNext.title         = atEnd ? 'Закрыть книгу' : 'Следующий разворот';
        }
        repositionUI();
    }

    // ── Кривые ──────────────────────────────────────────────
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ── Init ────────────────────────────────────────────────
    function init() {
        setTimeout(() => {
            const l = document.getElementById('loading-screen');
            if (l) l.classList.add('hidden');
        }, 900);

        appendBackCover();
        measure();

        state = ST_CLOSED;
        bookEl.classList.add('is-closed');
        pageLeftEl.style.visibility = 'hidden';
        renderCover();
        applyShift(1);
        updateNav();

        window.addEventListener('resize', () => {
            measure();
            applyShift(closedK);
            repositionUI();
        });

        // клик по закрытой книге — открыть
        bookEl.addEventListener('click', () => {
            if (state === ST_CLOSED) openBook();
        });

        document.addEventListener('keydown', (e) => {
            if (state === ST_BUSY) return;
            if (e.key === 'ArrowRight')     next();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'Escape' && state === ST_OPEN) closeBook();
        });

        // первая отрисовка тени/позиций после применения стилей
        setTimeout(() => { measure(); applyShift(1); }, 60);
    }

    document.addEventListener('DOMContentLoaded', init);

    return { next, prev, openBook, closeBook, getCurrentIndex: () => index };

})();
