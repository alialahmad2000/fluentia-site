import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { faqData } from './faqData';

const THEMES = {
  'dark-gold': {
    cardBg: 'rgba(39,39,42,0.5)',
    border: 'rgba(63,63,70,1)',
    hoverBorder: 'rgba(212,175,55,0.3)',
    text: '#FAFAFA',
    muted: '#A1A1AA',
    accent: '#D4AF37',
  },
  'dark-blue': {
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    hoverBorder: 'rgba(56,189,248,0.3)',
    text: '#FAFAFA',
    muted: '#cbd5e1',
    accent: '#38bdf8',
  },
  gradient: {
    cardBg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
    hoverBorder: 'rgba(139,92,246,0.4)',
    text: '#fff',
    muted: 'rgba(255,255,255,0.7)',
    accent: '#8B5CF6',
  },
  clean: {
    cardBg: '#fff',
    border: '#E5E7EB',
    hoverBorder: '#0EA5E9',
    text: '#111827',
    muted: '#6B7280',
    accent: '#0EA5E9',
  },
};

export default function FAQList({ theme = 'dark-gold' }) {
  const t = THEMES[theme] || THEMES['dark-gold'];
  const [open, setOpen] = useState(null);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {faqData.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{
            background: t.cardBg, border: `1px solid ${isOpen ? t.accent : t.border}`,
            borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.3s',
            backdropFilter: theme === 'gradient' ? 'blur(12px)' : undefined,
          }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '16px', padding: '16px 20px', textAlign: 'right', cursor: 'pointer',
                background: 'none', border: 'none', color: t.text, fontFamily: 'Tajawal',
                fontSize: '15px', fontWeight: 600, lineHeight: 1.6,
              }}
            >
              <span>{item.q}</span>
              <ChevronDown size={18} style={{
                flexShrink: 0, color: t.accent, transition: 'transform 0.3s',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              }} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    padding: '0 20px 16px', fontSize: '14px', lineHeight: 1.8,
                    color: t.muted, fontFamily: 'Tajawal', whiteSpace: 'pre-line',
                  }}>
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
