import React, { useEffect } from 'react';
import { fireTikTokRedirectEvents } from '../lib/tiktokPixel';

/**
 * TikTok Click-to-WhatsApp Redirect Page
 * Route: /w
 *
 * Flow:
 * 1. User lands here from TikTok ad (fluentia.academy/w or fluentia.online/w)
 * 2. Fire TikTok Pixel Lead + SubmitForm + GA4 generate_lead on mount
 * 3. Wait 1500ms so pixels flush (iOS Safari ITP can drop fast-redirect requests)
 * 4. Redirect to WhatsApp with pre-filled message containing UTM source
 */

const WA_PHONE = '966558669974';

// Map UTM sources to Arabic labels for Hajar to read in WhatsApp
const SOURCE_LABELS = {
  tiktok: 'تيك توك',
  tiktok_ads: 'إعلان تيك توك',
  instagram: 'انستقرام',
  snapchat: 'سناب شات',
  google: 'جوجل',
  facebook: 'فيسبوك',
  twitter: 'تويتر',
  x: 'إكس',
  whatsapp: 'واتساب',
  referral: 'إحالة',
  direct: 'مباشر',
};

function getSourceLabel() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = (params.get('utm_source') || '').toLowerCase();
    const utmCampaign = params.get('utm_campaign') || '';
    const label = SOURCE_LABELS[utmSource] || utmSource || 'مباشر';
    return utmCampaign ? `${label} (${utmCampaign})` : label;
  } catch {
    return 'مباشر';
  }
}

function buildWhatsAppURL() {
  const source = getSourceLabel();
  const message =
    `السلام عليكم 🌟\n` +
    `شفت إعلانكم وحبيت أعرف أكثر عن أكاديمية Fluentia\n` +
    `أبي أحجز لقاء مبدئي مجاني\n\n` +
    `📌 المصدر: ${source}`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}

function fireTracking() {
  const source = getSourceLabel();
  // TikTok Pixel — routed through shared helper (keeps src/ free of raw ttq.track)
  fireTikTokRedirectEvents();
  // GA4 generate_lead
  try {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'generate_lead', {
        currency: 'SAR',
        value: 1100,
        source,
        method: 'whatsapp_redirect',
      });
      // Google Ads conversion
      window.gtag('event', 'conversion', {
        send_to: 'AW-9314838750',
        value: 1.0,
        currency: 'SAR',
      });
      if (import.meta.env.DEV) {
        console.log('[GA4] generate_lead + Ads conversion fired for /w', { source });
      }
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[GA4] error:', e);
  }
}

export default function WhatsAppRedirect() {
  useEffect(() => {
    fireTracking();
    const timer = setTimeout(() => {
      window.location.replace(buildWhatsAppURL());
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1225 0%, #1a2d50 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif",
        padding: '20px',
        textAlign: 'center',
      }}
    >
      {/* Brand */}
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '32px',
          fontWeight: 700,
          color: '#38bdf8',
          marginBottom: '32px',
          letterSpacing: '-0.5px',
        }}
      >
        Fluentia
      </div>

      {/* WhatsApp icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          animation: 'waPulse 1.5s ease-in-out infinite',
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </div>

      <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
        جاري التحويل للواتساب...
      </div>

      <div
        style={{
          fontSize: '16px',
          color: '#7dd3fc',
          marginBottom: '32px',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        راح تفتح محادثة مع فريقنا خلال ثوانٍ
      </div>

      {/* Manual fallback (also works with JS disabled) */}
      <a
        href={buildWhatsAppURL()}
        onClick={fireTracking}
        style={{
          color: '#f8fafc',
          fontSize: '14px',
          textDecoration: 'underline',
          opacity: 0.7,
          marginTop: '16px',
        }}
      >
        لم يتم التحويل تلقائياً؟ اضغط هنا
      </a>

      <style>{`
        @keyframes waPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
