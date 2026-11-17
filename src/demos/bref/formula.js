// A small port of Bref's table formulas (src/logic/formula.rs): =B*C, =sum(above), =avg(B1:B9), =round(B/C, 2),
// =if(B>10, "big", "small"). Rows are numbered from the first row under the header (grid row 0 is the header).
// Functions: sum avg/average min max count round abs if. Operators: + - * / ^ % and comparisons.

export const isFormula = (text) => /^=[^=]/.test(text.trim());

// "1 234,5", "1,234.5", "12.50 €", "15%": same reading as the app (a single separator is the decimal one)
export function readNumber(text) {
  let s = text.replace(/[\s   €$£¥]/g, '');
  const pct = s.endsWith('%');
  if (pct) s = s.slice(0, -1);
  const neg = /^[-−]/.test(s);
  if (neg || s[0] === '+') s = s.slice(1);
  if (!/\d/.test(s) || /[^\d.,]/.test(s)) return null;
  const dots = (s.match(/\./g) || []).length, commas = (s.match(/,/g) || []).length;
  let dec = null;
  if (dots && commas) dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
  else if (dots === 1) dec = '.';
  else if (commas === 1) dec = ',';
  const at = dec ? s.lastIndexOf(dec) : -1;
  const int = at < 0 ? s : s.slice(0, at), frac = at < 0 ? '' : s.slice(at + 1);
  const g = int.match(/[.,]/);
  if (g) {
    const parts = int.split(g[0]);
    if (!(parts[0].length >= 1 && parts[0].length <= 3 && /^\d+$/.test(parts[0]) && parts.slice(1).every((p) => /^\d{3}$/.test(p)))) return null;
  }
  if (/[.,]/.test(frac)) return null;
  const v = parseFloat(int.replace(/[.,]/g, '') + '.' + frac);
  if (Number.isNaN(v)) return null;
  return (neg ? -1 : 1) * (pct ? v / 100 : v);
}

export function show(x, decimal) {
  if (!isFinite(x)) return '#ERR';
  if (Math.abs(x) >= 1e15) return x.toExponential().replace('.', decimal);
  let t = (Math.round(x * 1e9) / 1e9).toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
  if (t === '-0') t = '0';
  return t.replace('.', decimal);
}

const fail = (msg) => { throw new Error(msg); };
const colIndex = (L) => [...L.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
const EMPTY = { t: 'e' };

function lex(src) {
  const out = [];
  const re = /\s*(\d+(?:\.\d+)?|\.\d+|"[^"]*"|[A-Za-z_]\w*|<>|<=|>=|[-+*/^%(),;:=<>])/y;
  for (let i = 0; i < src.length && src.slice(i).trim(); i = re.lastIndex) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) fail('Syntax');
    out.push(m[1]);
  }
  return out;
}

