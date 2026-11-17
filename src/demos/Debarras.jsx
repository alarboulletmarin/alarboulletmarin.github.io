import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// Live re-creation of Débarras (Rust + GPUI). Followed: src/logic/layout.rs (squarified treemap, « others »
// plot, folders opened in place), src/ui/theme.rs (house palettes, tints per family), src/ui/widgets.rs
// (hatching = safe, dots = to review), src/logic/sample.rs (the made-up home folder), src/logic/rules.rs (why).

// ---------- copy ----------
const TXT = {
  en: {
    used: 'used', items: (n) => (n === 1 ? '1 item' : `${n} items`), made: 'made-up data',
    ticked: 'ticked to free', share: (p) => `${p}% of the total`, review: 'Review', reset: 'Reset',
    hint: 'Hover a plot. Hatching: can go without loss. Dots: to review. Click a name to open a folder.',
    others: (n) => `${n} others`, safe: 'safe to remove', check: 'check first', keep: 'to keep',
    open: (n) => `Open ${n}`, tick: (n) => `Tick ${n}`, up: 'Up', plan: 'Disk plan, demo',
    title: 'Before moving to the trash', empty: 'Nothing ticked.', cancel: 'Cancel',
    go: 'Move to the trash', demoNote: 'Demo: nothing is really deleted, the plots just disappear.',
    done: (s) => `Demo: ${s} freed. Nothing was deleted for real.`, inside: 'inside a ticked folder',
  },
  fr: {
    used: 'utilisé', items: (n) => (n <= 1 ? `${n} élément` : `${n} éléments`), made: 'données inventées',
    ticked: 'coché à libérer', share: (p) => `${p} % du total`, review: 'Vérifier', reset: 'Réinitialiser',
    hint: 'Survolez un plot. Hachures : peut partir sans perte. Points : à vérifier. Cliquez un nom pour ouvrir un dossier.',
    others: (n) => `${n} autres`, safe: 'sans risque', check: 'à vérifier', keep: 'à garder',
    open: (n) => `Ouvrir ${n}`, tick: (n) => `Cocher ${n}`, up: 'Remonter', plan: 'Plan du disque, démo',
    title: 'Avant la corbeille', empty: 'Rien de coché.', cancel: 'Annuler',
    go: 'Mettre à la corbeille', demoNote: 'Démo : rien n’est vraiment supprimé, les plots disparaissent seulement.',
    done: (s) => `Démo : ${s} libérés. Rien n’a été supprimé pour de vrai.`, inside: 'dans un dossier coché',
  },
};
const WHY = {
  nm: ['npm dependencies: npm install puts them back.', 'Dépendances npm : se réinstallent avec npm install.'],
  rt: ['Rust build output: cargo build makes it again.', 'Compilation Rust : cargo build la refait.'],
  cr: ['Downloaded crate sources: cargo fetches them again.', 'Sources des crates : cargo les retélécharge.'],
  uc: ['User cache: applications rebuild it.', 'Cache utilisateur : les applications le reconstruisent.'],
  tr: ['Trash: already deleted, it only waits to be emptied.', 'Corbeille : déjà supprimé, n’attend que d’être vidé.'],
  md: ['Local AI models: downloadable again, but slow.', 'Modèles d’IA locaux : retéléchargeables, mais longs.'],
  ct: ['Container images and volumes: prune frees the unused.', 'Images et volumes de conteneurs : prune libère les inutiles.'],
  di: ['Disk image over 500 MB: often useless once installed.', 'Image disque de plus de 500 Mo : souvent inutile une fois installée.'],
};

