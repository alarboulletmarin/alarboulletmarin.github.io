// Live re-creation of Astrolabe (Rust + GPUI). Palette from src/ui/theme.rs, labels from
// src/views/{dashboard,loops,form}.rs. All data is made up. No timers: everything is event-driven.
import { useId, useMemo, useState } from 'react';

const SANS = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
};
const palette = (dark) => {
  const [bg, text, dim, accent, panel, border] = dark
    ? ['#1b1a19', '#e4e0da', '#77716a', '#e0926b', '#161514', '#3a3735']
    : ['#fbfaf8', '#26231f', '#a8a29a', '#b4532a', '#f1eeea', '#e2ddd6'];
  return { bg, text, dim, accent, panel, border, soft: mix(text, dim, 0.45), sel: mix(accent, bg, 0.2) };
};

const T = {
  fr: {
    tabs: ['Aujourd’hui', 'Boucles', 'Forme'], made: 'données inventées',
    date: 'lundi 16 novembre', thisWeek: 'Cette semaine', streak: 'Série', in26: 'En 2026',
    outing: '1 sortie · 6 jours restants', median: 'semaine médiane', weeks: 'semaines',
    streakA: 'au moins une sortie chaque semaine', streakB: 'la plus longue à ce jour', sameDate: '2025 à la même date',
    perWeek: 'Temps par semaine', w26: '26 semaines', run: 'Course', trail: 'Trail', walk: 'Marche', cur: 'semaine en cours',
    loops: 'Boucles', region: 'Auvergne-Rhône-Alpes', sub: 'km · rues ou chemins', start: 'Départ', others: 'Autres', reverse: 'Inverser',
    out: 'aller-retour', climb: 'Profil', alt: 'Altitude', max: 'max', dist: 'Distance', grade: 'Pente', plain: 'Plan',
    form: 'Forme', fatigue: 'Fatigue', fresh: 'Fraîcheur', freshToday: 'Fraîcheur du jour', fmFat: 'forme moins fatigue, en fin de journée',
    fatAvg: 'charge moyennée sur environ une semaine', formAvg: 'charge moyennée sur environ six semaines',
    levels: 'Forme et fatigue', formMinus: 'Forme moins fatigue', over8: 'Sur 8 semaines', pts: ['point', 'points'],
    sub3: 'Ce que la fréquence cardiaque des sorties dit de la charge, de la fatigue et de la fraîcheur : des chiffres, pas des conseils.',
    above: (p) => `La fatigue (sur 7 jours) dépasse la forme (sur 42 jours) de ${p} %.`,
    below: (p) => `La fatigue (sur 7 jours) est inférieure à la forme (sur 42 jours) de ${p} %.`,
    hint: 'Survolez ou touchez la courbe, ou ← →', wk: 'semaine du', h: 'h', loc: 'fr-FR',
  },
  en: {
    tabs: ['Today', 'Loops', 'Form'], made: 'made-up data',
    date: 'Monday, November 16', thisWeek: 'This week', streak: 'Streak', in26: 'In 2026',
    outing: '1 outing · 6 days left', median: 'median week', weeks: 'weeks',
    streakA: 'at least one outing every week', streakB: 'the longest so far', sameDate: '2025 on the same date',
    perWeek: 'Time per week', w26: '26 weeks', run: 'Run', trail: 'Trail', walk: 'Walk', cur: 'current week',
    loops: 'Loops', region: 'Auvergne-Rhône-Alpes', sub: 'km · streets or trails', start: 'Start', others: 'Others', reverse: 'Reverse',
    out: 'out and back', climb: 'Profile', alt: 'Altitude', max: 'max', dist: 'Distance', grade: 'Grade', plain: 'Plain',
    form: 'Form', fatigue: 'Fatigue', fresh: 'Freshness', freshToday: 'Freshness today', fmFat: 'form minus fatigue, end of day',
    fatAvg: 'load averaged over about a week', formAvg: 'load averaged over about six weeks',
    levels: 'Form and fatigue', formMinus: 'Form minus fatigue', over8: 'Over 8 weeks', pts: ['point', 'points'],
    sub3: 'What the heart rate of the outings says of load, fatigue and freshness: figures, not advice.',
    above: (p) => `Fatigue (over 7 days) is ${p}% above form (over 42 days).`,
    below: (p) => `Fatigue (over 7 days) is ${p}% below form (over 42 days).`,
    hint: 'Hover or tap the curve, or ← →', wk: 'week of', h: 'h', loc: 'en-GB',
  },
};

