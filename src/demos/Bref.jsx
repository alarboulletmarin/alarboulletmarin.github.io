import { useRef, useState } from 'react';

// Live re-creation of Bref's editor: every line is one surface, the styled render below, the transparent input above.

const TXT = {
  fr: { editLine: 'Ligne en cours d’édition', taskLabel: 'Cocher ou décocher', words: 'mots', chars: 'caractères',
    tools: { b: 'Gras', i: 'Italique', s: 'Barré', h: 'Surligné', c: 'Code', l: 'Lien', t: 'Case à cocher' } },
  en: { editLine: 'Line being edited', taskLabel: 'Toggle the task', words: 'words', chars: 'characters',
    tools: { b: 'Bold', i: 'Italic', s: 'Strikethrough', h: 'Highlight', c: 'Code', l: 'Link', t: 'Checkbox' } },
};
const NOTE = {
  fr: ['# Voyage à Lisbonne', 'Trois jours en **mai**, arrivée un *jeudi*. Le budget et les réservations sont dans [[Budget 2026]], les idées portent le tag #voyage.', '> [!TIP] Réserver le train pour Sintra la ==veille==.', '## À réserver', '- [x] Vols', '- [ ] Hôtel près de l’Alfama', '- [ ] Excursion à Sintra', ''],
  en: ['# Trip to Lisbon', 'Three days in **May**, flying in on a *Thursday*. Budget and bookings live in [[Budget 2026]], ideas are tagged #travel.', '> [!TIP] Book the Sintra train the ==evening before==.', '## To book', '- [x] Flights', '- [ ] Hotel near Alfama', '- [ ] Day trip to Sintra', ''],
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

export default function BrefDemo({ dark, wide, lang }) {
  const t = TXT[lang];
  const [stored, setStored] = useState(null);
  const root = useRef(null);
  const active = useRef(null);
  const lines = () => (stored ? stored.slice() : NOTE[lang].slice());
  const L = lines();

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
  const setLines = (ls, focus) => { setStored(ls); if (focus) focusLine(focus[0], focus[1], focus[2]); };
  const change = (i, value) => {
    const ls = lines();
    const parts = value.split('\n');
    ls[i] = withText(ls[i], parts[0]);
    // a multi-line paste becomes several lines
    if (parts.length > 1) { ls.splice(i + 1, 0, ...parts.slice(1)); setLines(ls, [i + parts.length - 1]); }
    else setStored(ls);
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
    setStored(ls);
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
  const onKey = (i, e) => {
    const el = e.target, v = el.value, a = el.selectionStart, b = el.selectionEnd;
    const ls = lines();
    const raw = ls[i], tk = taskOf(raw);
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter' && tk) { e.preventDefault(); toggleTask(i); return; }
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
      const m = /^(- |> )/.exec(v);
      if (m && v === m[1]) { ls[i] = ''; setLines(ls, [i, 0]); return; }
      const prefix = m ? m[1] : '';
      ls[i] = v.slice(0, a);
      ls.splice(i + 1, 0, prefix + v.slice(b));
      setLines(ls, [i + 1, prefix.length]);
    } else if (e.key === 'Backspace' && a === 0 && b === 0) {
      if (tk) { e.preventDefault(); ls[i] = v; setLines(ls, [i, 0]); return; }
      if (i === 0) return;
      e.preventDefault();
      const prevText = textOf(ls[i - 1]);
      ls[i - 1] = withText(ls[i - 1], prevText + v);
      ls.splice(i, 1);
      setLines(ls, [i - 1, prevText.length]);
    } else if (e.key === 'Delete' && a === v.length && b === a && i < ls.length - 1) {
      e.preventDefault();
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

  const bc = dark
    ? { chrome: '#1B1A19', paper: '#242321', ink: '#E8E6E3', faint: '#7C776F', accent: '#D58B62', callout: '#1F2B21', hl: '#5A4A1C', edge: 'rgba(255, 255, 255, 0.08)' }
    : { chrome: '#EDE9E0', paper: '#FBFAF8', ink: '#2B2A28', faint: '#A39E95', accent: '#9B4824', callout: '#E4EFE1', hl: '#F3E3A0', edge: 'rgba(0, 0, 0, 0.07)' };
  // the render keeps exactly the input's metrics: bold by stroke, synthesized italic, code without changing font
  const tokStyle = (k) => ({
    color: k === 'mark' ? bc.faint : (k === 'link' || k === 'tag') ? bc.accent : 'inherit',
    WebkitTextStroke: k === 'bold' ? '0.5px currentColor' : '0', fontStyle: k === 'ital' ? 'italic' : 'inherit',
    textDecorationLine: k === 'strike' ? 'line-through' : 'none',
    background: k === 'hl' ? bc.hl : k === 'code' ? 'rgba(127, 127, 127, 0.16)' : 'transparent', borderRadius: 3,
  });
  const rows = L.map((raw, i) => {
    const tk = taskOf(raw);
    const text = textOf(raw);
    const bl = tk ? { kind: 'task', prefix: '', body: text } : blockOf(raw);
    const st = LINE_STYLE[bl.kind] || LINE_STYLE.p;
    let toks = [];
    if (bl.prefix) toks.push({ k: 'mark', text: bl.prefix });
    toks = toks.concat(inlineTokens(bl.body));
    if (tk && tk.done) toks = toks.map((x) => (x.k === 'text' ? { k: 'strike', text: x.text } : x));
    // an invisible char keeps the height of an empty line and of a trailing space
    toks.push({ k: 'text', text: '​' });
    return { raw, text, tk, bl, st, toks, i };
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
  const toolSize = wide ? 28 : 40;
  const ico = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 };
  const ctl = { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };

  return (
    <div ref={root} style={{ flex: wide ? 'none' : '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', borderRadius: 12, background: bc.chrome, border: `1px solid ${bc.edge}`, boxShadow: '0 24px 60px rgba(0, 0, 0, 0.16)', overflow: 'hidden', color: bc.ink }}>
      <style>{`.bref-outil:hover{background-color:rgba(127,127,127,.12)}.bref-saisie::selection{background:rgba(155,72,36,.28);color:transparent}.bref-saisie:focus{outline:none}`}</style>
      <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, height: 32, padding: '0 14px', color: bc.faint }}>
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
          <div style={{ flex: wide ? 'none' : '1 1 0', height: wide ? 300 : 'auto', minHeight: 0, overflowY: 'auto', padding: wide ? '18px 22px 10px' : '16px 16px 10px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: 1.6, cursor: 'text' }}>
            {rows.map(({ text, tk, bl, st, toks, i }) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: st.margin, padding: bl.kind === 'callout' ? '3px 10px' : 0, borderRadius: 6, background: bl.kind === 'callout' ? bc.callout : 'transparent' }}>
                {tk ? (
                  <button type="button" aria-pressed={tk.done} aria-label={t.taskLabel} onClick={() => toggleTask(i)} onMouseDown={keepFocus} style={{ flex: 'none', padding: '0 2px', border: 0, background: 'none', color: bc.accent, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, lineHeight: 1.6, cursor: 'pointer' }}>[{tk.done ? 'x' : ' '}]</button>
                ) : null}
                <div style={{ position: 'relative', flex: 1, minWidth: 0, fontFamily: st.font, fontWeight: st.weight, fontSize: wide ? st.size : st.sizeM, lineHeight: st.lh }}>
                  <div aria-hidden="true" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', pointerEvents: 'none', opacity: tk && tk.done ? 0.6 : 1 }}>
                    {toks.map((k, ki) => <span key={ki} style={tokStyle(k.k)}>{k.text}</span>)}
                  </div>
                  <textarea className="bref-saisie" rows="1" value={text} onChange={(e) => change(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onFocus={() => { active.current = i; }} aria-label={t.editLine + ' ' + (i + 1)} spellCheck="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', boxSizing: 'border-box', margin: 0, padding: 0, border: 0, outline: 'none', resize: 'none', overflow: 'hidden', background: 'transparent', color: 'transparent', caretColor: bc.accent, font: 'inherit', letterSpacing: 'inherit', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, padding: '6px 10px', borderTop: `1px solid ${bc.edge}` }}>
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
