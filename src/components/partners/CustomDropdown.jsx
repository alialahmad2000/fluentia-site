import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomDropdown({ value, onChange, options, placeholder = 'اختر...', error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'w-full px-4 py-3 rounded-xl',
          'bg-white/5 text-right',
          'border transition-colors',
          'flex items-center justify-between gap-2',
          'focus:outline-none focus:ring-2 focus:ring-amber-400/40',
          error ? 'border-red-400/50' : 'border-white/10 hover:border-white/20',
          selected ? 'text-white' : 'text-white/40',
        ].join(' ')}
      >
        <ChevronDown
          className={`w-4 h-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
        <span className="flex-1 text-right">{selected ? selected.label : placeholder}</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 right-0 left-0 z-50 rounded-xl overflow-hidden max-h-64 overflow-y-auto"
          style={{
            background: '#0b1628',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.6)',
          }}
          role="listbox"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                width: '100%',
                padding: '12px 16px',
                textAlign: 'right',
                background: opt.value === value ? 'rgba(251,191,36,0.08)' : 'transparent',
                color: opt.value === value ? '#fcd34d' : 'rgba(255,255,255,0.90)',
                transition: 'background 0.12s',
                cursor: 'pointer',
                border: 'none',
              }}
              onMouseEnter={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt.value === value
                ? <Check className="w-4 h-4 text-amber-400 shrink-0" />
                : <span className="w-4 shrink-0" />
              }
              <span className="flex-1">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