// ---------- the made-up home folder (sizes in MB, as sample.rs) ----------
const f = (name, size, cat, reclaim, why) => ({ name, size, cat, reclaim, why });
const d = (name, cat, kids, reclaim, why) => ({ name, cat, kids, reclaim, why, size: kids.reduce((s, k) => s + k.size, 0) });
const proj = (name, build, src, git) => d(name, 'dev', [...(build ? [f(build[0], build[1], 'dev', 'safe', build[0] === 'target' ? 'rt' : 'nm')] : []), f('src', src, 'dev'), f('.git', git, 'dev')]);
const HOME = d('~', 'other', [
  d(['projects', 'projets'], 'dev', [
    proj('atlas', ['target', 6400], 120, 210), proj('typeset', ['target', 5100], 140, 160), proj('comet', ['target', 3900], 90, 180),
    proj('harbor', ['node_modules', 1150], 160, 130), proj('ledger', ['node_modules', 820], 90, 100), proj('rampart', null, 380, 220),
  ]),
  d('.cache', 'cache', [f('browser', 2300, 'cache'), f('ms-playwright', 1400, 'cache'), f('pip', 1800, 'cache'), f('editor', 900, 'cache'), f('thumbnails', 640, 'cache')], 'safe', 'uc'),
  d('.cargo', 'dev', [f('registry', 4700, 'dev', 'safe', 'cr'), f('bin', 380, 'dev')]),
  d('.local/share', 'apps', [
    d('ollama', 'models', [f('coder-30b.gguf', 18600, 'models'), f('scout-q4.gguf', 11200, 'models'), f('embed-text.gguf', 274, 'models')], 'review', 'md'),
    d('flatpak', 'apps', [f('runtimes', 4200, 'system'), f('org.gimp.GIMP', 1100, 'apps'), f('org.inkscape.Inkscape', 640, 'apps')]),
    f('Trash', 2900, 'other', 'safe', 'tr'),
    f('containers', 9400, 'dev', 'review', 'ct'),
  ]),
  d(['Pictures', 'Images'], 'media', [f('2026', 910, 'media'), f('2025', 780, 'media'), f('2024', 520, 'media'), f(['Races', 'Courses'], 340, 'media')]),
  d(['Videos', 'Vidéos'], 'media', [f('summer-coast.mov', 12300, 'media'), f('half-marathon-2026.mp4', 7800, 'media'), f('timelapse-pass.mp4', 2100, 'media'), f('screencasts', 1600, 'media')]),
  d(['Downloads', 'Téléchargements'], 'docs', [f('ubuntu-26.04-desktop-amd64.iso', 6100, 'archives', 'review', 'di'), f('fedora-workstation-44.iso', 2400, 'archives', 'review', 'di'), f('watch-export.zip', 1300, 'archives'), f('pdf', 640, 'docs')]),
  d('Documents', 'docs', [f('admin', 210, 'docs'), f('notes', 120, 'docs'), f('cv', 40, 'docs')]),
  f('.mozilla', 1900, 'apps'),
]);
const nameOf = (n, l) => (Array.isArray(n.name) ? n.name[l === 'fr' ? 1 : 0] : n.name);
// ids: path of english names; sorted by size as the real tree is.
const seal = (n, parent) => {
  const en = Array.isArray(n.name) ? n.name[0] : n.name;
  const id = parent == null ? '' : parent ? `${parent}|${en}` : en;
  const kids = n.kids ? n.kids.map((k) => seal(k, id)).sort((a, b) => b.size - a.size) : null;
  return { ...n, id, kids };
};
const TREE = seal(HOME, null);
// the tree without what was moved to the trash, sizes recomputed
const prune = (n, gone) => {
  if (!n.kids) return n;
  const kids = n.kids.filter((k) => !gone.has(k.id)).map((k) => prune(k, gone));
  return { ...n, kids, size: kids.reduce((s, k) => s + k.size, 0) };
};
const find = (n, path) => path.reduce((c, id) => (c && c.kids ? c.kids.find((k) => k.id === id) : null), n);

// ---------- units: as lang::size, GB with a decimal ----------
const fmtParts = (mb, l) => {
  const gb = mb >= 1000;
  const v = gb ? mb / 1000 : mb;
  const s = gb ? (v >= 100 ? v.toFixed(0) : v.toFixed(1)) : v.toFixed(0);
  return [l === 'fr' ? s.replace('.', ',') : s, gb ? (l === 'fr' ? 'Go' : 'GB') : l === 'fr' ? 'Mo' : 'MB'];
};
const fmt = (mb, l) => fmtParts(mb, l).join(' ');

