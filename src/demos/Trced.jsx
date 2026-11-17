// Re-created from trced's ds tokens, HabitGrid, race ListView/format,
// journal DayView and urge Question. Demo data stays in React memory.
import { useId, useMemo, useState } from 'react';

const APPS = ['habit.', 'race.', 'journal.', 'urge.'];
const WORDS = {
  fr: { made: 'données inventées · session temporaire', week: '16 — 22 novembre 2026', habit: 'Habitude', add: 'Ajouter', newHabit: 'Une nouvelle habitude', count: 'jours cochés', days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], names: ['marcher', 'lire', 'étirements'], done: 'effectué', todo: 'à faire', race: 'Nouvelle course', date: 'Date', name: 'Nom', distance: 'Distance (km)', time: 'Temps (h:mm:ss)', cancel: 'Annuler', save: 'Enregistrer', invalid: 'Saisissez une durée positive : mm:ss ou h:mm:ss (minutes et secondes de 00 à 59).', races: ['Les quais', 'La boucle des bois', 'Le tour du lac'], journal: 'lundi 16 novembre', text: 'Le texte', entry: 'Sortir avant que la ville se réveille. Le froid sur les mains, puis la lumière sur le fleuve. Rien de particulier. Assez pour aujourd’hui.', words: 'mots', place: 'Lieu', mood: 'Humeur', calm: 'calme', question: 'Trente jours plus tard, cette envie compte encore ?', object: 'Un casque neuf', why: '« Celui que j’ai fonctionne encore. »', answers: ['Oui', 'Non', 'Autrement'], answered: 'Réponse enregistrée', reset: 'Recommencer', day: '30 jours · 17 oct. → 16 nov.', limit: '8 habitudes maximum dans cette démo', raceLimit: '8 courses maximum dans cette démo' },
  en: { made: 'made-up data · temporary session', week: '16 — 22 November 2026', habit: 'Habit', add: 'Add', newHabit: 'A new habit', count: 'days ticked', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], names: ['walk', 'read', 'stretch'], done: 'done', todo: 'to do', race: 'New race', date: 'Date', name: 'Name', distance: 'Distance (km)', time: 'Time (h:mm:ss)', cancel: 'Cancel', save: 'Save', invalid: 'Enter a positive time: mm:ss or h:mm:ss (minutes and seconds from 00 to 59).', races: ['The riverside', 'The woodland loop', 'Around the lake'], journal: 'Monday, November 16', text: 'The text', entry: 'Out before the city wakes up. Cold hands, then light on the river. Nothing special. Enough for today.', words: 'words', place: 'Place', mood: 'Mood', calm: 'calm', question: 'Thirty days later, does this urge still matter?', object: 'New headphones', why: '“The ones I have still work.”', answers: ['Yes', 'No', 'Differently'], answered: 'Answer recorded', reset: 'Start again', day: '30 days · Oct 17 → Nov 16', limit: '8 habits maximum in this demo', raceLimit: '8 races maximum in this demo' },
};
const pad = (n) => String(n).padStart(2, '0');
const seconds = (raw) => raw.split(':').reduce((n, part) => n * 60 + Number(part), 0);
const duration = (total) => total >= 3600 ? `${Math.floor(total / 3600)}h${pad(Math.floor(total % 3600 / 60))}:${pad(total % 60)}` : `${Math.floor(total / 60)}:${pad(total % 60)}`;
const pace = (total, km) => { const n = Math.round(total / km); return `${Math.floor(n / 60)}:${pad(n % 60)}/km`; };
const seedRaces = [
  { id: 0, date: '2026-11-15', km: 10, seconds: 2832 },
  { id: 1, date: '2026-10-25', km: 21.1, seconds: 6225 },
  { id: 2, date: '2026-09-13', km: 5, seconds: 1330 },
];

