import { useId, useMemo, useState } from 'react';
import { calculateReference, formatRaceMinutes } from './zoned/calculators.js';

const MONO = "'JetBrains Mono', monospace";
const DISTANCES = [5, 10, 21.1, 42.195];
const COPY = {
  fr: {
    title: 'À chacun ses allures.', race: 'Course récente', vma: 'VMA connue', distance: 'Distance',
    time: 'Temps · hh:mm:ss', speed: 'VMA · km/h', zones: 'Vos 6 zones', pace: 'min/km',
    predictions: 'Temps estimés', half: 'Semi', marathon: 'Marathon', estimated: 'VMA estimée',
    names: ['Récupération', 'Endurance', 'Tempo', 'Seuil', 'VO2max', 'Sprint'],
    invalidTime: 'Saisissez un temps hh:mm:ss valide, supérieur à zéro.',
    invalidRace: 'Ce temps donne une VMA hors limites (4 à 35 km/h).',
    invalidVma: 'Saisissez une VMA entre 8 et 30 km/h.',
    model: 'Péronnet–Thibault · indice E = 6,5', made: 'Exemple inventé · modifiez-le',
    empty: 'Vos allures apparaîtront ici.',
  },
  en: {
    title: 'Find your own pace.', race: 'Recent race', vma: 'Known MAS', distance: 'Distance',
    time: 'Time · hh:mm:ss', speed: 'MAS · km/h', zones: 'Your 6 zones', pace: 'min/km',
    predictions: 'Predicted times', half: 'Half', marathon: 'Marathon', estimated: 'Estimated MAS',
    names: ['Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO2max', 'Sprint'],
    invalidTime: 'Enter a valid hh:mm:ss time greater than zero.',
    invalidRace: 'This time gives a MAS outside 4–35 km/h.',
    invalidVma: 'Enter a MAS between 8 and 30 km/h.',
    model: 'Péronnet–Thibault · index E = 6.5', made: 'Made-up example · change it',
    empty: 'Your paces will appear here.',
  },
};