// Seeded noise, so every render and every screenshot draws the same thing.
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const hm = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; };

// ---- Today: 26 weeks of run / trail / walk hours (current week last, partial).
const WEEKS = (() => {
  const r = rng(7);
  const w = Array.from({ length: 25 }, (_, i) => {
    const tot = i === 9 || i === 12 ? 1.2 + r() : 3 + r() * 3.4 + (i > 14 ? 0.6 : 0);
    const run = tot * (0.55 + r() * 0.15), trail = (tot - run) * (0.5 + r() * 0.3);
    return [run, trail, tot - run - trail];
  });
  w.push([1.47, 0, 0]);
  return w;
})();
const MEDIAN = (() => {
  const t = WEEKS.slice(0, -1).map((x) => x[0] + x[1] + x[2]).sort((a, b) => a - b);
  return (t[11] + t[12]) / 2;
})();

// ---- Form: 42 days of warm-up + 56 shown. ctl 42 d, atl 7 d, tsb = ctl - atl.
const FORM = (() => {
  const r = rng(21);
  let c = 38, a = 38;
  const rows = [];
  for (let d = 0; d < 98; d++) {
    const dow = d % 7;
    const rest = dow === 1 || dow === 4;
    const long = dow === 5, big = d > 60 && d < 72;
    const load = rest ? r() * 8 : (long ? 75 : 45) * (0.8 + r() * 0.5) * (big ? 1.45 : d > 84 ? 0.7 : 1);
    a += (load - a) / 7; c += (load - c) / 42;
    if (d >= 42) rows.push({ ctl: c, atl: a, tsb: c - a });
  }
  return rows;
})();

// ---- Loops: 3 proposals per distance, seeded.
const DISTS = [5, 8, 12, 16, 21];
const NP = 64;
const makeLoop = (km, i, variant) => {
  const r = rng(km * 31 + i * 97 + variant * 1013);
  const dist = +(km * (i === 0 ? 1 : i === 1 ? 0.99 : 0.97) + (variant ? r() * 0.3 - 0.15 : 0)).toFixed(1);
  const gain = Math.round(km * (i === 0 ? 43 : i === 1 ? 29 : 17) * (0.85 + r() * 0.3));
  const min = Math.round(dist * (5.65 + (i === 0 ? 0.55 : i === 1 ? 0.2 : 0)));
  // Route: a closed blob, lobe count and wobble differ per loop.
  const a = [r() * 6.28, r() * 6.28, r() * 6.28];
  const sx = 1 + r() * 0.25, lob = 2 + (i + variant) % 3;
  const pts = Array.from({ length: NP }, (_, k) => {
    const t = (k / NP) * Math.PI * 2;
    const rad = 1 + 0.28 * Math.sin(lob * t + a[0]) + 0.14 * Math.sin((lob + 2) * t + a[1]) + 0.06 * Math.sin(9 * t + a[2]);
    return [rad * Math.cos(t) * sx, rad * Math.sin(t)];
  });
  // Elevation along the route: one main climb whose height tracks `gain`.
  const c0 = r(), w = 0.16 + r() * 0.12;
  const prof = Array.from({ length: NP }, (_, k) => {
    const x = k / NP, d = Math.min(Math.abs(x - c0), 1 - Math.abs(x - c0));
    return gain * Math.exp(-(d * d) / (2 * w * w)) + gain * 0.08 * Math.sin(x * 25 + a[1]);
  });
  const lo = Math.min(...prof);
  return { id: 'ABC'[i], dist, min, gain, pts, prof: prof.map((v) => v - lo + 410) };
};

const area = (v, w, h, lo, hi) => {
  const p = v.map((y, i) => `${((i / (v.length - 1)) * w).toFixed(1)},${(h - ((y - lo) / (hi - lo || 1)) * h).toFixed(1)}`);
  return { line: 'M' + p.join('L'), fill: `M0,${h}L` + p.join('L') + `L${w},${h}Z` };
};

