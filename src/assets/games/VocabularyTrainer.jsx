/*
---
title: Vocabulary Trainer
photo: ./VocabularyTrainer.png
desc: Intermediate to advanced English vocabulary multiple choice questions.
---
*/

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { vocabularyData } from './vocabularytrainerData.js';

// vocabularyData: 180 entries — see vocabularytrainerData.js (regenerate via src/games/scripts/generate_vocabulary_data.py)

// ─── Constants ─────────────────────────────────────────────────────────────

const MODES = {
  wordToMeaning: {
    id: 'wordToMeaning',
    label: 'Word → Meaning',
    shortDesc: 'Pick the correct definition for each word',
  },
  meaningToWord: {
    id: 'meaningToWord',
    label: 'Meaning → Word',
    shortDesc: 'Pick the word that best fits each definition',
  },
};

const DIFFICULTIES = {
  intermediate: { id: 'intermediate', label: 'Intermediate' },
  advanced: { id: 'advanced', label: 'Advanced' },
  mixed: { id: 'mixed', label: 'Mixed' },
};

const QUESTION_COUNTS = [10, 15, 20];
const BASE_POINTS = 10;
const STREAK_BONUS = 5;
const STORAGE_KEY = 'vocabularyTrainerHighScore';
const SESSION_HISTORY_KEY = 'vocabularyTrainerSessionHistory';
const SITE_FOOTER_HEIGHT = 'calc(var(--menu-footer-button-width, 15vw) * 2.5)';
const SITE_TOP_INSET_PORTRAIT = 'var(--menu-footer-button-width, 15vw)';
const SITE_TOP_INSET_LANDSCAPE = 'calc(var(--menu-header-height, 5vh) * 1.5)';

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function filterByDifficulty(pool, difficulty) {
  if (difficulty === 'mixed') return pool;
  return pool.filter((entry) => entry.level === difficulty);
}

function buildQuestion(entry, mode) {
  if (mode === 'wordToMeaning') {
    const options = shuffle([
      { text: entry.definition, correct: true },
      ...entry.distractor_definitions.map((text) => ({ text, correct: false })),
    ]);
    return {
      entry,
      mode,
      prompt: entry.word,
      promptSub: entry.pos,
      options,
      correctIndex: options.findIndex((o) => o.correct),
    };
  }

  const options = shuffle([
    { text: entry.word, correct: true },
    ...entry.distractor_words.map((text) => ({ text, correct: false })),
  ]);
  return {
    entry,
    mode,
    prompt: entry.definition,
    promptSub: entry.pos,
    options,
    correctIndex: options.findIndex((o) => o.correct),
  };
}

function selectSessionWords(difficulty, count, excludeIds = []) {
  const pool = filterByDifficulty(vocabularyData, difficulty).filter(
    (e) => !excludeIds.includes(e.id)
  );
  const shuffled = shuffle(pool);
  const n = Math.min(count, shuffled.length);
  return shuffled.slice(0, n);
}

function loadHighScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveHighScore(stats) {
  try {
    const prev = loadHighScore();
    if (!prev || stats.score > prev.score) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function loadSessionHistory() {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendSessionHistory(record) {
  try {
    const history = loadSessionHistory();
    const sessionNumber = history.length
      ? Math.max(...history.map((s) => s.sessionNumber)) + 1
      : 1;
    const entry = { ...record, sessionNumber };
    history.push(entry);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return loadSessionHistory();
  }
}

function filterSessions(sessions, { mode, difficulty, questionCount }) {
  return sessions.filter((s) => {
    if (mode !== 'all' && s.modeId !== mode) return false;
    if (difficulty !== 'all' && s.difficulty !== difficulty) return false;
    if (questionCount !== 'all' && s.questionCount !== questionCount) return false;
    return true;
  });
}

// ─── Confetti (canvas burst on streak milestones) ────────────────────────────

function Confetti({ active, palette }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const colors = [palette.accent, palette.success, palette.warn, '#a78bfa', '#f472b6'];
    const particles = Array.from({ length: 80 }, () => ({
      x: w / 2,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    let frame;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.018;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      });
      if (alive) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, palette]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}
    />
  );
}

// ─── Theme hooks (match site + DualNBack) ────────────────────────────────────

function useSiteTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function useIsCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return compact;
}

