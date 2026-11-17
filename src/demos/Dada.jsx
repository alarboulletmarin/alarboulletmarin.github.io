// Live re-creation of Dada (Ludo, "Un seul téléphone" mode). The real engine (vendor/dada) plays both
// sides: you are seat 0, the bot is seat 2, on the 'rapide' board (40 squares, 2 horses each).
// Palette and board drawing follow src/styles.css + src/ui/board-view.ts. Timers only run while a bot
// (or an auto-move) is pending; the effect cleanup clears them on unmount.
import { useEffect, useMemo, useState } from 'react';
import { apply, createGame, legalMoves, pawnSlot } from '../../vendor/dada/engine.ts';
import { chooseMove } from '../../vendor/dada/bot.ts';
import { cellOf, geometryFor } from '../../vendor/dada/board.ts';
import { variantById } from '../../vendor/dada/variants.ts';

const TITLE = "'Baloo 2', sans-serif";
const BODY = "'Nunito', sans-serif";
const HREF = 'https://dada-kohl.vercel.app';
const VARIANT = variantById('rapide');
const GEO = geometryFor(VARIANT);
const SEATS = [0, 1, 2, 3];
const MARKS = ['●', '▲', '■', '◆'];
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const LOGO = [['D', '#e9564b', '#fff7e6', '-2deg'], ['A', '#57b26a', '#fff7e6', '1.5deg'], ['D', '#4c93d8', '#fff7e6', '-1.5deg'], ['A', '#f4c43c', '#2a1e16', '2deg']];
const PLAYERS = [
  { seat: 0, name: 'you', kind: 'local', peerId: null, connected: true },
  { seat: 2, name: 'bot', kind: 'bot', peerId: null, connected: true },
];
const ME = 0;
const BOT = 2;

const T = {
  fr: {
    tagline: 'le jeu des petits chevaux, entre amis', real: 'Jouer pour de vrai', caption: 'vrai moteur du jeu · partie rapide, 2 chevaux',
    roll: 'Lancer le dé', you: 'Toi', bot: 'Bot', board: 'Plateau de Dada',
    yourRoll: 'À toi : lance le dé', pick: 'Touche un cheval qui brille', botThinks: 'Le bot joue…', noMove: 'Aucun coup possible', one: 'Un seul coup, on le joue',
    voided: 'Trois 6 : tour annulé', rolling: 'Le dé roule…',
    win: 'Gagné !', lose: 'Perdu…', again: 'Rejouer', rolls: (n) => `${n} lancer${n > 1 ? 's' : ''}`, caps: (n) => `${n} capture${n > 1 ? 's' : ''}`,
    exit: ['tu sors un cheval', 'le bot sort un cheval'], capture: ['tu manges un cheval du bot !', 'le bot mange un de tes chevaux !'],
    finish: ['un de tes chevaux est arrivé !', 'un cheval du bot est arrivé'], advance: (n) => [`tu avances de ${n}`, `le bot avance de ${n}`],
    pass: ['rien à jouer, tu passes', 'le bot passe'], voidedNote: ['trois 6 : ton tour est annulé', 'trois 6 : le tour du bot est annulé'],
    again1: [' · tu rejoues', ' · il rejoue'], home: 'arrivés', move: (n, ex) => (ex ? 'sortir ce cheval' : `avancer de ${n}`), horse: 'Cheval',
  },
  en: {
    tagline: 'the game of little horses, among friends', real: 'Play for real', caption: 'real game engine · quick game, 2 horses',
    roll: 'Roll the die', you: 'You', bot: 'Bot', board: 'Dada board',
    yourRoll: 'Your turn: roll the die', pick: 'Tap a glowing horse', botThinks: 'The bot is playing…', noMove: 'No move possible', one: 'Only one move, playing it',
    voided: 'Three 6s: turn cancelled', rolling: 'Rolling…',
    win: 'You won!', lose: 'You lost…', again: 'Play again', rolls: (n) => `${n} roll${n !== 1 ? 's' : ''}`, caps: (n) => `${n} capture${n !== 1 ? 's' : ''}`,
    exit: ['you bring a horse out', 'the bot brings a horse out'], capture: ['you capture a bot horse!', 'the bot captures one of yours!'],
    finish: ['one of your horses is home!', 'a bot horse is home'], advance: (n) => [`you move ${n}`, `the bot moves ${n}`],
    pass: ['nothing to play, you pass', 'the bot passes'], voidedNote: ['three 6s: your turn is cancelled', 'three 6s: the bot’s turn is cancelled'],
    again1: [' · you roll again', ' · it rolls again'], home: 'home', move: (n, ex) => (ex ? 'bring this horse out' : `move ${n}`), horse: 'Horse',
  },
};

