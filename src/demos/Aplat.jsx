// The gallery marquee; the live generator is still to come.
export default function AplatDemo({ shots, frame, hint }) {
  return (
    <>
      <div style={{ marginTop: 8, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)' }}>
        <div className="aplat-piste" style={{ display: 'flex', width: 'max-content', padding: '10px 0 12px' }}>
          {shots.map((s, i) => (
            <a key={i} className="aplat-tuile" href={s.href} target="_blank" rel="noopener" tabIndex={s.tab} aria-label={s.aria} style={{ margin: '0 20px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' }}>
              <img src={s.src} alt="" style={{ display: 'block', width: frame.w, height: frame.h, objectFit: 'cover', borderRadius: 24, border: `5px solid ${frame.frame}`, boxShadow: `8px 8px 0 ${frame.shadow}` }} />
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: 13 }}>{s.label}</span>
            </a>
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: "'Archivo', sans-serif", fontSize: 13, opacity: 0.65 }}>{hint}</p>
    </>
  );
}
