import React from 'react';

export function Field({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[15px] font-semibold text-white text-right">
        {label}
        {required && <span className="text-amber-400 mr-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-white/50 text-right leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-300 text-right leading-relaxed">{error}</p>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      dir="rtl"
      className={`
        w-full px-5 py-4 rounded-xl
        text-white placeholder:text-white/35
        border-2 transition-all duration-150
        focus:outline-none focus:ring-4 focus:ring-amber-400/20
        ${error
          ? 'bg-red-950/20 border-red-400/50 focus:border-red-400'
          : 'bg-white/[0.04] border-white/15 hover:border-white/30 hover:bg-white/[0.06] focus:border-amber-400/70 focus:bg-white/[0.06]'}
      `}
      style={{
        colorScheme: 'dark',
        textAlign: 'right',
        unicodeBidi: 'plaintext',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
      }}
      {...props}
    />
  );
}
