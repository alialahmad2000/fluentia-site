import { C } from "../atelier.tokens";
import Reveal from "../Reveal";

// ============================================================================
// Platform proof — 4 faithful Velvet Midnight UI panels, built in HTML/CSS/SVG
// (no images, no real student data). Lazy-loaded by the page shell.
// ============================================================================

function Frame({ caption, children }) {
  return (
    <Reveal className="at-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 16px", borderBottom: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <span className="at-meta" style={{ marginInlineStart: "auto", fontFamily: "var(--ui)", fontSize: "11px" }}>Fluentia LMS</span>
      </div>
      <div style={{ padding: "clamp(18px, 2.5vw, 24px)", flex: 1 }}>{children}</div>
      {caption && (
        <div style={{ padding: "11px 16px", borderTop: "1px solid var(--hairline)", background: "rgba(56,189,248,0.03)" }}>
          <span className="at-meta" style={{ color: "var(--sky-light)" }}>{caption}</span>
        </div>
      )}
    </Reveal>
  );
}

/* 1 — Daily trainer letter */
function DailyLetter() {
  const tasks = ["مراجعة ١٢ كلمة جديدة (SRS)", "تسجيل صوتي: Daily Routines", "تمرين القرامر — Present Perfect"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <div className="at-meta">رسالة اليوم</div>
        <h4 style={{ fontFamily: "var(--display-ar)", fontWeight: 800, fontSize: "18px", color: "var(--cream)", marginTop: "4px" }}>
          صباح الخير، أحمد 🌅
        </h4>
      </div>
      <p style={{ color: "var(--soft)", fontSize: "14.5px", lineHeight: 1.8 }}>
        أمس كان تسجيلك أوضح بكثير — النطق تحسّن خصوصاً في الجُمل الطويلة. اليوم نكمل على نفس الإيقاع، وركّز على مهامك الثلاث:
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {tasks.map((t) => (
          <li key={t} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "14px", color: "var(--white)" }}>
            <span style={{ width: 16, height: 16, borderRadius: "5px", border: "1px solid var(--hairline-gold)", flexShrink: 0 }} />
            {t}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "4px", paddingTop: "12px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="at-meta">مدرّبك</span>
        <span className="at-serif-it" style={{ color: "var(--gold)", fontSize: "16px" }}>— Coach Faisal</span>
      </div>
    </div>
  );
}

/* 2 — Skill radar */
const SKILLS = [
  { label: "قواعد", value: 78 },
  { label: "مفردات", value: 85 },
  { label: "تحدّث", value: 70 },
  { label: "استماع", value: 82 },
  { label: "قراءة", value: 88 },
  { label: "كتابة", value: 74 },
];
function SkillRadar() {
  const CX = 130, CY = 120, R = 84;
  const ang = (i) => (-90 + i * 60) * (Math.PI / 180);
  const pt = (i, r) => [CX + r * Math.cos(ang(i)), CY + r * Math.sin(ang(i))];
  const poly = (f) => SKILLS.map((_, i) => pt(i, R * f).join(",")).join(" ");
  const dataPoly = SKILLS.map((s, i) => pt(i, R * (s.value / 100)).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 235" width="100%" height="auto" role="img" aria-label="مؤشر المهارات">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={poly(f)} fill="none" stroke="rgba(125,211,252,0.12)" strokeWidth="1" />
      ))}
      {SKILLS.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(125,211,252,0.10)" strokeWidth="1" />;
      })}
      <polygon points={dataPoly} fill="rgba(56,189,248,0.16)" stroke={C.sky} strokeWidth="2" />
      {SKILLS.map((s, i) => {
        const [x, y] = pt(i, R * (s.value / 100));
        return <circle key={i} cx={x} cy={y} r="3" fill={C.gold} />;
      })}
      {SKILLS.map((s, i) => {
        const [x, y] = pt(i, R + 22);
        return (
          <text key={s.label} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontFamily="'Tajawal', sans-serif" fontSize="12" fill={C.soft}>
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

/* 3 — Mock exam result */
const EXAM = [
  { skill: "Listening", band: 7.0 },
  { skill: "Reading", band: 6.5 },
  { skill: "Writing", band: 6.0 },
  { skill: "Speaking", band: 6.5 },
];
function ExamResult() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="at-meta">النتيجة الكلية (Band)</div>
          <div className="at-numeral" style={{ fontSize: "40px", color: "var(--sky)" }}>6.5</div>
        </div>
        <span className="at-chip" style={{ color: "var(--gold)", borderColor: "var(--hairline-gold)" }}>اختبار تجريبي</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {EXAM.map((e) => (
          <div key={e.skill}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--soft)", fontFamily: "var(--ui)" }}>{e.skill}</span>
              <span className="at-numeral" style={{ fontSize: "14px", color: "var(--cream)" }}>{e.band.toFixed(1)}</span>
            </div>
            <div style={{ height: "5px", borderRadius: "100px", background: "rgba(255,255,255,0.05)" }}>
              <div style={{ width: `${(e.band / 9) * 100}%`, height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, var(--sky), var(--sky-light))" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.14)" }}>
        <div className="at-meta" style={{ color: "var(--gold)", marginBottom: "5px" }}>تقييم بالذكاء الاصطناعي</div>
        <p style={{ fontSize: "13.5px", color: "var(--soft)", lineHeight: 1.7 }}>
          بنية الفقرة جيدة ومترابطة. ركّز على تنويع أدوات الربط (however, moreover) وتقليل التكرار لرفع درجة الـ Writing.
        </p>
      </div>
    </div>
  );
}

/* 4 — Vocabulary + SRS */
function VocabCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "30px", color: "var(--cream)" }} dir="ltr">commute</div>
          <div className="at-meta" dir="ltr" style={{ marginTop: "2px" }}>/kəˈmjuːt/</div>
        </div>
        <span className="at-chip" style={{ color: "var(--sky-light)", fontSize: "11px", padding: "5px 11px" }}>مراجعة اليوم</span>
      </div>
      <div>
        <div className="at-meta" style={{ marginBottom: "3px" }}>المعنى</div>
        <div style={{ fontSize: "15px", color: "var(--white)" }}>التنقّل اليومي بين البيت والعمل</div>
      </div>
      <div style={{ paddingTop: "12px", borderTop: "1px solid var(--hairline)" }}>
        <div className="at-meta" style={{ marginBottom: "4px" }}>مثال</div>
        <p dir="ltr" style={{ fontFamily: "var(--ui)", fontSize: "14px", color: "var(--soft)", lineHeight: 1.7, textAlign: "left" }}>
          “My daily commute takes about forty minutes.”
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
        <span className="at-chip" style={{ fontSize: "11.5px" }}>التكرار المتباعد · SRS</span>
        <span className="at-chip" style={{ fontSize: "11.5px", color: "var(--gold)" }}>التالي بعد ٣ أيام</span>
      </div>
    </div>
  );
}

export default function Platform() {
  return (
    <section className="at-section">
      <div className="at-container">
        <Reveal className="at-section-head">
          <span className="at-eyebrow">المنصّة</span>
          <h2 className="at-title">منصّة تعليمية متكاملة — وليست مجرد مجموعة دردشة</h2>
        </Reveal>

        <div className="at-grid at-grid-2">
          <Frame caption="الرسالة اليومية من المدرب"><DailyLetter /></Frame>
          <Frame caption="مؤشر المهارات — تتبّع تطوّرك بالأرقام"><SkillRadar /></Frame>
          <Frame caption="نتيجة الاختبار التجريبي + تقييم AI"><ExamResult /></Frame>
          <Frame caption="بنك المفردات مع التكرار المتباعد"><VocabCard /></Frame>
        </div>
      </div>
    </section>
  );
}
