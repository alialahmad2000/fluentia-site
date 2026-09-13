import { LockKeyhole } from "lucide-react";

/**
 * «متاح داخل المنصة» — what a control does inside the platform, said in place of doing it.
 *
 * Used wherever the real screen has something the tour cannot run for a visitor (a saved
 * bookmark, another entry of the library, the AI tutor). It belongs to the TOUR, not the
 * platform, so it wears the tour's azure rather than either surface's accent.
 */
export default function InPlatformNote({ children, className = "" }) {
  return (
    <p className={`tour-chrome grm-inplatform ${className}`} role="status" dir="rtl">
      <span className="grm-inplatform-tag">
        <LockKeyhole size={12} aria-hidden="true" />
        متاح داخل المنصة
      </span>
      <span className="grm-inplatform-text">{children}</span>
    </p>
  );
}
