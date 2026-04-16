import { useState } from 'react';
import supabase from '../../../utils/supabase';
import { CheckCircle2, AlertCircle, Loader2, Send, ChevronDown } from 'lucide-react';

const THEMES = {
  'dark-gold': {
    bg: '#0A0A0A',
    cardBg: 'rgba(39,39,42,0.5)',
    border: 'rgba(63,63,70,1)',
    focusRing: 'rgba(212,175,55,0.4)',
    text: '#FAFAFA',
    muted: '#A1A1AA',
    inputBg: 'rgba(24,24,27,1)',
    btnBg: 'linear-gradient(135deg,#D4AF37,#C9A961)',
    btnText: '#000',
    errorText: '#f87171',
    accent: '#D4AF37',
  },
  'dark-blue': {
    bg: 'transparent',
    cardBg: 'transparent',
    border: 'rgba(255,255,255,0.15)',
    focusRing: 'rgba(56,189,248,0.3)',
    text: '#FAFAFA',
    muted: '#94A3B8',
    inputBg: 'rgba(255,255,255,0.06)',
    btnBg: '#0ea5e9',
    btnText: '#fff',
    errorText: '#f87171',
    accent: '#38bdf8',
  },
  gradient: {
    bg: 'transparent',
    cardBg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    focusRing: 'rgba(139,92,246,0.5)',
    text: '#fff',
    muted: 'rgba(255,255,255,0.7)',
    inputBg: 'rgba(255,255,255,0.06)',
    btnBg: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
    btnText: '#fff',
    errorText: '#fca5a5',
    accent: '#8B5CF6',
  },
  clean: {
    bg: '#fff',
    cardBg: '#fff',
    border: '#E5E7EB',
    focusRing: 'rgba(14,165,233,0.3)',
    text: '#111827',
    muted: '#6B7280',
    inputBg: '#F9FAFB',
    btnBg: 'linear-gradient(135deg,#0EA5E9,#0284C7)',
    btnText: '#fff',
    errorText: '#EF4444',
    accent: '#0EA5E9',
  },
};