// ---------- squarified treemap (layout.rs) ----------
const worst = (row, side) => {
  const sum = row.reduce((s, a) => s + a, 0);
  return Math.max((side * side * Math.max(...row)) / (sum * sum), (sum * sum) / (side * side * Math.min(...row)));
};
function squarify(values, b) {
  const out = values.map(() => ({ x: b.x, y: b.y, w: 0, h: 0 }));
  const total = values.reduce((s, v) => s + (v > 0 ? v : 0), 0);
  if (total <= 0 || b.w * b.h <= 0) return out;
  const order = values.map((_, i) => i).filter((i) => values[i] > 0).sort((a, c) => values[c] - values[a]);
  const scale = (b.w * b.h) / total;
  const areas = order.map((i) => values[i] * scale);
  let free = b, start = 0, end = 0;
  const place = (s, e) => {
    const row = areas.slice(s, e), sum = row.reduce((x, y) => x + y, 0), last = row.length - 1;
    if (free.w >= free.h) {
      const w = Math.min(sum / free.h, free.w);
      let y = free.y;
      row.forEach((a, k) => { const h = k === last ? free.y + free.h - y : a / w; out[order[s + k]] = { x: free.x, y, w, h: Math.max(h, 0) }; y += h; });
      free = { x: free.x + w, y: free.y, w: Math.max(free.w - w, 0), h: free.h };
    } else {
      const h = Math.min(sum / free.w, free.h);
      let x = free.x;
      row.forEach((a, k) => { const w = k === last ? free.x + free.w - x : a / h; out[order[s + k]] = { x, y: free.y, w: Math.max(w, 0), h }; x += w; });
      free = { x: free.x, y: free.y + h, w: free.w, h: Math.max(free.h - h, 0) };
    }
  };
  while (end < areas.length) {
    const side = Math.min(free.w, free.h);
    if (end === start || worst(areas.slice(start, end + 1), side) <= worst(areas.slice(start, end), side)) end += 1;
    else { place(start, end); start = end; }
  }
  if (start < end) place(start, end);
  return out;
}
function layout(root, bounds, o) {
  const tiles = [];
  const lay = (node, area, depth, inh) => {
    if (!node.kids || !node.kids.length || area.w * area.h <= 0 || !node.size) return;
    const perMB = (area.w * area.h) / node.size;
    let kept = node.kids.filter((c) => c.size * perMB >= o.minArea).length;
    if (node.kids.length - kept === 1) kept += 1;
    const rest = node.kids.slice(kept), restSize = rest.reduce((s, c) => s + c.size, 0);
    const values = node.kids.slice(0, kept).map((c) => c.size);
    if (rest.length) values.push(restSize);
    const g = o.gap / 2;
    squarify(values, area).forEach((r, i) => {
      const rect = { x: r.x + g, y: r.y + g, w: r.w - 2 * g, h: r.h - 2 * g };
      if (rect.w < 1 || rect.h < 1) return;
      if (i === kept) { tiles.push({ id: `${node.id}|…`, rect, depth, size: restSize, grouped: rest.length, inh: inh }); return; }
      const c = node.kids[i];
      const open = depth < o.maxDepth && !!c.kids && c.kids.length > 0 && rect.w >= o.minOpen && rect.h >= o.minOpen;
      const eff = inh || c.reclaim;
      tiles.push({ id: c.id, node: c, rect, depth, size: c.size, open, inh, pat: eff });
      if (open) lay(c, { x: rect.x + o.pad, y: rect.y + o.header, w: rect.w - 2 * o.pad, h: rect.h - o.header - o.pad }, depth + 1, eff);
    });
  };
  lay(root, bounds, 1, null);
  return tiles;
}