const css = `
.astrolabe-root button{font-family:inherit;color:inherit;cursor:pointer}
.astrolabe-btn:hover{background:var(--astro-hover)!important}
.astrolabe-row:hover{background:var(--astro-hover)}
.astrolabe-chart:focus-visible{outline:1px dashed currentColor;outline-offset:2px}
@media (prefers-reduced-motion:no-preference){.astrolabe-route{stroke-dasharray:1;stroke-dashoffset:0;animation:astrolabe-draw .5s ease-out}}
@keyframes astrolabe-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
`;

export default function AstrolabeDemo({ dark, wide, lang }) {
  const p = useMemo(() => palette(dark), [dark]);
  const t = T[lang] || T.en;
  const [tab, setTab] = useState(0);
  const uid = useId();
  const tabId = (i) => `${uid}-t${i}`;
  const touch = wide ? 0 : 44;

  const tabBtn = (i) => (
    <button key={i} role="tab" id={tabId(i)} aria-selected={tab === i} aria-controls={`${uid}-p`} tabIndex={tab === i ? 0 : -1}
      onClick={() => setTab(i)}
      onKeyDown={(e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const n = (tab + d + 3) % 3;
        setTab(n);
        document.getElementById(tabId(n))?.focus();
      }}
      className="astrolabe-btn"
      style={{ '--astro-hover': mix(p.text, p.bg, 0.07), minHeight: touch || 30, padding: '0 14px', border: 0, borderRadius: 7, fontSize: 13, fontWeight: tab === i ? 600 : 400,
        background: tab === i ? p.sel : 'transparent', color: tab === i ? p.accent : p.soft, flex: wide ? '0 0 auto' : 1 }}>
      {t.tabs[i]}
    </button>
  );

  return (
    <div className="astrolabe-root" style={{ '--astro-hover': mix(p.text, p.bg, 0.07), flex: wide ? '0 0 auto' : '1 1 0', minHeight: 0, height: wide ? 460 : undefined,
      display: 'flex', flexDirection: 'column', marginTop: 8, borderRadius: 12, background: p.bg, color: p.text, border: `1px solid ${p.border}`,
      fontFamily: SANS, fontSize: 13, lineHeight: 1.4, overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
      <style>{css}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: p.panel, borderBottom: `1px solid ${p.border}`, flex: '0 0 auto' }}>
        <div role="tablist" aria-label="Astrolabe" style={{ display: 'flex', gap: 4, flex: wide ? '0 0 auto' : 1, minWidth: 0 }}>{[0, 1, 2].map(tabBtn)}</div>
        {wide ? <span style={{ marginLeft: 'auto', fontSize: 11, color: p.dim }}>{t.made}</span> : null}
      </div>
      <div role="tabpanel" id={`${uid}-p`} aria-labelledby={tabId(tab)} style={{ flex: '1 1 0', minHeight: 0, overflow: wide ? 'hidden' : 'auto', padding: wide ? '14px 18px' : '14px 14px 10px', display: 'flex', flexDirection: 'column' }}>
        {tab === 0 ? <Today p={p} t={t} wide={wide} /> : tab === 1 ? <Loops p={p} t={t} wide={wide} touch={touch} /> : <Form p={p} t={t} wide={wide} />}
        {!wide ? <div style={{ marginTop: 'auto', paddingTop: 10, fontSize: 11, color: p.dim }}>{t.made}</div> : null}
      </div>
    </div>
  );
}

const Title = ({ p, children, sub }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
    <span style={{ fontWeight: 600, fontSize: 13 }}>{children}</span>
    {sub ? <span style={{ fontSize: 11, color: p.dim }}>{sub}</span> : null}
  </div>
);