function getSiteLayout() {
  const portrait = window.matchMedia('(max-aspect-ratio: 17/20)').matches;
  return {
    portrait,
    top: portrait ? SITE_TOP_INSET_PORTRAIT : SITE_TOP_INSET_LANDSCAPE,
    bottom: portrait ? SITE_FOOTER_HEIGHT : '0',
  };
}

function useSiteLayout() {
  const [layout, setLayout] = useState(getSiteLayout);

  useEffect(() => {
    const mq = window.matchMedia('(max-aspect-ratio: 17/20)');
    const onChange = () => setLayout(getSiteLayout());
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);

  return layout;
}

function useThemePalette(isDark) {
  return useMemo(
    () => ({
      bg: 'var(--content-background)',
      text: 'var(--content-font-color)',
      accent: 'var(--content-font-color-hover)',
      border: 'var(--border)',
      panel: 'var(--text-background)',
      button: 'var(--button-font-color)',
      buttonHover: 'var(--button-font-color-hover)',
      font: 'var(--content-font)',
      titleFont: 'var(--title-font)',
      success: isDark ? '#4ade80' : '#15803d',
      error: isDark ? '#f87171' : '#b91c1c',
      warn: isDark ? '#fbbf24' : '#b45309',
      muted: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,30,0.55)',
      overlay: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.82)',
    }),
    [isDark]
  );
}

function primaryBtn(palette, compact, active = false) {
  return {
    background: palette.panel,
    border: active ? `2px solid ${palette.accent}` : palette.border,
    color: active ? palette.accent : palette.button,
    borderRadius: 8,
    cursor: 'pointer',
    padding: compact ? '0.65rem 1rem' : '0.75rem 1.25rem',
    fontFamily: palette.titleFont,
    fontSize: compact ? '0.9rem' : '1rem',
    fontWeight: 600,
    transition: 'border-color 0.15s, color 0.15s',
    touchAction: 'manipulation',
  };
}

function optionBtn(palette, compact, state) {
  const { selected, correct, incorrect, disabled } = state;
  let border = palette.border;
  let color = palette.text;
  let bg = palette.panel;

  if (correct) {
    border = `2px solid ${palette.success}`;
    color = palette.success;
    bg = isDarkish(palette) ? 'rgba(74,222,128,0.12)' : 'rgba(21,128,61,0.08)';
  } else if (incorrect) {
    border = `2px solid ${palette.error}`;
    color = palette.error;
    bg = isDarkish(palette) ? 'rgba(248,113,113,0.12)' : 'rgba(185,28,28,0.08)';
  } else if (selected) {
    border = `2px solid ${palette.accent}`;
    color = palette.accent;
  }

  return {
    width: '100%',
    textAlign: 'left',
    background: bg,
    border,
    color,
    borderRadius: 10,
    cursor: disabled ? 'default' : 'pointer',
    padding: compact ? '0.85rem 1rem' : '1rem 1.15rem',
    fontFamily: palette.font,
    fontSize: compact ? '0.92rem' : '1rem',
    lineHeight: 1.45,
    touchAction: 'manipulation',
    transition: 'border-color 0.15s, background 0.15s, color 0.15s',
    opacity: disabled && !selected && !correct && !incorrect ? 0.72 : 1,
  };
}

function isDarkish(palette) {
  return palette.success === '#4ade80';
}

function iconBtn(palette) {
  return {
    background: 'transparent',
    border: palette.border,
    color: palette.text,
    borderRadius: 6,
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    fontFamily: palette.font,
    fontSize: '1rem',
    lineHeight: 1,
  };
}

function filterChipBtn(palette, compact, active) {
  return {
    ...primaryBtn(palette, compact, active),
    padding: compact ? '0.4rem 0.65rem' : '0.45rem 0.75rem',
    fontSize: compact ? '0.78rem' : '0.82rem',
  };
}

