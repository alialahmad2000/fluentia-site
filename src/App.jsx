import React, { useState, useEffect, useRef } from "react";

const WA_BASE = "https://wa.me/966558669974?text=";
const waMsg = (pkg) => WA_BASE + encodeURIComponent(`السلام عليكم، أبي أحجز لقاء مبدئي مجاني — مهتم بباقة ${pkg}`);
const WA = WA_BASE + encodeURIComponent("السلام عليكم، أبي أحجز لقاء مبدئي مجاني مع المدرب");
const WA_OFF = WA_BASE + encodeURIComponent("السلام عليكم، أبي أستفيد من عرض الـ20%");
const TT = "https://www.tiktok.com/@fluentia_";
const IG = "https://www.instagram.com/fluentia__";

const reviews = [
  { n: "الجوهرة", r: "ثالث ثانوي", t: "ما كنت أتكلم ولا أقرأ والحين أقدر أتكلم وأقرأ بأقل من ١٠ دقايق! كسرت شوط كبير.", tag: "قصة نجاح" },
  { n: "ليان", r: "جامعة الملك سعود", t: "نتعلم كل المهارات الأربع والشرح بالقرامر ماشي خطوه بخطوه والفعاليات زي كاهوت رهيبة!", tag: "القرامر" },
  { n: "الهنوف", r: "English Level 2", t: "فرق كبير بين مستواي بالبداية واللحين! متابعة دائماً والمجموعة بسيطة تقدر تتجاوب مع الكل.", tag: "تقدم سريع" },
  { n: "هوازن", r: "دورة IELTS", t: "الدكتور علي يتميّز بأسلوبه الراقي والمحفّز. كان مثالاً في المهنية والتمكن العلمي.", tag: "IELTS" },
  { n: "فيصل", r: "جامعة الملك سعود", t: "الأنشطة والألعاب ومشروعات السبيكنج والكلاسات الخصوصيه اللي تركز على مهارتك. جزيل الشكر!", tag: "سبيكنج" },
  { n: "مها", r: "طالبة تمريض", t: "كتاب الـGrammar رهيب! والمصطلحات مره كويسه. بإذن الله نهكر اللغه!", tag: "القرامر" },
  { n: "لمى", r: "جامعة الملك عبدالعزيز", t: "القرامر والأزمنة للحين أتذكرها! والأكسنت حلو وكان يعلمنا نطق الكلمات صح.", tag: "النطق" },
];

const pkgs = [
  { id:1, nm:"أساس", sub:"ابدأ رحلتك", pr:750, pop:false, prem:false, f:[
    {t:"حصتين جماعية أسبوعياً",ok:1},{t:"حد أقصى 7 طلاب",ok:1},{t:"تيليجرام للطلاب",ok:1},{t:"تقييم شهري",ok:1},{t:"مواد أساسية",ok:1},{t:"متابعة يومية",ok:0},{t:"محتوى مسجل",ok:0},{t:"حصص فردية",ok:0},{t:"تقرير تقدّم",ok:0}
  ]},
  { id:2, nm:"طلاقة", sub:"الخيار الأذكى", pr:1100, pop:true, prem:false, f:[
    {t:"حصتين جماعية أسبوعياً",ok:1},{t:"حد أقصى 7 طلاب",ok:1},{t:"تيليجرام للطلاب",ok:1},{t:"تقييم كل أسبوعين",ok:1,hl:1},{t:"مواد + تمارين تفاعلية",ok:1,hl:1},{t:"متابعة يومية",ok:1,hl:1},{t:"محتوى مسجل",ok:1,hl:1},{t:"حصة فردية شهرياً",ok:1,hl:1},{t:"تقرير تقدّم مفصّل",ok:1,hl:1}
  ]},
  { id:3, nm:"تميّز", sub:"لمن يريد الأفضل", pr:1500, pop:false, prem:true, f:[
    {t:"حصتين جماعية أسبوعياً",ok:1},{t:"حد أقصى 7 طلاب",ok:1},{t:"تيليجرام للطلاب",ok:1},{t:"تقييم أسبوعي",ok:1,hl:1},{t:"مواد + بنك أسئلة حصري",ok:1,hl:1},{t:"متابعة مكثّفة يومياً",ok:1,hl:1},{t:"مكتبة دروس غير محدودة",ok:1,hl:1},{t:"4 حصص فردية شهرياً",ok:1,hl:1},{t:"تقرير أسبوعي + خطة تطوير",ok:1,hl:1}
  ]},
];