export default function TrcedDemo({ tr, dark = false, wide = false, lang = 'fr' }) {
  const t = WORDS[lang] || WORDS.fr;
  const id = useId();
  const [app, setApp] = useState('habit.');
  const [habits, setHabits] = useState(() => [0, 1, 2].map((id) => ({ id, days: [[true, true, false, true, true, false, false], [true, false, true, true, false, true, false], [false, true, false, true, false, false, false]][id] })));
  const [habitName, setHabitName] = useState('');
  const [races, setRaces] = useState(seedRaces);
  const [raceForm, setRaceForm] = useState(false);
  const [error, setError] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [journal, setJournal] = useState({});
  const totals = useMemo(() => habits.map((h) => h.days.filter(Boolean).length), [habits]);
  const sortedRaces = useMemo(() => [...races].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id), [races]);
  const entry = journal[lang] ?? t.entry;
  const wordCount = useMemo(() => entry.trim().split(/\s+/u).filter(Boolean).length, [entry]);
  const c = dark ? { bg: '#121311', ink: '#ecebe6', muted: '#8e9089', rule: '#34362f', dot: '#93a58c' } : { bg: '#f2f3f2', ink: '#17181a', muted: '#6a6c6a', rule: '#c8cac8', dot: '#5f6e59' };
  const rule = `1px solid ${c.rule}`;
  const button = { minHeight: 44, padding: '8px 12px', border: rule, background: 'transparent', color: c.ink, font: 'inherit', cursor: 'pointer' };
  const input = { width: '100%', minWidth: 0, minHeight: 44, padding: '8px', border: rule, borderRadius: 0, color: c.ink, background: c.bg, font: 'inherit', boxSizing: 'border-box' };
  const meta = { color: c.muted, fontSize: 11, lineHeight: 1.5 };
  const habitLabel = (h) => h.name ?? t.names[h.id];
  function addHabit(e) {
    e.preventDefault();
    if (!habitName.trim() || habits.length >= 8) return;
    setHabits((prev) => [...prev, { id: prev.length, name: habitName.trim(), days: Array(7).fill(false) }]);
    setHabitName('');
  }
  function addRace(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const time = String(form.get('time')).trim();
    if (!/^(?:\d+:)?[0-5]?\d:[0-5]\d$/.test(time) || seconds(time) <= 0) { setError(true); return; }
    const name = String(form.get('name')).trim();
    if (!name || races.length >= 8) return;
    setRaces((prev) => [...prev, { id: prev.length, name, date: String(form.get('date')), km: Number(form.get('km')), seconds: seconds(time) }]);
    setRaceForm(false); setError(false);
  }
  return (
    <div className="trced-demo" style={{ flex: '1 1 0', minHeight: 0, minWidth: 0, width: '100%', maxHeight: wide ? 460 : undefined, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: c.ink }}>
      <style>{`.trced-demo button:hover{opacity:.72}.trced-demo button:focus-visible,.trced-demo input:focus-visible,.trced-demo textarea:focus-visible{outline:2px dashed currentColor;outline-offset:-3px}.trced-demo button:disabled{opacity:.45;cursor:default}.trced-demo th,.trced-demo td{padding:0}.trced-demo input::-webkit-calendar-picker-indicator{cursor:pointer}`}</style>
      <p style={{ margin: 0, fontSize: wide ? 20 : 17, letterSpacing: '-.02em' }}>{tr.tagline}</p>
      <div style={{ background: c.bg, border: rule, display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 0', colorScheme: dark ? 'dark' : 'light' }}>
        <div role="tablist" aria-label="trced." style={{ display: 'flex', borderBottom: rule, flexShrink: 0 }}>
          {APPS.map((name, i) => <button key={name} id={`${id}-tab-${i}`} role="tab" aria-selected={app === name} aria-controls={`${id}-panel`} tabIndex={app === name ? 0 : -1} onKeyDown={(e) => {
            const next = e.key === 'ArrowRight' ? (i + 1) % 4 : e.key === 'ArrowLeft' ? (i + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1;
            if (next < 0) return;
            e.preventDefault(); setApp(APPS[next]); document.getElementById(`${id}-tab-${next}`)?.focus();
          }} onClick={() => setApp(name)} style={{ ...button, padding: '8px 4px', flex: 1, border: 0, boxShadow: app === name ? `inset 0 -2px ${c.ink}` : 'none', color: app === name ? c.ink : c.muted }}>{name}</button>)}
        </div>
        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${APPS.indexOf(app)}`} style={{ overflow: 'auto', minHeight: 0, padding: wide ? '12px 16px' : 12, flex: '1 1 auto' }}>
          {app === 'habit.' && <>
            <div style={{ ...meta, marginBottom: 8 }}>{t.week}</div>
            <div tabIndex={0} role="region" aria-label={t.habit} style={{ overflowX: 'auto', borderTop: `1px solid ${c.ink}` }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 404, tableLayout: 'fixed', textAlign: 'center' }}>
                <thead><tr><th scope="col" style={{ width: 96, textAlign: 'left', fontSize: 11, fontWeight: 400 }}>{t.habit}</th>{t.days.map((d, i) => <th key={i} scope="col" style={{ fontWeight: 400, height: 44, color: c.muted, fontSize: 11 }}>{d}<br /><span style={{ color: c.ink }}>{16 + i}</span></th>)}</tr></thead>
                <tbody>{habits.map((h, hi) => <tr key={h.id} style={{ borderTop: rule }}><th scope="row" style={{ textAlign: 'left', fontWeight: 400, paddingRight: 8 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={habitLabel(h)}>{habitLabel(h)}</span><span style={meta}>{totals[hi]}/7</span></th>{h.days.map((done, di) => <td key={di}><button aria-pressed={done} aria-label={`${habitLabel(h)}, ${16 + di}/11/2026, ${done ? t.done : t.todo}`} onClick={() => setHabits((prev) => prev.map((row) => row.id === h.id ? { ...row, days: row.days.map((v, index) => index === di ? !v : v) } : row))} style={{ ...button, padding: 0, border: 0, width: '100%', minWidth: 44, color: done ? c.dot : c.muted, fontSize: 22 }}>{done ? '●' : '·'}</button></td>)}</tr>)}</tbody>
              </table>
            </div>
            <form onSubmit={addHabit} style={{ display: 'flex', gap: 8, marginTop: 12 }}><input aria-label={t.newHabit} placeholder={`+ ${t.newHabit}`} style={input} value={habitName} maxLength={40} onChange={(e) => setHabitName(e.target.value)} disabled={habits.length >= 8} /><button style={button} disabled={!habitName.trim() || habits.length >= 8}>{t.add}</button></form>
            {habits.length >= 8 && <p style={meta}>{t.limit}</p>}
          </>}
          {app === 'race.' && (raceForm ? <form onSubmit={addRace}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
              {[[t.name, 'name', 'text'], [t.date, 'date', 'date'], [t.distance, 'km', 'number'], [t.time, 'time', 'text']].map(([label, name, type]) => <label key={name} style={{ ...meta, minWidth: 0 }}>{label}<input name={name} aria-label={label} type={type} required maxLength={name === 'name' ? 60 : undefined} min={name === 'km' ? '.1' : undefined} max={name === 'km' ? '1000' : undefined} step={name === 'km' ? '.1' : undefined} defaultValue={name === 'date' ? '2026-11-16' : ''} placeholder={name === 'time' ? '45:00' : name === 'km' ? '10' : ''} style={input} aria-describedby={name === 'time' && error ? `${id}-error` : undefined} aria-invalid={name === 'time' && error ? true : undefined} onChange={() => setError(false)} /></label>)}
            </div>
            {error && <p id={`${id}-error`} role="alert" style={meta}>{t.invalid}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button style={button}>{t.save}</button><button type="button" style={button} onClick={() => { setRaceForm(false); setError(false); }}>{t.cancel}</button></div>
          </form> : <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${c.ink}` }}><span>2026</span><button style={{ ...button, border: 0 }} disabled={races.length >= 8} onClick={() => setRaceForm(true)}>+ {t.race}</button></div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>{sortedRaces.map((r) => <li key={r.id} style={{ borderBottom: rule, padding: '10px 0', display: 'grid', gridTemplateColumns: '12px minmax(0,1fr)', gap: 8 }}><span aria-hidden="true">●</span><div><div style={{ overflowWrap: 'anywhere' }}>{r.name ?? t.races[r.id]}</div><div style={{ fontSize: 12, marginTop: 3 }}>{new Intl.NumberFormat(lang).format(r.km)} km · {duration(r.seconds)} · {pace(r.seconds, r.km)}</div><div style={meta}>{new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${r.date}T12:00:00`))}</div></div></li>)}</ul>
            {races.length >= 8 && <p style={meta}>{t.raceLimit}</p>}
          </>)}
          {app === 'journal.' && <>
            <div style={{ fontSize: 18, letterSpacing: '-.02em', padding: '8px 0 12px', borderBottom: `1px solid ${c.ink}` }}>{t.journal}</div>
            <label style={{ ...meta, display: 'block', marginTop: 12 }}>{t.text}<textarea aria-label={t.text} value={entry} maxLength={1500} onChange={(e) => setJournal((prev) => ({ ...prev, [lang]: e.target.value }))} style={{ ...input, display: 'block', resize: 'vertical', height: wide ? 100 : 160, marginTop: 4, lineHeight: 1.7 }} /></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', ...meta, paddingTop: 12 }}><span>{wordCount} {t.words}</span><span>{t.mood} · {t.calm}</span><span>{t.place} · Lyon</span></div>
          </>}
          {app === 'urge.' && <>
            <div style={meta}>{t.day}</div><p style={{ fontSize: 18, margin: '12px 0 8px' }}>{t.object}</p><p style={meta}>{t.why}</p>
            {answer === null ? <><p style={{ fontSize: 16, lineHeight: 1.5 }}>{t.question}</p><div style={{ display: 'flex', gap: 8 }}>{t.answers.map((a, i) => <button key={a} style={{ ...button, flex: 1, padding: '8px 4px' }} onClick={() => setAnswer(i)}>{a}</button>)}</div></> : <div role="status"><p>{t.answered} · {t.answers[answer]}</p><button style={button} onClick={() => setAnswer(null)}>{t.reset}</button></div>}
          </>}
        </div>
        <div style={{ ...meta, padding: '6px 12px', borderTop: rule, fontSize: 10, flexShrink: 0 }}>{t.made}</div>
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: wide ? 10 : 11, lineHeight: 1.5, flexShrink: 0 }}>
        {tr.principles.map((p) => <li key={p.n} style={{ display: 'flex', gap: 8 }}><span style={{ opacity: .55 }}>{p.n}</span><span>{p.text}</span></li>)}
      </ol>
    </div>
  );
}