function SessionLineChart({ data, yMax, yTicks, palette, compact, ariaLabel, formatValue }) {
  if (!data.length) {
    return (
      <p style={{ color: palette.muted, fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
        No sessions match these filters yet.
      </p>
    );
  }

  const width = compact ? 300 : 480;
  const height = 168;
  const pad = { t: 14, r: 10, b: 34, l: 34 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? pad.l + innerW / 2
        : pad.l + (i / (data.length - 1)) * innerW;
    const y = pad.t + innerH - (Math.min(d.value, yMax) / yMax) * innerH;
    return { x, y, label: d.label, value: d.value };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', marginTop: '0.35rem' }}
      aria-label={ariaLabel}
      role="img"
    >
      {yTicks.map((tick) => {
        const y = pad.t + innerH - (tick / yMax) * innerH;
        return (
          <g key={tick}>
            <line
              x1={pad.l}
              y1={y}
              x2={width - pad.r}
              y2={y}
              stroke={palette.muted}
              strokeWidth="0.5"
              strokeDasharray="3 3"
            />
            <text x={4} y={y + 4} fill={palette.muted} fontSize="9">
              {formatValue ? formatValue(tick) : tick}
            </text>
          </g>
        );
      })}
      {points.length > 1 && (
        <polyline
          fill="none"
          stroke={palette.accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        />
      )}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" fill={palette.accent} />
          <text
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            fill={palette.muted}
            fontSize={data.length > 12 ? 7 : 8}
          >
            {p.label}
          </text>
        </g>
      ))}
      <text x={pad.l} y={height - 2} fill={palette.muted} fontSize="9">
        Session
      </text>
    </svg>
  );
}

