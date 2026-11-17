import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dessiner, FAMILLES, GROUPES_PALETTES, PALETTES } from '../../vendor/aplat/moteur.ts';

// Live generator of Aplat (React + TS). Followed: src/lib/moteur.ts (dessiner, FAMILLES, PALETTES, GROUPES_PALETTES),
// src/components/Apercu.tsx (preview = displayed size x devicePixelRatio, mesureW/H = the screen), src/lib/resolution.ts
// (export = screen.width/height x dpr), src/lib/tirage.ts (surprise: another family + palette, seed 1..99999),
// src/lib/url.ts (?m=&p=&d=&s=), DESIGN_SYSTEM.md (arch radii, flat shadows, lime primary action).

const TXT = {
  fr: {
    gen: 'Générer', family: 'Famille', palette: 'Palette', seed: 'Graine', dl: 'Télécharger', open: 'Ouvrir dans Aplat',
    preview: 'Aperçu du fond d’écran',
    groups: { abs: 'Abstraits', pav: 'Pavages', vol: 'Volumes', mat: 'Matières', pay: 'Paysages', fig: 'Figures' },
  },
  en: {
    gen: 'Generate', family: 'Family', palette: 'Palette', seed: 'Seed', dl: 'Download', open: 'Open in Aplat',
    preview: 'Wallpaper preview',
    groups: { abs: 'Abstract', pav: 'Tilings', vol: 'Volumes', mat: 'Materials', pay: 'Landscapes', fig: 'Figures' },
  },
};
const GROUP_ORDER = ['abs', 'pav', 'vol', 'mat', 'pay', 'fig'];
const SEED_MAX = 99999;
// Measured (Chrome, preview 370x802 and export 1170x2532): the slowest family takes ~55 ms, so none is excluded.
const pick = (list, not) => {
  const rest = list.filter((x) => x !== not);
  return rest[Math.floor(Math.random() * rest.length)];
};

const PAL = {
  light: { surface: '#FFFFFF', ink: '#17243F', soft: 'rgba(23, 36, 63, 0.66)', line: 'rgba(23, 36, 63, 0.46)', accent: '#DFF478', accentInk: '#17243F', shadow: 'rgba(23, 36, 63, 0.18)' },
  dark: { surface: '#17243F', ink: '#F7F3E6', soft: 'rgba(247, 243, 230, 0.72)', line: 'rgba(247, 243, 230, 0.46)', accent: '#DFF478', accentInk: '#17243F', shadow: 'rgba(247, 243, 230, 0.14)' },
};

// The device's physical screen, as resolution.ts: portrait on touch, floor 320.
function screenSize() {
  const dpr = window.devicePixelRatio || 1;
  let w = Math.max(320, Math.round((window.screen?.width || 390) * dpr));
  let h = Math.max(320, Math.round((window.screen?.height || 844) * dpr));
  if (w > h && window.matchMedia?.('(pointer: coarse)').matches) [w, h] = [h, w];
  return { w, h };
}