const heading = (a, b) => (Math.atan2(b.col - a.col, a.row - b.row) * 180) / Math.PI;
const star = '50,0 61,39 100,50 61,61 50,100 39,61 0,50 39,39';
const arrow = '6,4 100,50 6,96 26,50';
const pts = (s, o, k) => s.split(' ').map((p) => p.split(',').map((n, i) => o + (+n / 100) * k).join(',')).join(' ');

const newGame = () => ({ s: createGame({ players: PLAYERS, variant: VARIANT, seed: ((Math.random() * 2147483646) | 0) + 1 }), face: 1, note: '' });

// Turn the engine's structured log entries into one short sentence.
function describe(prev, next, actor, kind, t) {
  const i = actor === ME ? 0 : 1;
  const ev = next.log.filter((e) => e.seq >= (prev.logSeq ?? 0)).map((e) => e.event);
  const has = (k) => ev.find((e) => e.kind === k);
  let text = null;
  if (has('capture')) text = t.capture[i];
  else if (has('finish')) text = t.finish[i];
  else if (has('exit')) text = t.exit[i];
  else if (has('advance')) text = t.advance(has('advance').dice)[i];
  else if (has('voided')) text = t.voidedNote[i];
  else if (has('pass')) text = t.pass[i];
  if (text && kind === 'move' && next.turn === prev.turn && next.phase === 'rolling') text += t.again1[i];
  return text;
}