function SessionScoresOverlay({
  open,
  onClose,
  palette,
  compact,
  siteLayout,
  sessions,
}) {
  const [filterMode, setFilterMode] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterQuestions, setFilterQuestions] = useState('all');

  const filtered = useMemo(
    () =>
      filterSessions(sessions, {
        mode: filterMode,
        difficulty: filterDifficulty,
        questionCount: filterQuestions,
      }).sort((a, b) => a.sessionNumber - b.sessionNumber),
    [sessions, filterMode, filterDifficulty, filterQuestions]
  );

  const accuracyData = useMemo(
    () =>
      filtered.map((s) => ({
        label: `S${s.sessionNumber}`,
        value: Math.round(s.accuracy * 100),
      })),
    [filtered]
  );

  const timedSessions = useMemo(
    () => filtered.filter((s) => s.useTimer && s.elapsedMs > 0 && s.totalQuestions > 0),
    [filtered]
  );

  const avgTimeData = useMemo(
    () =>
      timedSessions.map((s) => ({
        label: `S${s.sessionNumber}`,
        value: s.elapsedMs / 1000 / s.totalQuestions,
      })),
    [timedSessions]
  );

  const timeYMax = useMemo(() => {
    if (!avgTimeData.length) return 30;
    const peak = Math.max(...avgTimeData.map((d) => d.value));
    return Math.ceil(peak / 5) * 5 || 30;
  }, [avgTimeData]);

  const filteredByRecent = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filtered]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-scores-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: siteLayout.top,
        left: 0,
        right: 0,
        bottom: siteLayout.bottom,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '0.65rem' : '1rem',
        background: palette.overlay,
        backdropFilter: 'blur(4px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          background: palette.bg,
          color: palette.text,
          border: palette.border,
          borderRadius: 8,
          padding: compact ? '1.1rem' : '1.5rem',
          fontFamily: palette.font,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h2
            id="session-scores-title"
            style={{
              margin: 0,
              fontFamily: palette.titleFont,
              fontSize: compact ? '1.1rem' : '1.3rem',
              color: palette.accent,
            }}
          >
            Session scores and times
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={iconBtn(palette)}>
            ✕
          </button>
        </div>

        <p style={{ color: palette.muted, fontSize: '0.88rem', margin: '0.5rem 0 1rem', lineHeight: 1.5 }}>
          {sessions.length
            ? `${sessions.length} session${sessions.length === 1 ? '' : 's'} recorded. Use filters to compare runs.`
            : 'Complete a session to start building your history.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.1rem' }}>
          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.8rem', color: palette.accent }}>
              Game mode
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setFilterMode('all')} style={filterChipBtn(palette, compact, filterMode === 'all')}>
                All
              </button>
              {Object.values(MODES).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFilterMode(m.id)}
                  style={filterChipBtn(palette, compact, filterMode === m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.8rem', color: palette.accent }}>
              Difficulty
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setFilterDifficulty('all')} style={filterChipBtn(palette, compact, filterDifficulty === 'all')}>
                All
              </button>
              {Object.values(DIFFICULTIES).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setFilterDifficulty(d.id)}
                  style={filterChipBtn(palette, compact, filterDifficulty === d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.8rem', color: palette.accent }}>
              Questions
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setFilterQuestions('all')} style={filterChipBtn(palette, compact, filterQuestions === 'all')}>
                All
              </button>
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFilterQuestions(n)}
                  style={filterChipBtn(palette, compact, filterQuestions === n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section
          style={{
            background: palette.panel,
            border: palette.border,
            borderRadius: 8,
            padding: compact ? '0.75rem' : '0.9rem',
            marginBottom: '0.85rem',
          }}
        >
          <h3 style={{ margin: 0, fontFamily: palette.titleFont, fontSize: '0.95rem', color: palette.accent }}>
            Accuracy per session
          </h3>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: palette.muted }}>
            Overall percentage score — comparable across different question counts.
          </p>
          <SessionLineChart
            data={accuracyData}
            yMax={100}
            yTicks={[0, 25, 50, 75, 100]}
            palette={palette}
            compact={compact}
            ariaLabel="Accuracy percentage per session"
            formatValue={(v) => `${v}%`}
          />
        </section>

        <section
          style={{
            background: palette.panel,
            border: palette.border,
            borderRadius: 8,
            padding: compact ? '0.75rem' : '0.9rem',
          }}
        >
          <h3 style={{ margin: 0, fontFamily: palette.titleFont, fontSize: '0.95rem', color: palette.accent }}>
            Average time per question
          </h3>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: palette.muted }}>
            Seconds per question for sessions where time tracking was enabled.
          </p>
          {timedSessions.length ? (
            <SessionLineChart
              data={avgTimeData}
              yMax={timeYMax}
              yTicks={[0, timeYMax / 2, timeYMax]}
              palette={palette}
              compact={compact}
              ariaLabel="Average seconds per question per session"
              formatValue={(v) => `${v < 10 ? v.toFixed(1) : Math.round(v)}s`}
            />
          ) : (
            <p style={{ color: palette.muted, fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
              {filtered.length
                ? 'No timed sessions match these filters.'
                : 'No sessions match these filters yet.'}
            </p>
          )}
        </section>

        {filtered.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '1rem 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.82rem',
            }}
          >
            {filteredByRecent.map((s) => (
              <li
                key={s.sessionNumber}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.45rem 0.55rem',
                  background: palette.panel,
                  border: palette.border,
                  borderRadius: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontFamily: palette.titleFont, color: palette.accent }}>
                  Session {s.sessionNumber}
                </span>
                <span style={{ color: palette.muted }}>
                  {Math.round(s.accuracy * 100)}%
                  {s.useTimer && s.elapsedMs > 0
                    ? ` · ${(s.elapsedMs / 1000 / s.totalQuestions).toFixed(1)}s/q`
                    : ''}
                  {' · '}
                  {MODES[s.modeId]?.label ?? s.modeId}
                  {' · '}
                  {DIFFICULTIES[s.difficulty]?.label ?? s.difficulty}
                  {' · '}
                  {s.questionCount} Q
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const VocabularyTrainer = () => {
  const siteTheme = useSiteTheme();
  const isDark = siteTheme === 'dark';
  const palette = useThemePalette(isDark);
  const compact = useIsCompact();
  const siteLayout = useSiteLayout();

  const [screen, setScreen] = useState('welcome'); // welcome | playing | finished | reviewAll
  const [modeId, setModeId] = useState('wordToMeaning');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(15);
  const [useTimer, setUseTimer] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [sessionStartMs, setSessionStartMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newHighScore, setNewHighScore] = useState(false);
  const [highScore, setHighScore] = useState(() => loadHighScore());
  const [sessionHistory, setSessionHistory] = useState(() => loadSessionHistory());
  const [showSessionScores, setShowSessionScores] = useState(false);
  const [sessionMeta, setSessionMeta] = useState(null);

  const timerRef = useRef(null);

  const shellStyle = {
    minHeight: '100vh',
    width: '100%',
    background: palette.bg,
    color: palette.text,
    fontFamily: palette.font,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: compact ? '0.75rem' : '1.25rem',
    boxSizing: 'border-box',
  };

  const maxScore = questions.length * (BASE_POINTS + STREAK_BONUS);

  const startSession = useCallback(
    (words, sessionMode = modeId, meta = null) => {
      const qs = words.map((entry) => buildQuestion(entry, sessionMode));
      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setRevealed(false);
      setScore(0);
      setStreak(0);
      setLongestStreak(0);
      setCorrectCount(0);
      setMasteredCount(0);
      setMistakes([]);
      setShowConfetti(false);
      setNewHighScore(false);
      setSessionMeta(
        meta ?? {
          modeId: sessionMode,
          difficulty,
          questionCount,
          useTimer,
        }
      );
      const now = Date.now();
      setSessionStartMs(now);
      setElapsedMs(0);
      setScreen('playing');
    },
    [modeId, difficulty, questionCount, useTimer]
  );

  const handleStart = () => {
    const words = selectSessionWords(difficulty, questionCount);
    startSession(words);
  };

  const handlePracticeMistakes = () => {
    if (!mistakes.length) return;
    const ids = [...new Set(mistakes.map((m) => m.entry.id))];
    const words = vocabularyData.filter((e) => ids.includes(e.id));
    startSession(shuffle(words));
  };

  const finishSession = useCallback(() => {
    const finalElapsed = Date.now() - sessionStartMs;
    setElapsedMs(finalElapsed);
    clearInterval(timerRef.current);

    const accuracy = questions.length ? correctCount / questions.length : 0;
    const stats = {
      score,
      accuracy,
      longestStreak,
      elapsedMs: finalElapsed,
      date: new Date().toISOString(),
    };
    const isNew = saveHighScore(stats);
    setNewHighScore(isNew);
    if (isNew) setHighScore(stats);

    if (sessionMeta) {
      const updated = appendSessionHistory({
        modeId: sessionMeta.modeId,
        difficulty: sessionMeta.difficulty,
        questionCount: sessionMeta.questionCount,
        useTimer: sessionMeta.useTimer,
        totalQuestions: questions.length,
        correctCount,
        accuracy,
        score,
        elapsedMs: sessionMeta.useTimer ? finalElapsed : 0,
        date: stats.date,
      });
      setSessionHistory(updated);
    }

    if (accuracy >= 0.8 && longestStreak >= 3) {
      setShowConfetti(true);
    }
    setScreen('finished');
  }, [
    score,
    correctCount,
    longestStreak,
    sessionStartMs,
    questions.length,
    sessionMeta,
  ]);

  const goNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      finishSession();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }, [currentIndex, questions.length, finishSession]);

  const submitAnswer = useCallback(() => {
    if (selectedIndex === null || revealed) return;

    const q = questions[currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      const bonus = streak * STREAK_BONUS;
      setScore((s) => s + BASE_POINTS + bonus);
      setCorrectCount((c) => c + 1);
      setMasteredCount((m) => m + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setLongestStreak((best) => Math.max(best, nextStreak));
      if (nextStreak > 0 && nextStreak % 5 === 0) setShowConfetti(true);
    } else {
      setStreak(0);
      const selectedText = q.options[selectedIndex].text;
      const correctText = q.options[q.correctIndex].text;
      setMistakes((prev) => [
        ...prev,
        {
          entry: q.entry,
          mode: q.mode,
          prompt: q.mode === 'wordToMeaning' ? q.entry.word : q.entry.definition,
          promptPos: q.entry.pos,
          selected: selectedText,
          correct: q.mode === 'wordToMeaning' ? q.entry.definition : q.entry.word,
          correctWord: q.entry.word,
          fullDefinition: q.entry.definition,
        },
      ]);
    }

    setRevealed(true);
  }, [selectedIndex, revealed, questions, currentIndex, streak]);

  useEffect(() => {
    if (screen === 'playing' && useTimer) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - sessionStartMs);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, useTimer, sessionStartMs]);

  useEffect(() => {
    if (screen !== 'playing') return undefined;

    const onKey = (e) => {
      if (!revealed) {
        if (e.key >= '1' && e.key <= '4') {
          const idx = Number(e.key) - 1;
          if (idx < 4) setSelectedIndex(idx);
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev === null ? 0 : Math.min(3, prev + 1)));
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev === null ? 3 : Math.max(0, prev - 1)));
        }
      }
      if (e.key === 'Enter') {
        if (revealed) goNext();
        else submitAnswer();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, revealed, submitAnswer, goNext]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + (revealed ? 1 : 0)) / questions.length) * 100 : 0;

  // ─── Welcome ───────────────────────────────────────────────────────────────

  if (screen === 'welcome') {
    return (
      <div style={shellStyle}>
        <header style={{ textAlign: 'center', maxWidth: 560, marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: palette.titleFont,
              color: palette.accent,
              margin: '0 0 0.35rem',
              fontSize: compact ? '1.6rem' : '2.1rem',
            }}
          >
            Vocabulary Trainer
          </h1>
          <p style={{ color: palette.muted, margin: 0, lineHeight: 1.55, maxWidth: 480 }}>
            Active recall for intermediate and advanced English vocabulary. Train both directions —
            word to meaning and meaning to word — with immediate feedback and a dedicated mistakes review.
          </p>
        </header>

        <section style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>
              Game mode
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {Object.values(MODES).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeId(m.id)}
                  style={{ ...primaryBtn(palette, compact, modeId === m.id), flex: 1, minWidth: 140 }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginTop: '0.35rem' }}>
              {MODES[modeId].shortDesc}
            </span>
          </div>

          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>
              Difficulty
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              {Object.values(DIFFICULTIES).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  style={{ ...primaryBtn(palette, compact, difficulty === d.id), flex: 1 }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>
              Questions
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuestionCount(n)}
                  style={{ ...primaryBtn(palette, compact, questionCount === n), flex: 1 }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useTimer}
              onChange={(e) => setUseTimer(e.target.checked)}
              style={{ accentColor: palette.accent }}
            />
            <span style={{ fontSize: '0.9rem' }}>Track session time</span>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleStart} style={{ ...primaryBtn(palette, compact), flex: 1 }}>
              Start session
            </button>
            <button
              type="button"
              onClick={() => setShowSessionScores(true)}
              style={primaryBtn(palette, compact)}
            >
              Session scores and times
            </button>
          </div>

          {highScore && (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: palette.muted, margin: 0 }}>
              Best score: {highScore.score} · {Math.round(highScore.accuracy * 100)}% accuracy
            </p>
          )}
        </section>

        <footer style={{ marginTop: '2rem', fontSize: '0.78rem', color: palette.muted, textAlign: 'center' }}>
          Data sourced from curated advanced vocabulary · {vocabularyData.length} words
        </footer>

        <SessionScoresOverlay
          open={showSessionScores}
          onClose={() => setShowSessionScores(false)}
          palette={palette}
          compact={compact}
          siteLayout={siteLayout}
          sessions={sessionHistory}
        />
      </div>
    );
  }

  // ─── Review all words from session ─────────────────────────────────────────

  if (screen === 'reviewAll') {
    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 560, width: '100%' }}>
          <h2 style={{ fontFamily: palette.titleFont, color: palette.accent, marginTop: 0 }}>
            Session vocabulary
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map((q) => (
              <li
                key={q.entry.id}
                style={{
                  background: palette.panel,
                  border: palette.border,
                  borderRadius: 8,
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '1.05rem' }}>
                  {q.entry.word}
                  <span style={{ color: palette.muted, fontWeight: 400, fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({q.entry.pos})
                  </span>
                </div>
                <p style={{ margin: '0.35rem 0 0', lineHeight: 1.5, fontSize: '0.92rem' }}>{q.entry.definition}</p>
                {q.entry.etymology && (
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.84rem', color: palette.muted, lineHeight: 1.45 }}>
                    <span style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '0.78rem' }}>
                      Why it means that ·{' '}
                    </span>
                    {q.entry.etymology}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button type="button" onClick={() => setScreen('finished')} style={primaryBtn(palette, compact)}>
              Back to summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Finished ──────────────────────────────────────────────────────────────

  if (screen === 'finished') {
    const accuracy = questions.length ? correctCount / questions.length : 0;

    return (
      <div style={shellStyle}>
        <Confetti active={showConfetti} palette={palette} />
        <div style={{ maxWidth: 560, width: '100%' }}>
          <h2
            style={{
              fontFamily: palette.titleFont,
              color: palette.accent,
              textAlign: 'center',
              marginTop: 0,
              fontSize: compact ? '1.35rem' : '1.6rem',
            }}
          >
            Session complete
          </h2>

          {newHighScore && (
            <p style={{ textAlign: 'center', color: palette.success, fontFamily: palette.titleFont, margin: '0.5rem 0' }}>
              New high score!
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: '0.65rem',
              margin: '1rem 0',
            }}
          >
            {[
              { label: 'Score', value: `${score} / ${maxScore}` },
              { label: 'Accuracy', value: `${Math.round(accuracy * 100)}%` },
              { label: 'Longest streak', value: longestStreak },
              { label: 'Words mastered', value: masteredCount },
              { label: 'Time', value: useTimer ? formatTime(elapsedMs) : '—' },
              { label: 'Words seen', value: questions.length },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: palette.panel,
                  border: palette.border,
                  borderRadius: 8,
                  padding: '0.65rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: palette.muted }}>{s.label}</div>
                <div style={{ fontFamily: palette.titleFont, fontSize: '1.1rem', color: palette.accent }}>{s.value}</div>
              </div>
            ))}
          </div>

          {mistakes.length > 0 ? (
            <section style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '1rem' }}>
                Mistakes review ({mistakes.length})
              </h3>
              <p style={{ color: palette.muted, fontSize: '0.88rem', margin: '0.35rem 0 0.75rem' }}>
                Re-read these entries — correcting errors is the fastest path to retention.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {mistakes.map((m, i) => (
                  <li
                    key={`${m.entry.id}-${i}`}
                    style={{
                      background: palette.panel,
                      border: palette.border,
                      borderRadius: 8,
                      padding: '0.9rem 1rem',
                    }}
                  >
                    <div style={{ fontFamily: palette.titleFont, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      {m.mode === 'wordToMeaning' ? (
                        <>
                          <span style={{ color: palette.accent }}>{m.prompt}</span>
                          <span style={{ color: palette.muted, marginLeft: '0.4rem' }}>({m.promptPos})</span>
                        </>
                      ) : (
                        <span style={{ fontStyle: 'italic' }}>{m.prompt}</span>
                      )}
                    </div>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>
                      <span style={{ color: palette.error }}>❌</span> You chose: {m.selected}
                    </p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>
                      <span style={{ color: palette.success }}>✅</span> Correct: {m.correct}
                    </p>
                    <p style={{ margin: '0.45rem 0 0', fontSize: '0.88rem', color: palette.muted, lineHeight: 1.5 }}>
                      {m.fullDefinition}
                    </p>
                    {m.entry.etymology && (
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.84rem', color: palette.muted, lineHeight: 1.45 }}>
                        <span style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '0.78rem' }}>
                          Why it means that ·{' '}
                        </span>
                        {m.entry.etymology}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p style={{ textAlign: 'center', color: palette.success, marginTop: '1rem' }}>
              Perfect session — no mistakes to review!
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {mistakes.length > 0 && (
              <button type="button" onClick={handlePracticeMistakes} style={primaryBtn(palette, compact)}>
                Practice mistakes only
              </button>
            )}
            <button type="button" onClick={() => setScreen('reviewAll')} style={primaryBtn(palette, compact)}>
              Review all words
            </button>
            <button type="button" onClick={() => setScreen('welcome')} style={primaryBtn(palette, compact)}>
              New session
            </button>
          </div>

          <footer style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: palette.muted, textAlign: 'center' }}>
            Data sourced from curated advanced vocabulary
          </footer>
        </div>
      </div>
    );
  }

  // ─── Playing ───────────────────────────────────────────────────────────────

  if (!currentQuestion) return null;

  const isCorrectSelection = revealed && selectedIndex === currentQuestion.correctIndex;

  return (
    <div style={shellStyle}>
      <Confetti active={showConfetti} palette={palette} />
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.65rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontFamily: palette.titleFont, fontSize: '0.9rem', color: palette.accent }}>
            {MODES[modeId].label}
          </span>
          <span style={{ fontSize: '0.85rem', color: palette.muted }}>
            {useTimer ? formatTime(elapsedMs) : `Score ${score}`}
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: palette.muted }}>
            <span>
              Question {currentIndex + 1} / {questions.length}
            </span>
            <span>Streak {streak}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              height: 6,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              borderRadius: 3,
              marginTop: '0.35rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: palette.accent,
                borderRadius: 3,
                transition: 'width 0.35s ease',
              }}
            />
          </div>
        </div>

        {/* Prompt card */}
        <div
          style={{
            background: palette.panel,
            border: palette.border,
            borderRadius: 10,
            padding: compact ? '1.25rem 1rem' : '1.5rem 1.25rem',
            marginBottom: '1rem',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {currentQuestion.mode === 'wordToMeaning' ? (
            <>
              <div
                style={{
                  fontFamily: palette.titleFont,
                  fontSize: compact ? '1.75rem' : '2.25rem',
                  color: palette.accent,
                  letterSpacing: '0.02em',
                }}
              >
                {currentQuestion.prompt}
              </div>
              <div style={{ color: palette.muted, fontSize: '0.9rem', marginTop: '0.35rem' }}>
                {currentQuestion.promptSub}
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: 0, lineHeight: 1.55, fontSize: compact ? '1rem' : '1.1rem' }}>
                {currentQuestion.prompt}
              </p>
              <div style={{ color: palette.muted, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                ({currentQuestion.promptSub})
              </div>
            </>
          )}
        </div>

        {/* Options */}
        <div
          role="listbox"
          aria-label="Answer options"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}
        >
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = revealed && idx === currentQuestion.correctIndex;
            const isIncorrect = revealed && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={revealed}
                onClick={() => !revealed && setSelectedIndex(idx)}
                style={optionBtn(palette, compact, {
                  selected: isSelected,
                  correct: isCorrect,
                  incorrect: isIncorrect,
                  disabled: revealed,
                })}
              >
                <span style={{ fontFamily: palette.titleFont, marginRight: '0.5rem', opacity: 0.7 }}>
                  {idx + 1}.
                </span>
                {opt.text}
                {isCorrect && revealed && (
                  <span style={{ marginLeft: '0.5rem', color: palette.success }}>✓</span>
                )}
                {isIncorrect && <span style={{ marginLeft: '0.5rem', color: palette.error }}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback + brief learning explanation */}
        {revealed && (
          <div
            style={{
              margin: '0 0 0.85rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <p
              style={{
                textAlign: 'center',
                margin: '0 0 0.55rem',
                fontFamily: palette.titleFont,
                color: isCorrectSelection ? palette.success : palette.error,
                fontSize: '0.95rem',
              }}
            >
              {isCorrectSelection
                ? streak > 1
                  ? `Correct! +${BASE_POINTS + (streak - 1) * STREAK_BONUS} pts (streak bonus)`
                  : `Correct! +${BASE_POINTS} pts`
                : 'Incorrect — review the correct answer above.'}
            </p>
            {currentQuestion.entry.etymology && (
              <div
                role="note"
                aria-label="Answer explanation"
                style={{
                  background: isDarkish(palette) ? 'rgba(167,139,250,0.1)' : 'rgba(109,40,217,0.06)',
                  border: palette.border,
                  borderRadius: 8,
                  padding: compact ? '0.7rem 0.85rem' : '0.8rem 1rem',
                }}
              >
                <div
                  style={{
                    fontFamily: palette.titleFont,
                    fontSize: '0.78rem',
                    color: palette.accent,
                    marginBottom: '0.3rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  Why it means that
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: compact ? '0.86rem' : '0.9rem',
                    lineHeight: 1.5,
                    color: palette.text,
                  }}
                >
                  {currentQuestion.entry.etymology}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!revealed ? (
            <button
              type="button"
              onClick={submitAnswer}
              disabled={selectedIndex === null}
              style={{
                ...primaryBtn(palette, compact),
                flex: 1,
                opacity: selectedIndex === null ? 0.5 : 1,
                cursor: selectedIndex === null ? 'not-allowed' : 'pointer',
              }}
            >
              Submit
            </button>
          ) : (
            <button type="button" onClick={goNext} style={{ ...primaryBtn(palette, compact), flex: 1 }}>
              {currentIndex + 1 >= questions.length ? 'View results' : 'Next question'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: palette.muted, marginTop: '0.75rem' }}>
          Keys: 1–4 to select · arrows to move · Enter to submit / continue
        </p>
      </div>
    </div>
  );
};

export default VocabularyTrainer;