export default function AplatDemo({ shots, frame, hint, dark, wide, lang }) {
  const t = TXT[lang] || TXT.fr;
  const c = dark ? PAL.dark : PAL.light;
  const [fam, setFam] = useState('cernes');
  const [pal, setPal] = useState('corail');
  const [seed, setSeed] = useState(7314);
  const canvas = useRef(null);
  const cw = wide ? 178 : 112;
  const ch = Math.round(cw * 2.1667); // the 9:19.5 frame of the marquee tiles

  const byGroup = useMemo(() => GROUP_ORDER.map((g) => [g, FAMILLES.filter((f) => f.groupe === g)]).filter(([, l]) => l.length), []);
  const famIds = useMemo(() => FAMILLES.map((f) => f.id), []);
  const palIds = useMemo(() => GROUPES_PALETTES.flatMap((g) => g.ids), []);
  const P = PALETTES[pal];

  // Draw at displayed size x dpr (capped at 3 like the app), one frame after the click so the button answers first.
  useEffect(() => {
    const node = canvas.current;
    if (!node) return undefined;
    const id = requestAnimationFrame(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.round(cw * dpr), h = Math.round(ch * dpr);
      if (node.width !== w || node.height !== h) { node.width = w; node.height = h; }
      const ctx = node.getContext('2d', { alpha: false });
      const s = screenSize();
      try {
        dessiner(ctx, w, h, { famille: fam, palette: pal, densite: 1, graine: seed }, { mesureW: s.w, mesureH: s.h });
      } catch (e) { /* a family that fails leaves the previous frame */ }
    });
    return () => cancelAnimationFrame(id);
  }, [fam, pal, seed, cw, ch]);

  const generate = useCallback(() => {
    setFam((f) => pick(famIds, f));
    setPal((p) => pick(palIds, p));
    setSeed(Math.floor(Math.random() * SEED_MAX) + 1);
  }, [famIds, palIds]);

  // Export at the device's real screen resolution, on an offscreen canvas.
  const download = useCallback(() => {
    const { w, h } = screenSize();
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    dessiner(off.getContext('2d', { alpha: false }), w, h, { famille: fam, palette: pal, densite: 1, graine: seed });
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `aplat-${fam}-${pal}-${seed}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      off.width = off.height = 0;
    }, 'image/png');
  }, [fam, pal, seed]);

  const href = `https://aplat.vercel.app/app?m=${fam}&p=${pal}&d=1&s=${seed}`;
  const famName = FAMILLES.find((f) => f.id === fam)?.[lang] || fam;
  const arch = (r) => `${r}px ${r}px ${Math.round(r * 0.3)}px ${Math.round(r * 0.3)}px`;
  const btn = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 14, minHeight: 44, padding: '0 14px', border: `2px solid ${c.ink}`, borderRadius: arch(24), cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', color: c.ink, background: c.surface, boxShadow: `3px 3px 0 ${c.shadow}` };
  const lab = { fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: c.soft, display: 'block', marginBottom: 4 };
  const sel = { width: '100%', minHeight: 44, boxSizing: 'border-box', fontFamily: "'Archivo', sans-serif", fontSize: 14, color: c.ink, background: c.surface, border: `1.5px solid ${c.line}`, borderRadius: arch(19), padding: '0 10px' };

  const tileW = wide ? 104 : 112;
  const tileH = Math.round(tileW * 2.1667);

  const generator = (
    <div style={{ display: 'flex', gap: wide ? 20 : 14, alignItems: 'flex-start', flex: '0 0 auto', minWidth: 0 }}>
      <div style={{ flex: '0 0 auto' }}>
        <canvas ref={canvas} role="img" aria-label={`${t.preview} : ${famName}, ${P[lang]}, ${t.seed} ${seed}`}
          style={{ display: 'block', width: cw, height: ch, borderRadius: Math.round(cw * 0.13), border: `5px solid ${frame.frame}`, boxShadow: `8px 8px 0 ${frame.shadow}`, background: P.fond, boxSizing: 'content-box' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: wide ? 10 : 9, width: wide ? 214 : undefined, flex: wide ? '0 0 auto' : '1 1 0', minWidth: 0 }}>
        <button type="button" onClick={generate} style={{ ...btn, background: c.accent, color: c.accentInk, borderColor: c.accentInk, fontSize: 16, minHeight: 48 }}>{t.gen}</button>
        <label style={{ minWidth: 0 }}>
          <span style={lab}>{t.family}</span>
          <select value={fam} onChange={(e) => setFam(e.target.value)} style={sel}>
            {byGroup.map(([g, list]) => (
              <optgroup key={g} label={t.groups[g]}>{list.map((f) => <option key={f.id} value={f.id}>{f[lang]}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <label style={{ minWidth: 0 }}>
          <span style={lab}>{t.palette}</span>
          <select value={pal} onChange={(e) => setPal(e.target.value)} style={sel}>
            {GROUPES_PALETTES.map((g) => (
              <optgroup key={g.id} label={g[lang]}>{g.ids.map((id) => <option key={id} value={id}>{PALETTES[id][lang]}</option>)}</optgroup>
            ))}
          </select>
          <span aria-hidden="true" style={{ display: 'flex', height: 12, marginTop: 6, borderRadius: 7, overflow: 'hidden', border: `1.5px solid ${c.line}` }}>
            {[P.fond, ...P.couleurs].map((col, i) => <span key={i} style={{ flex: 1, background: col }} />)}
          </span>
        </label>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: 13, color: c.soft, fontVariantNumeric: 'tabular-nums' }}>{t.seed} <b style={{ color: c.ink }}>{seed}</b></div>
        <button type="button" onClick={download} style={btn}>{t.dl} PNG</button>
        <a href={href} target="_blank" rel="noopener" style={{ ...btn, background: 'transparent', boxShadow: 'none' }}>{t.open} ↗</a>
      </div>
    </div>
  );

  const marquee = (
    <div style={{ minWidth: 0, flex: wide ? '1 1 0' : '0 0 auto', alignSelf: wide ? 'center' : 'stretch' }}>
      <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)' }}>
        <div className="aplat-piste" style={{ display: 'flex', width: 'max-content', padding: '10px 0 12px' }}>
          {shots.map((s, i) => (
            <a key={i} className="aplat-tuile" href={s.href} target="_blank" rel="noopener" tabIndex={s.tab} aria-label={s.aria} style={{ margin: '0 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none' }}>
              <img src={s.src} alt="" loading="lazy" style={{ display: 'block', width: tileW, height: tileH, objectFit: 'cover', borderRadius: 18, border: `4px solid ${frame.frame}`, boxShadow: `6px 6px 0 ${frame.shadow}` }} />
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: 12 }}>{s.label}</span>
            </a>
          ))}
        </div>
      </div>
      <p style={{ margin: '4px 0 0', fontFamily: "'Archivo', sans-serif", fontSize: 12, opacity: 0.65 }}>{hint}</p>
    </div>
  );

  if (wide) {
    return <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginTop: 4, minWidth: 0 }}>{generator}{marquee}</div>;
  }
  return (
    <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 6 }}>
      {generator}{marquee}
    </div>
  );
}
