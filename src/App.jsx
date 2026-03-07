import React, { useState, useEffect, useRef } from "react";

const WA = "https://wa.me/966558669974?text=%D8%A3%D8%A8%D9%8A%20%D8%A3%D8%B3%D8%AC%D9%84%20%D9%81%D9%8A%20%D9%83%D9%84%D8%A7%D8%B3%20%D8%AA%D8%AC%D8%B1%D9%8A%D8%A8%D9%8A%20%D9%85%D8%AC%D8%A7%D9%86%D9%8A";
const WA_OFF = "https://wa.me/966558669974?text=%D8%B9%D8%B1%D8%B6%2020%25";
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
  {q:"كيف أسجل في الكلاس التجريبي؟",a:"تواصل معنا عبر الواتساب وبنحدد لك أقرب موعد متاح."},
  {q:"هل الكلاسات أونلاين؟",a:"نعم، جميع كلاساتنا لايف عبر زووم من أي مكان."},
  {q:"كم عدد الطلاب بالكلاس؟",a:"حد أقصى 7 طلاب فقط لضمان الجودة والتفاعل."},
  {q:"متى أوقات الكلاسات؟",a:"بعد العصر حتى بعد العشاء. في رمضان بعد العشاء فقط."},
  {q:"هل أقدر أغير الباقة؟",a:"نعم! الدفع شهري بدون أي التزام."},
  {q:"هل المدربين سعوديين؟",a:"نعم، جميع مدربينا سعوديون متخصصون."},
];

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
    style: {
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0) rotate(0)" : `translateY(${y}px)`,
      transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${d}s`,
      ...style,
    }
  }, children);
}

function NumUp({ target, suffix = "" }) {
  const [ref, v] = useVis();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!v) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 30);
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
    <div style={{ background: "#050508", color: "#e8e8e8", minHeight: "100vh", overflowX: "hidden", direction: "rtl" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Tajawal',sans-serif}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(0,220,200,0.25);color:#fff}
        a{text-decoration:none;color:inherit}
        .hide-sb::-webkit-scrollbar{display:none}
        @keyframes glow{0%,100%{filter:blur(60px) brightness(1)}50%{filter:blur(80px) brightness(1.3)}}
        @keyframes drift{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-20px,15px) rotate(240deg)}100%{transform:translate(0,0) rotate(360deg)}}
        @keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}70%{box-shadow:0 0 0 18px rgba(37,211,102,0)}}
        @keyframes textShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(0,220,200,0.2)}50%{border-color:rgba(0,220,200,0.5)}}
        body{overflow-x:hidden}
      `}</style>

      {/* ═══ OFFER STRIP ═══ */}
      <div style={{ background: "#00dcc8", padding: "10px 20px", textAlign: "center", position: "relative", zIndex: 1001, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", animation: "textShine 2s linear infinite", backgroundSize: "200% 100%" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", position: "relative" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#050508", letterSpacing: "-0.3px" }}>
            خصم 20% لأول 5 مشتركين
          </span>
          <div style={{ display: "flex", gap: "4px", direction: "ltr" }}>
            {[{ v: cd.d, l: "د" }, { v: cd.h, l: "س" }, { v: cd.m, l: "د" }, { v: cd.s, l: "ث" }].map((u, i) => (
              <div key={i} style={{ background: "#050508", borderRadius: "6px", padding: "2px 8px", textAlign: "center", minWidth: "36px" }}>
                <span style={{ fontSize: "15px", fontWeight: 900, color: "#00dcc8", fontFamily: "'Playfair Display',serif" }}>{p2(u.v)}</span>
                <span style={{ fontSize: "8px", color: "#666", marginRight: "2px" }}>{u.l}</span>
              </div>
            ))}
          </div>
          <a href={WA_OFF} target="_blank" rel="noopener noreferrer" style={{ background: "#050508", color: "#00dcc8", padding: "4px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 800 }}>
            سجّل →
          </a>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scr ? "rgba(5,5,8,0.9)" : "transparent",
        backdropFilter: scr ? "blur(30px) saturate(1.5)" : "none",
        borderBottom: scr ? "1px solid rgba(255,255,255,0.04)" : "none",
        transition: "all 0.5s", padding: "14px 28px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
              <span style={{ color: "#00dcc8" }}>F</span>luentia
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a href="#pricing" style={{ color: "#888", fontSize: "13px", fontWeight: 500, transition: "color 0.3s" }}>الباقات</a>
            <a href="#reviews" style={{ color: "#888", fontSize: "13px", fontWeight: 500 }}>آراء الطلاب</a>
            <a href={WA} target="_blank" rel="noopener noreferrer" style={{
              background: "#00dcc8", color: "#050508", padding: "8px 22px", borderRadius: "100px",
              fontSize: "13px", fontWeight: 800, transition: "all 0.3s",
            }}>ابدأ مجاناً</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", padding: "60px 28px", overflow: "hidden" }}>
        {/* Animated orbs */}
        <div style={{ position: "absolute", top: "15%", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,220,200,0.12), transparent 70%)", animation: "glow 6s ease-in-out infinite, drift 20s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,180,0,0.08), transparent 70%)", animation: "glow 8s ease-in-out infinite 2s, drift 25s ease-in-out infinite reverse", pointerEvents: "none" }} />
        {/* Grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "700px" }}>
            <Reveal>
              <div style={{ display: "inline-block", padding: "6px 18px", marginBottom: "28px", border: "1px solid rgba(0,220,200,0.2)", borderRadius: "100px", color: "#00dcc8", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                أكاديمية سعودية
              </div>
            </Reveal>

            <Reveal d={0.1} y={80}>
              <h1 style={{
                fontSize: "clamp(44px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.05, marginBottom: "24px",
                color: "#fff", letterSpacing: "-2px",
              }}>
                تكلّم
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #00dcc8, #00a89e, #00dcc8, #7efff0)",
                  backgroundSize: "300% 100%",
                  animation: "textShine 4s linear infinite",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>إنجليزي</span>
                <br />
                بطلاقة<span style={{ color: "#00dcc8" }}>.</span>
              </h1>
            </Reveal>

            <Reveal d={0.2}>
              <p style={{ fontSize: "17px", color: "#777", lineHeight: 2, marginBottom: "40px", maxWidth: "440px", fontWeight: 300 }}>
                مدربون سعوديون · كلاسات لايف · حد أقصى <span style={{ color: "#00dcc8", fontWeight: 700 }}>٧</span> طلاب
                <br />نتائج حقيقية من أول شهر.
              </p>
            </Reveal>

            <Reveal d={0.3}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: "#00dcc8", color: "#050508", padding: "16px 36px", borderRadius: "60px",
                  fontSize: "16px", fontWeight: 800, transition: "all 0.4s",
                  boxShadow: "0 0 40px rgba(0,220,200,0.2)",
                }}>
                  كلاس تجريبي مجاني ←
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
                {[
                  { n: 7, s: "", l: "طالب كحد أقصى" },
                  { n: 100, s: "+", l: "طالب وطالبة" },
                  { n: 4.9, s: "", l: "تقييم" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {i === 2 ? "4.9" : React.createElement(NumUp, { target: s.n, suffix: s.s })}
                    </div>
                    <div style={{ fontSize: "12px", color: "#555", marginTop: "4px", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div style={{ overflow: "hidden", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "fit-content" }}>
          {Array(2).fill(["قرامر", "سبيكنج", "ريدنج", "رايتنج", "لسنج", "IELTS", "نطق", "مفردات", "محادثة"]).flat().map((w, i) => (
            <span key={i} style={{ padding: "0 24px", fontSize: "14px", color: "#333", fontWeight: 700, letterSpacing: "1px", whiteSpace: "nowrap" }}>
              {w} <span style={{ color: "#00dcc8", margin: "0 8px" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: "100px 28px", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "60px" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                ليش <span style={{ color: "#00dcc8" }}>مختلفين</span>؟
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2px" }}>
            {[
              { n: "01", t: "مدربون سعوديون", d: "يفهمون تحدياتك ويتكلمون لغتك. مو أجنبي ما يعرف وضعك.", c: "#00dcc8" },
              { n: "02", t: "٧ طلاب كحد أقصى", d: "كل طالب ياخذ وقته الكامل بالتحدث والتفاعل مع المدرب.", c: "#fbbf24" },
              { n: "03", t: "متابعة يومية حقيقية", d: "مو بس كلاسات — مدربك معك يومياً عبر تيليجرام.", c: "#a78bfa" },
              { n: "04", t: "نتائج ملموسة", d: "تقييمات دورية وتقارير تقدم تشوف تطورك بعينك.", c: "#f472b6" },
            ].map((item, i) => (
              <Reveal key={i} d={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  padding: "40px 32px", transition: "all 0.5s", cursor: "default",
                  position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = item.c + "33"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}
                >
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "48px", fontWeight: 900, color: item.c, opacity: 0.15, position: "absolute", top: "16px", left: "20px", lineHeight: 1 }}>{item.n}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "10px", position: "relative" }}>{item.t}</h3>
                  <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.8, position: "relative" }}>{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="reviews" style={{ padding: "100px 0", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,220,200,0.03), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px", marginBottom: "48px" }}>
          <Reveal>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
              آراء <span style={{ color: "#00dcc8" }}>طلابنا</span>
            </span>
          </Reveal>
        </div>
        <div ref={sRef} className="hide-sb" style={{ display: "flex", gap: "16px", overflowX: "auto", padding: "0 28px 24px", scrollSnapType: "x mandatory" }}>
          {reviews.map((rv, i) => (
            <div key={i} onClick={() => setTI(i)} style={{
              minWidth: "300px", maxWidth: "340px", flex: "0 0 auto", scrollSnapAlign: "center",
              background: tI === i ? "rgba(0,220,200,0.04)" : "rgba(255,255,255,0.02)",
              border: tI === i ? "1px solid rgba(0,220,200,0.15)" : "1px solid rgba(255,255,255,0.04)",
              borderRadius: "20px", padding: "32px 26px", cursor: "pointer", transition: "all 0.5s",
              transform: tI === i ? "scale(1)" : "scale(0.97)",
            }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: "100px", background: "rgba(0,220,200,0.08)", color: "#00dcc8", fontSize: "11px", fontWeight: 700, marginBottom: "16px" }}>{rv.tag}</div>
              <p style={{ color: "#bbb", fontSize: "14px", lineHeight: 2, marginBottom: "24px", minHeight: "80px", fontWeight: 300 }}>"{rv.t}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #00dcc8, #007a70)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#050508" }}>
                  {rv.n[0]}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{rv.n}</div>
                  <div style={{ fontSize: "11px", color: "#555" }}>{rv.r}</div>
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
              background: tI === i ? "#00dcc8" : "rgba(255,255,255,0.08)",
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
              background: "linear-gradient(135deg, rgba(0,220,200,0.03), rgba(0,0,0,0))",
              border: "1px solid rgba(0,220,200,0.1)", borderRadius: "24px",
              animation: "borderGlow 4s ease-in-out infinite",
            }}>
              <div style={{ position: "absolute", top: "-14px", right: "32px", background: "#050508", padding: "4px 20px", border: "1px solid rgba(0,220,200,0.2)", borderRadius: "100px", fontSize: "12px", fontWeight: 700, color: "#00dcc8" }}>
                قصة نجاح
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "20px", lineHeight: 1.4 }}>
                من الصفر إلى مستوى
                <br /><span style={{ color: "#00dcc8" }}>المتحدثين الأصليين</span>
              </h3>
              <div style={{ color: "#888", fontSize: "14px", lineHeight: 2.1, fontWeight: 300 }}>
                <p style={{ marginBottom: "12px" }}>بدأت <strong style={{ color: "#fff", fontWeight: 700 }}>الجوهرة</strong> وهي في آخر سنة بالثانوية. لغتها كانت ضعيفة جداً لكنها كانت متحمسة.</p>
                <p style={{ marginBottom: "12px" }}>مرّت بمراحل — حماس ثم فقدان حماس ثم رجوع. لكن المدرب كان يتابع ويحفّز خطوة بخطوة.</p>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: "12px" }}>الآن؟ قراءتها قريبة جداً من المتحدثين الأصليين.</p>
                <p style={{ color: "#00dcc8", fontWeight: 700 }}>السر؟ اجتهاد + مدرب يتابع وحريص ✦</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: "100px 28px", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                اختر <span style={{ color: "#00dcc8" }}>باقتك</span>
              </span>
              <p style={{ color: "#555", fontSize: "14px", marginTop: "12px" }}>كلاس تجريبي مجاني · دفع شهري · بدون التزام</p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", alignItems: "stretch" }}>
            {pkgs.map((pk, idx) => {
              const isH = hC === pk.id, isP = pk.pop, isPr = pk.prem;
              const ac = isP ? "#00dcc8" : isPr ? "#fbbf24" : "#555";
              return (
                <Reveal key={pk.id} d={idx * 0.12} style={{ flex: "1 1 300px", maxWidth: "360px", minWidth: "280px", display: "flex" }}>
                  <div
                    onMouseEnter={() => setHC(pk.id)} onMouseLeave={() => setHC(null)}
                    style={{
                      width: "100%", borderRadius: "20px", overflow: "hidden",
                      background: isP ? "linear-gradient(170deg, rgba(0,220,200,0.06), rgba(0,220,200,0.02))" : isPr ? "linear-gradient(170deg, rgba(251,191,36,0.05), rgba(251,191,36,0.01))" : "rgba(255,255,255,0.015)",
                      border: isP ? "1px solid rgba(0,220,200,0.25)" : isPr ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      transform: isP ? "scale(1.03)" : isH ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: isP ? "0 30px 80px rgba(0,220,200,0.08)" : "none",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {isP && <div style={{ background: "#00dcc8", color: "#050508", textAlign: "center", padding: "10px", fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>الأكثر طلباً</div>}
                    {isPr && <div style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)", color: "#050508", textAlign: "center", padding: "10px", fontSize: "12px", fontWeight: 800, letterSpacing: "1px" }}>✦ لأفضل النتائج</div>}
                    <div style={{ padding: "32px 26px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: ac, letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>{pk.sub}</div>
                      <h3 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", marginBottom: "20px" }}>باقة {pk.nm}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "44px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pk.pr.toLocaleString()}</span>
                        <span style={{ color: "#555", fontSize: "13px" }}>ر.س / شهرياً</span>
                      </div>
                      <div style={{ flex: 1, marginBottom: "24px" }}>
                        {pk.f.map((ft, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: ft.ok ? 1 : 0.25 }}>
                            <span style={{ fontSize: "14px", color: ft.ok ? (ft.hl ? ac : "#4ade80") : "#333" }}>{ft.ok ? "✓" : "—"}</span>
                            <span style={{ fontSize: "13px", color: ft.ok ? "#ccc" : "#333", fontWeight: ft.hl ? 600 : 300, textDecoration: ft.ok ? "none" : "line-through" }}>{ft.t}</span>
                          </div>
                        ))}
                      </div>
                      <a href={WA} target="_blank" rel="noopener noreferrer" style={{
                        display: "block", textAlign: "center", padding: "14px", borderRadius: "14px",
                        fontSize: "15px", fontWeight: 800, transition: "all 0.3s",
                        background: isP ? "#00dcc8" : isPr ? "#fbbf24" : "rgba(255,255,255,0.06)",
                        color: isP || isPr ? "#050508" : "#ccc",
                        border: isP || isPr ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}>ابدأ مجاناً</a>
                      <div style={{ textAlign: "center", marginTop: "8px", color: "#444", fontSize: "11px" }}>كلاس تجريبي مجاني</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal d={0.3}>
            <div style={{ maxWidth: "600px", margin: "48px auto 0", textAlign: "center", padding: "20px 24px", borderRadius: "16px", border: "1px solid rgba(0,220,200,0.08)", background: "rgba(0,220,200,0.02)" }}>
              <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.9 }}>
                💡 باقة طلاقة: مقابل <span style={{ color: "#00dcc8", fontWeight: 700 }}>350 ريال</span> زيادة عن أساس = ٥ مميزات إضافية. كل ميزة بأقل من <span style={{ color: "#00dcc8" }}>٧٠ ريال</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#fff", display: "block", marginBottom: "40px" }}>
              أسئلة <span style={{ color: "#00dcc8" }}>شائعة</span>
            </span>
          </Reveal>
          {fqs.map((f, i) => (
            <Reveal key={i} d={i * 0.05}>
              <div
                onClick={() => setFO(fO === i ? null : i)}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", padding: "20px 0" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: fO === i ? "#00dcc8" : "#ddd", transition: "color 0.3s" }}>{f.q}</span>
                  <span style={{ color: "#00dcc8", fontSize: "20px", transition: "transform 0.3s", transform: fO === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </div>
                <div style={{ maxHeight: fO === i ? "150px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                  <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.9, paddingTop: "12px", fontWeight: 300 }}>{f.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: "120px 28px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,220,200,0.06), transparent 60%)", animation: "glow 5s ease-in-out infinite", pointerEvents: "none" }} />
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, color: "#fff", marginBottom: "20px", letterSpacing: "-1px", lineHeight: 1.1 }}>
            جاهز تبدأ<span style={{ color: "#00dcc8" }}>؟</span>
          </h2>
          <p style={{ color: "#666", fontSize: "16px", lineHeight: 1.8, marginBottom: "40px", maxWidth: "400px", marginInline: "auto", fontWeight: 300 }}>
            كلاس تجريبي مجاني بدون أي التزام.
            <br />جرّب بنفسك.
          </p>
          <a href={WA} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "#00dcc8", color: "#050508", padding: "18px 48px", borderRadius: "60px",
            fontSize: "18px", fontWeight: 800, boxShadow: "0 0 60px rgba(0,220,200,0.15)",
            transition: "all 0.4s",
          }}>تواصل معنا ←</a>
          <div style={{ marginTop: "16px", color: "#444", fontSize: "13px" }}>+966 55 866 9974</div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "28px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 900, color: "#fff" }}>
            <span style={{ color: "#00dcc8" }}>F</span>luentia
          </span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a href={TT} target="_blank" rel="noopener noreferrer" style={{ color: "#444", fontSize: "12px", fontWeight: 500, transition: "color 0.3s" }}>TikTok</a>
            <a href={IG} target="_blank" rel="noopener noreferrer" style={{ color: "#444", fontSize: "12px", fontWeight: 500 }}>Instagram</a>
            <span style={{ color: "#222", fontSize: "11px" }}>© 2026</span>
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING WA ═══ */}
      <a href={WA} target="_blank" rel="noopener noreferrer" style={{
        position: "fixed", bottom: "24px", left: "24px", zIndex: 999,
        width: "56px", height: "56px", borderRadius: "50%",
        background: "linear-gradient(135deg,#25D366,#128C7E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "24px",
        animation: "pulse2 2s infinite",
      }}>💬</a>
    </div>
  );
}