// ---------------------------------------------------------------- Today
function Today({ p, t, wide }) {
  const [hov, setHov] = useState(null);
  const shades = [p.accent, mix(p.accent, p.bg, 0.6), mix(p.accent, p.bg, 0.3)];
  const max = 8;
  const W = 520, H = wide ? 150 : 130, bw = W / 26;
  const at = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    setHov(Math.max(0, Math.min(25, Math.floor(((e.clientX - b.left) / b.width) * 26))));
  };
  const stat = (label, big, unit, l1, l2) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ color: p.soft, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: wide ? 28 : 24, fontWeight: 600, lineHeight: 1.15, margin: '2px 0' }}>{big}{unit ? <span style={{ fontSize: 13, fontWeight: 400, color: p.soft, marginLeft: 6 }}>{unit}</span> : null}</div>
      <div style={{ color: p.dim, fontSize: 11 }}>{l1}</div>
      {l2 ? <div style={{ color: p.dim, fontSize: 11 }}>{l2}</div> : null}
    </div>
  );
  const w = hov == null ? null : WEEKS[hov];
  const wkDate = hov == null ? '' : new Date(2026, 10, 16 - (25 - hov) * 7).toLocaleDateString(t.loc, { day: 'numeric', month: 'short' });
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20, fontWeight: 600 }}>{t.tabs[0]}</span>
        <span style={{ color: p.soft, fontSize: 12 }}>{t.date}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: wide ? '1fr 1fr 1fr' : '1fr 1fr', gap: wide ? 16 : '10px 14px', marginTop: 12 }}>
        {stat(t.thisWeek, '1h28', '', t.outing, `${t.median}: ${hm(MEDIAN)}`)}
        {stat(t.streak, '66', t.weeks, t.streakA, wide ? t.streakB : '')}
        {wide ? stat(t.in26, '273', t.h, `${t.sameDate}: 271h`, '') : null}
      </div>
      <div style={{ marginTop: wide ? 16 : 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Title p={p} sub={t.w26}>{t.perWeek}</Title>
          <span style={{ fontFamily: MONO, fontSize: 11, color: p.soft, minHeight: 16 }}>{w ? `${t.wk} ${wkDate} · ${hm(w[0] + w[1] + w[2])}` : ''}</span>
        </div>
        <div style={{ display: 'flex', marginTop: 6, gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10, color: p.dim, height: H, textAlign: 'right' }}>
            {[8, 6, 4, 2, 0].map((v) => <span key={v}>{v}h</span>)}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${t.perWeek}, ${t.w26}`}
            onPointerMove={at} onPointerDown={at} onPointerLeave={() => setHov(null)}
            style={{ flex: 1, minWidth: 0, height: H, display: 'block', touchAction: 'pan-y' }}>
            {[0, 2, 4, 6, 8].map((v) => <line key={v} x1="0" x2={W} y1={H - (v / max) * H} y2={H - (v / max) * H} stroke={p.border} strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            {WEEKS.map((wk, i) => {
              let y = H;
              const cur = i === 25;
              return (
                <g key={i} opacity={hov == null || hov === i ? 1 : 0.55}>
                  {wk.map((v, k) => {
                    const h = (v / max) * H;
                    y -= h;
                    return h > 0 ? <rect key={k} x={i * bw + 1.5} y={y} width={bw - 3} height={h} fill={cur ? mix(p.accent, p.bg, 0.15) : shades[k]} stroke={cur ? p.accent : 'none'} strokeDasharray={cur ? '2 2' : undefined} vectorEffect="non-scaling-stroke" /> : null;
                  })}
                </g>
              );
            })}
            <line x1="0" x2={W} y1={H - (MEDIAN / max) * H} y2={H - (MEDIAN / max) * H} stroke={p.text} strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 8, marginLeft: 26, fontSize: 11, color: p.soft }}>
          {[[t.run, shades[0]], [t.trail, shades[1]], [t.walk, shades[2]]].map(([l, c]) => (
            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}</span>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, border: `1px dashed ${p.accent}` }} />{t.cur}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 14, borderTop: `1px dashed ${p.text}` }} />{t.median}: {hm(MEDIAN)}</span>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Loops
const GRADE = (p) => [mix(p.accent, p.bg, 0.25), mix(p.accent, p.bg, 0.45), mix(p.accent, p.bg, 0.7), p.accent, mix(p.accent, '#000000', 0.7)];

function Loops({ p, t, wide, touch }) {
  const [km, setKm] = useState(12);
  const [sel, setSel] = useState(0);
  const [variant, setVariant] = useState(0);
  const [rev, setRev] = useState(false);
  const gid = useId().replace(/:/g, '');
  const loops = useMemo(() => [0, 1, 2].map((i) => makeLoop(km, i, variant)), [km, variant]);
  const L = loops[sel];
  const grades = GRADE(p);
  const btn = (extra) => ({ minHeight: touch || 30, padding: '0 12px', border: `1px solid ${p.border}`, borderRadius: 7, background: p.bg, fontSize: 12, ...extra });

  // Map: normalise the three routes into one viewBox so loops share a scale.
  const MW = 400, MH = 260;
  const route = useMemo(() => {
    const xs = L.pts.map((q) => q[0]), ys = L.pts.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((MW - 50) / (x1 - x0), (MH - 36) / (y1 - y0));
    const ox = (MW - (x1 - x0) * s) / 2 - x0 * s, oy = (MH - (y1 - y0) * s) / 2 - y0 * s;
    let pts = L.pts.map(([x, y]) => [x * s + ox, y * s + oy]);
    if (rev) pts = [pts[0], ...pts.slice(1).reverse()];
    return pts;
  }, [L, rev]);
  const prof = useMemo(() => (rev ? [L.prof[0], ...L.prof.slice(1).reverse()] : L.prof), [L, rev]);
  const segs = useMemo(() => route.map((a, k) => {
    const b = route[(k + 1) % NP];
    const g = Math.abs(prof[(k + 1) % NP] - prof[k]) / (L.dist * 1000 / NP) * 100 * 3.2;
    return { a, b, c: grades[g < 3 ? 0 : g < 6 ? 1 : g < 10 ? 2 : g < 15 ? 3 : 4] };
  }), [route, prof, L, p]);
  const PW = 400, PH = 56;
  const lo = Math.min(...prof), hi = Math.max(...prof);
  const pa = useMemo(() => area(prof, PW, PH, lo - 20, hi + 10), [prof]);
  const peak = Math.round(hi);

  const list = (
    <div role="listbox" aria-label={t.loops} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {loops.map((l, i) => {
        const pr = i === sel ? prof : l.prof;
        const a = area(pr, 200, 26, Math.min(...pr) - 10, Math.max(...pr) + 6);
        const on = i === sel;
        return (
          <button key={l.id} role="option" aria-selected={on} className="astrolabe-row" onClick={() => setSel(i)}
            style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderRadius: 8, padding: '7px 9px', minHeight: touch || undefined, background: on ? p.sel : 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12 }}>
              <span style={{ color: p.soft }}>{l.id}</span>
              <b style={{ fontFamily: MONO, fontWeight: 600, color: on ? p.accent : p.text }}>{l.dist.toFixed(1)} km</b>
              <span style={{ fontFamily: MONO, color: p.soft }}>≈ {hm(l.min / 60)}</span>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11 }}>+{l.gain} m −{l.gain} m</span>
            </span>
            <svg viewBox="0 0 200 26" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', width: '100%', height: 24, marginTop: 3 }}>
              <path d={a.line} fill="none" stroke={on ? p.accent : p.soft} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
            </svg>
            <span style={{ display: 'block', fontSize: 10, color: p.dim }}>0 % {t.out}</span>
          </button>
        );
      })}
    </div>
  );

  const panel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, width: wide ? 250 : undefined, flex: wide ? '0 0 250px' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{t.loops}</span>
        <span style={{ fontSize: 11, color: p.soft }}>{t.region}</span>
      </div>
      <div role="group" aria-label={t.dist} style={{ display: 'flex', gap: 4 }}>
        {DISTS.map((d) => (
          <button key={d} aria-pressed={km === d} className="astrolabe-btn" onClick={() => { setKm(d); setSel(0); setVariant(0); }}
            style={{ ...btn({ flex: 1, padding: 0, fontFamily: MONO, background: km === d ? p.sel : p.bg, borderColor: km === d ? p.accent : p.border, color: km === d ? p.accent : p.text, fontWeight: km === d ? 600 : 400 }) }}>{d}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: p.dim, marginTop: -3 }}>{km} {t.sub}</div>
      {list}
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="astrolabe-btn" style={btn({})} onClick={() => { setVariant((v) => v + 1); setSel(0); }}>↻ {t.others}</button>
        <button className="astrolabe-btn" aria-pressed={rev} style={btn({ borderColor: rev ? p.accent : p.border })} onClick={() => setRev((r) => !r)}>⇄ {t.reverse}</button>
      </div>
    </div>
  );

  const map = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0, minHeight: wide ? 0 : undefined }}>
      <svg viewBox={`0 0 ${MW} ${MH}`} role="img" aria-label={`${t.loops} ${L.id}: ${L.dist.toFixed(1)} km`}
        style={{ display: 'block', width: '100%', flex: wide ? '1 1 0' : undefined, height: wide ? undefined : 'auto', aspectRatio: wide ? undefined : `${MW} / ${MH}`, minHeight: 0, borderRadius: 8, background: p.panel, border: `1px solid ${p.border}` }}>
        <defs><pattern id={`${gid}-g`} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke={p.border} strokeWidth="0.6" /></pattern></defs>
        <rect width={MW} height={MH} fill={`url(#${gid}-g)`} />
        <path d={`M-10 ${MH * 0.82}C80 ${MH * 0.7} 150 ${MH * 0.95} 260 ${MH * 0.8}S380 ${MH * 0.68} ${MW + 10} ${MH * 0.74}`} fill="none" stroke={mix(p.accent, p.panel, 0.1)} strokeWidth="9" opacity="0.8" />
        <path d={`M${MW * 0.12} -10C${MW * 0.2} 80 ${MW * 0.1} 140 ${MW * 0.22} ${MH + 10}`} fill="none" stroke={p.border} strokeWidth="3" />
        <g strokeLinecap="round" strokeWidth="4.5" key={`${km}-${sel}-${variant}-${rev}`}>
          {segs.map((s, k) => <line key={k} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={s.c} />)}
        </g>
        <circle cx={route[0][0]} cy={route[0][1]} r="5.5" fill={p.text} stroke={p.bg} strokeWidth="2" />
        <text x={route[0][0] + 9} y={route[0][1] - 8} fontSize="10" fontFamily={MONO} fill={p.soft}>{t.start}</text>
      </svg>
      <div style={{ border: `1px solid ${p.border}`, borderRadius: 8, padding: '6px 10px', background: p.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, color: p.soft }}>
          <span>{t.climb}</span><span style={{ fontFamily: MONO }}>{t.alt} {peak} m {t.max}</span>
        </div>
        <svg viewBox={`0 0 ${PW} ${PH}`} preserveAspectRatio="none" role="img" aria-label={`${t.climb} ${L.id}`} style={{ display: 'block', width: '100%', height: wide ? 46 : 56 }}>
          <path d={pa.fill} fill={mix(p.accent, p.bg, 0.14)} />
          <path d={pa.line} fill="none" stroke={p.accent} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 10, color: p.dim }}>
          {['< 3 %', '3–6', '6–10', '10–15', '> 15 %'].map((l, i) => <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 10, height: 4, borderRadius: 2, background: grades[i] }} />{l}</span>)}
        </div>
      </div>
    </div>
  );

  return wide ? <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>{panel}{map}</div>
    : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{panel}{map}</div>;
}

