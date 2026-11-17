// The family list; the playable micro-apps are still to come.
export default function TrcedDemo({ tr }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontFamily: "'JetBrains Mono', monospace" }}>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{tr.tagline}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid currentColor' }}>
        {tr.apps.map((y) => (
          <li key={y.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8rem) minmax(0, 1fr) auto', gap: 16, alignItems: 'baseline', padding: '10px 0', borderBottom: `1px solid ${tr.rule}`, fontSize: 14 }}>
            <span style={{ fontWeight: 700 }}>{y.name}</span><span style={{ opacity: 0.75 }}>{y.desc}</span><span style={{ opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{y.status}</span>
          </li>
        ))}
      </ul>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {tr.principles.map((y) => (
          <li key={y.n} style={{ display: 'grid', gridTemplateColumns: '2.4rem minmax(0, 1fr)', gap: 8 }}><span style={{ opacity: 0.55 }}>{y.n}</span><span>{y.text}</span></li>
        ))}
      </ol>
    </div>
  );
}
