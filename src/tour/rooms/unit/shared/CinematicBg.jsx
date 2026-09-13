/**
 * _premiumPrimitives.CinematicBg — the unit's cover painted behind the page.
 *
 * In the platform this layer is position:fixed over the whole viewport. Inside
 * the tour that would float over the TourBar and past the room's end, so the
 * same layers ride in a sticky, viewport-tall frame clipped to the room: it
 * looks fixed while the room scrolls, and it ends where the room ends.
 * Every layer below is the platform's own, value for value.
 */
const T = {
  bg: "var(--cinematic-bg)",
  overlay: "var(--cinematic-overlay)",
  overlaySoft: "var(--cinematic-overlay-soft)",
  accentGoldSoft: "var(--cinematic-accent-gold-soft)",
  accentCyanSoft: "var(--cinematic-accent-cyan-soft)",
  filmGrainOpacity: "var(--cinematic-film-grain-opacity)",
};

export default function CinematicBg({ coverUrl, lift = false }) {
  return (
    <div className="tu-stickyframe" aria-hidden>
      <div className="tu-stickyframe__view">
        <div style={{ position: "absolute", inset: 0, background: T.bg }} />
        {coverUrl && (
          <div
            className="curr-kenburns"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: lift ? "blur(34px) brightness(0.92) saturate(1.35) contrast(1.05)" : "blur(40px) brightness(0.35) saturate(1.3)",
              WebkitFilter: lift ? "blur(34px) brightness(0.92) saturate(1.35) contrast(1.05)" : "blur(40px) brightness(0.35) saturate(1.3)",
              transform: "scale(1.1)",
            }}
          />
        )}
        {lift && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              mixBlendMode: "screen",
              opacity: 0.7,
              background: "radial-gradient(58% 46% at 76% 10%, var(--accent-sky-glow, rgba(232,193,105,0.30)) 0%, transparent 62%)",
            }}
          />
        )}
        <div
          className="curr-breathe"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 42% at 50% 6%, rgba(251,191,36,0.10), transparent 60%)", mixBlendMode: "screen" }}
        />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, transparent 0%, ${T.overlaySoft} 50%, ${T.overlay} 100%)` }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: T.filmGrainOpacity,
            mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div style={{ position: "absolute", top: "20%", left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${T.accentGoldSoft}, transparent)` }} />
        <div style={{ position: "absolute", top: "75%", left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${T.accentCyanSoft}, transparent)` }} />
      </div>
    </div>
  );
}
