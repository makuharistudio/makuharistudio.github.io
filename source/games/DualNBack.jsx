/*
---
title: Dual N-Back
photo: ./DualNBack.png
desc: Match square position and letters from N steps back to directly improve working memory.
---
*/

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
const STIMULUS_MS = 500;
const TRIAL_MS = 3000;
const RESPONSE_MS = TRIAL_MS - STIMULUS_MS;
const FEEDBACK_MS = 450;
const MATCH_RATE = 0.3;
const ADAPT_THRESHOLD = 0.8;
const MAX_N = 9;
const DEFAULT_SESSION_MIN = 17;
// Match site layout insets (see App.css @media portrait / landscape)
const SITE_FOOTER_HEIGHT = 'calc(var(--menu-footer-button-width, 15vw) * 2.5)';
const SITE_TOP_INSET_PORTRAIT = 'var(--menu-footer-button-width, 15vw)';
const SITE_TOP_INSET_LANDSCAPE = 'calc(var(--menu-header-height, 5vh) * 1.5)';

// ─── Expandable game modes ───────────────────────────────────────────────────
// Add new modes here; each mode defines its modalities and stimulus rendering.

const GAME_MODES = {
  classic: {
    id: 'classic',
    label: 'Classic Dual N-Back',
    shortDesc: 'Square position + spoken letters',
    modalities: [
      { id: 'position', label: 'Position' },
      { id: 'letter', label: 'Letter' },
    ],
    letters: LETTERS,
    gridSize: 3,
    generateStimulus(trial) {
      return { position: trial.position, letter: trial.letter };
    },
  },
  // Future modes (e.g. triple n-back, colour + shape) plug in here.
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function pickRandom(items, exclude = null) {
  const pool = exclude != null ? items.filter((x) => x !== exclude) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function blockSize(n) {
  return 20 + n;
}

function generateBlockTrials(n, mode) {
  const size = blockSize(n);
  const letters = mode.letters;
  const trials = [];

  for (let t = 0; t < size; t++) {
    let position;
    let letter;
    const scorable = t >= n;

    if (t < n) {
      position = Math.floor(Math.random() * 9);
      letter = pickRandom(letters);
    } else {
      const ref = trials[t - n];
      const wantPosMatch = Math.random() < MATCH_RATE;
      const wantLetMatch = Math.random() < MATCH_RATE;

      position = wantPosMatch
        ? ref.position
        : pickRandom([0, 1, 2, 3, 4, 5, 6, 7, 8], ref.position);
      letter = wantLetMatch ? ref.letter : pickRandom(letters, ref.letter);
    }

    trials.push({
      index: t,
      position,
      letter,
      positionMatch: scorable && position === trials[t - n]?.position,
      letterMatch: scorable && letter === trials[t - n]?.letter,
      scorable,
    });
  }

  return trials;
}

function scoreModality(target, responded) {
  if (target && responded) return 'hit';
  if (!target && !responded) return 'correctReject';
  if (!target && responded) return 'falseAlarm';
  return 'miss';
}

function modalityAccuracy(results) {
  if (!results.length) return 0;
  const correct = results.filter(
    (r) => r === 'hit' || r === 'correctReject'
  ).length;
  return correct / results.length;
}

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function pct(n) {
  return `${Math.round(n * 100)}%`;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

// ─── Theme-aware palette (reads site CSS variables) ──────────────────────────

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
      cell: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      cellActive: isDark ? 'rgba(51,160,255,0.9)' : 'rgba(0,110,210,0.82)',
      cellGlow: isDark ? '0 0 18px rgba(51,160,255,0.55)' : '0 0 14px rgba(0,110,210,0.4)',
      overlay: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.82)',
    }),
    [isDark]
  );
}

// ─── Inline sub-components ───────────────────────────────────────────────────

