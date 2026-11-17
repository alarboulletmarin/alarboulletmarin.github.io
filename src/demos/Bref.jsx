import { useMemo, useRef, useState } from 'react';
import { evaluate, isFormula } from './bref/formula.js';

// Live re-creation of Bref's editor (Rust + GPUI). Followed: src/views/editor (a line is plain Markdown, styled while
// typing, markers dimmed), book/src/links.md (Ctrl+click opens a [[link]], Backlinks list who links to the note),
// book/src/tables.md + src/logic/formula.rs (a cell starting with = computes; the caret in it shows the formula).

const TXT = {
  fr: { editLine: 'Ligne en cours d’édition', taskLabel: 'Cocher ou décocher', words: 'mots', chars: 'caractères',
    tools: { b: 'Gras', i: 'Italique', s: 'Barré', h: 'Surligné', c: 'Code', l: 'Lien', t: 'Case à cocher' },
    back: 'Note précédente', open: 'Ouvrir', openLink: (n) => 'Ouvrir la note ' + n, backlinks: 'Rétroliens', none: 'aucun',
    hintMouse: 'Ctrl + clic sur un [[lien]] l’ouvre', hintTouch: 'Touchez un [[lien]], puis Ouvrir', made: 'données inventées',
    trail: 'Notes ouvertes', formulaErr: { Cycle: 'Référence circulaire', DivideByZero: 'Division par zéro', NotANumber: 'Pas un nombre', Range: 'Plage invalide', Syntax: 'Syntaxe', Name: 'Nom inconnu', Arguments: 'Arguments', NoNumbers: 'Aucun nombre' } },
  en: { editLine: 'Line being edited', taskLabel: 'Toggle the task', words: 'words', chars: 'characters',
    tools: { b: 'Bold', i: 'Italic', s: 'Strikethrough', h: 'Highlight', c: 'Code', l: 'Link', t: 'Checkbox' },
    back: 'Previous note', open: 'Open', openLink: (n) => 'Open the note ' + n, backlinks: 'Backlinks', none: 'none',
    hintMouse: 'Ctrl + click a [[link]] to open it', hintTouch: 'Tap a [[link]], then Open', made: 'made-up data',
    trail: 'Open notes', formulaErr: { Cycle: 'Circular reference', DivideByZero: 'Division by zero', NotANumber: 'Not a number', Range: 'Invalid range', Syntax: 'Syntax', Name: 'Unknown name', Arguments: 'Arguments', NoNumbers: 'No numbers' } },
};
// The tiny vault: ids, their names (a link finds a note by name, in either language), and their seed text.
const NAMES = { trip: ['Voyage à Lisbonne', 'Trip to Lisbon'], budget: ['Budget 2026', 'Budget 2026'], food: ['Restos à Lisbonne', 'Lisbon food'] };
const SEED = {
  fr: {
    trip: ['# Voyage à Lisbonne', 'Trois jours en **mai**, arrivée un *jeudi*. Le budget et les réservations sont dans [[Budget 2026]], les idées portent le tag #voyage.', '> [!TIP] Réserver le train pour Sintra la ==veille==.', '## À réserver', '- [x] Vols', '- [ ] Hôtel près de l’Alfama', '- [ ] Excursion à Sintra', 'Où manger : [[Restos à Lisbonne]].', ''],
    budget: ['# Budget 2026', 'Le voyage à [[Voyage à Lisbonne]], en euros. Une cellule qui commence par `=` calcule.', '| Poste | Prévu | Réel | Écart |', '|:--|--:|--:|--:|', '| Vols | 240 | 252 | =C-B |', '| Hôtel | 310 | 298,5 | =C-B |', '| Sintra | 45 | 38 | =C-B |', '| Restos | 150 | 164 | =C-B |', '| Total | =sum(above) | =sum(above) | =sum(above) |', '> [!TIP] Changez un chiffre, ou essayez `=avg(above)` et `=max(above)`.', ''],
    food: ['# Restos à Lisbonne', '## À essayer', '- [ ] Pastéis de nata à Belém', '- [ ] Petiscos près de l’Alfama', '- [ ] Un soir de fado', 'Retour au plan : [[Voyage à Lisbonne]]. Les sous sont dans [[Budget 2026]], ligne Restos.', ''],
  },
  en: {
    trip: ['# Trip to Lisbon', 'Three days in **May**, flying in on a *Thursday*. Budget and bookings live in [[Budget 2026]], ideas are tagged #travel.', '> [!TIP] Book the Sintra train the ==evening before==.', '## To book', '- [x] Flights', '- [ ] Hotel near Alfama', '- [ ] Day trip to Sintra', 'Where to eat: [[Lisbon food]].', ''],
    budget: ['# Budget 2026', 'The [[Trip to Lisbon]], in euros. A cell that starts with `=` computes.', '| Item | Planned | Actual | Gap |', '|:--|--:|--:|--:|', '| Flights | 240 | 252 | =C-B |', '| Hotel | 310 | 298.5 | =C-B |', '| Sintra | 45 | 38 | =C-B |', '| Food | 150 | 164 | =C-B |', '| Total | =sum(above) | =sum(above) | =sum(above) |', '> [!TIP] Change a number, or try `=avg(above)` and `=max(above)`.', ''],
    food: ['# Lisbon food', '## To try', '- [ ] Pastéis de nata in Belém', '- [ ] Petiscos near Alfama', '- [ ] A fado night', 'Back to the plan: [[Trip to Lisbon]]. The money is in [[Budget 2026]], Food line.', ''],
  },
};
const INLINE = /(\*\*[^*]+\*\*|~~[^~]+~~|==[^=]+==|\*[^*\s][^*]*\*|`[^`]+`|\[\[[^\]]+\]\]|(?:^|(?<=\s))#[\p{L}\p{N}_-]+)/gu;
function inlineTokens(text) {
  const out = [];
  let last = 0, m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push({ k: 'text', text: text.slice(last, m.index) });
    const w = m[0];
    const pair = (o, kind) => { out.push({ k: 'mark', text: o }); out.push({ k: kind, text: w.slice(o.length, w.length - (kind === 'link' ? 2 : o.length)) }); out.push({ k: 'mark', text: kind === 'link' ? ']]' : o }); };
    if (w.startsWith('**')) pair('**', 'bold');
    else if (w.startsWith('~~')) pair('~~', 'strike');
    else if (w.startsWith('==')) pair('==', 'hl');
    else if (w.startsWith('`')) pair('`', 'code');
    else if (w.startsWith('[[')) pair('[[', 'link');
    else if (w.startsWith('#')) out.push({ k: 'tag', text: w });
    else pair('*', 'ital');
    last = m.index + w.length;
  }
  if (last < text.length) out.push({ k: 'text', text: text.slice(last) });
  return out;
}
function blockOf(raw) {
  let m;
  if ((m = /^(#{1,3}) (.*)$/.exec(raw))) return { kind: 'h' + m[1].length, prefix: m[1] + ' ', body: m[2] };
  if ((m = /^- \[([ xX])\] ?(.*)$/.exec(raw))) return { kind: 'task', done: m[1] !== ' ', prefix: '', body: m[2] };
  if ((m = /^> \[!(\w+)\] ?(.*)$/.exec(raw))) return { kind: 'callout', prefix: '> [!' + m[1] + '] ', body: m[2] };
  if ((m = /^> ?(.*)$/.exec(raw))) return { kind: 'quote', prefix: '> ', body: m[1] };
  if ((m = /^- (.*)$/.exec(raw))) return { kind: 'li', prefix: '- ', body: m[1] };
  return { kind: 'p', prefix: '', body: raw };
}
const LINE_STYLE = {
  h1: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '26px', size: '24px', lh: '1.25', margin: '4px 0 6px' },
  h2: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '20px', size: '18px', lh: '1.3', margin: '12px 0 2px' },
  h3: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '18px', size: '16px', lh: '1.35', margin: '10px 0 2px' },
  p: { font: "'IBM Plex Sans', sans-serif", weight: 400, sizeM: '16px', size: '14px', lh: '1.6', margin: '1px 0' },
};
const taskOf = (raw) => { const m = /^- \[([ xX])\] ?/.exec(raw); return m ? { prefix: m[0], done: m[1] !== ' ' } : null; };
const textOf = (raw) => { const tk = taskOf(raw); return tk ? raw.slice(tk.prefix.length) : raw; };
const withText = (raw, text) => { const tk = taskOf(raw); return tk ? (tk.done ? '- [x] ' : '- [ ] ') + text : text; };
const keepFocus = (e) => e.preventDefault();
LINE_STYLE.tbl = { font: "'IBM Plex Mono', monospace", weight: 400, sizeM: '13px', size: '13px', lh: '22px', margin: '0' };

// ---------- tables: every row is a line; consecutive `| a | b |` lines form one table
const isPipe = (raw) => /^\s*\|.*\|\s*$/.test(raw);
const isSep = (raw) => /^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(raw);
// [start, end) of the content of each cell of a row, in the raw text (a `\|` is not a separator)
function cellRanges(raw) {
  const bars = [];
  for (let k = 0; k < raw.length; k++) if (raw[k] === '|' && raw[k - 1] !== '\\') bars.push(k);
  const out = [];
  for (let k = 0; k + 1 < bars.length; k++) {
    const a = bars[k] + 1, b = bars[k + 1], seg = raw.slice(a, b);
    const lead = seg.length - seg.trimStart().length, body = seg.trim();
    const st = body ? a + lead : Math.min(a + 1, b);
    out.push([st, body ? st + body.length : st]);
  }
  return out;
}
const cellsOf = (raw) => cellRanges(raw).map(([a, b]) => raw.slice(a, b).replace(/\\\|/g, '|'));
const alignsOf = (raw) => cellsOf(raw).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left'));
// per line: null, or { t: table index, k: position in the table, row: grid row (-1 = dash line), cols, aligns }
function tablesOf(L) {
  const meta = L.map(() => null), grids = [];
  for (let i = 0; i < L.length; i++) {
    if (!isPipe(L[i])) continue;
    let j = i;
    while (j < L.length && isPipe(L[j])) j++;
    const sep = j - i > 1 && isSep(L[i + 1]);
    const cols = cellRanges(L[i]).length, aligns = sep ? alignsOf(L[i + 1]) : [];
    const grid = [];
    for (let k = 0; k < j - i; k++) {
      const row = sep && k === 1 ? -1 : sep && k > 1 ? k - 1 : k;
      meta[i + k] = { t: grids.length, k, row, cols, aligns, first: i, last: j - 1 };
      if (row >= 0) grid[row] = cellsOf(L[i + k]);
    }
    grids.push(grid);
    i = j - 1;
  }
  return { meta, grids };
}
const target = (inner) => inner.split('|')[0].split('#')[0].trim();
const linkAt = (text, pos) => {
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(text))) if (m.index <= pos && pos <= m.index + m[0].length) return target(m[1]);
  return null;
};

export default function BrefDemo({ dark, wide, lang }) {
  const t = TXT[lang];
  const [edits, setEdits] = useState({});          // id -> lines, once a note was touched
  const [made, setMade] = useState([]);            // notes created by following a link to nowhere: { id, name }
  const [trail, setTrail] = useState(['trip']);    // the notes opened one after the other; the last is on screen
  const [cur, setCur] = useState(null);            // the line holding the caret: shown raw, the others rendered
  const [caret, setCaret] = useState(null);        // { i, link } when the caret is inside a [[link]]
  const root = useRef(null);
  const active = useRef(null);
  const id = trail[trail.length - 1];

  const seedOf = (n) => SEED[lang][n] || ['# ' + (made.find((x) => x.id === n) || {}).name, ''];
  const L = edits[id] || seedOf(id);
  const lines = () => L.slice();
  const save = (ls) => setEdits((e) => ({ ...e, [id]: ls }));
  const nameOf = (n) => (NAMES[n] ? NAMES[n][lang === 'fr' ? 0 : 1] : (made.find((x) => x.id === n) || {}).name || n);

  // a link finds its note by name, ignoring case, in either language
  const byName = useMemo(() => {
    const m = new Map();
    Object.entries(NAMES).forEach(([n, names]) => names.forEach((x) => m.set(x.toLowerCase(), n)));
    made.forEach((x) => m.set(x.name.toLowerCase(), x.id));
    return m;
  }, [made]);
  // who links to the open note: computed from the text, so a new [[link]] shows up as it is typed
  const backlinks = useMemo(() => {
    const out = [];
    for (const n of Object.keys(NAMES).concat(made.map((x) => x.id))) {
      if (n === id) continue;
      const ls = edits[n] || SEED[lang][n] || [];
      const hit = ls.find((l) => [...l.matchAll(/\[\[([^\]]+)\]\]/g)].some((m) => byName.get(target(m[1]).toLowerCase()) === id));
      if (hit !== undefined) out.push({ id: n, line: hit });
    }
    return out;
  }, [edits, id, lang, byName, made]);

  const { meta, grids } = useMemo(() => tablesOf(L), [L]);
  const decimal = lang === 'fr' ? ',' : '.';
  const results = useMemo(() => grids.map((g) => evaluate(g, decimal)), [grids, decimal]);

  const reset = () => { setCur(null); setCaret(null); active.current = null; };
  const openNote = (name) => {
    let n = byName.get(name.toLowerCase());
    if (!n) { // a link to a note that does not exist creates it, as in the app
      n = 'n' + made.length;
      setMade((m) => m.concat({ id: n, name }));
      setEdits((e) => ({ ...e, [n]: ['# ' + name, ''] }));
    }
    setTrail((tr) => (tr[tr.length - 1] === n ? tr : tr.concat(n)));
    reset();
  };
  const goTo = (k) => { setTrail((tr) => tr.slice(0, k + 1)); reset(); };

  const field = (i) => (root.current ? root.current.querySelectorAll('.bref-saisie')[i] : null) || null;
  const focusLine = (i, a, b) => {
    active.current = i;
    requestAnimationFrame(() => {
      const el = field(i);
      if (!el) return;
      el.focus();
      const len = el.value.length;
      const x = a == null ? len : Math.min(a, len);
      el.setSelectionRange(x, b == null ? x : Math.min(b, len));
    });
  };
  const setLines = (ls, focus) => { save(ls); if (focus) focusLine(focus[0], focus[1], focus[2]); };
  const change = (i, value) => {
    const ls = lines();
    const parts = value.split('\n');
    ls[i] = withText(ls[i], parts[0]);
    // a multi-line paste becomes several lines
    if (parts.length > 1) { ls.splice(i + 1, 0, ...parts.slice(1)); setLines(ls, [i + parts.length - 1]); }
    else save(ls);
  };
  const wrap = (open, close) => {
    const ls = lines();
    let i = active.current == null ? ls.length - 1 : active.current;
    if (i >= ls.length) i = ls.length - 1;
    const el = field(i);
    const text = textOf(ls[i]);
    const a = el ? el.selectionStart : text.length, b = el ? el.selectionEnd : text.length;
    close = close == null ? open : close;
    ls[i] = withText(ls[i], text.slice(0, a) + open + text.slice(a, b) + close + text.slice(b));
    setLines(ls, a === b ? [i, a + open.length] : [i, a + open.length, b + open.length]);
  };
  const toggleTask = (i) => {
    const ls = lines();
    const tk = taskOf(ls[i]);
    if (!tk) return;
    ls[i] = (tk.done ? '- [ ] ' : '- [x] ') + textOf(ls[i]);
    save(ls);
  };
  const makeTask = () => {
    const ls = lines();
    const i = active.current == null ? ls.length - 1 : Math.min(active.current, ls.length - 1);
    const el = field(i);
    const pos = el ? el.selectionStart : 0;
    const raw = ls[i];
    if (taskOf(raw)) { ls[i] = textOf(raw); setLines(ls, [i, pos]); }
    else { const body = raw.replace(/^- /, ''); ls[i] = '- [ ] ' + body; setLines(ls, [i, Math.max(0, pos - (raw.length - body.length))]); }
  };
  // Tab / Shift+Tab / Enter inside a table row, as in the app: next cell (selected), a new row after the last
  const tableKey = (i, e, ls, m) => {
    const el = e.target, a = el.selectionStart;
    const newRow = (after) => { ls.splice(after + 1, 0, '|' + '  |'.repeat(m.cols)); setLines(ls, [after + 1, 2]); };
    if (e.key === 'Tab') {
      e.preventDefault();
      const rs = cellRanges(ls[i]);
      let c = rs.findIndex(([s, en]) => a >= s - 1 && a <= en + 1);
      if (c < 0) c = 0;
      const to = c + (e.shiftKey ? -1 : 1);
      if (to >= 0 && to < rs.length) { el.setSelectionRange(rs[to][0], rs[to][1]); return; }
      const step = e.shiftKey ? -1 : 1;
      let j = i + step;
      while (meta[j] && meta[j].t === m.t && meta[j].row < 0) j += step;
      if (meta[j] && meta[j].t === m.t) { const r2 = cellRanges(ls[j]); const x = e.shiftKey ? r2[r2.length - 1] : r2[0]; if (x) focusLine(j, x[0], x[1]); }
      else if (!e.shiftKey) newRow(i);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // an empty last row + Enter removes the row and leaves the table
      if (i === m.last && m.row > 0 && cellsOf(ls[i]).every((c) => !c.trim())) { ls[i] = ''; setLines(ls, [i, 0]); return; }
      newRow(m.row === 0 && meta[i + 1] && meta[i + 1].row < 0 ? i + 1 : i);
      return;
    }
    // Backspace / Delete never glue a row to its neighbours
    e.preventDefault();
  };
  const onKey = (i, e) => {
    const el = e.target, v = el.value, a = el.selectionStart, b = el.selectionEnd;
    const ls = lines();
    const raw = ls[i], tk = taskOf(raw);
    const mod = e.ctrlKey || e.metaKey;
    const m = meta[i];
    if (m && !mod && !e.altKey) {
      if (e.key === 'Tab' || e.key === 'Enter') { tableKey(i, e, ls, m); return; }
      if ((e.key === 'Backspace' && a === 0 && b === 0) || (e.key === 'Delete' && a === v.length && b === a)) { tableKey(i, e, ls, m); return; }
    }
    if (mod && e.key === 'Enter' && tk) { e.preventDefault(); toggleTask(i); return; }
    if (mod && e.key === 'Enter') { const l = linkAt(v, a); if (l) { e.preventDefault(); openNote(l); return; } }
    if (mod && ['b', 'i', 'e', 'h'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const k = e.key.toLowerCase();
      wrap(k === 'b' ? '**' : k === 'i' ? '*' : k === 'e' ? '`' : '==');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tk) {
        // an empty task + Enter leaves the list
        if (!v) { ls[i] = ''; setLines(ls, [i, 0]); return; }
        ls[i] = withText(raw, v.slice(0, a));
        ls.splice(i + 1, 0, '- [ ] ' + v.slice(b));
        setLines(ls, [i + 1, 0]);
        return;
      }
      const mm = /^(- |> )/.exec(v);
      if (mm && v === mm[1]) { ls[i] = ''; setLines(ls, [i, 0]); return; }
      const prefix = mm ? mm[1] : '';
      ls[i] = v.slice(0, a);
      ls.splice(i + 1, 0, prefix + v.slice(b));
      setLines(ls, [i + 1, prefix.length]);
    } else if (e.key === 'Backspace' && a === 0 && b === 0) {
      if (tk) { e.preventDefault(); ls[i] = v; setLines(ls, [i, 0]); return; }
      if (i === 0) return;
      e.preventDefault();
      if (meta[i - 1]) { focusLine(i - 1); return; } // never glue a line to a table row
      const prevText = textOf(ls[i - 1]);
      ls[i - 1] = withText(ls[i - 1], prevText + v);
      ls.splice(i, 1);
      setLines(ls, [i - 1, prevText.length]);
    } else if (e.key === 'Delete' && a === v.length && b === a && i < ls.length - 1) {
      e.preventDefault();
      if (meta[i + 1]) { focusLine(i + 1, 0); return; }
      ls[i] = withText(raw, v + textOf(ls[i + 1]));
      ls.splice(i + 1, 1);
      setLines(ls, [i, a]);
    } else if (e.key === 'ArrowUp' && i > 0) {
      if (a === 0 && b === 0) { e.preventDefault(); focusLine(i - 1); return; }
      // on the first visual line the browser moves the caret to the start: go up one line
      requestAnimationFrame(() => { if (el.selectionStart === 0 && a !== 0) focusLine(i - 1); });
    } else if (e.key === 'ArrowDown' && i < ls.length - 1) {
      if (a === v.length) { e.preventDefault(); focusLine(i + 1, 0); return; }
      requestAnimationFrame(() => { if (el.selectionStart === el.value.length && a !== el.value.length) focusLine(i + 1, 0); });
    } else if (e.key === 'Escape') {
      e.preventDefault(); el.blur();
    }
  };
  // where the caret is: inside a [[link]] the "open" button shows (touch has no Ctrl+click)
  const trackCaret = (i, el) => {
    const link = linkAt(el.value, el.selectionStart);
    setCaret((c) => ((c ? c.link : null) === link && (!c || c.i === i) ? c : link ? { i, link } : null));
  };
  const ctrlClick = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const l = linkAt(e.target.value, e.target.selectionStart);
    if (l) { e.preventDefault(); openNote(l); }
  };

  const bc = dark
    ? { chrome: '#1B1A19', paper: '#242321', ink: '#E8E6E3', faint: '#7C776F', accent: '#D58B62', callout: '#1F2B21', hl: '#5A4A1C', edge: 'rgba(255, 255, 255, 0.08)', err: '#E07A6A' }
    : { chrome: '#EDE9E0', paper: '#FBFAF8', ink: '#2B2A28', faint: '#A39E95', accent: '#9B4824', callout: '#E4EFE1', hl: '#F3E3A0', edge: 'rgba(0, 0, 0, 0.07)', err: '#B3361F' };
  // the render keeps exactly the input's metrics: bold by stroke, synthesized italic, code without changing font
  const tokStyle = (k) => ({
    color: k === 'mark' ? bc.faint : (k === 'link' || k === 'tag') ? bc.accent : 'inherit',
    WebkitTextStroke: k === 'bold' ? '0.5px currentColor' : '0', fontStyle: k === 'ital' ? 'italic' : 'inherit',
    textDecorationLine: k === 'strike' ? 'line-through' : k === 'link' ? 'underline' : 'none', textDecorationColor: 'rgba(127,127,127,.45)', textUnderlineOffset: 2,
    background: k === 'hl' ? bc.hl : k === 'code' ? 'rgba(127, 127, 127, 0.16)' : 'transparent', borderRadius: 3,
  });
  const rows = L.map((raw, i) => {
    const tk = taskOf(raw);
    const text = textOf(raw);
    const m = meta[i];
    const bl = tk ? { kind: 'task', prefix: '', body: text } : m ? { kind: 'tbl', prefix: '', body: raw } : blockOf(raw);
    const st = LINE_STYLE[bl.kind] || LINE_STYLE.p;
    let toks = [];
    if (bl.prefix) toks.push({ k: 'mark', text: bl.prefix });
    toks = toks.concat(inlineTokens(bl.body));
    if (m) toks = toks.flatMap((x) => (x.k === 'text' || x.k === 'link' ? x.text.split(/(\|)/).filter(Boolean).map((y) => ({ k: y === '|' ? 'mark' : x.k, text: y })) : [x]));
    if (tk && tk.done) toks = toks.map((x) => (x.k === 'text' ? { k: 'strike', text: x.text } : x));
    // an invisible char keeps the height of an empty line and of a trailing space
    toks.push({ k: 'text', text: '​' });
    return { raw, text, tk, bl, st, toks, i, m };
  });
  const tool = (glyph, label, run, extra) => Object.assign({ glyph, label, run, color: bc.ink, font: "'IBM Plex Sans', sans-serif", weight: 400, style: 'normal', deco: 'none' }, extra || {});
  const tools = [
    tool('B', t.tools.b, () => wrap('**'), { weight: 700 }),
    tool('I', t.tools.i, () => wrap('*'), { style: 'italic' }),
    tool('S', t.tools.s, () => wrap('~~'), { deco: 'line-through' }),
    tool('H', t.tools.h, () => wrap('=='), { color: bc.accent, weight: 700 }),
    tool('<>', t.tools.c, () => wrap('`'), { font: "'IBM Plex Mono', monospace" }),
    tool('[[ ]]', t.tools.l, () => wrap('[[', ']]'), { font: "'IBM Plex Mono', monospace" }),
    tool('[x]', t.tools.t, () => makeTask(), { font: "'IBM Plex Mono', monospace", color: bc.accent }),
  ];
  const count = L.join(' ').split(/\s+/).filter(Boolean).length + ' ' + t.words + ' · ' + L.join('\n').length + ' ' + t.chars;
  const toolSize = wide ? 28 : 44;
  const ico = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 };
  const ctl = { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };
  const hit = wide ? 28 : 44;
  const btn = { border: 0, background: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 };
  const chip = { display: 'inline-flex', alignItems: 'center', minHeight: wide ? 22 : 44, padding: '0 8px', borderRadius: 11, border: `1px solid ${bc.edge}`, color: bc.accent, fontSize: 12, cursor: 'pointer', background: 'rgba(127,127,127,.08)' };

  // a table row not under the caret: drawn as a grid row (header tinted, formulas replaced by their result)
  const tableRow = (raw, m, i) => {
    const res = results[m.t], cells = cellsOf(raw), ranges = cellRanges(raw), out = [];
    for (let c = 0; c < m.cols; c++) {
      const cell = cells[c] == null ? '' : cells[c];
      const key = m.row + ',' + c;
      const calc = isFormula(cell), bad = calc && res.errors[key];
      out.push(
        <div key={c} onClick={() => focusLine(i, (ranges[c] || [raw.length])[0])} title={bad ? t.formulaErr[bad] || bad : undefined}
          style={{ padding: '0 8px', minWidth: 0, overflowWrap: 'anywhere', textAlign: m.aligns[c] || 'left', fontWeight: m.row === 0 ? 600 : 400, color: bad ? bc.err : calc ? bc.accent : 'inherit', fontVariantNumeric: 'tabular-nums', cursor: 'text' }}>
          {calc ? res.shown[key] : inlineTokens(cell).map((k, ki) => <span key={ki} style={tokStyle(k.k)}>{k.text}</span>)}
          {'​'}
        </div>
      );
    }
    return out;
  };
  const trailShow = wide ? trail.slice(-3) : trail.slice(-1);

  return (
    <div ref={root} style={{ flex: wide ? 'none' : '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', borderRadius: 12, background: bc.chrome, border: `1px solid ${bc.edge}`, boxShadow: '0 24px 60px rgba(0, 0, 0, 0.16)', overflow: 'hidden', color: bc.ink }}>
      <style>{`.bref-outil:hover,.bref-chip:hover,.bref-nav:hover{background-color:rgba(127,127,127,.14)}.bref-saisie::selection{background:rgba(155,72,36,.28);color:transparent}.bref-saisie:focus{outline:none}`}</style>
      <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, height: 32, padding: '0 14px', color: bc.faint, flex: 'none' }}>
        <svg {...ctl}><path d="M1 5h8" /></svg>
        <svg {...ctl}><rect x="1" y="1" width="8" height="8" /></svg>
        <svg {...ctl}><path d="M1 1l8 8M9 1l-8 8" /></svg>
      </div>
      <div style={{ display: 'flex', flex: wide ? 'none' : '1 1 0', minHeight: 0 }}>
        <div aria-hidden="true" style={{ width: 40, flex: 'none', display: wide ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 10, color: bc.faint }}>
          <svg {...ico}><path d="M3 2h7l3 3v9H3z" /></svg>
          <svg {...ico}><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 2" /></svg>
          <svg {...ico}><circle cx="4" cy="12" r="1.6" /><circle cx="12" cy="4" r="1.6" /><circle cx="12" cy="12" r="1.6" /><path d="M5.4 11l5.2-5.6M5.6 12h4.8" /></svg>
          <svg {...ico}><path d="M6 2L4.5 14M11.5 2L10 14M2.5 5.5h11M2 10.5h11" /></svg>
          <svg {...ico}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, margin: wide ? '0 10px 10px 0' : '0 8px 8px 8px', borderRadius: 10, background: bc.paper, display: 'flex', flexDirection: 'column' }}>
          <nav aria-label={t.trail} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 4, minHeight: hit, padding: '0 8px 0 4px', borderBottom: `1px solid ${bc.edge}`, fontSize: 12, color: bc.faint, minWidth: 0 }}>
            <button type="button" className="bref-nav" aria-label={t.back} disabled={trail.length < 2} onClick={() => goTo(trail.length - 2)} style={{ ...btn, width: hit, height: hit, flex: 'none', borderRadius: 6, display: 'grid', placeItems: 'center', opacity: trail.length < 2 ? 0.3 : 1, cursor: trail.length < 2 ? 'default' : 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace" }}>
              {trailShow.map((n, k) => {
                const at = trail.length - trailShow.length + k, last = at === trail.length - 1;
                return (
                  <span key={at} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, flex: last ? '1 1 auto' : '0 1 auto', overflow: 'hidden' }}>
                    {k > 0 ? <span aria-hidden="true">›</span> : null}
                    {last ? <span aria-current="page" style={{ color: bc.ink, overflow: 'hidden', textOverflow: 'ellipsis' }}>{nameOf(n)}.md</span>
                      : <button type="button" className="bref-nav" onClick={() => goTo(at)} style={{ ...btn, fontFamily: 'inherit', fontSize: 12, borderRadius: 4, padding: '0 2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nameOf(n)}</button>}
                  </span>
                );
              })}
            </div>
            {caret ? (
              <button type="button" className="bref-chip" aria-label={t.openLink(caret.link)} onMouseDown={keepFocus} onClick={() => openNote(caret.link)} style={{ ...btn, ...chip, flex: '0 1 auto', minWidth: 0, maxWidth: '50%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>↗ {t.open} {caret.link}</span>
              </button>
            ) : null}
          </nav>
          <div style={{ flex: wide ? 'none' : '1 1 0', height: wide ? 262 : 'auto', minHeight: 0, overflowY: 'auto', padding: wide ? '14px 22px 8px' : '12px 16px 8px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: 1.6, cursor: 'text' }}>
            {rows.map(({ text, tk, bl, st, toks, i, m, raw }) => {
              const rendered = m && cur !== i;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: st.margin, padding: bl.kind === 'callout' ? '3px 10px' : 0, borderRadius: 6, background: bl.kind === 'callout' ? bc.callout : 'transparent' }}>
                  {tk ? (
                    <button type="button" aria-pressed={tk.done} aria-label={t.taskLabel} onClick={() => toggleTask(i)} onMouseDown={keepFocus} style={{ flex: 'none', padding: '0 2px', border: 0, background: 'none', color: bc.accent, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, lineHeight: 1.6, cursor: 'pointer' }}>[{tk.done ? 'x' : ' '}]</button>
                  ) : null}
                  <div style={{ position: 'relative', flex: 1, minWidth: 0, fontFamily: st.font, fontWeight: st.weight, fontSize: wide ? st.size : st.sizeM, lineHeight: st.lh }}>
                    {rendered ? (
                      m.row < 0 ? <div aria-hidden="true" style={{ height: 6, display: 'flex', alignItems: 'center' }}><div style={{ flex: 1, borderTop: '1px solid rgba(127,127,127,.35)' }} /></div>
                        : <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(${m.cols}, minmax(0, 1fr))`, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: wide ? 14 : 13, lineHeight: '22px', background: m.row === 0 ? 'rgba(127,127,127,.12)' : 'transparent', borderRadius: m.row === 0 ? 4 : 0 }}>{tableRow(raw, m, i)}</div>
                    ) : (
                      <div aria-hidden="true" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', pointerEvents: 'none', opacity: tk && tk.done ? 0.6 : 1 }}>
                        {toks.map((k, ki) => <span key={ki} style={tokStyle(k.k)}>{k.text}</span>)}
                      </div>
                    )}
                    <textarea className="bref-saisie" rows="1" value={text} onChange={(e) => change(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
                      onFocus={(e) => { active.current = i; setCur(i); trackCaret(i, e.target); }}
                      onBlur={() => requestAnimationFrame(() => { if (!document.activeElement || !document.activeElement.classList.contains('bref-saisie')) { setCur(null); setCaret(null); } })}
                      onSelect={(e) => trackCaret(i, e.target)} onKeyUp={(e) => trackCaret(i, e.target)} onClick={(e) => { trackCaret(i, e.target); ctrlClick(e); }}
                      aria-label={t.editLine + ' ' + (i + 1)} spellCheck="false"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', boxSizing: 'border-box', margin: 0, padding: 0, border: 0, outline: 'none', resize: 'none', overflow: 'hidden', background: 'transparent', color: 'transparent', caretColor: bc.accent, font: 'inherit', letterSpacing: 'inherit', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', pointerEvents: rendered ? 'none' : 'auto' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, minHeight: wide ? 30 : 44, padding: '2px 10px', borderTop: `1px solid ${bc.edge}`, fontSize: 12 }}>
            <span style={{ color: bc.faint }}>{t.backlinks}</span>
            {backlinks.length ? backlinks.map((b) => (
              <button key={b.id} type="button" className="bref-chip" title={b.line.replace(/^[#>\s-]+/, '')} onClick={() => openNote(nameOf(b.id))} style={{ ...btn, ...chip }}>{nameOf(b.id)}</button>
            )) : <span style={{ color: bc.faint }}>{t.none}</span>}
            <span style={{ marginLeft: 'auto', color: bc.faint, fontSize: 11 }}>{t.made}</span>
          </div>
          <div style={{ flex: 'none', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, padding: '4px 10px', borderTop: `1px solid ${bc.edge}` }}>
            {tools.map((o, oi) => (
              <button key={oi} type="button" className="bref-outil" aria-label={o.label} title={o.label} onMouseDown={keepFocus} onClick={o.run} style={{ minWidth: toolSize, height: toolSize, padding: '0 6px', border: 0, borderRadius: 6, backgroundColor: 'transparent', color: o.color, fontFamily: o.font, fontWeight: o.weight, fontStyle: o.style, textDecorationLine: o.deco, fontSize: 13, cursor: 'pointer' }}>{o.glyph}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: bc.faint, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
