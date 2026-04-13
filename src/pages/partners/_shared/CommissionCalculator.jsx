import { useState } from 'react';
import { motion } from 'framer-motion';

const THEMES = {
  'dark-gold': {
    bg: 'rgba(39,39,42,0.5)',
    border: 'rgba(63,63,70,1)',
    text: '#FAFAFA',
    muted: '#A1A1AA',
    accent: '#D4AF37',
    inputBg: 'rgba(24,24,27,1)',
    inputBorder: 'rgba(63,63,70,1)',
    numberFont: "'JetBrains Mono', monospace",
  },
  'dark-blue': {
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    text: '#FAFAFA',
    muted: '#94A3B8',
    accent: '#38bdf8',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.15)',
    numberFont: "'JetBrains Mono', monospace",
  },
  gradient: {
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    text: '#fff',
    muted: 'rgba(255,255,255,0.7)',
    accent: '#8B5CF6',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.15)',
    numberFont: 'inherit',
  },
  clean: {
    bg: '#fff',
    border: '#E5E7EB',
    text: '#111827',
    muted: '#6B7280',
    accent: '#0EA5E9',
    inputBg: '#F9FAFB',
    inputBorder: '#D1D5DB',
    numberFont: 'inherit',
  },
};

export default function CommissionCalculator({ theme = 'dark-gold' }) {
  const t = THEMES[theme] || THEMES['dark-gold'];
  const [students, setStudents] = useState(10);

  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: '20px',
      padding: '40px 32px', maxWidth: '560px', margin: '0 auto', textAlign: 'center',
      backdropFilter: theme === 'gradient' ? 'blur(16px)' : undefined,
    }}>
      <label style={{ display: 'block', fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: t.text, fontFamily: 'Tajawal' }}>
        كم طالب تقدر تجيب شهرياً؟
      </label>

      <input
        type="range" min={1} max={100} value={students}
        onChange={e => setStudents(Number(e.target.value))}
        style={{ width: '100%', marginBottom: '8px', accentColor: t.accent }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
        <input
          type="number" min={1} max={100} value={students}
          onChange={e => setStudents(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          style={{
            width: '80px', borderRadius: '12px', padding: '8px 12px', textAlign: 'center',
            fontSize: '18px', fontWeight: 700, background: t.inputBg, color: t.text,
            border: `1px solid ${t.inputBorder}`, outline: 'none', fontFamily: 'Tajawal',
          }}
        />
        <span style={{ color: t.muted, fontFamily: 'Tajawal' }}>طالب</span>
      </div>

      <motion.div key={students} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <p style={{ fontSize: 'clamp(36px,8vw,52px)', fontWeight: 900, color: t.accent, marginBottom: '4px', fontFamily: t.numberFont, lineHeight: 1.1 }}>
          {(students * 100).toLocaleString('ar-SA')} ريال
        </p>
        <p style={{ fontSize: '14px', color: t.muted, fontFamily: 'Tajawal' }}>شهرياً</p>
      </motion.div>

      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${t.border}` }}>
        <p style={{ fontSize: '24px', fontWeight: 700, color: t.text, fontFamily: t.numberFont }}>
          {(students * 1200).toLocaleString('ar-SA')} ريال
        </p>
        <p style={{ fontSize: '14px', color: t.muted, fontFamily: 'Tajawal' }}>سنوياً</p>
      </div>
    </div>
  );
}