const fqs = [
  {q:"كيف أسجل وأبدأ؟",a:"تواصل معنا عبر الواتساب ونرتب لك لقاء مبدئي مجاني مع المدرب. تتعرف على أسلوبه وطريقة شرحه، وبعدها تقرر إذا تبي تسجل."},
  {q:"هل الكلاسات أونلاين؟",a:"نعم، جميع كلاساتنا لايف عبر زووم من أي مكان. كل اللي تحتاجه جوال أو لابتوب وإنترنت."},
  {q:"كم عدد الطلاب بالكلاس؟",a:"حد أقصى 7 طلاب فقط لضمان الجودة والتفاعل."},
  {q:"متى تبدأ الدورات؟",a:"نعتمد الأشهر الميلادية — الكورسات تبدأ مع بداية كل شهر ميلادي. ومع ذلك تقدر تنضم بأي وقت والمدرب يعوّضك ما فاتك."},
  {q:"متى أوقات الكلاسات؟",a:"بعد العصر حتى بعد العشاء. في رمضان بعد العشاء فقط."},
  {q:"هل أقدر أغير الباقة؟",a:"نعم! الدفع شهري بدون أي التزام."},
  {q:"هل المدربين سعوديين؟",a:"نعم، جميع مدربينا سعوديون متخصصون."},
  {q:"وش اللقاء المبدئي المجاني؟",a:"هو لقاء مباشر مع المدرب نقدمه لأي طالب متحمس. تتعرف على أسلوب التدريس وتشوف إذا يناسبك قبل ما تلتزم بأي شيء."},
];

/* ─── Colors from logo ─── */
const C = {
  navy: "#1a2d50",
  navyDeep: "#0f1b33",
  navyDark: "#0a1225",
  sky: "#38bdf8",
  skyLight: "#7dd3fc",
  skyGlow: "rgba(56,189,248,0.12)",
  white: "#f8fafc",
  gold: "#fbbf24",
};

function useVis(th = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: th });
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function Reveal({ children, d = 0, y = 60, style = {} }) {
  const [ref, v] = useVis();
  return React.createElement("div", {
    ref,
    style: { opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(" + y + "px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) " + d + "s", ...style }
  }, children);
}

function NumUp({ target, suffix = "" }) {
  const [ref, v] = useVis();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!v) return;
    let s = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(id); } else setVal(s); }, 30);
    return () => clearInterval(id);
  }, [v, target]);
  return React.createElement("span", { ref }, val + suffix);
}

function useCD(td) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(td) - new Date();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4), s: Math.floor((diff % 6e4) / 1e3) });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [td]);
  return t;
}