export default function ApplicationForm({ theme = 'dark-gold' }) {
  const t = THEMES[theme] || THEMES['dark-gold'];

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', city: '', ref_code: '',
    twitter: '', instagram: '', tiktok: '',
    followers_count: '', motivation: '', source: '', terms_accepted: false,
  });
  const [errors, setErrors] = useState({});
  const [refCodeStatus, setRefCodeStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
    if (field === 'ref_code') setRefCodeStatus(null);
  };

  const checkRefCode = async (code) => {
    if (!code || code.length < 4) return;
    setRefCodeStatus('checking');
    const { data } = await supabase.from('affiliates').select('id').eq('ref_code', code).maybeSingle();
    setRefCodeStatus(data ? 'taken' : 'available');
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'مطلوب';
    const phoneClean = form.phone.replace(/\s/g, '');
    if (!/^(\+966|05)\d{8}$/.test(phoneClean)) e.phone = 'رقم سعودي غير صحيح';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'إيميل غير صحيح';
    if (!form.city.trim()) e.city = 'مطلوب';
    if (!/^[A-Za-z0-9]{4,12}$/.test(form.ref_code)) e.ref_code = 'من 4 إلى 12 حرف/رقم إنجليزي فقط';
    if (refCodeStatus === 'taken') e.ref_code = 'الكود مستخدم، اختر كود آخر';
    if (!form.twitter.trim() && !form.instagram.trim() && !form.tiktok.trim()) e.social = 'أدخل حساب واحد على الأقل';
    if (form.motivation.trim().length < 20 || form.motivation.trim().length > 500) e.motivation = 'من 20 إلى 500 حرف';
    if (!form.source) e.source = 'مطلوب';
    if (!form.terms_accepted) e.terms_accepted = 'يجب الموافقة على الشروط';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);

    try {
      const refCode = form.ref_code.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      const email = form.email.trim().toLowerCase();
      const phoneClean = form.phone.replace(/\s+/g, '').trim();

      // ── ref_code uniqueness ──
      const { data: existingCode, error: codeCheckError } = await supabase
        .from('affiliates')
        .select('id')
        .eq('ref_code', refCode)
        .maybeSingle();
      if (codeCheckError) {
        console.error('[affiliate] code check error:', codeCheckError);
        setSubmitError(`خطأ في التحقق من الكود: ${codeCheckError.message}`);
        setSubmitting(false);
        return;
      }
      if (existingCode) {
        setSubmitError('الكود مستخدم من شخص آخر، اختر كود مختلف');
        setSubmitting(false);
        return;
      }

      // ── email duplicate (separate query — avoids .or() pitfalls when
      // one field might be empty or contain special chars) ──
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('affiliates')
        .select('id, status')
        .eq('email', email)
        .in('status', ['pending', 'approved'])
        .maybeSingle();
      if (emailCheckError) {
        console.error('[affiliate] email check error:', emailCheckError);
        // Non-fatal — continue; the DB unique constraint is the real guard.
      }
      if (existingEmail) {
        setSubmitError('يوجد طلب سابق بهذا الإيميل، راسلنا على الواتساب للمتابعة');
        setSubmitting(false);
        return;
      }

      // ── phone duplicate ──
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('affiliates')
        .select('id, status')
        .eq('phone', phoneClean)
        .in('status', ['pending', 'approved'])
        .maybeSingle();
      if (phoneCheckError) {
        console.error('[affiliate] phone check error:', phoneCheckError);
      }
      if (existingPhone) {
        setSubmitError('يوجد طلب سابق بهذا الرقم، راسلنا على الواتساب للمتابعة');
        setSubmitting(false);
        return;
      }

      const social_handles = {};
      if (form.twitter.trim()) social_handles.twitter = form.twitter.trim();
      if (form.instagram.trim()) social_handles.instagram = form.instagram.trim();
      if (form.tiktok.trim()) social_handles.tiktok = form.tiktok.trim();

      const payload = {
        full_name: form.full_name.trim(),
        phone: phoneClean,
        email,
        city: form.city.trim(),
        ref_code: refCode,
        social_handles,
        followers_count: form.followers_count ? parseInt(form.followers_count, 10) : null,
        motivation: form.motivation.trim(),
        source: form.source,
        status: 'pending',
        terms_accepted_at: new Date().toISOString(),
      };

      console.log('[affiliate] inserting payload:', payload);

      const { data: inserted, error: insertError } = await supabase
        .from('affiliates')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error('[affiliate] INSERT FAILED:', insertError);
        console.error('[affiliate] error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });

        const msg = (insertError.message || '').toLowerCase();
        if (insertError.code === '23505') {
          setSubmitError('الكود أو الإيميل أو الرقم مستخدم مسبقاً');
        } else if (insertError.code === '42501' || msg.includes('rls') || msg.includes('policy') || msg.includes('permission')) {
          setSubmitError('خطأ في صلاحيات النظام، راسلنا على الواتساب');
        } else if (insertError.code === '23502') {
          setSubmitError(`حقل مطلوب ناقص: ${insertError.details || insertError.message}`);
        } else if (insertError.code === '23514') {
          setSubmitError(`قيمة غير صحيحة: ${insertError.details || insertError.message}`);
        } else {
          setSubmitError(`خطأ: ${insertError.message}`);
        }
        setSubmitting(false);
        return;
      }

      console.log('[affiliate] INSERT SUCCESS:', inserted);
      window.location.href = `/partners/submitted?name=${encodeURIComponent(form.full_name.trim())}`;
    } catch (unexpected) {
      console.error('[affiliate] UNEXPECTED ERROR:', unexpected);
      setSubmitError(`خطأ غير متوقع: ${unexpected?.message || 'راسلنا على الواتساب'}`);
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    outline: 'none', background: t.inputBg, color: t.text,
    border: `1px solid ${t.border}`, fontFamily: 'Tajawal', transition: 'border-color 0.2s',
  };

  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: t.text, fontFamily: 'Tajawal' };
  const errorStyle = { color: t.errorText, fontSize: '12px', marginTop: '4px', fontFamily: 'Tajawal' };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ fontFamily: 'Tajawal' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Field label="الاسم الكامل" value={form.full_name} onChange={v => set('full_name', v)} error={errors.full_name} placeholder="مثال: محمد العتيبي" {...{ inputStyle, labelStyle, errorStyle }} />
        <Field label="الجوال" value={form.phone} onChange={v => set('phone', v)} error={errors.phone} placeholder="05XXXXXXXX" dir="ltr" {...{ inputStyle, labelStyle, errorStyle }} />
        <Field label="الإيميل" value={form.email} onChange={v => set('email', v)} error={errors.email} placeholder="email@example.com" dir="ltr" type="email" {...{ inputStyle, labelStyle, errorStyle }} />
        <Field label="المدينة" value={form.city} onChange={v => set('city', v)} error={errors.city} placeholder="مثال: الرياض" {...{ inputStyle, labelStyle, errorStyle }} />

        {/* Ref code */}
        <div>
          <label style={labelStyle}>الكود المطلوب (ref_code)</label>
          <div style={{ position: 'relative' }}>
            <input value={form.ref_code} onChange={e => { const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); set('ref_code', v); }} onBlur={() => checkRefCode(form.ref_code)} maxLength={12} style={inputStyle} placeholder="مثال: AHMED10" dir="ltr" onFocus={e => { e.target.style.borderColor = t.accent; }} onBlurCapture={e => { e.target.style.borderColor = t.border; }} />
            {refCodeStatus === 'checking' && <Loader2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.accent, animation: 'spin 1s linear infinite' }} />}
            {refCodeStatus === 'available' && <CheckCircle2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} />}
            {refCodeStatus === 'taken' && <AlertCircle size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#f87171' }} />}
          </div>
          <p style={{ fontSize: '12px', marginTop: '4px', color: t.muted }}>من 4 إلى 12 حرف/رقم إنجليزي فقط</p>
          {refCodeStatus === 'taken' && <p style={errorStyle}>الكود مستخدم، اختر كود آخر</p>}
          {errors.ref_code && <p style={errorStyle}>{errors.ref_code}</p>}
        </div>

        {/* Social */}
        <div>
          <label style={labelStyle}>حسابات التواصل الاجتماعي (حساب واحد على الأقل)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input value={form.twitter} onChange={e => set('twitter', e.target.value)} style={inputStyle} placeholder="Twitter / X" dir="ltr" />
            <input value={form.instagram} onChange={e => set('instagram', e.target.value)} style={inputStyle} placeholder="Instagram" dir="ltr" />
            <input value={form.tiktok} onChange={e => set('tiktok', e.target.value)} style={inputStyle} placeholder="TikTok" dir="ltr" />
          </div>
          {errors.social && <p style={errorStyle}>{errors.social}</p>}
        </div>

        <Field label={<>تقريباً كم يبلغ مجموع متابعيك؟ <span style={{ fontWeight: 400, color: t.muted }}>(اختياري)</span></>} value={form.followers_count} onChange={v => set('followers_count', v)} placeholder="مثال: 5000" dir="ltr" type="number" {...{ inputStyle, labelStyle, errorStyle }} />

        {/* Motivation */}
        <div>
          <label style={labelStyle}>ليش تبي تنضم لبرنامج شركاء طلاقة؟</label>
          <textarea value={form.motivation} onChange={e => set('motivation', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'none' }} placeholder="اكتب هنا... (20 إلى 500 حرف)" />
          <p style={{ fontSize: '12px', marginTop: '4px', color: t.muted }}>{form.motivation.length}/500</p>
          {errors.motivation && <p style={errorStyle}>{errors.motivation}</p>}
        </div>

        {/* Source */}
        <div>
          <label style={labelStyle}>من وين سمعت عنا؟</label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.source}
              onChange={e => set('source', e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                // `colorScheme: 'dark'` forces Chrome/Edge to render the popup
                // with a dark theme, otherwise it defaults to OS colors and
                // the options can appear white-on-white on light-mode OSes.
                colorScheme: 'dark',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                // Add space for the chevron on the logical end (left in RTL).
                paddingInlineEnd: '40px',
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#ffffff' }}>اختر...</option>
              <option value="صديق" style={{ background: '#0f172a', color: '#ffffff' }}>صديق</option>
              <option value="سوشال ميديا" style={{ background: '#0f172a', color: '#ffffff' }}>سوشال ميديا</option>
              <option value="إعلان" style={{ background: '#0f172a', color: '#ffffff' }}>إعلان</option>
              <option value="غير ذلك" style={{ background: '#0f172a', color: '#ffffff' }}>غير ذلك</option>
            </select>
            <ChevronDown
              size={18}
              style={{
                position: 'absolute',
                insetInlineStart: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: t.muted,
                pointerEvents: 'none',
              }}
            />
          </div>
          {errors.source && <p style={errorStyle}>{errors.source}</p>}
        </div>

        {/* Terms */}
        <div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.terms_accepted} onChange={e => set('terms_accepted', e.target.checked)} style={{ marginTop: '4px', accentColor: t.accent, width: 16, height: 16 }} />
            <span style={{ fontSize: '14px', color: t.muted }}>
              أوافق على{' '}
              <a href="/partners/terms" target="_blank" rel="noopener noreferrer" style={{ color: t.accent, textDecoration: 'underline' }}>الشروط والأحكام</a>
            </span>
          </label>
          {errors.terms_accepted && <p style={errorStyle}>{errors.terms_accepted}</p>}
        </div>

        {submitError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '14px', color: t.errorText }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
          cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
          background: t.btnBg, color: t.btnText, border: 'none', fontFamily: 'Tajawal',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'transform 0.2s', transform: 'scale(1)',
        }}
          onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {submitting ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><Send size={16} /> قدّم طلبي</>}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </form>
  );
}

function Field({ label, value, onChange, error, placeholder, dir, type = 'text', inputStyle, labelStyle, errorStyle }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} placeholder={placeholder} dir={dir} />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}
