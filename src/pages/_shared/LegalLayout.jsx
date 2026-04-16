import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared layout for legal/info pages (Privacy, Terms, About).
 * Dark theme; 17px body; Tajawal font; max-width reading column.
 */
export default function LegalLayout({ children, updated }) {
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
      {/* Top bar */}
      <div
        style={{
          borderBottom: '1px solid rgba(56,189,248,0.08)',
          padding: '1rem 1.25rem',
          position: 'sticky',
          top: 0,
          background: 'rgba(6,14,28,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Link
            to="/"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span style={{ fontFamily: "'Playfair Display', serif", color: '#38bdf8' }}>F</span>
            <span style={{ color: '#f8fafc' }}>luentia</span>
          </Link>
          <Link
            to="/"
            style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            ← العودة للرئيسية
          </Link>
        </div>
      </div>

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