export default function App() {
  const [hC, setHC] = useState(null);
  const [scr, setScr] = useState(false);
  const [tI, setTI] = useState(0);
  const [fO, setFO] = useState(null);
  const sRef = useRef(null);
  const [dl] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString(); });
  const cd = useCD(dl);
  const p2 = n => String(n).padStart(2, "0");

  useEffect(() => { const h = () => setScr(window.scrollY > 60); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { const i = setInterval(() => setTI(p => (p + 1) % reviews.length), 5000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const container = sRef.current;
    if (!container || !container.children[tI]) return;
    const child = container.children[tI];
    const scrollPos = child.offsetLeft - container.offsetWidth / 2 + child.offsetWidth / 2;
    container.scrollTo({ left: scrollPos, behavior: "smooth" });
  }, [tI]);

  return (
    <div style={{ background: C.navyDark, color: C.white, minHeight: "100vh", overflowX: "hidden", direction: "rtl" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Tajawal',sans-serif}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(56,189,248,0.25);color:#fff}
        a{text-decoration:none;color:inherit}
        .hide-sb::-webkit-scrollbar{display:none}
        @keyframes glow{0%,100%{filter:blur(60px) brightness(1)}50%{filter:blur(80px) brightness(1.3)}}
        @keyframes drift{0%{transform:translate(0,0)}33%{transform:translate(30px,-20px)}66%{transform:translate(-20px,15px)}100%{transform:translate(0,0)}}
        @keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}70%{box-shadow:0 0 0 18px rgba(37,211,102,0)}}
        @keyframes textShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(56,189,248,0.15)}50%{border-color:rgba(56,189,248,0.4)}}
        body{overflow-x:hidden}
      `}</style>

      {/* ═══ OFFER STRIP ═══ */}
      <div style={{ background: C.sky, padding: "10px 20px", textAlign: "center", position: "relative", zIndex: 1001, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)", animation: "textShine 2s linear infinite", backgroundSize: "200% 100%" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap", position: "relative" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, color: C.navyDark }}>
            🔥 خصم 20% لأول 5 مشتركين
          </span>
          <div style={{ display: "flex", gap: "4px", direction: "ltr" }}>
            {[{ v: cd.d, l: "د" }, { v: cd.h, l: "س" }, { v: cd.m, l: "د" }, { v: cd.s, l: "ث" }].map((u, i) => (
              <div key={i} style={{ background: C.navyDark, borderRadius: "6px", padding: "2px 8px", textAlign: "center", minWidth: "36px" }}>
                <span style={{ fontSize: "15px", fontWeight: 900, color: C.sky, fontFamily: "'Playfair Display',serif" }}>{p2(u.v)}</span>
                <span style={{ fontSize: "8px", color: "#667", marginRight: "2px" }}>{u.l}</span>
              </div>
            ))}
          </div>
          <a href={WA_OFF} target="_blank" rel="noopener noreferrer" style={{ background: C.navyDark, color: C.sky, padding: "4px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 800 }}>
            سجّل →
          </a>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scr ? "rgba(10,18,37,0.92)" : "transparent",
        backdropFilter: scr ? "blur(30px) saturate(1.5)" : "none",
        borderBottom: scr ? "1px solid rgba(56,189,248,0.06)" : "none",
        transition: "all 0.5s", padding: "14px 28px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
              <span style={{ color: C.sky }}>F</span>luentia
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a href="#pricing" style={{ color: "#8899aa", fontSize: "13px", fontWeight: 500 }}>الباقات</a>
            <a href="#reviews" style={{ color: "#8899aa", fontSize: "13px", fontWeight: 500 }}>آراء الطلاب</a>
            <a href={WA} target="_blank" rel="noopener noreferrer" style={{
              background: C.sky, color: C.navyDark, padding: "8px 22px", borderRadius: "100px",
              fontSize: "13px", fontWeight: 800,
            }}>احجز لقاءك المجاني</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", padding: "60px 28px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%)", animation: "glow 6s ease-in-out infinite, drift 20s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,45,80,0.3), transparent 70%)", animation: "glow 8s ease-in-out infinite 2s, drift 25s ease-in-out infinite reverse", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(56,189,248,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "700px" }}>
            <Reveal>
              <div style={{ display: "inline-block", padding: "6px 18px", marginBottom: "28px", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "100px", color: C.sky, fontSize: "12px", fontWeight: 700, letterSpacing: "1px" }}>
                أكاديمية سعودية متخصصة
              </div>
            </Reveal>
            <Reveal d={0.1} y={80}>
              <h1 style={{ fontSize: "clamp(44px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.05, marginBottom: "24px", color: "#fff", letterSpacing: "-2px" }}>
                تكلّم
                <br />
                <span style={{ background: "linear-gradient(135deg, " + C.sky + ", " + C.skyLight + ", #fff, " + C.sky + ")", backgroundSize: "300% 100%", animation: "textShine 4s linear infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  إنجليزي
                </span>
                <br />
                بطلاقة<span style={{ color: C.sky }}>.</span>
              </h1>
            </Reveal>
            <Reveal d={0.2}>
              <p style={{ fontSize: "17px", color: "#8899aa", lineHeight: 2, marginBottom: "40px", maxWidth: "440px", fontWeight: 300 }}>
                مدربون سعوديون · كلاسات لايف · حد أقصى <span style={{ color: C.sky, fontWeight: 700 }}>٧</span> طلاب
                <br />الكورسات تبدأ مع بداية كل شهر ميلادي — وتقدر تنضم بأي وقت.
              </p>
            </Reveal>
            <Reveal d={0.3}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: C.sky, color: C.navyDark, padding: "16px 36px", borderRadius: "60px",
                  fontSize: "16px", fontWeight: 800, boxShadow: "0 0 40px rgba(56,189,248,0.15)",
                }}>
                  احجز لقاءك المجاني مع المدرب ←
                </a>
                <a href="#pricing" style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#aaa",
                  padding: "16px 28px", borderRadius: "60px", fontSize: "14px", fontWeight: 500,
                }}>الباقات والأسعار</a>
              </div>
            </Reveal>
            <Reveal d={0.5}>
              <div style={{ display: "flex", gap: "48px", marginTop: "64px" }}>
                {[{ n: 7, s: "", l: "طالب كحد أقصى" }, { n: 100, s: "+", l: "طالب وطالبة" }].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {React.createElement(NumUp, { target: s.n, suffix: s.s })}
                    </div>
                    <div style={{ fontSize: "12px", color: "#556677", marginTop: "4px", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>4.9</div>
                  <div style={{ fontSize: "12px", color: "#556677", marginTop: "4px", fontWeight: 500 }}>تقييم ⭐</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div style={{ overflow: "hidden", padding: "20px 0", borderTop: "1px solid rgba(56,189,248,0.04)", borderBottom: "1px solid rgba(56,189,248,0.04)" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "fit-content" }}>
          {Array(2).fill(["قرامر", "سبيكنج", "ريدنج", "رايتنج", "لسنج", "IELTS", "نطق", "مفردات", "محادثة"]).flat().map((w, i) => (
            <span key={i} style={{ padding: "0 24px", fontSize: "14px", color: "#334455", fontWeight: 700, letterSpacing: "1px", whiteSpace: "nowrap" }}>
              {w} <span style={{ color: C.sky, margin: "0 8px", opacity: 0.5 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: "100px 28px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "60px" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                ليش <span style={{ color: C.sky }}>مختلفين</span>؟
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(56,189,248,0.1), transparent)" }} />
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2px" }}>
            {[
              { n: "01", t: "مدربون سعوديون", d: "يفهمون تحدياتك ويتكلمون لغتك. مو أجنبي ما يعرف وضعك.", c: C.sky },
              { n: "02", t: "٧ طلاب كحد أقصى", d: "كل طالب ياخذ وقته الكامل بالتحدث والتفاعل مع المدرب.", c: C.gold },
              { n: "03", t: "متابعة يومية حقيقية", d: "مو بس كلاسات — مدربك معك يومياً عبر تيليجرام.", c: "#a78bfa" },
              { n: "04", t: "نتائج ملموسة", d: "تقييمات دورية وتقارير تقدم تشوف تطورك بعينك.", c: "#f472b6" },
            ].map((item, i) => (
              <Reveal key={i} d={i * 0.1}>
                <div style={{
                  background: "rgba(56,189,248,0.02)", border: "1px solid rgba(56,189,248,0.04)",
                  padding: "40px 32px", transition: "all 0.5s", cursor: "default", position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.05)"; e.currentTarget.style.borderColor = item.c + "33"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.02)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.04)"; }}
                >
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "48px", fontWeight: 900, color: item.c, opacity: 0.12, position: "absolute", top: "16px", left: "20px", lineHeight: 1 }}>{item.n}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "10px", position: "relative" }}>{item.t}</h3>
                  <p style={{ fontSize: "14px", color: "#8899aa", lineHeight: 1.8, position: "relative" }}>{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="reviews" style={{ padding: "100px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px", marginBottom: "48px" }}>
          <Reveal>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
              آراء <span style={{ color: C.sky }}>طلابنا</span>
            </span>
          </Reveal>
        </div>
        <div ref={sRef} className="hide-sb" style={{ display: "flex", gap: "16px", overflowX: "auto", padding: "0 28px 24px", scrollSnapType: "x mandatory" }}>
          {reviews.map((rv, i) => (
            <div key={i} onClick={() => setTI(i)} style={{
              minWidth: "300px", maxWidth: "340px", flex: "0 0 auto", scrollSnapAlign: "center",
              background: tI === i ? "rgba(56,189,248,0.04)" : "rgba(255,255,255,0.015)",
              border: tI === i ? "1px solid rgba(56,189,248,0.15)" : "1px solid rgba(255,255,255,0.03)",
              borderRadius: "20px", padding: "32px 26px", cursor: "pointer", transition: "all 0.5s",
            }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: "100px", background: "rgba(56,189,248,0.08)", color: C.sky, fontSize: "11px", fontWeight: 700, marginBottom: "16px" }}>{rv.tag}</div>
              <p style={{ color: "#bbc", fontSize: "14px", lineHeight: 2, marginBottom: "24px", minHeight: "80px", fontWeight: 300 }}>"{rv.t}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, " + C.sky + ", " + C.navy + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff" }}>
                  {rv.n[0]}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{rv.n}</div>
                  <div style={{ fontSize: "11px", color: "#556677" }}>{rv.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
          {reviews.map((_, i) => (
            <div key={i} onClick={() => setTI(i)} style={{
              width: tI === i ? "32px" : "8px", height: "4px", borderRadius: "100px",
              cursor: "pointer", transition: "all 0.4s",
              background: tI === i ? C.sky : "rgba(255,255,255,0.06)",
            }} />
          ))}
        </div>
      </section>

      {/* ═══ SUCCESS STORY ═══ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Reveal>
            <div style={{
              position: "relative", padding: "48px 36px",
              background: "linear-gradient(135deg, rgba(56,189,248,0.03), rgba(26,45,80,0.1))",
              border: "1px solid rgba(56,189,248,0.1)", borderRadius: "24px",
              animation: "borderGlow 4s ease-in-out infinite",
            }}>
              <div style={{ position: "absolute", top: "-14px", right: "32px", background: C.navyDark, padding: "4px 20px", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "100px", fontSize: "12px", fontWeight: 700, color: C.sky }}>
                قصة نجاح
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "20px", lineHeight: 1.4 }}>
                من الصفر إلى مستوى
                <br /><span style={{ color: C.sky }}>المتحدثين الأصليين</span>
              </h3>
              <div style={{ color: "#8899aa", fontSize: "14px", lineHeight: 2.1, fontWeight: 300 }}>
                <p style={{ marginBottom: "12px" }}>بدأت <strong style={{ color: "#fff", fontWeight: 700 }}>الجوهرة</strong> وهي في آخر سنة بالثانوية. لغتها كانت ضعيفة جداً لكنها كانت متحمسة.</p>
                <p style={{ marginBottom: "12px" }}>مرّت بمراحل — حماس ثم فقدان حماس ثم رجوع. لكن المدرب كان يتابع ويحفّز خطوة بخطوة.</p>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: "12px" }}>الآن؟ قراءتها قريبة جداً من المتحدثين الأصليين.</p>
                <p style={{ color: C.sky, fontWeight: 700 }}>السر؟ اجتهاد + مدرب يتابع وحريص ✦</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: "100px 28px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                اختر <span style={{ color: C.sky }}>باقتك</span>
              </span>
            </div>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <p style={{ color: "#556677", fontSize: "14px" }}>لقاء مبدئي مجاني مع المدرب · دفع شهري · بدون التزام</p>
            </div>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "100px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.1)", color: C.skyLight, fontSize: "13px", fontWeight: 600 }}>
                📅 الكورسات تبدأ مع بداية كل شهر ميلادي — وتقدر تنضم بأي وقت
              </div>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", alignItems: "stretch" }}>
            {pkgs.map((pk, idx) => {
              const isH = hC === pk.id, isP = pk.pop, isPr = pk.prem;
              const ac = isP ? C.sky : isPr ? C.gold : "#667788";
              return (
                <Reveal key={pk.id} d={idx * 0.12} style={{ flex: "1 1 300px", maxWidth: "360px", minWidth: "280px", display: "flex" }}>
                  <div
                    onMouseEnter={() => setHC(pk.id)} onMouseLeave={() => setHC(null)}
                    style={{
                      width: "100%", borderRadius: "20px", overflow: "hidden",
                      background: isP ? "linear-gradient(170deg, rgba(56,189,248,0.06), rgba(56,189,248,0.02))" : isPr ? "linear-gradient(170deg, rgba(251,191,36,0.05), rgba(251,191,36,0.01))" : "rgba(255,255,255,0.015)",
                      border: isP ? "1px solid rgba(56,189,248,0.25)" : isPr ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      transform: isP ? "scale(1.03)" : isH ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: isP ? "0 30px 80px rgba(56,189,248,0.06)" : "none",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {isP && <div style={{ background: C.sky, color: C.navyDark, textAlign: "center", padding: "10px", fontSize: "12px", fontWeight: 800, letterSpacing: "2px" }}>الأكثر طلباً</div>}
                    {isPr && <div style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)", color: C.navyDark, textAlign: "center", padding: "10px", fontSize: "12px", fontWeight: 800, letterSpacing: "1px" }}>✦ لأفضل النتائج</div>}
                    <div style={{ padding: "32px 26px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: ac, letterSpacing: "1px", marginBottom: "4px" }}>{pk.sub}</div>
                      <h3 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", marginBottom: "20px" }}>باقة {pk.nm}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "44px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pk.pr.toLocaleString()}</span>
                        <span style={{ color: "#556677", fontSize: "13px" }}>ر.س / شهرياً</span>
                      </div>
                      <div style={{ flex: 1, marginBottom: "24px" }}>
                        {pk.f.map((ft, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: ft.ok ? 1 : 0.25 }}>
                            <span style={{ fontSize: "14px", color: ft.ok ? (ft.hl ? ac : "#4ade80") : "#333" }}>{ft.ok ? "✓" : "—"}</span>
                            <span style={{ fontSize: "13px", color: ft.ok ? "#ccd" : "#333", fontWeight: ft.hl ? 600 : 300, textDecoration: ft.ok ? "none" : "line-through" }}>{ft.t}</span>
                          </div>
                        ))}
                      </div>
                      <a href={waMsg(pk.nm)} target="_blank" rel="noopener noreferrer" style={{
                        display: "block", textAlign: "center", padding: "14px", borderRadius: "14px",
                        fontSize: "15px", fontWeight: 800, transition: "all 0.3s",
                        background: isP ? C.sky : isPr ? C.gold : "rgba(255,255,255,0.06)",
                        color: isP || isPr ? C.navyDark : "#ccc",
                        border: isP || isPr ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}>احجز لقاءك المجاني ←</a>
                      <div style={{ textAlign: "center", marginTop: "10px", color: "#556677", fontSize: "11px", lineHeight: 1.6 }}>
                        لقاء مبدئي مجاني مع المدرب
                        <br />تتعرف على الأسلوب قبل التسجيل
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* ═══ BIGGER COMPARISON BOX ═══ */}
          <Reveal d={0.3}>
            <div style={{
              maxWidth: "800px", margin: "56px auto 0", padding: "36px 40px", borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(26,45,80,0.15))",
              border: "2px solid rgba(56,189,248,0.15)",
              animation: "borderGlow 4s ease-in-out infinite",
            }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "20px", textAlign: "center" }}>
                💡 ليش باقة <span style={{ color: C.sky }}>طلاقة</span> هي الخيار الأذكى؟
              </div>
              <div style={{ fontSize: "17px", color: "#bbc", lineHeight: 2, textAlign: "center", marginBottom: "20px" }}>
                مقابل <span style={{ color: C.sky, fontWeight: 800, fontSize: "22px" }}>350 ريال</span> فقط زيادة عن باقة أساس تحصل على:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
                {["متابعة يومية مع المدرب", "محتوى مسجل ترجعله أي وقت", "حصة فردية شهرية", "تقييم كل أسبوعين", "تقرير تقدّم مفصّل"].map((item, i) => (
                  <div key={i} style={{
                    padding: "8px 18px", borderRadius: "100px",
                    background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.12)",
                    color: C.skyLight, fontSize: "14px", fontWeight: 600,
                  }}>✓ {item}</div>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: "18px", color: "#fff", fontWeight: 700 }}>
                يعني كل ميزة إضافية بأقل من <span style={{ color: C.sky, fontSize: "24px" }}>٧٠ ريال</span> فقط
              </div>
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <a href={waMsg("طلاقة")} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: C.sky, color: C.navyDark, padding: "14px 36px", borderRadius: "60px",
                  fontSize: "16px", fontWeight: 800,
                }}>احجز لقاءك المجاني — باقة طلاقة ←</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#fff", display: "block", marginBottom: "40px" }}>
              أسئلة <span style={{ color: C.sky }}>شائعة</span>
            </span>
          </Reveal>
          {fqs.map((f, i) => (
            <Reveal key={i} d={i * 0.05}>
              <div onClick={() => setFO(fO === i ? null : i)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: fO === i ? C.sky : "#dde", transition: "color 0.3s" }}>{f.q}</span>
                  <span style={{ color: C.sky, fontSize: "20px", transition: "transform 0.3s", transform: fO === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </div>
                <div style={{ maxHeight: fO === i ? "200px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                  <p style={{ color: "#778899", fontSize: "14px", lineHeight: 1.9, paddingTop: "12px", fontWeight: 300 }}>{f.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: "120px 28px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.05), transparent 60%)", animation: "glow 5s ease-in-out infinite", pointerEvents: "none" }} />
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, color: "#fff", marginBottom: "20px", letterSpacing: "-1px", lineHeight: 1.1 }}>
            جاهز تبدأ<span style={{ color: C.sky }}>؟</span>
          </h2>
          <p style={{ color: "#778899", fontSize: "16px", lineHeight: 1.8, marginBottom: "40px", maxWidth: "440px", marginInline: "auto", fontWeight: 300 }}>
            احجز لقاء مبدئي مجاني مع المدرب.
            <br />تتعرف على أسلوبه وطريقة شرحه — بدون أي التزام.
          </p>
          <a href={WA} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: C.sky, color: C.navyDark, padding: "18px 48px", borderRadius: "60px",
            fontSize: "18px", fontWeight: 800, boxShadow: "0 0 60px rgba(56,189,248,0.12)",
          }}>تواصل معنا ←</a>
          <div style={{ marginTop: "16px", color: "#556677", fontSize: "13px" }}>+966 55 866 9974</div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "28px", borderTop: "1px solid rgba(56,189,248,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 900, color: "#fff" }}>
            <span style={{ color: C.sky }}>F</span>luentia
          </span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a href={TT} target="_blank" rel="noopener noreferrer" style={{ color: "#556677", fontSize: "12px", fontWeight: 500 }}>TikTok</a>
            <a href={IG} target="_blank" rel="noopener noreferrer" style={{ color: "#556677", fontSize: "12px", fontWeight: 500 }}>Instagram</a>
            <span style={{ color: "#223344", fontSize: "11px" }}>© 2026</span>
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING WA ═══ */}
      <a href={WA} target="_blank" rel="noopener noreferrer" style={{
        position: "fixed", bottom: "24px", left: "24px", zIndex: 999,
        width: "56px", height: "56px", borderRadius: "50%",
        background: "linear-gradient(135deg,#25D366,#128C7E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "24px", animation: "pulse2 2s infinite",
      }}>💬</a>
    </div>
  );
}