// AST: ['n',v] ['s',v] ['ref',word] ['range',a,b] ['bin',op,a,b] ['neg',a] ['call',name,args]
function parse(src) {
  const tk = lex(src);
  let p = 0;
  const peek = () => tk[p], next = () => tk[p++];
  const starts = (t) => t !== undefined && /^(\d|\.\d|"|[A-Za-z_]|\()/.test(t);
  const cmp = () => {
    let a = sum();
    while (['=', '<>', '<', '<=', '>', '>='].includes(peek())) { const op = next(); a = ['bin', op, a, sum()]; }
    return a;
  };
  const sum = () => { let a = prod(); while (peek() === '+' || peek() === '-') { const op = next(); a = ['bin', op, a, prod()]; } return a; };
  // `15%` is a hundredth, `7 % 3` a remainder
  const prod = () => {
    let a = unary();
    while (peek() === '*' || peek() === '/' || (peek() === '%' && starts(tk[p + 1]))) { const op = next(); a = ['bin', op, a, unary()]; }
    return a;
  };
  const unary = () => (peek() === '-' ? (next(), ['neg', unary()]) : peek() === '+' ? (next(), unary()) : pow());
  const pow = () => { const a = atom(); return peek() === '^' ? (next(), ['bin', '^', a, unary()]) : a; };
  const atom = () => {
    const t = next();
    if (t === undefined) fail('Syntax');
    if (t === '(') { const v = cmp(); if (next() !== ')') fail('Syntax'); return v; }
    if (/^(\d|\.\d)/.test(t)) {
      let v = parseFloat(t);
      if (peek() === '%' && !starts(tk[p + 1])) { next(); v /= 100; }
      return ['n', v];
    }
    if (t[0] === '"') return ['s', t.slice(1, -1)];
    if (!/^[A-Za-z_]/.test(t)) fail('Syntax');
    if (peek() === '(') {
      next();
      const args = [];
      if (peek() === ')') next();
      else for (;;) { args.push(cmp()); const s = next(); if (s === ',' || s === ';') continue; if (s === ')') break; fail('Syntax'); }
      return ['call', t.toLowerCase(), args];
    }
    if (peek() === ':') { next(); return ['range', t, next() || fail('Syntax')]; }
    return ['ref', t];
  };
  const tree = cmp();
  if (p < tk.length) fail('Syntax');
  return tree;
}

// Evaluates every formula of a grid (grid[0] is the header). Returns { 'r,c': text } for each formula cell:
// the result, or '#ERR' with the reason in errors['r,c'].
export function evaluate(grid, decimal) {
  const memo = new Map(), busy = new Set(), shown = {}, errors = {};
  const cellAt = (r, c) => {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[r].length) fail('Range');
    const key = r + ',' + c;
    if (memo.has(key)) return memo.get(key);
    const text = grid[r][c].trim();
    let held;
    if (isFormula(text)) {
      if (busy.has(key)) fail('Cycle');
      busy.add(key);
      try { held = one(ev(parse(text.slice(1)), r, c)); } finally { busy.delete(key); }
    } else if (!text) held = EMPTY;
    else { const n = readNumber(text); held = n == null ? { t: 's', v: text } : { t: 'n', v: n }; }
    memo.set(key, held);
    return held;
  };
  const one = (it) => (it.many ? (it.many.length === 1 ? it.many[0] : fail('Range')) : it);
  const num = (it) => { const h = one(it); return h.t === 'n' ? h.v : h.t === 'e' ? 0 : fail('NotANumber'); };
  const N = (v) => (isFinite(v) ? { t: 'n', v } : fail('DivideByZero'));
  const nums = (items) => items.flatMap((it) => (it.many ? it.many.filter((h) => h.t === 'n').map((h) => h.v) : it.t === 'n' ? [it.v] : it.t === 'e' ? [] : fail('NotANumber')));
  const point = (w, r0) => { const m = /^([A-Za-z]+)(\d*)$/.exec(w); if (!m) fail('Name'); return [m[2] ? +m[2] : r0, colIndex(m[1])]; };
  const ev = (n, r0, c0) => {
    switch (n[0]) {
      case 'n': return { t: 'n', v: n[1] };
      case 's': return { t: 's', v: n[1] };
      case 'neg': return N(-num(ev(n[1], r0, c0)));
      case 'ref': {
        const w = n[1].toLowerCase();
        if (w === 'above') return { many: Array.from({ length: Math.max(0, r0 - 1) }, (_, i) => cellAt(i + 1, c0)) };
        if (w === 'left') return { many: Array.from({ length: c0 }, (_, i) => cellAt(r0, i)) };
        if (w === 'column') return { many: grid.map((_, r) => r).filter((r) => r > 0 && r !== r0).map((r) => cellAt(r, c0)) };
        return cellAt(...point(n[1], r0));
      }
      case 'range': {
        const [ra, ca] = point(n[1], r0), [rb, cb] = point(n[2], r0), cells = [];
        for (let r = Math.min(ra, rb); r <= Math.max(ra, rb); r++) for (let c = Math.min(ca, cb); c <= Math.max(ca, cb); c++) cells.push(cellAt(r, c));
        return { many: cells };
      }
      case 'bin': {
        const op = n[1], a = ev(n[2], r0, c0), b = ev(n[3], r0, c0);
        if (['=', '<>', '<', '<=', '>', '>='].includes(op)) {
          const x = one(a), y = one(b), text = x.t === 's' || y.t === 's';
          const xv = text ? String(x.v ?? '') : x.v || 0, yv = text ? String(y.v ?? '') : y.v || 0, k = xv < yv ? -1 : xv > yv ? 1 : 0;
          return { t: 'n', v: { '=': k === 0, '<>': k !== 0, '<': k < 0, '<=': k <= 0, '>': k > 0, '>=': k >= 0 }[op] ? 1 : 0 };
        }
        const x = num(a), y = num(b);
        if ((op === '/' || op === '%') && !y) fail('DivideByZero');
        return N(op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : op === '/' ? x / y : op === '%' ? x % y : Math.pow(x, y));
      }
      default: return call(n[1], n[2], r0, c0);
    }
  };
  const call = (name, args, r0, c0) => {
    const all = () => args.map((a) => ev(a, r0, c0));
    const arity = (ok) => ok || fail('Arguments');
    switch (name) {
      case 'sum': return N(nums(all()).reduce((a, b) => a + b, 0));
      case 'count': return N(nums(all()).length);
      case 'avg': case 'average': case 'min': case 'max': {
        const v = nums(all());
        if (!v.length) fail('NoNumbers');
        return N(name === 'min' ? Math.min(...v) : name === 'max' ? Math.max(...v) : v.reduce((a, b) => a + b, 0) / v.length);
      }
      case 'abs': arity(args.length === 1); return N(Math.abs(num(ev(args[0], r0, c0))));
      case 'round': {
        arity(args.length === 1 || args.length === 2);
        const x = num(ev(args[0], r0, c0)), d = args[1] ? Math.max(-15, Math.min(15, num(ev(args[1], r0, c0)))) : 0, k = Math.pow(10, Math.trunc(d));
        return N(Math.round(x * k) / k);
      }
      case 'if': { // only the branch taken is computed
        arity(args.length === 2 || args.length === 3);
        const c = one(ev(args[0], r0, c0)), on = c.t === 'n' ? c.v !== 0 : c.t === 's' && c.v !== '';
        return on ? ev(args[1], r0, c0) : args[2] ? ev(args[2], r0, c0) : EMPTY;
      }
      default: return fail('Name');
    }
  };
  grid.forEach((row, r) => row.forEach((text, c) => {
    if (!isFormula(text)) return;
    const key = r + ',' + c;
    try { const h = one(ev(parse(text.trim().slice(1)), r, c)); shown[key] = h.t === 'n' ? show(h.v, decimal) : h.t === 's' ? h.v : ''; }
    catch (e) { shown[key] = '#ERR'; errors[key] = e.message; }
  }));
  return { shown, errors };
}