export default function DadaDemo({ dark, wide, lang }) {
  const t = T[lang] || T.fr;
  const [g, setG] = useState(newGame);
  const [rolling, setRolling] = useState(false);
  const s = g.s;
  const moves = useMemo(() => legalMoves(s), [s]);
  const playable = useMemo(() => new Map(moves.map((m) => [m.pawnId, m])), [moves]);
  const human = s.turn === ME;

  const act = (action, kind) => setG((cur) => {
    const r = apply(cur.s, action, cur.s.turn);
    if (r.error) return cur;
    return { s: r.state, face: r.state.dice ?? cur.face, note: describe(cur.s, r.state, cur.s.turn, kind, t) ?? cur.note };
  });

  // One effect drives every timed step: die wobble, bot rolls/moves, forced passes, single-move auto-play.
  useEffect(() => {
    if (s.phase === 'finished') return undefined;
    let ms; let fn;
    if (rolling) { ms = 320; fn = () => { setRolling(false); act({ type: 'roll' }, 'roll'); }; }
    else if (s.phase === 'rolling') {
      if (human) return undefined;
      ms = 450; fn = () => setRolling(true);
    } else if (moves.length === 0) { ms = human ? 800 : 650; fn = () => act({ type: 'pass' }, 'pass'); }
    else if (human && moves.length > 1) return undefined;
    else {
      const m = human ? moves[0] : chooseMove(s);
      ms = human ? 380 : 480; fn = () => act({ type: 'move', pawnId: m.pawnId }, 'move');
    }
    const id = setTimeout(fn, ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, rolling]);

  const offsets = useMemo(() => {
    const byCell = new Map();
    const pos = new Map();
    for (const p of s.pawns) {
      const c = cellOf(GEO, p.owner, p.steps, pawnSlot(p.id));
      pos.set(p.id, c);
      const k = `${c.col.toFixed(2)},${c.row.toFixed(2)}`;
      byCell.set(k, [...(byCell.get(k) || []), p.id]);
    }
    const out = new Map();
    for (const [k, ids] of byCell) ids.forEach((id, i) => {
      const c = pos.get(id);
      out.set(id, ids.length === 1 ? [c.col + 0.5, c.row + 0.5] : [c.col + 0.5 + (i % 2 ? 0.104 : -0.104), c.row + 0.5 + (i < 2 ? -0.078 : 0.078)]);
    });
    return out;
  }, [s.pawns]);

  const homeCount = (seat) => s.pawns.filter((p) => p.owner === seat && p.steps === GEO.lastStep).length;
  const won = s.phase === 'finished' && s.ranking[0] === ME;
  const canRoll = human && s.phase === 'rolling' && !rolling && s.phase !== 'finished';
  const status = s.phase === 'finished' ? '' : rolling ? t.rolling : !human ? t.botThinks
    : s.phase === 'rolling' ? t.yourRoll : moves.length > 1 ? t.pick : moves.length === 1 ? t.one : s.voided ? t.voided : t.noMove;

  const ink = dark ? 'rgb(242,230,210)' : 'rgb(59,42,30)';
  const rgb = dark ? '242,230,210' : '59,42,30';
  const vars = {
    '--ink': ink, '--line': `rgba(${rgb},.44)`, '--card': dark ? '#2a211a' : '#fffdf5', '--shade': dark ? '#0b0806' : '#3b2a1e', '--emboss': 'rgba(30,20,14,.18)',
    '--seat-0': '#57b26a', '--seat-1': '#f4c43c', '--seat-2': '#4c93d8', '--seat-3': '#e9564b',
    '--on-0': '#fff7e6', '--on-1': '#2a1e16', '--on-2': '#fff7e6', '--on-3': '#fff7e6',
  };
  const absent = (seat) => (seat === ME || seat === BOT ? undefined : { opacity: 0.22, filter: 'grayscale(.5)' });
  const seatFill = (seat, pct) => ({ fill: pct ? `color-mix(in srgb, var(--seat-${seat}) ${pct}%, var(--card))` : `var(--seat-${seat})` });
  const starOwner = new Map(GEO.starIndices.map((i, seat) => [i, seat]));
  const startOwner = new Map(SEATS.map((seat) => [GEO.startIndex[seat], seat]));
  const NS = { vectorEffect: 'non-scaling-stroke' };

  const board = (
    <div style={{ position: 'relative', width: wide ? 390 : '100%', maxWidth: wide ? 390 : 400, aspectRatio: '1', flex: 'none', alignSelf: 'center', borderRadius: 18, overflow: 'hidden', background: 'var(--card)', border: '3px solid var(--ink)', boxSizing: 'border-box' }}>
      <svg viewBox={`0 0 ${GEO.grid} ${GEO.grid}`} role="group" aria-label={t.board} style={{ display: 'block', width: '100%', height: '100%' }}>
        {GEO.track.map((c, i) => {
          const sOwn = startOwner.get(i);
          const base = { x: c.col, y: c.row, width: 1, height: 1 };
          if (sOwn !== undefined) {
            const next = GEO.track[(i + 1) % GEO.track.length];
            return (<g key={i} style={absent(sOwn)}><rect {...base} {...NS} style={seatFill(sOwn)} stroke="var(--ink)" strokeWidth="2.5" />
              <polygon points={pts(arrow, c.col + 0.27, 0.46)} fill={`var(--on-${sOwn})`} transform={`rotate(${heading(c, next) - 90} ${c.col + 0.5} ${c.row + 0.5})`} /></g>);
          }
          if (starOwner.has(i)) {
            const o = starOwner.get(i);
            return (<g key={i} style={absent(o)}><rect {...base} {...NS} style={seatFill(o, 24)} stroke="var(--ink)" strokeWidth="2.5" />
              <polygon points={pts(star, c.col + 0.21, 0.58)} style={{ fill: `var(--seat-${o})` }} /></g>);
          }
          return <rect key={i} {...base} {...NS} fill="var(--card)" stroke="var(--line)" strokeWidth="1.5" />;
        })}
        {SEATS.map((seat) => {
          const b = GEO.stableBox[seat];
          const ins = b.size * 0.16;
          return (<g key={`s${seat}`} style={absent(seat)}>
            <rect x={b.col} y={b.row} width={b.size} height={b.size} rx=".3" {...NS} style={seatFill(seat)} stroke="var(--ink)" strokeWidth="3" />
            <rect x={b.col + ins} y={b.row + ins} width={b.size - 2 * ins} height={b.size - 2 * ins} rx=".3" {...NS} fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
            {GEO.stableSlots[seat].map((c, k) => <circle key={k} cx={c.col + 0.5} cy={c.row + 0.5} r=".36" {...NS} fill="none" stroke={`var(--seat-${seat})`} strokeWidth="2" strokeDasharray="3 3" />)}
          </g>);
        })}
        <g>
          <rect x={GEO.center.col} y={GEO.center.row} width="1" height="1" {...NS} fill="var(--card)" stroke="var(--ink)" strokeWidth="2.5" />
          {SEATS.map((seat) => {
            const path = GEO.homePath[seat];
            return <polygon key={seat} points={`${GEO.center.col},${GEO.center.row} ${GEO.center.col + 1},${GEO.center.row} ${GEO.center.col + 0.5},${GEO.center.row + 0.5}`} style={{ fill: `var(--seat-${seat})`, ...absent(seat) }} transform={`rotate(${heading(GEO.center, path[path.length - 1])} ${GEO.center.col + 0.5} ${GEO.center.row + 0.5})`} />;
          })}
        </g>
        {SEATS.map((seat) => (<g key={`h${seat}`} style={absent(seat)}>
          {GEO.homePath[seat].map((c, k) => <rect key={k} x={c.col} y={c.row} width="1" height="1" {...NS} style={seatFill(seat, 62)} stroke="var(--ink)" strokeWidth="2" />)}
        </g>))}
        {s.pawns.map((p) => {
          const [x, y] = offsets.get(p.id);
          const m = playable.get(p.id);
          const ok = human && m && !rolling;
          const press = () => act({ type: 'move', pawnId: p.id }, 'move');
          return (
            <g key={p.id} className={ok ? 'dadad-pawn dadad-ok' : 'dadad-pawn'} style={{ transform: `translate(${x}px, ${y}px)` }} {...(ok ? { role: 'button', tabIndex: 0, 'aria-label': `${t.horse} ${pawnSlot(p.id) + 1} : ${t.move(s.dice, m.exits)}`, onClick: press, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(); } } } : { 'aria-hidden': true })}>
              {ok ? <><circle r=".82" fill="transparent" /><circle className="dadad-ring" r=".52" fill="none" stroke="var(--ink)" strokeWidth="3" {...NS} /><circle className="dadad-focus" r=".62" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" {...NS} /></> : null}
              <circle r=".4" style={{ fill: `var(--seat-${p.owner})` }} stroke="var(--ink)" strokeWidth={ok ? 3.5 : 2.5} {...NS} />
              <path d="M -.3 .12 A .31 .31 0 0 0 .22 .22 A .31 .31 0 0 0 .3 -.1 A .4 .4 0 0 1 -.3 .12 Z" fill="var(--emboss)" />
              <text y=".13" textAnchor="middle" fontSize=".38" fontWeight="800" fontFamily={BODY} style={{ fill: `var(--on-${p.owner})` }}>{MARKS[p.owner]}</text>
            </g>
          );
        })}
      </svg>
      {s.phase === 'finished' ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, textAlign: 'center', background: dark ? 'rgba(30,23,18,.88)' : 'rgba(251,242,223,.9)' }}>
          <p style={{ margin: 0, fontFamily: TITLE, fontWeight: 800, fontSize: 40, lineHeight: 1, color: won ? 'var(--seat-0)' : 'var(--seat-3)' }}>{won ? t.win : t.lose}</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{t.rolls(s.stats[ME].rolls)} · {t.caps(s.stats[ME].captures)}</p>
          <button type="button" className="dadad-btn" onClick={() => { setRolling(false); setG(newGame()); }} autoFocus style={{ minHeight: 48, padding: '6px 26px', border: '4px solid var(--ink)', borderRadius: 24, background: 'var(--seat-3)', color: '#fff7e6', boxShadow: '0 5px 0 var(--shade)', fontFamily: TITLE, fontWeight: 700, fontSize: 20, cursor: 'pointer' }}>{t.again}</button>
        </div>
      ) : null}
    </div>
  );

  const die = (
    <button type="button" className="dadad-btn" disabled={!canRoll} onClick={() => setRolling(true)} aria-label={t.roll}
      style={{ flex: 'none', width: wide ? 96 : 76, height: wide ? 96 : 76, boxSizing: 'border-box', padding: wide ? 12 : 10, border: '4px solid var(--ink)', borderRadius: 24, background: 'var(--card)', boxShadow: `0 6px 0 var(--shade)${canRoll ? ', 0 0 0 4px var(--seat-0)' : ''}`, cursor: canRoll ? 'pointer' : 'default', opacity: 1 }}>
      <span className={rolling ? 'dadad-roll' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(3, minmax(0, 1fr))', width: '100%', height: '100%' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => <span key={k} style={{ display: 'grid', placeItems: 'center' }}><span style={{ width: '62%', aspectRatio: '1', borderRadius: '50%', background: 'var(--ink)', opacity: PIPS[g.face].includes(k) ? 1 : 0 }} /></span>)}
      </span>
    </button>
  );

  const chip = (seat, label) => (
    <span aria-current={s.turn === seat && s.phase !== 'finished' ? 'true' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', border: '2.5px solid var(--ink)', borderRadius: 999, background: s.turn === seat && s.phase !== 'finished' ? `var(--seat-${seat})` : 'transparent', color: s.turn === seat && s.phase !== 'finished' ? `var(--on-${seat})` : 'inherit', fontFamily: TITLE, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
      <span aria-hidden="true">{MARKS[seat]}</span>{label}<span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 12, opacity: 0.8 }} aria-label={`${homeCount(seat)}/2 ${t.home}`}>{homeCount(seat)}/2</span>
    </span>
  );

  const info = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{chip(ME, t.you)}{chip(BOT, t.bot)}</div>
      <p aria-live="polite" style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.25, minHeight: wide ? 38 : 0 }}>{status}</p>
      <p aria-live="polite" style={{ margin: 0, fontWeight: 600, fontSize: 13, lineHeight: 1.3, opacity: 0.75, minHeight: wide ? 34 : 17 }}>{g.note ? g.note.charAt(0).toUpperCase() + g.note.slice(1) : ''}</p>
    </div>
  );

  const link = (
    <a className="dadad-btn" href={HREF} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '4px 18px', boxSizing: 'border-box', border: '4px solid var(--ink)', borderRadius: 24, background: 'var(--seat-3)', color: '#fff7e6', boxShadow: '0 4px 0 var(--shade)', textDecoration: 'none', fontFamily: TITLE, fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>{t.real} ↗</a>
  );

  const logo = (
    <div aria-label="Dada" role="img" style={{ display: 'flex', gap: 4, flex: 'none' }}>
      {LOGO.map(([c, bg, fg, rot], i) => <span key={i} style={{ display: 'grid', placeItems: 'center', width: 30, height: 36, boxSizing: 'border-box', border: '3px solid var(--ink)', borderRadius: 10, boxShadow: '0 3px 0 var(--shade)', background: bg, color: fg, fontFamily: TITLE, fontWeight: 800, fontSize: 21, lineHeight: 1, transform: `rotate(${rot})` }}>{c}</span>)}
    </div>
  );

  return (
    <div style={{ ...vars, color: 'var(--ink)', fontFamily: BODY, flex: '1 1 0', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', gap: wide ? 12 : 10, overflowY: wide ? 'visible' : 'auto', overflowX: 'hidden', padding: wide ? 0 : '2px 2px 8px' }}>
      <style>{`
        .dadad-btn{transition:transform .08s ease,box-shadow .08s ease}
        .dadad-btn:not(:disabled):active{transform:translateY(4px)}
        .dadad-pawn{transition:transform .26s ease-out}
        .dadad-ok{cursor:pointer;outline:none}
        .dadad-ok:hover .dadad-ring{opacity:1}
        .dadad-ring{transform-box:fill-box;transform-origin:center;animation:dadad-pulse 1.2s ease-in-out infinite}
        .dadad-focus{opacity:0}
        .dadad-ok:focus-visible .dadad-focus{opacity:1}
        .dadad-roll{animation:dadad-wobble .18s ease-in-out infinite}
        @keyframes dadad-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.22);opacity:.35}}
        @keyframes dadad-wobble{0%{transform:rotate(0) scale(1)}30%{transform:rotate(-14deg) scale(1.06)}60%{transform:rotate(10deg) scale(.97)}100%{transform:rotate(0) scale(1)}}
        @media (prefers-reduced-motion: reduce){.dadad-pawn,.dadad-btn{transition:none}.dadad-ring,.dadad-roll{animation:none}}
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: wide ? 14 : 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {logo}
          <p style={{ margin: 0, fontFamily: TITLE, fontWeight: 700, fontSize: wide ? 15 : 13, lineHeight: 1.2, opacity: 0.8 }}>{t.tagline}</p>
        </div>
        {wide ? link : null}
      </div>
      {wide ? (
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', minWidth: 0 }}>
          {board}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, flex: 1, minWidth: 0 }}>
            {die}
            {info}
            <span style={{ fontSize: 11, opacity: 0.6 }}>{t.caption}</span>
          </div>
        </div>
      ) : (
        <>
          {board}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>{die}{info}</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, opacity: 0.6, flex: '1 1 120px' }}>{t.caption}</span>
            {link}
          </div>
        </>
      )}
    </div>
  );
}
