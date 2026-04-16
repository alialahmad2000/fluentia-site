import React, { useState, useEffect, useRef } from 'react';

/**
 * Privacy-first cookie consent banner (custom, zero dependencies).
 * Persists choice under localStorage key "fluentia_cookie_consent_v1".
 * Dispatches window event "fluentia-consent-updated" with { essential, analytics, marketing }
 * so the app (or future refactor) can conditionally load GA4 / TikTok Pixel.
 *
 * NOTE: current build already hard-loads GA4 + TikTok Pixel in index.html.
 * This component only records user intent; actual conditional loading will be
 * wired in a future pass per the audit roadmap.
 */

const STORAGE_KEY = 'fluentia_cookie_consent_v1';

const defaultConsent = {
  essential: true,     // always on
  analytics: false,
  marketing: false,
  decidedAt: null,
};

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(consent) {
  const payload = { ...consent, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / privacy mode */
  }
  window.dispatchEvent(new CustomEvent('fluentia-consent-updated', { detail: payload }));
  return payload;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [choices, setChoices] = useState(defaultConsent);
  const dialogRef = useRef(null);

  // Decide whether to show the banner
  useEffect(() => {
    const existing = readConsent();
    if (existing) return; // user already chose
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Keyboard: Escape = reject all
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleEssentialOnly();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const closeAfter = (consent) => {
    writeConsent(consent);
    setVisible(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () =>
    closeAfter({ essential: true, analytics: true, marketing: true });

  const handleEssentialOnly = () =>
    closeAfter({ essential: true, analytics: false, marketing: false });

  const handleSaveCustom = () =>
    closeAfter({ ...choices, essential: true });

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby="fluentia-cookie-title"
      aria-describedby="fluentia-cookie-body"
      dir="rtl"
      style={{
        position: 'fixed',
        insetInlineStart: '1rem',
        insetInlineEnd: '1rem',
        bottom: '1rem',
        zIndex: 9999,
        maxWidth: '560px',
        marginInlineStart: 'auto',
        marginInlineEnd: 'auto',
        background: 'rgba(6,14,28,0.97)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: '1rem',
        padding: '1.25rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
        color: '#e2e8f0',
        animation: 'fluentiaCookieIn 0.4s ease-out',
      }}
    >
      <style>{`
        @keyframes fluentiaCookieIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .flu-cookie-btn {
          font-family: 'Tajawal', sans-serif;
          font-size: 0.9375rem;
          font-weight: 700;
          padding: 0.625rem 1rem;
          border-radius: 0.625rem;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .flu-cookie-btn-primary {
          background: #38bdf8;
          color: #060e1c;
        }
        .flu-cookie-btn-primary:hover { background: #7dd3fc; }
        .flu-cookie-btn-secondary {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.1);
        }
        .flu-cookie-btn-secondary:hover { background: rgba(255,255,255,0.08); }
        .flu-cookie-btn-ghost {
          background: transparent;
          color: #94a3b8;
        }
        .flu-cookie-btn-ghost:hover { color: #38bdf8; }
        .flu-cookie-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <h2
        id="fluentia-cookie-title"
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: '#f8fafc',
          margin: '0 0 0.5rem',
        }}
      >
        نحن نقدّر خصوصيتك
      </h2>
      <p
        id="fluentia-cookie-body"
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          color: '#cbd5e1',
          margin: '0 0 1rem',
        }}
      >
        نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع، وملفات اختيارية للتحليلات والإعلانات.
        تحكّم في خياراتك، أو اقرأ{' '}
        <a
          href="/privacy"
          style={{ color: '#38bdf8', textDecoration: 'underline' }}
        >
          سياسة الخصوصية
        </a>
        .
      </p>

      {showCustomize && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="flu-cookie-toggle">
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                الضرورية
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#7e8a9a' }}>
                لتشغيل الموقع — لا يمكن تعطيلها
              </div>
            </div>
            <span style={{ fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 700 }}>
              مفعّلة
            </span>
          </div>

          <label className="flu-cookie-toggle" style={{ cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                التحليلية
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#7e8a9a' }}>
                Google Analytics و Vercel Analytics
              </div>
            </div>
            <input
              type="checkbox"
              checked={choices.analytics}
              onChange={(e) =>
                setChoices((c) => ({ ...c, analytics: e.target.checked }))
              }
              style={{ width: 18, height: 18, accentColor: '#38bdf8' }}
            />
          </label>

          <label className="flu-cookie-toggle" style={{ cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                التسويقية
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#7e8a9a' }}>
                TikTok Pixel و Google Ads
              </div>
            </div>
            <input
              type="checkbox"
              checked={choices.marketing}
              onChange={(e) =>
                setChoices((c) => ({ ...c, marketing: e.target.checked }))
              }
              style={{ width: 18, height: 18, accentColor: '#38bdf8' }}
            />
          </label>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'flex-start',
        }}
      >
        {showCustomize ? (
          <>
            <button className="flu-cookie-btn flu-cookie-btn-primary" onClick={handleSaveCustom}>
              حفظ الخيارات
            </button>
            <button
              className="flu-cookie-btn flu-cookie-btn-ghost"
              onClick={() => setShowCustomize(false)}
            >
              رجوع
            </button>
          </>
        ) : (
          <>
            <button className="flu-cookie-btn flu-cookie-btn-primary" onClick={handleAcceptAll}>
              قبول الكل
            </button>
            <button
              className="flu-cookie-btn flu-cookie-btn-secondary"
              onClick={handleEssentialOnly}
            >
              الضروري فقط
            </button>
            <button
              className="flu-cookie-btn flu-cookie-btn-ghost"
              onClick={() => setShowCustomize(true)}
            >
              تخصيص
            </button>
          </>
        )}
      </div>
    </div>
  );
}
