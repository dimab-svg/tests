/**
 * profile.js
 * Сбор данных о пользователе и вычисление профиля личности
 */

const Profile = (() => {

    // ── Накопленные очки по осям ──────────────────────────────
    const scores = {
        thinking  :  0,   // + мышление / – импульс/действие
        inner     :  0,   // + внутренний мир / – внешний
        solo      :  0,   // + одиночество / – общность
        creating  :  0,   // + создание / – исполнение
        caring    :  0,   // + забота о других / – личное достижение
        stable    :  0,   // + стабильность / – движение/риск
        intuitive :  0,   // + интуиция / – логика
        spiritual :  0    // + смысл/дух / – прагматизм
    };

    // ── Все ответы (для возможной отправки на сервер / в ИИ) ──
    const answers = [];

    // ── Тайминги ──────────────────────────────────────────────
    const timings = [];
    let pageOpenTime = Date.now();

    // ── Hover-лог ─────────────────────────────────────────────
    const hoverLog = {};

    // ─────────────────────────────────────────────────────────
    function startPageTimer() {
        pageOpenTime = Date.now();
    }

    function recordAnswer({ questionId, choiceId, choiceTraits, freeText, scales }) {
        const elapsed = Date.now() - pageOpenTime;

        answers.push({
            questionId,
            choiceId     : choiceId   || null,
            freeText     : freeText   || null,
            scales       : scales     || null,
            timeMs       : elapsed,
            timestamp    : Date.now()
        });

        timings.push({ questionId, timeMs: elapsed });

        // Добавляем очки в профиль
        if (choiceTraits) {
            Object.keys(choiceTraits).forEach(axis => {
                if (scores.hasOwnProperty(axis)) {
                    scores[axis] += choiceTraits[axis];
                }
            });
        }

        // Шкалы тоже вносят вклад
        if (scales) {
            Object.keys(scales).forEach(axis => {
                if (scores.hasOwnProperty(axis)) {
                    // Нормализуем: слайдер 0-100, центр 50 → диапазон -3…+3
                    scores[axis] += Math.round((scales[axis] - 50) / 16.67);
                }
            });
        }
    }

    function recordHover(questionId, optionId, durationMs) {
        const key = questionId + '_' + optionId;
        hoverLog[key] = (hoverLog[key] || 0) + durationMs;
    }

    // Найти варианты, на которых задерживались дольше всего
    function getHesitationInsights() {
        const sorted = Object.entries(hoverLog)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        return sorted; // [[key, ms], ...]
    }

    // Самый медленный ответ → зона неопределённости
    function getSlowestQuestion() {
        if (!timings.length) return null;
        return timings.reduce((a, b) => a.timeMs > b.timeMs ? a : b);
    }

    // ── Определение архетипа ───────────────────────────────────
    function computeArchetype() {
        const s = scores;

        // Порядок важен: более специфичные условия первыми
        if (s.thinking >= 4 && s.inner >= 3 && s.solo >= 2)
            return 'sage';

        if (s.spiritual >= 3 && s.inner >= 2)
            return 'seeker';

        if (s.creating >= 4)
            return 'creator';

        if (s.caring >= 4 && s.stable >= 1)
            return 'guardian';

        if (s.caring >= 3 && s.inner >= 2)
            return 'healer';

        if (s.stable <= -2 && s.thinking >= 1)
            return 'explorer';

        if (s.solo >= 4 && s.inner >= 3)
            return 'hermit';

        if (s.inner <= -2 && s.caring >= 1 && s.stable >= 1)
            return 'leader';

        if (s.creating >= 2 && s.stable >= 2)
            return 'craftsman';

        if (s.stable <= -2 && s.creating >= 1)
            return 'dreamer';

        if (s.thinking <= -2)
            return 'warrior';

        if (s.solo <= -2 && s.caring >= 1)
            return 'connector';

        if (s.intuitive >= 3)
            return 'mystic';

        return 'seeker'; // дефолт
    }

    // Нормализованные очки для шкал (0-100%)
    function getNormalizedScores() {
        const MAX = 12;
        const result = {};
        Object.keys(scores).forEach(k => {
            result[k] = Math.round(((scores[k] + MAX) / (MAX * 2)) * 100);
            result[k] = Math.max(5, Math.min(95, result[k]));
        });
        return result;
    }

    function getScores()  { return { ...scores }; }
    function getAnswers() { return [...answers];   }

    // Экспортируем данные для ИИ-анализа (можно отправить на сервер)
    function exportForAI() {
        return {
            scores,
            answers,
            timings,
            hoverLog,
            hesitation: getHesitationInsights(),
            slowest: getSlowestQuestion(),
            archetype: computeArchetype()
        };
    }

    return {
        startPageTimer,
        recordAnswer,
        recordHover,
        getHesitationInsights,
        getSlowestQuestion,
        computeArchetype,
        getNormalizedScores,
        getScores,
        getAnswers,
        exportForAI
    };

})();