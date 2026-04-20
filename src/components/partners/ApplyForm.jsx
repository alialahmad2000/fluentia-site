import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Field, TextInput } from './Field';
import { CustomDropdown } from './CustomDropdown';
import { Loader2, AlertCircle } from 'lucide-react';

const HEARD_FROM_OPTIONS = [
  { value: 'صديق', label: 'صديق / معرفة' },
  { value: 'سوشال', label: 'قنوات التواصل الاجتماعي' },
  { value: 'إعلان', label: 'إعلان' },
  { value: 'غير ذلك', label: 'غير ذلك' },
];

const PHONE_RE = /^(\+966|05)\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_CODE_RE = /^[A-Z0-9]{4,16}$/;

function SectionHeader({ title, subtitle }) {
  return (
    <div className="space-y-1 text-right">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-white/55">{subtitle}</p>}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
  );
}

export default function ApplyForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    ref_code: '',
    twitter: '',
    instagram: '',
    tiktok: '',
    snapchat: '',
    audience_size: '',
    why_join: '',
    heard_from: '',
    terms_accepted: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => {
    const v = e?.target ? e.target.value : e;
    setForm(f => ({ ...f, [k]: v }));
    setErrors(er => ({ ...er, [k]: undefined, _general: undefined }));
  };

  function validate() {
    const er = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 3)
      er.full_name = 'الاسم الكامل مطلوب (3 أحرف على الأقل)';
    if (!EMAIL_RE.test(form.email.trim()))
      er.email = 'إيميل غير صحيح';
    const phoneClean = form.phone.trim().replace(/\s+/g, '');
    if (!PHONE_RE.test(phoneClean))
      er.phone = 'رقم الجوال يبدأ بـ 05 أو +966 ويتكون من 10 أرقام';
    if (!form.ref_code.trim())
      er.ref_code = 'اختر كود الإحالة الخاص بك';
    else if (!REF_CODE_RE.test(form.ref_code.trim().toUpperCase()))
      er.ref_code = 'الكود: حروف إنجليزية وأرقام فقط (4-16 خانة)';
    if (form.audience_size && isNaN(parseInt(form.audience_size, 10)))
      er.audience_size = 'أدخل رقماً صحيحاً';
    if (!form.why_join.trim() || form.why_join.trim().length < 10)
      er.why_join = 'اكتب لنا لماذا تريد الانضمام (10 أحرف على الأقل)';
    if (!form.heard_from)
      er.heard_from = 'اختر من القائمة';
    if (!form.terms_accepted)
      er.terms_accepted = 'يجب الموافقة على الشروط';
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErrors(er => ({ ...er, _general: undefined }));
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim().replace(/\s+/g, ''),
        city: form.city.trim() || null,
        ref_code: form.ref_code.trim().toUpperCase(),
        status: 'pending',
        social_handles: {
          twitter:   form.twitter.trim()   || '',
          instagram: form.instagram.trim() || '',
          tiktok:    form.tiktok.trim()    || '',
          snapchat:  form.snapchat.trim()  || '',
        },
        audience_size: form.audience_size ? parseInt(form.audience_size, 10) : null,
        why_join: form.why_join.trim(),
        heard_from: form.heard_from,
        terms_accepted_at: new Date().toISOString(),
      };

      console.log('[affiliate-apply] payload =', payload);

      // Do NOT use .select().single() — SELECT policy blocks anon from reading back the row.
      const { error } = await supabase
        .from('affiliates')
        .insert(payload);

      if (error) {
        console.error('[affiliate-apply] insert error:', error);

        if (error.code === '23505') {
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('ref_code'))
            setErrors({ ref_code: 'هذا الكود مستخدم — جرّب كود آخر' });
          else if (msg.includes('email'))
            setErrors({ email: 'يوجد طلب سابق بنفس الإيميل' });
          else
            setErrors({ _general: 'طلب مكرر — تواصل معنا على الواتساب' });
          setSubmitting(false);
          return;
        }

        if (error.code === '42501') {
          setErrors({ _general: 'خطأ في صلاحيات قاعدة البيانات — تم إبلاغ الفريق التقني' });
          setSubmitting(false);
          return;
        }

        if (error.code === '23502') {
          setErrors({ _general: `حقل مطلوب ناقص: ${error.details || error.message}` });
          setSubmitting(false);
          return;
        }

        setErrors({ _general: `خطأ غير متوقع: ${error.message || 'حاول مرة ثانية'}` });
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      const name = encodeURIComponent(form.full_name.trim());
      const code = encodeURIComponent(form.ref_code.trim().toUpperCase());
      window.location.href = `/partners/submitted?name=${name}&code=${code}`;
    } catch (err) {
      console.error('[affiliate-apply] exception:', err);
      setErrors({ _general: 'خطأ غير متوقع، حاول مرة ثانية' });
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
        <p style={{ color: '#6ee7b7', fontSize: 18 }}>تم استلام طلبك ✨ جاري التحويل...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      dir="rtl"
      noValidate
      className="mx-auto w-full max-w-2xl space-y-10"
    >
      {/* ═══════════ Section 1 — Personal Info ═══════════ */}
      <section className="space-y-6">
        <SectionHeader title="معلوماتك الشخصية" subtitle="كيف نتواصل معك" />

        <Field label="الاسم الكامل" required error={errors.full_name}>
          <TextInput value={form.full_name} onChange={set('full_name')} placeholder="محمد عبدالله الأحمد" error={errors.full_name} autoComplete="name" />
        </Field>

        <Field label="رقم الجوال" required error={errors.phone} hint="يبدأ بـ 05">
          <TextInput value={form.phone} onChange={set('phone')} placeholder="05xxxxxxxx" type="tel" inputMode="numeric" autoComplete="tel" error={errors.phone} />
        </Field>

        <Field label="الإيميل" required error={errors.email}>
          <TextInput value={form.email} onChange={set('email')} placeholder="you@example.com" type="email" autoComplete="email" error={errors.email} />
        </Field>

        <Field label="المدينة" error={errors.city}>
          <TextInput value={form.city} onChange={set('city')} placeholder="الرياض" autoComplete="address-level2" error={errors.city} />
        </Field>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 2 — Marketing Profile ═══════════ */}
      <section className="space-y-6">
        <SectionHeader title="بياناتك التسويقية" subtitle="معلومات عن جمهورك وكودك" />

        <Field label="كود الإحالة الخاص بك" required error={errors.ref_code} hint="4-16 حرف/رقم إنجليزي — سيُعرض في رابطك">
          <TextInput
            value={form.ref_code}
            onChange={(e) => setForm(f => ({ ...f, ref_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
            placeholder="AHMAD25"
            error={errors.ref_code}
          />
        </Field>

        <Field label="تقريباً كم متابع لديك إجمالاً؟" error={errors.audience_size} hint="اختياري — رقم فقط">
          <TextInput value={form.audience_size} onChange={set('audience_size')} placeholder="5000" type="number" inputMode="numeric" error={errors.audience_size} />
        </Field>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 3 — Socials (optional, clearly grouped) ═══════════ */}
      <section className="space-y-6">
        <SectionHeader title="حساباتك على السوشال" subtitle="اختياري — ساعدنا نفهم قنواتك" />

        <div className="space-y-5">
          <Field label="تويتر / X">
            <TextInput value={form.twitter} onChange={set('twitter')} placeholder="@handle" />
          </Field>
          <Field label="انستغرام">
            <TextInput value={form.instagram} onChange={set('instagram')} placeholder="@handle" />
          </Field>
          <Field label="تيك توك">
            <TextInput value={form.tiktok} onChange={set('tiktok')} placeholder="@handle" />
          </Field>
          <Field label="سناب شات">
            <TextInput value={form.snapchat} onChange={set('snapchat')} placeholder="@handle" />
          </Field>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 4 — Application ═══════════ */}
      <section className="space-y-6">
        <SectionHeader title="طلبك للانضمام" subtitle="آخر خطوتين وانتهينا" />

        <Field label="لماذا تريد الانضمام لبرنامج الشركاء؟" required error={errors.why_join}>
          <textarea
            value={form.why_join}
            onChange={set('why_join')}
            dir="rtl"
            rows={5}
            placeholder="احكي لنا عن جمهورك وكيف تخطط لتسويق طلاقة"
            className={`
              w-full px-5 py-4 rounded-xl resize-none
              text-white placeholder:text-white/35
              border-2 transition-all duration-150
              focus:outline-none focus:ring-4 focus:ring-amber-400/20
              ${errors.why_join
                ? 'bg-red-950/20 border-red-400/50 focus:border-red-400'
                : 'bg-white/[0.04] border-white/15 hover:border-white/30 focus:border-amber-400/70 focus:bg-white/[0.06]'}
            `}
            style={{
              colorScheme: 'dark',
              textAlign: 'right',
              unicodeBidi: 'plaintext',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
            }}
          />
        </Field>

        <Field label="من أين سمعت عنا؟" required error={errors.heard_from}>
          <CustomDropdown
            value={form.heard_from}
            onChange={(v) => setForm(f => ({ ...f, heard_from: v }))}
            options={HEARD_FROM_OPTIONS}
            placeholder="اختر..."
            error={errors.heard_from}
          />
        </Field>
      </section>

      {/* ═══════════ Terms + Submit ═══════════ */}
      <div className="space-y-6 pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={(e) => setForm(f => ({ ...f, terms_accepted: e.target.checked }))}
            className="mt-1 w-5 h-5 accent-amber-400 cursor-pointer"
          />
          <span className="text-sm text-white/85 leading-relaxed">
            أوافق على{' '}
            <a href="/partners/terms" target="_blank" className="text-amber-300 underline underline-offset-4 hover:text-amber-200">
              شروط برنامج الشركاء
            </a>
          </span>
        </label>
        {errors.terms_accepted && <p className="text-xs text-red-300 text-right -mt-3">{errors.terms_accepted}</p>}

        {errors._general && (
          <div className="rounded-xl bg-red-500/10 border-2 border-red-400/30 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 flex-1 text-right leading-relaxed">{errors._general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="
            w-full py-5 rounded-xl
            bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500
            text-[#0b1628] font-bold text-lg
            shadow-[0_8px_24px_-8px_rgba(251,191,36,0.5)]
            transition-all duration-150
            hover:scale-[1.01] hover:shadow-[0_12px_32px_-8px_rgba(251,191,36,0.6)]
            active:scale-[0.99]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center gap-2
          "
        >
          {submitting
            ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>جاري الإرسال...</span></>)
            : (<span>إرسال الطلب</span>)}
        </button>
      </div>
    </form>
  );
}
