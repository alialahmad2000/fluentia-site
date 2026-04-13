import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PartnersSubmitted() {
  const [params] = useSearchParams()
  const name = params.get('name') || 'شريكنا'

  return (
    <div className="min-h-dvh flex items-center justify-center p-6" dir="rtl" style={{ background: '#060e1c' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={48} className="text-emerald-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white font-['Tajawal']">
          شكراً {name}!
        </h1>
        <p className="text-lg text-white/70 font-['Tajawal']">
          استلمنا طلبك بنجاح
        </p>

        <div className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-white/60 font-['Tajawal'] leading-relaxed">
            بنراجع طلبك خلال 48 ساعة ونراسلك على الإيميل بالرد.
          </p>
          <p className="text-sm text-white/60 font-['Tajawal'] leading-relaxed">
            إذا عندك أي استفسار، تواصل معنا عبر الواتساب.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <a href="https://twitter.com/fluaborabia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://instagram.com/fluaborabia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
          </a>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold font-['Tajawal'] transition"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
      </motion.div>
    </div>
  )
}
