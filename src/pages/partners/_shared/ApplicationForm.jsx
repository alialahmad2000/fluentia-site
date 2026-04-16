import { useState } from 'react';
import supabase from '../../../utils/supabase';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

// The `theme` prop is kept for call-site backward compatibility but the
// redesigned form is locked to the dark-sky palette used on /partners.
// eslint-disable-next-line no-unused-vars
export default function ApplicationForm({ theme: _theme }) {
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
    // city is now optional per redesign
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
        city: form.city.trim() || null,
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

  // Shared Tailwind chains (kept as constants to avoid 30-line className soup on every input).
  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white ' +
    'placeholder:text-white/25 focus:border-sky-400 focus:bg-white/10 ' +
    'focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all';
  const labelClass = 'block text-sm font-medium text-white/80 mb-1.5';
  const optionalTag = <span className="text-white/30 text-xs font-normal">(اختياري)</span>;
  const errorLine = (msg) =>
    msg ? <p className="text-red-300 text-xs mt-1">{msg}</p> : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      dir="rtl"
      className="font-[Tajawal] space-y-8"
    >
      {/* ═══ GROUP 1: Basic Info ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 text-sm font-bold">١</span>
          <h3 className="text-lg font-bold text-white">معلوماتك الأساسية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full name */}
          <div>
            <label className={labelClass}>الاسم الكامل</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="مثال: محمد العتيبي"
              className={`${inputClass} text-right`}
            />
            {errorLine(errors.full_name)}
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>الجوال</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="05XXXXXXXX"
              dir="ltr"
              className={`${inputClass} text-right`}
            />
            {errorLine(errors.phone)}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>الإيميل</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@example.com"
              dir="ltr"
              className={`${inputClass} text-right`}
            />
            {errorLine(errors.email)}
          </div>

          {/* City — optional */}
          <div>
            <label className={labelClass}>
              المدينة {optionalTag}
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="مثال: الرياض"
              className={`${inputClass} text-right`}
            />
          </div>
        </div>
      </div>

      {/* ═══ GROUP 2: Social ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 text-sm font-bold">٢</span>
          <h3 className="text-lg font-bold text-white">حسابات التواصل</h3>
        </div>
        <p className="text-white/40 text-sm mb-5 mr-9">حساب واحد على الأقل مطلوب — عشان نعرف جمهورك</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Twitter / X</label>
            <input
              type="text"
              value={form.twitter}
              onChange={e => set('twitter', e.target.value)}
              placeholder="@username"
              dir="ltr"
              className={`${inputClass} text-right`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Instagram</label>
            <input
              type="text"
              value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              placeholder="@username"
              dir="ltr"
              className={`${inputClass} text-right`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">TikTok</label>
            <input
              type="text"
              value={form.tiktok}
              onChange={e => set('tiktok', e.target.value)}
              placeholder="@username"
              dir="ltr"
              className={`${inputClass} text-right`}
            />
          </div>
        </div>
        {errorLine(errors.social)}

        <div className="mt-4">
          <label className={labelClass}>
            مجموع المتابعين تقريباً {optionalTag}
          </label>
          <input
            type="number"
            value={form.followers_count}
            onChange={e => set('followers_count', e.target.value)}
            placeholder="مثال: 5000"
            dir="ltr"
            className={`${inputClass} md:w-1/2 text-right`}
          />
        </div>
      </div>

      {/* ═══ GROUP 3: Final ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 text-sm font-bold">٣</span>
          <h3 className="text-lg font-bold text-white">الأخير!</h3>
        </div>
        <p className="text-white/40 text-sm mb-5 mr-9">اختر كودك الفريد واكتب لنا ليش تبي تنضم</p>

        {/* Ref code */}
        <div className="mb-4">
          <label className={labelClass}>كود الإحالة الخاص فيك</label>
          <div className="relative md:w-1/2">
            <input
              type="text"
              value={form.ref_code}
              onChange={e => {
                const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
                set('ref_code', v);
              }}
              onBlur={() => checkRefCode(form.ref_code)}
              placeholder="مثال: AHMED10"
              dir="ltr"
              maxLength={12}
              minLength={4}
              className={`${inputClass} font-mono tracking-wider uppercase text-right pl-10`}
            />
            {refCodeStatus === 'checking' && (
              <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 animate-spin" />
            )}
            {refCodeStatus === 'available' && (
              <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
            )}
            {refCodeStatus === 'taken' && (
              <AlertCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
            )}
          </div>
          <p className="text-white/30 text-xs mt-1.5">
            من 4 إلى 12 حرف/رقم إنجليزي — هذا الكود يظهر في رابطك:{' '}
            <span className="text-sky-400/60 font-mono">
              fluentia.academy/?ref=
              <span className="text-sky-300">{form.ref_code || '...'}</span>
            </span>
          </p>
          {errorLine(errors.ref_code)}
        </div>

        {/* Motivation */}
        <div className="mb-4">
          <label className={labelClass}>ليش تبي تنضم لبرنامج شركاء طلاقة؟</label>
          <textarea
            value={form.motivation}
            onChange={e => set('motivation', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="مثال: عندي جمهور مهتم بتطوير الذات وتعلم اللغات..."
            className={`${inputClass} resize-none text-right`}
          />
          <p className="text-white/30 text-xs mt-1 text-left">{form.motivation.length}/500</p>
          {errorLine(errors.motivation)}
        </div>

        {/* Source */}
        <div className="mb-6">
          <label className={labelClass}>من وين سمعت عنا؟</label>
          <select
            value={form.source}
            onChange={e => set('source', e.target.value)}
            className={`${inputClass} md:w-1/2 cursor-pointer appearance-none text-right`}
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ background: '#0f172a', color: '#94a3b8' }}>اختر...</option>
            <option value="صديق" style={{ background: '#0f172a', color: '#fff' }}>صديق</option>
            <option value="سوشال ميديا" style={{ background: '#0f172a', color: '#fff' }}>سوشال ميديا</option>
            <option value="إعلان" style={{ background: '#0f172a', color: '#fff' }}>إعلان</option>
            <option value="غير ذلك" style={{ background: '#0f172a', color: '#fff' }}>غير ذلك</option>
          </select>
          {errorLine(errors.source)}
        </div>

        {/* Terms */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={e => set('terms_accepted', e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/30 cursor-pointer accent-sky-500"
          />
          <span className="text-white/70 text-sm">
            أوافق على{' '}
            <a href="/partners/terms" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
              الشروط والأحكام
            </a>
          </span>
        </label>
        {errorLine(errors.terms_accepted)}
      </div>

      {/* ═══ ERROR ═══ */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ═══ SUBMIT ═══ */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-sky-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.01] flex items-center justify-center gap-2 text-lg"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            جاري التقديم...
          </>
        ) : (
          <>
            قدّم طلبي
            <Send size={20} />
          </>
        )}
      </button>

      {/* ═══ REASSURANCE ═══ */}
      <p className="text-center text-white/40 text-sm">
        ✓ نراجع طلبك خلال 48 ساعة ونراسلك على الإيميل
      </p>
    </form>
  );
}