// ---------- theme.rs: house palettes, tint per family ----------
const hex = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v * t + b[i] * (1 - t));
const hsl = (h, s, l) => { const k = (n) => (n + h * 12) % 12, a = s * Math.min(l, 1 - l), q = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [q(0) * 255, q(8) * 255, q(4) * 255]; };
const css = (c, a = 1) => `rgba(${c.map((v) => Math.round(v)).join(',')},${a})`;
const FAMILIES = { system: [0.08, 0.06], apps: [0.54, 0.3], dev: [0.25, 0.3], media: [0.09, 0.4], docs: [0.7, 0.2], cache: [0.13, 0.5], archives: [0.03, 0.35], models: [0.8, 0.2], other: [0.1, 0] };
const PAL = {
  dark: { paper: 0x1a1917, ink: 0xece7dc, faint: 0x9a948a, accent: 0xf0643a, panel: 0x201f1c, rule: 0x3a3732, safe: 0x86c5c4, review: 0xe3ad5f },
  light: { paper: 0xf1ede4, ink: 0x1d1c1a, faint: 0x6e6a62, accent: 0xd4471f, panel: 0xf6f3ec, rule: 0xcfc8ba, safe: 0x2c6a70, review: 0x7a4f0f },
};
function makeTheme(dark) {
  const p = PAL[dark ? 'dark' : 'light'];
  const [paper, ink, faint, accent, panel, rule, safe, review] = ['paper', 'ink', 'faint', 'accent', 'panel', 'rule', 'safe', 'review'].map((k) => hex(p[k]));
  const tints = {};
  for (const [k, [h, s]] of Object.entries(FAMILIES)) {
    const pure = hsl(h, Math.max(s, 0.08), dark ? 0.6 : 0.5);
    let t = mix(pure, paper, 0.06);
    for (let i = 0; i <= 14; i++) { const c = mix(pure, paper, 0.2 - i * 0.01); if (contrast(ink, c) >= 6) { t = c; break; } }
    tints[k] = t;
  }
  const grounds = [paper, panel, ...Object.values(tints)];
  let soft = ink;
  for (let i = 0; i <= 20; i++) { const c = mix(faint, ink, 1 - i * 0.05); if (grounds.every((g) => contrast(c, g) >= 4.5)) { soft = c; break; } }
  return { paper: css(paper), panel: css(panel), panelA: css(panel, 0.92), ink: css(ink), soft: css(soft), rule: css(rule), accent: css(accent), safe: css(safe), review: css(review), tint: Object.fromEntries(Object.entries(tints).map(([k, v]) => [k, css(v)])), line: [css(ink, 0.85), css(ink, 0.45)], hatch: css(ink, 0.18), dot: css(ink, 0.42) };
}

const patternBg = (pat, th) => pat === 'safe' ? `repeating-linear-gradient(135deg, transparent 0 5px, ${th.hatch} 5px 6px)`
  : pat === 'review' ? `radial-gradient(circle, ${th.dot} 0.9px, transparent 1.3px) 0 0 / 6px 6px` : null;