function Modal({ open, onClose, title, children, palette, compact }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '1rem' : '2rem',
        background: palette.overlay,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: palette.bg,
          color: palette.text,
          border: palette.border,
          borderRadius: 8,
          padding: compact ? '1.25rem' : '1.75rem',
          fontFamily: palette.font,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontFamily: palette.titleFont,
              fontSize: compact ? '1.15rem' : '1.35rem',
              color: palette.accent,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={iconBtn(palette)}
          >
            ✕
          </button>
        </div>
        <div style={{ marginTop: '1rem', lineHeight: 1.65, fontSize: compact ? '0.95rem' : '1rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function NHistoryChart({ history, palette, compact }) {
  if (history.length < 2) {
    return (
      <p style={{ color: palette.muted, fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
        Complete another block to see your N-level trend.
      </p>
    );
  }

  const width = compact ? 280 : 360;
  const height = 100;
  const pad = { t: 12, r: 12, b: 22, l: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxY = Math.max(...history.map((h) => h.n), 3);
  const minY = 1;

  const points = history.map((h, i) => {
    const x = pad.l + (i / (history.length - 1)) * innerW;
    const y = pad.t + innerH - ((h.n - minY) / (maxY - minY)) * innerH;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', marginTop: '0.5rem' }}
      aria-label="N-level history chart"
    >
      {[minY, Math.ceil((minY + maxY) / 2), maxY].map((tick) => {
        const y = pad.t + innerH - ((tick - minY) / (maxY - minY)) * innerH;
        return (
          <g key={tick}>
            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke={palette.muted} strokeWidth="0.5" strokeDasharray="3 3" />
            <text x={4} y={y + 4} fill={palette.muted} fontSize="9">
              {tick}
            </text>
          </g>
        );
      })}
      <polyline
        fill="none"
        stroke={palette.accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
      {history.map((h, i) => {
        const x = pad.l + (i / (history.length - 1)) * innerW;
        const y = pad.t + innerH - ((h.n - minY) / (maxY - minY)) * innerH;
        return <circle key={h.block} cx={x} cy={y} r="3.5" fill={palette.accent} />;
      })}
      <text x={pad.l} y={height - 4} fill={palette.muted} fontSize="9">
        Block
      </text>
    </svg>
  );
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

function primaryBtn(palette, compact) {
  return {
    background: palette.panel,
    border: palette.border,
    color: palette.buttonHover,
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

function responseBtn(palette, compact, active, canRespond, isDark) {
  return {
    flex: 1,
    minHeight: compact ? 52 : 58,
    background: palette.panel,
    border: canRespond
      ? `2px solid ${palette.accent}`
      : active
        ? `2px solid ${palette.accent}`
        : palette.border,
    color: canRespond ? palette.accent : palette.text,
    borderRadius: 10,
    cursor: canRespond ? 'pointer' : 'default',
    fontFamily: palette.titleFont,
    fontSize: compact ? '0.95rem' : '1.05rem',
    fontWeight: 600,
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: canRespond
      ? `0 0 12px ${isDark ? 'rgba(51,160,255,0.35)' : 'rgba(0,110,210,0.25)'}`
      : 'none',
    transition: 'border-color 0.15s, color 0.15s, box-shadow 0.15s',
  };
}

function getPhaseHint(phase, scorable) {
  if (phase === 'stimulus') return 'Watch the highlighted square and letter above.';
  if (phase === 'response' && scorable) return 'Tap a button now if something matched N steps back.';
  if (phase === 'response') return 'Warming up — watch and remember. Buttons activate soon.';
  if (phase === 'feedback') return 'Next trial coming up…';
  return 'Get ready…';
}

// ─── Main component ──────────────────────────────────────────────────────────

const DualNBack = () => {
  const siteTheme = useSiteTheme();
  const isDark = siteTheme === 'dark';
  const palette = useThemePalette(isDark);
  const compact = useIsCompact();
  const siteLayout = useSiteLayout();

  // Screen: welcome | playing | blockBreak | paused | finished
  const [screen, setScreen] = useState('welcome');
  const [showInstructions, setShowInstructions] = useState(false);

  const [modeId, setModeId] = useState('classic');
  const [startN, setStartN] = useState(2);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULT_SESSION_MIN);

  const mode = GAME_MODES[modeId];

  // Active session state (resets on refresh — no persistence)
  const [nLevel, setNLevel] = useState(2);
  const [blockNum, setBlockNum] = useState(0);
  const [blockTrials, setBlockTrials] = useState([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // stimulus | response | feedback
  const [feedback, setFeedback] = useState(null);

  const [positionPressed, setPositionPressed] = useState(false);
  const [letterPressed, setLetterPressed] = useState(false);

  const [elapsedMs, setElapsedMs] = useState(0);
  const sessionLimitMs = sessionMinutes * 60 * 1000;
  const remainingMs = Math.max(0, sessionLimitMs - elapsedMs);

  // Session stats
  const [posResults, setPosResults] = useState([]);
  const [letResults, setLetResults] = useState([]);
  const [maxN, setMaxN] = useState(2);
  const [bestStreak, setBestStreak] = useState({ position: 0, letter: 0 });
  const [curStreak, setCurStreak] = useState({ position: 0, letter: 0 });
  const [nHistory, setNHistory] = useState([]);
  const [blockSummary, setBlockSummary] = useState(null);
  const [totalBlocks, setTotalBlocks] = useState(0);

  const responsesRef = useRef({ position: false, letter: false });
  const blockPosResultsRef = useRef([]);
  const blockLetResultsRef = useRef([]);
  const elapsedRef = useRef(0);
  const timersRef = useRef([]);
  const sessionIntervalRef = useRef(null);
  const playingRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // ─── Scoring ─────────────────────────────────────────────────────────────

  const recordTrial = useCallback(
    (trial, responses) => {
      if (!trial.scorable) return;

      const posOutcome = scoreModality(trial.positionMatch, responses.position);
      const letOutcome = scoreModality(trial.letterMatch, responses.letter);

      setPosResults((prev) => [...prev, posOutcome]);
      setLetResults((prev) => [...prev, letOutcome]);
      blockPosResultsRef.current.push(posOutcome);
      blockLetResultsRef.current.push(letOutcome);

      setCurStreak((prev) => {
        const posOk = posOutcome === 'hit' || posOutcome === 'correctReject';
        const letOk = letOutcome === 'hit' || letOutcome === 'correctReject';
        const next = {
          position: posOk ? prev.position + 1 : 0,
          letter: letOk ? prev.letter + 1 : 0,
        };
        setBestStreak((best) => ({
          position: Math.max(best.position, next.position),
          letter: Math.max(best.letter, next.letter),
        }));
        return next;
      });

      const parts = [];
      if (posOutcome === 'hit') parts.push('Position ✓');
      else if (posOutcome === 'miss') parts.push('Position missed');
      else if (posOutcome === 'falseAlarm') parts.push('Position ✗');

      if (letOutcome === 'hit') parts.push('Letter ✓');
      else if (letOutcome === 'miss') parts.push('Letter missed');
      else if (letOutcome === 'falseAlarm') parts.push('Letter ✗');

      const hasError = parts.some((p) => p.includes('missed') || p.includes('✗'));
      const hasHit = parts.some((p) => p.includes('✓'));
      setFeedback({
        text: parts.length ? parts.join(' · ') : 'Good focus',
        tone: hasError ? 'error' : hasHit ? 'success' : 'neutral',
      });
    },
    []
  );

  // ─── Block lifecycle ─────────────────────────────────────────────────────

  const finishBlock = useCallback(() => {
    const posAcc = modalityAccuracy(blockPosResultsRef.current);
    const letAcc = modalityAccuracy(blockLetResultsRef.current);

    let nextN = nLevel;
    if (posAcc >= ADAPT_THRESHOLD && letAcc >= ADAPT_THRESHOLD) {
      nextN = Math.min(nLevel + 1, MAX_N);
    } else {
      nextN = Math.max(nLevel - 1, 1);
    }

    setBlockSummary({
      block: blockNum,
      n: nLevel,
      nextN,
      posAcc,
      letAcc,
      trials: blockSize(nLevel),
    });
    setNHistory((prev) => [...prev, { block: blockNum, n: nLevel }]);
    setTotalBlocks((b) => b + 1);
    setNLevel(nextN);
    setMaxN((m) => Math.max(m, nLevel, nextN));
    setBlockNum((b) => b + 1);
    setScreen('blockBreak');
    playingRef.current = false;
    clearTimers();
  }, [nLevel, blockNum, clearTimers]);

  const runTrial = useCallback(
    (idx, trials) => {
      if (!playingRef.current) return;

      const limit = sessionMinutes * 60 * 1000;
      if (elapsedRef.current >= limit) {
        playingRef.current = false;
        clearTimers();
        setScreen('finished');
        return;
      }

      if (idx >= trials.length) {
        finishBlock();
        return;
      }

      const trial = trials[idx];
      setTrialIndex(idx);
      setPhase('stimulus');
      setFeedback(null);
      setPositionPressed(false);
      setLetterPressed(false);
      responsesRef.current = { position: false, letter: false };

      schedule(() => {
        if (!playingRef.current) return;
        setPhase('response');

        schedule(() => {
          if (!playingRef.current) return;
          recordTrial(trial, { ...responsesRef.current });
          setPhase('feedback');

          schedule(() => {
            if (!playingRef.current) return;
            runTrial(idx + 1, trials);
          }, FEEDBACK_MS);
        }, RESPONSE_MS);
      }, STIMULUS_MS);
    },
    [schedule, recordTrial, finishBlock, clearTimers, sessionMinutes]
  );

  const beginBlock = useCallback(
    (trials) => {
      blockPosResultsRef.current = [];
      blockLetResultsRef.current = [];
      setBlockTrials(trials);
      setTrialIndex(0);
      setPhase('stimulus');
      setFeedback(null);
      setPositionPressed(false);
      setLetterPressed(false);
      responsesRef.current = { position: false, letter: false };
      playingRef.current = true;
      setScreen('playing');
      schedule(() => runTrial(0, trials), 0);
    },
    [schedule, runTrial]
  );

  const startBlock = useCallback(() => {
    beginBlock(generateBlockTrials(nLevel, mode));
  }, [nLevel, mode, beginBlock]);

  // Session timer
  useEffect(() => {
    if (screen === 'playing') {
      sessionIntervalRef.current = setInterval(() => {
        setElapsedMs((e) => {
          const next = e + 1000;
          elapsedRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      clearInterval(sessionIntervalRef.current);
    }
    return () => clearInterval(sessionIntervalRef.current);
  }, [screen]);

  useEffect(() => {
    if (screen === 'playing' && elapsedMs >= sessionLimitMs) {
      playingRef.current = false;
      clearTimers();
      setScreen('finished');
    }
  }, [elapsedMs, sessionLimitMs, screen, clearTimers]);

  // ─── Input handlers ──────────────────────────────────────────────────────

  const handleMatch = useCallback(
    (modality) => {
      if (screen !== 'playing' || phase !== 'response') return;
      if (!blockTrials[trialIndex]?.scorable) return;

      responsesRef.current[modality] = true;
      if (modality === 'position') setPositionPressed(true);
      if (modality === 'letter') setLetterPressed(true);
    },
    [screen, phase, blockTrials, trialIndex]
  );

  const pause = useCallback(() => {
    if (screen !== 'playing') return;
    playingRef.current = false;
    clearTimers();
    setScreen('paused');
  }, [screen, clearTimers]);

  const resume = useCallback(() => {
    playingRef.current = true;
    setScreen('playing');
    clearTimers();
    schedule(() => runTrial(trialIndex, blockTrials), 0);
  }, [trialIndex, blockTrials, runTrial, clearTimers, schedule]);

  const startSession = useCallback(() => {
    setNLevel(startN);
    setMaxN(startN);
    setBlockNum(1);
    setElapsedMs(0);
    elapsedRef.current = 0;
    setPosResults([]);
    setLetResults([]);
    setBestStreak({ position: 0, letter: 0 });
    setCurStreak({ position: 0, letter: 0 });
    setNHistory([{ block: 0, n: startN }]);
    setTotalBlocks(0);
    setBlockSummary(null);
    beginBlock(generateBlockTrials(startN, mode));
  }, [startN, mode, beginBlock]);

  const endSession = useCallback(() => {
    playingRef.current = false;
    clearTimers();
    setScreen('finished');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ─── Derived display ───────────────────────────────────────────────────────

  const currentTrial = blockTrials[trialIndex];
  const stimulus = currentTrial ? mode.generateStimulus(currentTrial) : null;
  const showGridHighlight = phase === 'stimulus' && stimulus;
  const showLetter = phase === 'stimulus' && stimulus;
  const canRespond = phase === 'response' && !!currentTrial?.scorable;
  const phaseHint = getPhaseHint(phase, !!currentTrial?.scorable);

  const sessionPosAcc = modalityAccuracy(posResults);
  const sessionLetAcc = modalityAccuracy(letResults);

  const tips = useMemo(() => {
    const t = [];
    if (sessionPosAcc < sessionLetAcc - 0.1) {
      t.push('Visualise the 3×3 grid as a physical map — mentally "place" each square to strengthen spatial working memory.');
    }
    if (sessionLetAcc < sessionPosAcc - 0.1) {
      t.push("Sub-vocalise each letter quietly; hearing it in your mind's voice builds the auditory memory trace.");
    }
    if (maxN >= 4) {
      t.push('Strong performance! Real-world transfer shows up when you hold multiple conversation threads or follow complex instructions.');
    } else {
      t.push('Consistency beats intensity — short daily sessions compound into measurable gains on fluid intelligence tasks.');
    }
    if (bestStreak.position < 5 && bestStreak.letter < 5) {
      t.push('Try responding only when confident; reducing false alarms often unlocks the next N level.');
    }
    return t;
  }, [sessionPosAcc, sessionLetAcc, maxN, bestStreak]);

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

  // ─── Render: Welcome ─────────────────────────────────────────────────────

  if (screen === 'welcome') {
    return (
      <div style={shellStyle}>
        <header style={{ textAlign: 'center', maxWidth: 520, marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: palette.titleFont, color: palette.accent, margin: '0 0 0.35rem', fontSize: compact ? '1.5rem' : '2rem' }}>
            Dual N-Back
          </h1>
          <p style={{ color: palette.muted, margin: 0, lineHeight: 1.5 }}>
            Train working memory by matching stimuli from N steps back. Adaptive difficulty keeps you in the growth zone.
          </p>
        </header>

        <section style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>Game mode</span>
            <select
              value={modeId}
              onChange={(e) => setModeId(e.target.value)}
              style={{
                padding: '0.6rem',
                background: palette.panel,
                color: palette.text,
                border: palette.border,
                borderRadius: 6,
                fontFamily: palette.font,
              }}
            >
              {Object.values(GAME_MODES).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.8rem', color: palette.muted }}>{mode.shortDesc}</span>
          </label>

          <div>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>Starting N</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              {[1, 2].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStartN(n)}
                  style={{
                    ...primaryBtn(palette, compact),
                    flex: 1,
                    border: startN === n ? `2px solid ${palette.accent}` : palette.border,
                    color: startN === n ? palette.accent : palette.button,
                  }}
                >
                  N = {n}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontFamily: palette.titleFont, fontSize: '0.85rem', color: palette.accent }}>
              Session length ({sessionMinutes} min)
            </span>
            <input
              type="range"
              min={15}
              max={20}
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              style={{ width: '100%', accentColor: palette.accent }}
            />
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={startSession} style={{ ...primaryBtn(palette, compact), flex: 1 }}>
              Start session
            </button>
            <button type="button" onClick={() => setShowInstructions(true)} style={primaryBtn(palette, compact)}>
              How it works
            </button>
          </div>
        </section>

        <InstructionsModal
          open={showInstructions}
          onClose={() => setShowInstructions(false)}
          palette={palette}
          compact={compact}
        />
      </div>
    );
  }

  // ─── Render: Block break ─────────────────────────────────────────────────

  if (screen === 'blockBreak' && blockSummary) {
    const improved = blockSummary.nextN > blockSummary.n;
    const declined = blockSummary.nextN < blockSummary.n;

    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <h2 style={{ fontFamily: palette.titleFont, color: palette.accent, marginTop: 0 }}>Block {blockSummary.block} complete</h2>
          <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
            Position {pct(blockSummary.posAcc)} · Letter {pct(blockSummary.letAcc)}
          </p>
          <p style={{ color: palette.muted }}>
            {improved && `Excellent — advancing to N = ${blockSummary.nextN}.`}
            {declined && `Adjusting to N = ${blockSummary.nextN} to consolidate.`}
            {!improved && !declined && `Holding at N = ${blockSummary.n}. Keep pushing!`}
          </p>
          <NHistoryChart history={nHistory} palette={palette} compact={compact} />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={startBlock} style={primaryBtn(palette, compact)}>
              Next block (N = {blockSummary.nextN})
            </button>
            <button type="button" onClick={endSession} style={primaryBtn(palette, compact)}>
              End session
            </button>
          </div>
          <p style={{ color: palette.muted, fontSize: '0.85rem', marginTop: '1rem' }}>
            {formatTime(remainingMs)} remaining
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: Paused ──────────────────────────────────────────────────────

  if (screen === 'paused') {
    return (
      <div style={shellStyle}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: palette.titleFont, color: palette.accent }}>Paused</h2>
          <p style={{ color: palette.muted }}>Take a breath — working memory training is mentally demanding by design.</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={resume} style={primaryBtn(palette, compact)}>
              Resume
            </button>
            <button type="button" onClick={endSession} style={primaryBtn(palette, compact)}>
              End session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Finished ────────────────────────────────────────────────────

  if (screen === 'finished') {
    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <h2 style={{ fontFamily: palette.titleFont, color: palette.accent, textAlign: 'center', marginTop: 0 }}>
            Session complete
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '0.65rem',
              margin: '1rem 0',
            }}
          >
            {[
              { label: 'Max N', value: maxN },
              { label: 'Position', value: pct(sessionPosAcc) },
              { label: 'Letter', value: pct(sessionLetAcc) },
              { label: 'Blocks', value: totalBlocks },
              { label: 'Best pos streak', value: bestStreak.position },
              { label: 'Best letter streak', value: bestStreak.letter },
              { label: 'Time', value: formatTime(elapsedMs) },
              { label: 'Mode', value: mode.label.split(' ')[0] },
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
                <div style={{ fontFamily: palette.titleFont, fontSize: '1.15rem', color: palette.accent }}>{s.value}</div>
              </div>
            ))}
          </div>

          <NHistoryChart history={nHistory} palette={palette} compact={compact} />

          <div style={{ marginTop: '1.25rem' }}>
            <h3 style={{ fontFamily: palette.titleFont, fontSize: '1rem', color: palette.accent }}>Tips for next time</h3>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.6, color: palette.text }}>
              {tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setScreen('welcome')}
              style={primaryBtn(palette, compact)}
            >
              New session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const playingShellStyle = {
    position: 'fixed',
    top: siteLayout.top,
    left: 0,
    right: 0,
    bottom: siteLayout.bottom,
    width: '100%',
    background: palette.bg,
    color: palette.text,
    fontFamily: palette.font,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: compact ? '0.6rem 0.75rem 0.5rem' : '0.85rem 1rem 0.65rem',
    boxSizing: 'border-box',
    overflow: 'hidden',
    zIndex: 1,
  };

  const actionBarStyle = {
    flexShrink: 0,
    width: '100%',
    maxWidth: 520,
    marginTop: compact ? '0.35rem' : '0.5rem',
    padding: compact ? '0.55rem 0 0' : '0.65rem 0 0',
    background: palette.bg,
    borderTop: palette.border,
    boxSizing: 'border-box',
  };

  // ─── Render: Playing ─────────────────────────────────────────────────────

  return (
    <div style={playingShellStyle}>
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: compact ? '0.45rem' : '0.65rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ fontFamily: palette.titleFont, fontSize: compact ? '0.85rem' : '0.95rem' }}>
          <span style={{ color: palette.accent }}>N = {nLevel}</span>
          <span style={{ color: palette.muted }}> · Block {blockNum}</span>
        </div>
        <div style={{ fontFamily: palette.titleFont, fontSize: compact ? '0.85rem' : '0.95rem', color: palette.muted }}>
          {formatTime(remainingMs)} left
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button type="button" onClick={() => setShowInstructions(true)} style={{ ...iconBtn(palette), fontSize: '0.85rem' }} aria-label="Instructions">
            ?
          </button>
          <button type="button" onClick={pause} style={{ ...iconBtn(palette), fontSize: '0.85rem' }} aria-label="Pause">
            Pause
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div
        style={{
          flexShrink: 0,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          justifyContent: 'space-around',
          background: palette.panel,
          border: palette.border,
          borderRadius: 8,
          padding: '0.45rem 0.25rem',
          marginBottom: compact ? '0.45rem' : '0.6rem',
          fontSize: compact ? '0.75rem' : '0.85rem',
        }}
      >
        <span>Pos {pct(sessionPosAcc)}</span>
        <span>Letter {pct(sessionLetAcc)}</span>
        <span>Streak {curStreak.position}/{curStreak.letter}</span>
        <span>Best {bestStreak.position}/{bestStreak.letter}</span>
        <span>Peak N {maxN}</span>
      </div>

      {/* Stimulus area — flexes to fill space; grid shrinks on short viewports */}
      <div
        style={{
          flex: '1 1 0',
          minHeight: 0,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Letter */}
        <div
          style={{
            flexShrink: 0,
            height: 'clamp(2rem, 9vmin, 4.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.35rem',
          }}
        >
          {showLetter ? (
            <span
              style={{
                fontFamily: palette.titleFont,
                fontSize: 'clamp(1.75rem, 9vmin, 3.5rem)',
                color: palette.accent,
                animation: 'fadeIn 0.15s ease',
                lineHeight: 1,
              }}
            >
              {stimulus.letter}
            </span>
          ) : (
            <span style={{ color: palette.muted, fontSize: '0.9rem' }}>
              {phase === 'response' ? 'Recall…' : phase === 'feedback' ? '' : '·'}
            </span>
          )}
        </div>

        {/* 3×3 grid — largest square that fits; cells are 1fr × 1fr so they stay square */}
        <div
          style={{
            flex: '1 1 0',
            minHeight: 0,
            width: '100%',
            maxWidth: compact ? 260 : 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            containerType: 'size',
          }}
        >
          <div
            style={{
              width: 'min(100cqw, 100cqh)',
              aspectRatio: '1',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: compact ? 6 : 8,
            }}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const active = showGridHighlight && stimulus.position === i;
              return (
                <div
                  key={i}
                  style={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    background: active ? palette.cellActive : palette.cell,
                    border: palette.border,
                    borderRadius: 6,
                    boxShadow: active ? palette.cellGlow : 'none',
                    transition: 'background 0.12s, box-shadow 0.12s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Trial progress + feedback */}
        <div style={{ flexShrink: 0, textAlign: 'center', marginTop: '0.35rem' }}>
          <p style={{ color: palette.muted, fontSize: '0.8rem', margin: 0 }}>
            Trial {trialIndex + 1} / {blockTrials.length}
            {!currentTrial?.scorable && ' (warming up)'}
          </p>
          {feedback && (
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.85rem',
                color:
                  feedback.tone === 'success'
                    ? palette.success
                    : feedback.tone === 'error'
                      ? palette.error
                      : palette.muted,
                minHeight: '1.1rem',
              }}
            >
              {feedback.text}
            </p>
          )}
        </div>
      </div>

      {/* Match buttons — in document flow below the grid, never overlapping it */}
      <div style={actionBarStyle}>
        <p
          style={{
            margin: '0 0 0.55rem',
            textAlign: 'center',
            fontSize: compact ? '0.82rem' : '0.9rem',
            color: canRespond ? palette.accent : palette.muted,
            fontFamily: palette.titleFont,
            fontWeight: canRespond ? 600 : 400,
          }}
        >
          {canRespond ? '▶ What matched?' : phaseHint}
        </p>
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            margin: '0 auto',
            display: 'flex',
            gap: '0.65rem',
          }}
        >
          <button
            type="button"
            onClick={() => canRespond && handleMatch('position')}
            aria-label="Position"
            style={responseBtn(palette, compact, positionPressed, canRespond, isDark)}
          >
            Position
          </button>
          <button
            type="button"
            onClick={() => canRespond && handleMatch('letter')}
            aria-label="Letter"
            style={responseBtn(palette, compact, letterPressed, canRespond, isDark)}
          >
            Letter
          </button>
        </div>
      </div>

      <InstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        palette={palette}
        compact={compact}
      />
    </div>
  );
};

// ─── Instructions modal content ──────────────────────────────────────────────

function InstructionsModal({ open, onClose, palette, compact }) {
  const stepStyle = {
    margin: '0 0 0.65rem',
    paddingLeft: '0.25rem',
    lineHeight: 1.6,
  };

  const calloutStyle = {
    background: palette.panel,
    border: palette.border,
    borderRadius: 8,
    padding: compact ? '0.75rem' : '0.9rem',
    marginBottom: '1rem',
  };

  return (
    <Modal open={open} onClose={onClose} title="How Dual N-Back works" palette={palette} compact={compact}>
      <div style={calloutStyle}>
        <strong style={{ color: palette.accent }}>Do not tap the grid squares.</strong>
        <p style={{ margin: '0.4rem 0 0', lineHeight: 1.6 }}>
          The grid is only for <em>watching</em>. You respond with the two buttons below the grid:
          <strong> Position match</strong> and <strong>Letter match</strong>.
        </p>
      </div>

      <h3 style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '1rem', margin: '0 0 0.5rem' }}>
        What happens each trial
      </h3>
      <ol style={{ margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
        <li style={stepStyle}>
          <strong>Watch</strong> — for a split second, one square lights up on the grid and a letter appears above it.
        </li>
        <li style={stepStyle}>
          <strong>Remember</strong> — the square and letter disappear. Keep them in mind; they join your mental list
          of recent trials.
        </li>
        <li style={stepStyle}>
          <strong>Compare</strong> — ask yourself: does this trial match what I saw <em>N steps back</em>?
          If N = 2, compare to the trial from 2 steps ago (not the one right before).
        </li>
        <li style={stepStyle}>
          <strong>Respond</strong> — the bar at the bottom of the screen lights up with &ldquo;TAP NOW&rdquo;.
          While that is showing, tap or click:
          <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem' }}>
            <li><strong>Position match</strong> — same square location as N trials ago</li>
            <li><strong>Letter match</strong> — same letter as N trials ago</li>
            <li><strong>Both</strong> — if both match</li>
            <li><strong>Neither</strong> — if nothing matches (that is a valid and common answer)</li>
          </ul>
        </li>
      </ol>

      <h3 style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '1rem', margin: '0 0 0.35rem' }}>
        Mini example (N = 2)
      </h3>
      <p style={{ margin: '0 0 1rem', lineHeight: 1.65, fontSize: compact ? '0.92rem' : '0.95rem' }}>
        Trial 1: top-left + <strong>C</strong> &nbsp;·&nbsp;
        Trial 2: centre + <strong>H</strong> &nbsp;·&nbsp;
        Trial 3: top-left + <strong>K</strong>
        <br />
        On trial 3, compare to trial 1 (two steps back): position matches (top-left), letter does not (C vs K).
        Tap <strong>Position match</strong> only.
      </p>

      <p style={{ margin: '0 0 1rem', lineHeight: 1.6, color: palette.muted, fontSize: '0.9rem' }}>
        The match buttons are <strong>always visible</strong> in a fixed bar above the site navigation — you never
        need to scroll to find them. They only accept taps during the &ldquo;TAP NOW&rdquo; window (~2.5 seconds per trial).
        The first N trials each block are warm-up; the bar shows &ldquo;Warming up&rdquo; until comparisons are possible.
      </p>

      <h3 style={{ fontFamily: palette.titleFont, color: palette.accent, fontSize: '1rem', marginBottom: '0.35rem' }}>
        Real-life transfer
      </h3>
      <p>
        Working memory is the mental whiteboard you use to follow a conversation, do mental arithmetic, or
        remember directions while driving. Dual N-Back forces you to continuously update and compare information —
        the same skill you use when tracking multiple tasks at work or holding a phone number in mind while dialling.
      </p>
      <p>
        Research on intensive N-Back training suggests gains in fluid intelligence and attention control. The
        biggest practical payoff is smoother multitasking: less forgetting mid-sentence, sharper focus during
        lectures, and quicker recovery when interrupted.
      </p>
      <p style={{ color: palette.muted, fontSize: '0.9rem', marginBottom: 0 }}>
        Tap the match buttons on mobile, or click them on desktop. Use Pause any time you need a break.
      </p>
    </Modal>
  );
}

export default DualNBack;