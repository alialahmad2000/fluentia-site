import React from 'react';

export function Field({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-white/90 text-right">
        {label}
        {required && <span className="text-amber-400 mr-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-white/50 text-right">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-300 text-right">{error}</p>
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
      className={[
        'w-full px-4 py-3 rounded-xl',
        'bg-white/5 text-white placeholder:text-white/40',
        'border transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-amber-400/40',
        error
          ? 'border-red-400/50'
          : 'border-white/10 hover:border-white/20 focus:border-amber-400/40',
      ].join(' ')}
      style={{ colorScheme: 'dark' }}
      {...props}
    />
  );
}
