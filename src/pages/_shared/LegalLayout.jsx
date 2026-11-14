import React from 'react';
import SiteHeader from '../../components/SiteHeader';

/**
 * Shared layout for legal/info pages (Privacy, Terms, About).
 * Dark theme; 17px body; Tajawal font; max-width reading column.
 */
export default function LegalLayout({ children, updated, src = 'legal' }) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: '#060e1c',
        color: '#e2e8f0',
        fontFamily: "'Tajawal', 'Segoe UI', -apple-system, sans-serif",
        fontSize: '1.0625rem',
        lineHeight: 1.8,
      }}
    >
      <SiteHeader src={src} />

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '3rem 1.5rem 2rem',
        }}
      >
        {children}

        {/* Footer line */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(56,189,248,0.08)',
            fontSize: '0.875rem',
            color: '#556677',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {updated && (
            <span>
              آخر تحديث: <time dateTime={updated.iso}>{updated.display}</time>
            </span>
          )}
          <span>© 2026 أكاديمية طلاقة</span>
        </div>
      </main>
    </div>
  );
}