// ---------- the plots (memoised: hovering never redraws them) ----------
const Check = ({ on, th }) => (
  <span aria-hidden="true" style={{ flex: 'none', width: 12, height: 12, boxSizing: 'border-box', border: `1.5px solid ${th.ink}`, background: on ? th.ink : th.panel, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    {on && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4.2 3.1 6.2 7 1.6" fill="none" stroke={th.paper} strokeWidth="1.6" /></svg>}
  </span>
);
const row = { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 };
const ell = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 };

const Plot = memo(function Plot({ tiles, th, ticked, l, t, onTick, onEnter }) {
  return tiles.map((tl) => {
    const { rect: r, node } = tl;
    const summed = !node;
    const canTick = !!node && !!node.reclaim && !tl.inh;
    const on = ticked.has(tl.id) || false;
    const pat = tl.pat || tl.inh;
    const bg = summed ? th.paper : th.tint[node.cat];
    const bgi = summed ? null : patternBg(pat, th);
    const name = summed ? t.others(tl.grouped) : nameOf(node, l);
    const size = fmt(tl.size, l);
    const patch = pat ? th.panelA : 'transparent';
    const base = { position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', background: bgi ? `${bgi}, ${bg}` : bg, border: `1px ${summed ? 'dashed' : 'solid'} ${th.line[tl.depth === 1 ? 0 : 1]}`, overflow: 'hidden', color: th.ink };
    const hasLabel = r.w > 56 && r.h > 36;
    const big = r.w > 150 && r.h > 96 && !tl.open;
    const [n, unit] = fmtParts(tl.size, l);
    const bigPx = Math.max(16, Math.min(30, r.h * 0.16));
    const lbl = (
      <span style={{ position: 'absolute', top: 4, left: 4, maxWidth: r.w - 8, padding: '1px 4px', background: patch, display: 'flex', flexDirection: 'column', textAlign: 'left', boxSizing: 'border-box' }}>
        <span style={row}>
          {canTick && <Check on={on} th={th} />}
          <span style={{ ...ell, fontSize: tl.depth === 1 ? 12.5 : 11.5, fontWeight: 500 }}>{name}</span>
        </span>
        {!big && r.h > 44 && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: th.soft }}>{size}</span>}
      </span>
    );
    if (tl.open) {
      return (
        <div key={tl.id} className="dbr-t" data-id={tl.id} style={base}>
          <div style={{ position: 'absolute', top: 3, left: 3, right: 3, height: 16, display: 'flex', alignItems: 'center', background: patch }}>
            {canTick && (
              <button type="button" className="dbr-b" aria-label={t.tick(name)} aria-pressed={on} onClick={() => onTick(tl.id)} style={{ flex: 'none', width: 20, height: 16, padding: 0, border: 0, background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Check on={on} th={th} />
              </button>
            )}
            <button type="button" className="dbr-b" aria-label={t.open(name)} onClick={() => onEnter(tl.id)} style={{ flex: 1, minWidth: 0, height: 16, padding: '0 5px', border: 0, background: 'transparent', color: th.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer', font: 'inherit' }}>
              <span style={{ ...ell, fontSize: 12, fontWeight: 600 }}>{name}</span>
              <span style={{ flex: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: th.soft }}>{size}</span>
            </button>
          </div>
        </div>
      );
    }
    const act = summed || tl.inh ? null : canTick ? () => onTick(tl.id) : node.kids ? () => onEnter(tl.id) : null;
    return (
      <div key={tl.id} className="dbr-t" data-id={tl.id} style={base}>
        <button type="button" className="dbr-b" aria-label={canTick ? t.tick(name) : act ? t.open(name) : name} aria-pressed={canTick ? on : undefined} onClick={act || undefined} tabIndex={summed ? -1 : 0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 0, background: 'transparent', color: th.ink, cursor: act ? 'pointer' : 'default', font: 'inherit' }}>
          {hasLabel && lbl}
          {big && (
            <span style={{ position: 'absolute', bottom: 4, left: 4, padding: '0 4px', background: patch, display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: bigPx, lineHeight: 1.1 }}>{n}</span>
              <span style={{ fontSize: bigPx * 0.5, color: th.soft }}>{unit}</span>
            </span>
          )}
        </button>
      </div>
    );
  });
});

// ---------- the demo ----------
export default function DebarrasDemo({ dark, wide, lang }) {
  const l = lang === 'fr' ? 'fr' : 'en';
  const t = TXT[l];
  const th = useMemo(() => makeTheme(dark), [dark]);
  const [path, setPath] = useState([]);
  const [ticked, setTicked] = useState(() => new Set());
  const [gone, setGone] = useState(() => new Set());
  const [freed, setFreed] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [info, setInfo] = useState(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const planRef = useRef(null);
  const cancelRef = useRef(null);

  useLayoutEffect(() => {
    const el = planRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
      setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tree = useMemo(() => prune(TREE, gone), [gone]);
  // a path can only lose its tail (a ticked ancestor removed): cut at the first missing step
  const cur = useMemo(() => { let n = tree; const ok = []; for (const id of path) { const k = n.kids && n.kids.find((c) => c.id === id); if (!k) break; ok.push(id); n = k; } return { node: n, path: ok }; }, [tree, path]);
  const opts = useMemo(() => ({ gap: 6, pad: 6, header: 22, minArea: wide ? 1400 : 2600, minOpen: 120, maxDepth: wide ? 3 : 2 }), [wide]);
  const tiles = useMemo(() => (box.w > 40 && box.h > 40 ? layout(cur.node, { x: 0, y: 0, w: box.w, h: box.h }, opts) : []), [cur.node, box, opts]);
  const byId = useMemo(() => new Map(tiles.map((x) => [x.id, x])), [tiles]);

  // ticked items that are not inside another ticked item
  const eff = useMemo(() => {
    const out = [];
    const walk = (n) => { if (ticked.has(n.id)) { out.push(n); return; } (n.kids || []).forEach(walk); };
    walk(tree);
    return out;
  }, [tree, ticked]);
  const total = eff.reduce((s, n) => s + n.size, 0);
  const pctShare = tree.size + freed ? Math.round((total / (tree.size + freed)) * 100) : 0;
  const [msg, setMsg] = useState('');

  const onTick = useCallback((id) => { setMsg(''); setTicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);
  const onEnter = useCallback((id) => { setMsg(''); setInfo(null); setPath((p) => { const i = p.indexOf(id); return i >= 0 ? p.slice(0, i + 1) : [...p, id]; }); }, []);
  const up = (i) => { setMsg(''); setInfo(null); setPath(cur.path.slice(0, i)); };
  const over = useCallback((e) => { const el = e.target.closest && e.target.closest('[data-id]'); setInfo((p) => { const id = el ? el.dataset.id : null; return p === id || !el ? p : id; }); }, []);

  useEffect(() => { if (dialog && cancelRef.current) cancelRef.current.focus(); }, [dialog]);
  const confirm = () => {
    const ids = new Set(eff.map((n) => n.id));
    setGone((g) => new Set([...g, ...ids]));
    setFreed((x) => x + total);
    setTicked(new Set());
    setDialog(false);
    setMsg(t.done(fmt(total, l)));
  };
  const reset = () => { setGone(new Set()); setTicked(new Set()); setFreed(0); setPath([]); setDialog(false); setMsg(''); setInfo(null); };
  const onKey = (e) => { if (e.key !== 'Escape') return; if (dialog) setDialog(false); else if (cur.path.length) up(cur.path.length - 1); };

  const hov = info && byId.get(info);
  const hovLine = hov && (() => {
    const n = hov.node;
    if (!n) return `${t.others(hov.grouped)} · ${fmt(hov.size, l)}`;
    const verdict = hov.pat === 'safe' ? t.safe : hov.pat === 'review' ? t.check : t.keep;
    const why = n.why && !hov.inh ? ` — ${WHY[n.why][l === 'fr' ? 1 : 0]}` : hov.inh ? ` — ${t.inside}` : '';
    return `${nameOf(n, l)} · ${fmt(n.size, l)} · ${verdict}${why}`;
  })();
  const dirty = gone.size > 0 || ticked.size > 0 || path.length > 0;
  const touch = wide ? 30 : 44;
  const btn = (primary, disabled) => ({ minHeight: touch, padding: '0 16px', borderRadius: 3, border: `1px solid ${th.ink}`, background: primary ? th.ink : 'transparent', color: primary ? th.paper : th.ink, font: "600 13px 'Inter', sans-serif", cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, whiteSpace: 'nowrap' });
  const mono = { fontFamily: "'IBM Plex Mono', monospace" };
  const [tn, tu] = fmtParts(total, l);
  const [un, uu] = fmtParts(tree.size, l);
  const crumbs = [{ id: null, label: '~' }, ...cur.path.map((id) => ({ id, label: nameOf(find(tree, [...cur.path.slice(0, cur.path.indexOf(id) + 1)]) || { name: id }, l) }))];

  return (
    <div role="group" aria-label={t.plan} onKeyDown={onKey} style={{ position: 'relative', display: 'flex', flexDirection: 'column', ...(wide ? { height: 440, width: '100%' } : { flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }), boxSizing: 'border-box', padding: wide ? '8px 14px 10px' : '10px 12px', gap: wide ? 6 : 6, background: th.paper, color: th.ink, border: `1px solid ${th.rule}`, borderRadius: 10, fontFamily: "'Inter', sans-serif", textAlign: 'left' }}>
      <style>{`.dbr-t:hover,.dbr-t:focus-within{outline:2px solid ${th.accent};outline-offset:-1px;z-index:3}.dbr-b:focus-visible{outline:1px dashed ${th.ink};outline-offset:-3px}.dbr-b{-webkit-tap-highlight-color:transparent}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flex: 'none' }}>
        <nav aria-label="path" style={{ ...mono, fontSize: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {i > 0 && <span aria-hidden="true" style={{ color: th.soft, padding: '0 2px' }}>/</span>}
                {last ? <span aria-current="page" style={{ fontWeight: 600, padding: '0 6px', minHeight: touch, display: 'inline-flex', alignItems: 'center' }}>{c.label}</span>
                  : <button type="button" className="dbr-b" onClick={() => up(i)} aria-label={i === crumbs.length - 2 ? `${t.up}: ${c.label}` : c.label} style={{ ...mono, fontSize: 12, minHeight: touch, minWidth: touch > 30 ? 44 : 0, padding: '0 6px', border: 0, background: 'transparent', color: th.ink, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>{c.label}</button>}
              </span>
            );
          })}
        </nav>
        <div style={{ textAlign: 'right', flex: 'none', paddingTop: 2 }}>
          <div style={{ ...mono, fontSize: 12 }}>{un}{' '}{uu} · {t.items(cur.node.kids ? cur.node.kids.length : 0)}</div>
          <div style={{ ...mono, fontSize: 10.5, color: th.soft }}>{t.made}</div>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: wide ? 0 : 300 }}>
        <div ref={planRef} onPointerOver={over} onFocus={over} style={{ position: 'absolute', inset: 0 }}>
          <Plot tiles={tiles} th={th} ticked={ticked} l={l} t={t} onTick={onTick} onEnter={onEnter} />
        </div>
        {dialog && (
          <div role="dialog" aria-modal="true" aria-label={t.title} style={{ position: 'absolute', inset: 0, zIndex: 10, background: th.panel, border: `1px solid ${th.ink}`, display: 'flex', flexDirection: 'column', padding: 14, gap: 10, boxSizing: 'border-box' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{t.title}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {eff.length === 0 && <li style={{ color: th.soft, fontSize: 13 }}>{t.empty}</li>}
              {eff.map((n) => (
                <li key={n.id} style={{ borderBottom: `1px solid ${th.rule}`, paddingBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, fontWeight: 600 }}>
                    <span style={ell}>{n.id.split('|').map((p, i, a) => (i === a.length - 1 ? nameOf(n, l) : p)).join('/')}</span>
                    <span style={{ ...mono, fontWeight: 400, flex: 'none' }}>{fmt(n.size, l)}</span>
                  </div>
                  {n.why && <div style={{ fontSize: 11.5, color: n.reclaim === 'safe' ? th.safe : th.review }}>{WHY[n.why][l === 'fr' ? 1 : 0]}</div>}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11.5, color: th.soft }}>{t.demoNote}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" ref={cancelRef} className="dbr-b" onClick={() => setDialog(false)} style={btn(false, false)}>{t.cancel}</button>
              <button type="button" className="dbr-b" disabled={!eff.length} onClick={confirm} style={btn(true, !eff.length)}>{t.go} · {fmt(total, l)}</button>
            </div>
          </div>
        )}
      </div>

      <div aria-live="polite" style={{ ...mono, fontSize: 11, color: msg ? th.safe : th.soft, minHeight: wide ? 16 : 30, flex: 'none', lineHeight: 1.35, ...(wide ? ell : {}) }} title={msg || hovLine || undefined}>{msg || hovLine || t.hint}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', flex: 'none' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...mono, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: th.soft }}>{t.ticked}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontWeight: 300, fontSize: 26, lineHeight: 1.1 }}>{tn}</span>
            <span style={{ fontSize: 13, color: th.soft }}>{tu}</span>
            <span style={{ ...mono, fontSize: 10.5, color: th.soft }}>{t.share(pctShare)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {dirty && <button type="button" className="dbr-b" onClick={reset} style={btn(false, false)}>{t.reset}</button>}
          <button type="button" className="dbr-b" disabled={!eff.length} onClick={() => setDialog(true)} style={btn(true, !eff.length)}>{t.review}{eff.length ? ` · ${eff.length}` : ''}</button>
        </div>
      </div>
    </div>
  );
}