export default function ZonedCalc({ dark, wide, lang }) {
  const t = COPY[lang] || COPY.en;
  const uid = useId();
  const [mode, setMode] = useState('race');
  const [distance, setDistance] = useState(10);
  const [time, setTime] = useState('00:50:00');
  const [speed, setSpeed] = useState('15');
  const result = useMemo(() => calculateReference({ mode, distance, time, speed }), [mode, distance, time, speed]);

  const ink = dark ? '#F6F5F2' : '#171614';
  const card = dark ? '#211F1D' : '#FFFFFF';
  const muted = dark ? '#C9C6BF' : '#55524C';
  const divider = dark ? 'rgba(237,235,231,.18)' : 'rgba(23,22,20,.18)';
  const accent = dark ? '#F2694F' : '#E8452A';
  const field = { boxSizing: 'border-box', width: '100%', minWidth: 0, height: 44, border: `1px solid ${ink}`, borderRadius: 10,
    background: card, color: ink, padding: '0 10px', fontFamily: MONO, fontSize: 15 };
  const heading = { margin: 0, fontSize: 13, fontWeight: 600 };
  const labels = ['5 km', '10 km', t.half, t.marathon];

  return (
    <div className="zoned-calc" style={{ flex: wide ? '0 1 auto' : '1 1 0', minHeight: 0, minWidth: 0, overflow: 'auto',
      maxHeight: wide ? 420 : undefined, padding: wide ? 20 : 16, boxSizing: 'border-box', border: `1px solid ${ink}`,
      borderRadius: 26, background: card, color: ink, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.4 }}>
      <style>{`.zoned-calc button{font-family:inherit;cursor:pointer}.zoned-calc button:hover{box-shadow:inset 0 0 0 1px currentColor}.zoned-calc :is(input,select,button):focus-visible{outline:2px dashed currentColor;outline-offset:3px}`}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', 'Space Grotesk', sans-serif", fontSize: wide ? 24 : 21, lineHeight: 1.1, letterSpacing: '-.03em' }}>{t.title}</h3>
        <span style={{ color: muted, fontSize: 10 }}>{t.made}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0,.8fr) minmax(0,1.3fr)' : 'minmax(0,1fr)', gap: wide ? 24 : 0 }}>
      <div>
      <div role="group" aria-label={lang === 'fr' ? 'Référence' : 'Reference'} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['race', 'vma'].map((key) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)}
          style={{ flex: 1, minHeight: 44, padding: '0 14px', border: `1px solid ${ink}`, borderRadius: 999,
            background: mode === key ? ink : 'transparent', color: mode === key ? card : ink, fontSize: 12 }}>{t[key]}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mode === 'race' && !wide ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)', gap: 12, marginBottom: 12 }}>
        {mode === 'race' ? <>
          <label style={{ minWidth: 0 }}>{t.distance}
            <select style={{ ...field, display: 'block', marginTop: 4 }} value={distance} onChange={(e) => setDistance(Number(e.target.value))}>
              {DISTANCES.map((km, i) => <option key={km} value={km}>{labels[i]}</option>)}
            </select>
          </label>
          <label style={{ minWidth: 0 }}>{t.time}
            <input aria-describedby={result.error ? `${uid}-error` : undefined} aria-invalid={!!result.error} style={{ ...field, display: 'block', marginTop: 4 }}
              type="text" inputMode="text" placeholder="00:50:00" maxLength={8} value={time} onChange={(e) => setTime(e.target.value)} spellCheck={false} />
          </label>
        </> : <label>{t.speed}
          <input aria-describedby={result.error ? `${uid}-error` : undefined} aria-invalid={!!result.error} style={{ ...field, display: 'block', marginTop: 4 }}
            type="text" inputMode="decimal" value={speed} onChange={(e) => setSpeed(e.target.value)} />
        </label>}
      </div>
      </div>
      <div>
      {result.error ? <div style={{ minHeight: wide ? 180 : 140, paddingTop: 12, borderTop: `1px solid ${divider}` }}>
        <p id={`${uid}-error`} role="status" style={{ color: ink, borderLeft: `3px solid ${accent}`, paddingLeft: 8, margin: '0 0 8px' }}>{t[result.error]}</p>
        <p style={{ margin: 0, color: muted }}>{t.empty}</p>
      </div> : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12, borderTop: wide ? undefined : `1px solid ${divider}`, paddingTop: wide ? 0 : 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><h4 style={heading}>{t.zones}</h4><span style={{ color: muted }}>{t.pace}</span></div>
            <table aria-label={t.zones} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>{result.zones.map((zone, i) => <tr key={zone.zone} style={{ borderBottom: i < 5 ? `1px solid ${divider}` : undefined }}>
                <th scope="row" style={{ padding: '4px 0', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', padding: '2px 5px', marginRight: 7, borderRadius: 4,
                    background: i === 5 ? (dark ? '#EDEBE7' : '#171614') : `rgba(${dark ? '237,235,231' : '23,22,20'},${[.14, .30, .46, .62, .80][i]})`,
                    color: i >= 3 ? (dark ? '#171614' : '#FFFFFF') : ink, fontFamily: MONO, fontWeight: 600 }}>Z{zone.zone}</span>{t.names[i]}
                </th>
                <td style={{ textAlign: 'right', fontFamily: MONO, whiteSpace: 'nowrap', fontSize: 11 }}>
                  {formatRaceMinutes(zone.paceMinPerKm)}–{formatRaceMinutes(zone.paceMaxPerKm)}
                </td>
              </tr>)}</tbody>
            </table>
          </div>
          <div>
            <h4 style={{ ...heading, marginBottom: 8 }}>{t.predictions}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(4,minmax(0,1fr))' : 'repeat(2,minmax(0,1fr))', gap: '10px 12px' }}>
              {result.times.map((value, i) => <div key={i} style={{ borderTop: `2px solid ${divider}`, paddingTop: 4 }}>
                <div style={{ color: muted, fontSize: 11 }}>{labels[i]}</div>
                <div style={{ fontFamily: MONO, fontSize: wide ? 13 : 18, letterSpacing: '-.05em' }}>{value}</div>
              </div>)}
            </div>
            <div style={{ marginTop: 12, color: ink, borderLeft: `3px solid ${accent}`, paddingLeft: 8, fontSize: 12 }}>{mode === 'race' ? t.estimated : t.speed.split(' · ')[0]} <b style={{ fontFamily: MONO }}>{result.vma.toFixed(1)}</b> km/h</div>
          </div>
        </div>
        <p style={{ margin: '12px 0 0', color: muted, fontSize: 10 }}>{t.model}</p>
      </>}
      </div>
      </div>
    </div>
  );
}