// ---------------------------------------------------------------- Form
function Form({ p, t, wide }) {
  const n = FORM.length;
  const [hov, setHov] = useState(null);
  const last = FORM[n - 1];
  const cur = FORM[hov ?? n - 1];
  const sign = (v) => { const r = Math.round(v); return r === 0 ? '0' : r < 0 ? '−' + -r : '+' + r; };
  const pt = (v) => `${Math.round(v)} ${Math.round(v) === 1 ? t.pts[0] : t.pts[1]}`;
  const dayLabel = (i) => new Date(2026, 10, 16 - (n - 1 - i)).toLocaleDateString(t.loc, { weekday: 'short', day: 'numeric', month: 'short' });
  const ratio = last.atl / last.ctl;
  const pc = Math.round(Math.abs(ratio - 1) * 100);
  const stmt = pc < 3 ? null : ratio > 1 ? t.above(pc) : t.below(pc);

  const W = 560, H1 = wide ? 100 : 84, H2 = wide ? 56 : 56;
  const maxL = Math.max(...FORM.map((r) => Math.max(r.ctl, r.atl))) * 1.08, minL = Math.min(...FORM.map((r) => Math.min(r.ctl, r.atl))) * 0.8;
  const tmax = Math.max(...FORM.map((r) => Math.abs(r.tsb))) * 1.15;
  const ctl = useMemo(() => area(FORM.map((r) => r.ctl), W, H1, minL, maxL), [maxL, H1]);
  const atl = useMemo(() => area(FORM.map((r) => r.atl), W, H1, minL, maxL), [maxL, H1]);
  const tsb = useMemo(() => area(FORM.map((r) => r.tsb), W, H2, -tmax, tmax), [tmax, H2]);
  const move = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    setHov(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - b.left) / b.width) * (n - 1)))));
  };
  const key = (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); setHov((h) => Math.max(0, Math.min(n - 1, (h ?? n - 1) + d))); }
    else if (e.key === 'Escape') setHov(null);
  };
  const cx = hov == null ? null : (hov / (n - 1)) * W;
  const legend = (c, label, v, dash) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <i style={{ width: 12, height: 0, borderTop: `2px ${dash ? 'solid' : 'solid'} ${c}` }} />{label}
      <b style={{ fontFamily: MONO, fontWeight: 600 }}>{v}</b>
    </span>
  );
  const stat = (label, v, d) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ color: p.soft, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: wide ? 24 : 20, fontWeight: 600, lineHeight: 1.2 }}>{v}</div>
      {wide ? <div style={{ color: p.dim, fontSize: 11 }}>{d}</div> : null}
    </div>
  );
  const chartProps = (label) => ({ role: 'group', tabIndex: 0, 'aria-label': label + ' — ' + t.hint, className: 'astrolabe-chart', onPointerMove: move, onPointerDown: move, onPointerLeave: () => setHov(null), onKeyDown: key, onBlur: () => setHov(null),
    style: { position: 'relative', touchAction: 'pan-y', borderRadius: 4 } });
  const cursor = (h) => (cx == null ? null : <line x1={cx} x2={cx} y1="0" y2={h} stroke={p.dim} strokeWidth="1" vectorEffect="non-scaling-stroke" />);

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{t.form}</div>
      <div style={{ color: p.soft, fontSize: 12, maxWidth: 560, marginTop: 2 }}>{t.sub3}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: wide ? 16 : 8, marginTop: 10 }}>
        {stat(t.freshToday, sign(last.tsb), t.fmFat)}
        {stat(`${t.fatigue}, 7 ${lang0(t) ? 'jours' : 'days'}`, pt(last.atl), t.fatAvg)}
        {stat(`${t.form}, 42 ${lang0(t) ? 'jours' : 'days'}`, pt(last.ctl), t.formAvg)}
      </div>
      {stmt ? <div style={{ color: p.soft, fontSize: 12, marginTop: 8 }}>{stmt}</div> : null}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Title p={p} sub={t.over8}>{t.levels}</Title>
          <span style={{ fontFamily: MONO, fontSize: 11, color: p.soft, minHeight: 16 }}>{hov == null ? '' : dayLabel(hov)}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 18px' }}>
          {legend(p.accent, t.form, hov == null ? '' : pt(cur.ctl))}
          {legend(p.soft, t.fatigue, hov == null ? '' : pt(cur.atl))}
          {legend(p.text, t.formMinus, hov == null ? '' : sign(cur.tsb))}
        </div>
        <div {...chartProps(t.levels)}>
          <svg viewBox={`0 0 ${W} ${H1}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: H1 }}>
            <path d={ctl.fill} fill={mix(p.accent, p.bg, 0.12)} />
            <path d={ctl.line} fill="none" stroke={p.accent} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            <path d={atl.line} fill="none" stroke={p.soft} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            {cursor(H1)}
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Title p={p}>{t.fresh}</Title></div>
        <div {...chartProps(t.fresh)}>
          <svg viewBox={`0 0 ${W} ${H2}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: H2 }}>
            <line x1="0" x2={W} y1={H2 / 2} y2={H2 / 2} stroke={p.dim} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <path d={tsb.line} fill="none" stroke={p.text} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            {cursor(H2)}
          </svg>
        </div>
      </div>
    </>
  );
}
const lang0 = (t) => t.loc === 'fr-FR';
