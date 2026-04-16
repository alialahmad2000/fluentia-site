import { useState, useMemo, useRef, useEffect } from 'react';
import supabase from '../../../utils/supabase';
import {
  CheckCircle2, AlertCircle, Loader2, Sparkles, Clock, TrendingUp, ChevronDown,
} from 'lucide-react';

/* Source options — stored in DB as Arabic strings for readability in the admin panel. */
const HEARD_FROM_OPTIONS = [
  { value: '', label: 'اختر...' },
  { value: 'تويتر / X', label: 'تويتر / X' },
  { value: 'انستقرام', label: 'انستقرام' },
  { value: 'تيك توك', label: 'تيك توك' },
  { value: 'سناب شات', label: 'سناب شات' },
  { value: 'واتساب', label: 'واتساب / مجموعات' },
  { value: 'صديق', label: 'صديق / زميل' },
  { value: 'بحث جوجل', label: 'بحث جوجل' },
  { value: 'غير ذلك', label: 'مصدر آخر' },
];

// The `theme` prop is kept for call-site backward compatibility but the
// redesigned form is locked to the dark-sky palette used on /partners.
// eslint-disable-next-line no-unused-vars
export default function ApplicationForm({ theme: _theme }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    city: '',
    twitter: '',
    instagram: '',
    tiktok: '',
    audience_size: '',
    ref_code: '',
    why_join: '',
    heard_from: '',
    terms_accepted: false,
  });
  const [errors, setErrors] = useState({});
  const [refCodeStatus, setRefCodeStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    if (field === 'ref_code') setRefCodeStatus(null);
  };

  const checkRefCode = async (code) => {
    if (!code || code.length < 4) return;
    setRefCodeStatus('checking');
    const { data } = await supabase
      .from('affiliates')
      .select('id')
      .eq('ref_code', code)
      .maybeSingle();
    setRefCodeStatus(data ? 'taken' : 'available');
  };

  const previewCode = useMemo(
    () => form.ref_code.trim().toUpperCase() || 'AHMED10',
    [form.ref_code],
  );

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'الاسم مطلوب';
    const phoneClean = form.phone.replace(/\s/g, '');
    if (!/^(\+966|05)\d{8}$/.test(phoneClean)) e.phone = 'رقم سعودي غير صحيح';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'إيميل غير صحيح';
    if (!/^[A-Za-z0-9]{4,12}$/.test(form.ref_code)) {
      e.ref_code = 'من 4 إلى 12 حرف/رقم إنجليزي فقط';
    }
    if (refCodeStatus === 'taken') e.ref_code = 'الكود مستخدم، اختر كود آخر';
    if (!form.twitter.trim() && !form.instagram.trim() && !form.tiktok.trim()) {
      e.social = 'أدخل حساب واحد على الأقل';
    }
    if (form.why_join.trim().length < 20 || form.why_join.trim().length > 500) {
      e.why_join = 'من 20 إلى 500 حرف';
    }
    if (!form.heard_from) e.heard_from = 'مطلوب';
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

      // ── email duplicate (only pending/approved count) ──
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('affiliates')
        .select('id, status')
        .eq('email', email)
        .in('status', ['pending', 'approved'])
        .maybeSingle();
      if (emailCheckError) {
        console.error('[affiliate] email check error:', emailCheckError);
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
        city: form.city.trim() || null,
        ref_code: refCode,
        social_handles,
        audience_size: form.audience_size ? parseInt(form.audience_size, 10) : null,
        why_join: form.why_join.trim(),
        heard_from: form.heard_from,
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

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      dir="rtl"
      className="font-[Tajawal]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* ═════════════════ FORM (left) ═════════════════ */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-sky-500/15 rounded-3xl p-6 md:p-10 lg:p-12 space-y-8">

          {/* ── Section 1: Basic info ── */}
          <div>
            <SectionHeader num="١" title="معلوماتك الأساسية" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="الاسم الكامل"
                required
                value={form.full_name}
                onChange={(v) => set('full_name', v)}
                placeholder="مثال: محمد العتيبي"
                error={errors.full_name}
              />
              <Field
                label="الجوال"
                required
                type="tel"
                value={form.phone}
                onChange={(v) => set('phone', v)}
                placeholder="05XXXXXXXX"
                error={errors.phone}
                dir="ltr"
              />
              <Field
                label="الإيميل"
                required
                type="email"
                value={form.email}
                onChange={(v) => set('email', v)}
                placeholder="email@example.com"
                error={errors.email}
                dir="ltr"
              />
              <Field
                label="المدينة"
                optional
                value={form.city}
                onChange={(v) => set('city', v)}
                placeholder="مثال: الرياض"
              />
            </div>
          </div>

          {/* ── Section 2: Social accounts ── */}
          <div>
            <SectionHeader num="٢" title="حسابات التواصل" />
            <p className="text-xs text-slate-500 -mt-3 mb-4">
              حساب واحد على الأقل مطلوب — عشان نعرف جمهورك
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Twitter / X"
                value={form.twitter}
                onChange={(v) => set('twitter', v.replace(/^@/, ''))}
                placeholder="username"
                dir="ltr"
                iconPrefix="@"
              />
              <Field
                label="Instagram"
                value={form.instagram}
                onChange={(v) => set('instagram', v.replace(/^@/, ''))}
                placeholder="username"
                dir="ltr"
                iconPrefix="@"
              />
              <Field
                label="TikTok"
                value={form.tiktok}
                onChange={(v) => set('tiktok', v.replace(/^@/, ''))}
                placeholder="username"
                dir="ltr"
                iconPrefix="@"
              />
            </div>
            {errors.social && <p className="text-xs text-red-400 mt-2">{errors.social}</p>}
            <div className="mt-4">
              <Field
                label="مجموع المتابعين تقريباً"
                optional
                type="number"
                value={form.audience_size}
                onChange={(v) => set('audience_size', v.replace(/\D/g, ''))}
                placeholder="مثال: 5000"
                dir="ltr"
              />
            </div>
          </div>

          {/* ── Section 3: Join details ── */}
          <div>
            <SectionHeader num="٣" title="تفاصيل الانضمام" />
            <div className="space-y-4">

              {/* Ref code with live preview link */}
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>كود الإحالة الخاص فيك</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.ref_code}
                    onChange={(e) =>
                      set(
                        'ref_code',
                        e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12),
                      )
                    }
                    onBlur={() => checkRefCode(form.ref_code)}
                    placeholder="AHMED10"
                    dir="ltr"
                    maxLength={12}
                    className={`w-full h-12 bg-slate-800/40 border rounded-xl px-4 pl-10 text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/10 outline-none transition font-mono tracking-wider ${
                      errors.ref_code
                        ? 'border-red-500/50 focus:border-red-500/70'
                        : 'border-slate-700/50 focus:border-sky-500/60'
                    }`}
                  />
                  {refCodeStatus === 'checking' && (
                    <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 animate-spin" />
                  )}
                  {refCodeStatus === 'available' && (
                    <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                  {refCodeStatus === 'taken' && (
                    <AlertCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 font-mono" dir="ltr">
                  رابطك الشخصي: fluentia.academy/?ref=
                  <span className="text-sky-400 font-bold">
                    {form.ref_code.trim().toUpperCase() || 'YOUR_CODE'}
                  </span>
                </p>
                {errors.ref_code && <p className="text-xs text-red-400 mt-1">{errors.ref_code}</p>}
              </div>

              {/* why_join — textarea */}
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>ليش تبي تنضم لبرنامج شركاء طلاقة؟</span>
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.why_join}
                  onChange={(e) => set('why_join', e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="مثال: عندي جمهور مهتم بتطوير الذات وتعلّم اللغات..."
                  className={`w-full bg-slate-800/40 border rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/10 outline-none resize-none transition ${
                    errors.why_join
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-slate-700/50 focus:border-sky-500/60'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.why_join ? (
                    <p className="text-xs text-red-400">{errors.why_join}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-[10px] text-slate-600">{form.why_join.length}/500</p>
                </div>
              </div>

              {/* Custom dropdown — heard_from */}
              <CustomDropdown
                label="من وين سمعت عنا؟"
                required
                value={form.heard_from}
                onChange={(v) => set('heard_from', v)}
                options={HEARD_FROM_OPTIONS}
                placeholder="اختر..."
                error={errors.heard_from}
              />

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.terms_accepted}
                    onChange={(e) => set('terms_accepted', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition flex items-center justify-center">
                    {form.terms_accepted && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-300">
                  أوافق على{' '}
                  <a href="/partners/terms" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    الشروط والأحكام
                  </a>
                </span>
              </label>
              {errors.terms_accepted && (
                <p className="text-xs text-red-400 -mt-2">{errors.terms_accepted}</p>
              )}
            </div>
          </div>

          {/* ── Submit-level error ── */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition shadow-lg shadow-sky-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <span>🚀 قدّم طلبي الآن</span>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            بالضغط على "قدّم طلبي"، نراجع بياناتك ونرد خلال 48 ساعة على جوالك وإيميلك.
          </p>
        </div>

        {/* ═════════════════ STICKY PREVIEW (desktop only) ═════════════════ */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-sky-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">ملخص طلبك</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">الاسم</div>
                  <div className="text-white font-semibold truncate">
                    {form.full_name || <span className="text-slate-600">— سيظهر هنا —</span>}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">رابطك الشخصي</div>
                  <div className="font-mono text-xs text-sky-300 bg-slate-900/60 rounded-lg px-3 py-2 break-all" dir="ltr">
                    fluentia.academy/?ref={previewCode}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">العمولة المتوقعة</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-white font-black text-lg">100–400</span>
                <span className="text-slate-500"> ر.س</span>
                <br />
                لكل طالب ينضم عبر رابطك
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">المراجعة</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                نراجع طلبك خلال <span className="text-white font-bold">48 ساعة</span> ونرد عليك على الجوال والإيميل.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

/* ═════════════════ REUSABLE SUBCOMPONENTS ═════════════════ */

function SectionHeader({ num, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
        <span className="text-sky-300 font-black text-sm">{num}</span>
      </div>
      <h3 className="text-base md:text-lg font-bold text-white">{title}</h3>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, error,
  required, optional, type = 'text', dir = 'rtl', iconPrefix, maxLength,
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {required && <span className="text-red-400">*</span>}
        {optional && <span className="text-slate-600 text-[10px]">(اختياري)</span>}
      </label>
      <div className="relative">
        {iconPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
            {iconPrefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          dir={dir}
          className={`w-full h-12 bg-slate-800/40 border rounded-xl px-4 ${iconPrefix ? 'pl-8' : ''} text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/10 outline-none transition ${
            error
              ? 'border-red-500/50 focus:border-red-500/70'
              : 'border-slate-700/50 focus:border-sky-500/60'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function CustomDropdown({ label, value, onChange, options, placeholder, required, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  // Close on outside click (better than onBlur — keeps option clicks from being cancelled on mobile).
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {required && <span className="text-red-400">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-12 bg-slate-800/40 border rounded-xl px-4 text-white text-sm text-right flex items-center justify-between hover:border-slate-600 focus:ring-2 focus:ring-sky-500/10 outline-none transition ${
          error
            ? 'border-red-500/50 focus:border-red-500/70'
            : 'border-slate-700/50 focus:border-sky-500/60'
        }`}
      >
        <span className={selected && selected.value ? 'text-white' : 'text-slate-600'}>
          {selected && selected.value ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-right px-4 py-2.5 text-sm hover:bg-sky-500/10 transition ${
                value === opt.value ? 'bg-sky-500/10 text-sky-300' : 'text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
