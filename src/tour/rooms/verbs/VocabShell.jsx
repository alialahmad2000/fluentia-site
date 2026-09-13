import './vocab-cosmos.css'

/**
 * TOUR PORT of fluentia-lms src/components/vocab-cosmos/VocabShell.jsx, room
 * variant only — the one «الأفعال الشاذة» uses. Same wrapper, same classes,
 * same `var(--vc-void)` ground, with three things left behind:
 *   - ConstellationField and the low-end sniff (the field variant's, unused here);
 *   - min-h-[100dvh]: a tour view is a section of a page, not an app route;
 *   - the bottom-nav clearance: the site has no bottom nav, so the room just
 *     gets breathing room before the tour's end band.
 * `tour-verbs` scopes the room's --vl-* tokens (see verbLadder.css).
 */
export default function VocabShell({ children, className = '', room = null, labelledBy }) {
  return (
    <section
      dir="rtl"
      aria-labelledby={labelledBy}
      className={`vocab-cosmos vc-shell-room tour-verbs relative ${className}`}
      style={{ background: 'var(--vc-void)' }}
    >
      {room}
      <div className="vc-content" style={{ paddingBottom: 'clamp(3rem, 9vw, 5.5rem)' }}>
        {children}
      </div>
    </section>
  )
}
