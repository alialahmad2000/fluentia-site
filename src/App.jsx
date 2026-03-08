import React, { useState, useEffect, useRef } from "react";

/* ─── WhatsApp Links ─── */
const WA_BASE = "https://wa.me/966558669974?text=";
const waP = (pkg) => WA_BASE + encodeURIComponent("السلام عليكم، أبي أحجز لقاء مبدئي مجاني — مهتم بباقة " + pkg);
const WA = WA_BASE + encodeURIComponent("السلام عليكم، أبي أحجز لقاء مبدئي مجاني مع المدرب");
const WA_OFF = WA_BASE + encodeURIComponent("أبي أستفيد من عرض الـ20%");
const TT = "https://www.tiktok.com/@fluentia_";
const IG = "https://www.instagram.com/fluentia__";

/* ─── Colors (Logo: Navy/White/Sky) ─── */
const C = { nv: "#1a2d50", nd: "#0a1225", nb: "#060e1c", sk: "#38bdf8", sl: "#7dd3fc", sg: "rgba(56,189,248,0.12)", w: "#f8fafc", gd: "#fbbf24" };

/* ─── Data ─── */
const reviews = [
  { n: "الجوهرة", r: "ثالث ثانوي", t: "ما كنت أتكلم ولا أقرأ والحين أقدر أتكلم وأقرأ بأقل من ١٠ دقايق!", tag: "قصة نجاح" },
  { n: "ليان", r: "جامعة الملك سعود", t: "نتعلم كل المهارات الأربع والشرح بالقرامر ماشي خطوه بخطوه والفعاليات رهيبة!", tag: "القرامر" },
  { n: "الهنوف", r: "English Level 2", t: "فرق كبير بين مستواي بالبداية واللحين! متابعة دائماً والمجموعة بسيطة.", tag: "تقدم سريع" },
  { n: "هوازن", r: "دورة IELTS", t: "الدكتور علي يتميّز بأسلوبه الراقي والمحفّز. مثال في المهنية والتمكن العلمي.", tag: "IELTS" },
  { n: "فيصل", r: "جامعة الملك سعود", t: "الأنشطة والألعاب ومشروعات السبيكنج والكلاسات الخصوصيه. جزيل الشكر!", tag: "سبيكنج" },
  { n: "مها", r: "طالبة تمريض", t: "كتاب الـGrammar رهيب! والمصطلحات مره كويسه. بإذن الله نهكر اللغه!", tag: "القرامر" },
  { n: "لمى", r: "جامعة الملك عبدالعزيز", t: "القرامر والأزمنة للحين أتذكرها! والأكسنت حلو ويعلمنا نطق الكلمات صح.", tag: "النطق" },
];
const pkgs = [
  { id:1, nm:"أساس", sub:"ابدأ رحلتك", pr:750, rv:1050, pop:false, prem:false, seats:5, save:"29", f:[
    {t:"8 ساعات تدريب شهرياً تبني أساسك",ok:1},{t:"7 طلاب كحد أقصى — تفاعل حقيقي",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم شهري يقيس تقدمك",ok:1},{t:"مواد تعليمية مختارة بعناية",ok:1},{t:"مدربك يتابعك يومياً",ok:0},{t:"محتوى مسجل ترجعله أي وقت",ok:0},{t:"حصص فردية وجهاً لوجه",ok:0},{t:"تقرير تقدّم يوضح تطورك بالأرقام",ok:0}
  ]},
  { id:2, nm:"طلاقة", sub:"الخيار الأذكى", pr:1100, rv:1600, pop:true, prem:false, seats:3, save:"31", f:[
    {t:"8 ساعات تدريب شهرياً تبني أساسك",ok:1},{t:"7 طلاب كحد أقصى — تفاعل حقيقي",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم كل أسبوعين — ضعف التقدم",ok:1,hl:1},{t:"مواد شاملة + تمارين تفاعلية",ok:1,hl:1},{t:"مدربك يصحح أخطاءك يومياً",ok:1,hl:1},{t:"دروس مسجلة ترجعلها وقت ما تبي",ok:1,hl:1},{t:"حصة فردية شهرية مع مدربك",ok:1,hl:1},{t:"تقرير شهري تشوف تطورك بالأرقام",ok:1,hl:1}
  ]},
  { id:3, nm:"تميّز", sub:"لمن يريد الأفضل", pr:1500, rv:2200, pop:false, prem:true, seats:2, save:"32", f:[
    {t:"8 ساعات تدريب شهرياً تبني أساسك",ok:1},{t:"7 طلاب كحد أقصى — تفاعل حقيقي",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم أسبوعي — 4× أسرع تقدماً",ok:1,hl:1},{t:"مواد حصرية + بنك أسئلة كامل",ok:1,hl:1},{t:"متابعة مكثفة + ملاحظات شخصية يومياً",ok:1,hl:1},{t:"مكتبة دروس مسجلة غير محدودة",ok:1,hl:1},{t:"حصة فردية كل أسبوع مع مدربك",ok:1,hl:1},{t:"تقرير أسبوعي + خطة تطوير شخصية",ok:1,hl:1}
  ]},
];
const fqs = [
  {q:"وش اللقاء المبدئي المجاني بالضبط؟",a:"هو لقاء مباشر مع المدرب — مو مجرد تجربة. نفهم مستواك وأهدافك والعوائق اللي تواجهك. وأنت تتعرف على أسلوب المدرب وطريقة شرحه. بناءً عليه نقرر مع بعض إذا Fluentia هي المكان الصح لك."},
  {q:"متى تبدأ الدورات؟",a:"نعتمد الأشهر الميلادية — الكورسات تبدأ مع بداية كل شهر ميلادي. ومع ذلك تقدر تنضم بأي وقت والمدرب يعوّضك ما فاتك."},
  {q:"هل الكلاسات أونلاين؟",a:"نعم، جميع كلاساتنا لايف عبر زووم من أي مكان. كل اللي تحتاجه جوال أو لابتوب وإنترنت."},
  {q:"كم عدد الطلاب بالكلاس؟",a:"حد أقصى 7 طلاب فقط. مو 20 أو 30 مثل المعاهد الثانية. عشان كل طالب ياخذ وقته الكافي."},
  {q:"جربت دورات قبل وما استفدت — ليش عندكم بيختلف؟",a:"لأننا ندرس كل طالب بشكل فردي، نفهم شخصيته، ونحطه بالقروب اللي يناسبه. المدرب يتابعك يومياً مو بس بالكلاس. والمحتوى مصمم بعناية مو منسوخ من كتب قديمة."},
  {q:"أقدر أتعلم من اليوتيوب ببلاش — ليش أدفع؟",a:"لو اليوتيوب كان يكفي، كان الكل يتكلم إنجليزي. المشكلة مو بالمحتوى — المشكلة بالمتابعة والتصحيح والالتزام والبيئة. عندنا مدرب يتابعك يومياً ويصحح أخطاءك فوراً."},
  {q:"هل أقدر أغير الباقة؟",a:"نعم! الدفع شهري بدون أي التزام. تقدر تغير أو توقف أي وقت."},
  {q:"هل المدربين سعوديين؟",a:"نعم، جميع مدربينا سعوديون متخصصون. يفهمون تحدياتك ويتكلمون لغتك."},
];

/* ─── Hooks ─── */
function useVis(th=0.1){const r=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const e=r.current;if(!e)return;const o=new IntersectionObserver(([x])=>{if(x.isIntersecting)setV(true)},{threshold:th});o.observe(e);return()=>o.disconnect()},[th]);return[r,v]}
function Reveal({children,d=0,y=50,style={}}){const[r,v]=useVis();return React.createElement("div",{ref:r,style:{opacity:v?1:0,transform:v?"translateY(0)":`translateY(${y}px)`,transition:`all 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,...style}},children)}
function NumUp({target,suffix=""}){const[r,v]=useVis();const[val,setVal]=useState(0);useEffect(()=>{if(!v)return;let s=0;const step=Math.max(1,Math.floor(target/40));const id=setInterval(()=>{s+=step;if(s>=target){setVal(target);clearInterval(id)}else setVal(s)},30);return()=>clearInterval(id)},[v,target]);return React.createElement("span",{ref:r},val+suffix)}
function useCD(td){const[t,setT]=useState({d:0,h:0,m:0,s:0});useEffect(()=>{const tick=()=>{const diff=new Date(td)-new Date();if(diff<=0)return;setT({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)})};tick();const i=setInterval(tick,1000);return()=>clearInterval(i)},[td]);return t}

/* ─── Main ─── */
export default function App(){
  const[hC,setHC]=useState(null);const[scr,setScr]=useState(false);const[tI,setTI]=useState(0);const[fO,setFO]=useState(null);const[prob,setProb]=useState(null);const sRef=useRef(null);
  const[dl]=useState(()=>{const d=new Date();d.setDate(d.getDate()+3);return d.toISOString()});
  const cd=useCD(dl);const p2=n=>String(n).padStart(2,"0");
  useEffect(()=>{const h=()=>setScr(window.scrollY>60);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);
  useEffect(()=>{const i=setInterval(()=>setTI(p=>(p+1)%reviews.length),5000);return()=>clearInterval(i)},[]);
  useEffect(()=>{const c=sRef.current;if(!c||!c.children[tI])return;const ch=c.children[tI];c.scrollTo({left:ch.offsetLeft-c.offsetWidth/2+ch.offsetWidth/2,behavior:"smooth"})},[tI]);
  const mx={maxWidth:"1200px",margin:"0 auto",padding:"0 28px"};

  return(
<div style={{background:C.nb,color:C.w,minHeight:"100vh",overflowX:"hidden",direction:"rtl"}}>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Tajawal',sans-serif}
html{scroll-behavior:smooth}::selection{background:rgba(56,189,248,0.25)}
a{text-decoration:none;color:inherit}.hide-sb::-webkit-scrollbar{display:none}
@keyframes glow{0%,100%{filter:blur(60px) brightness(1)}50%{filter:blur(80px) brightness(1.3)}}
@keyframes drift{0%{transform:translate(0,0)}33%{transform:translate(30px,-20px)}66%{transform:translate(-20px,15px)}100%{transform:translate(0,0)}}
@keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}70%{box-shadow:0 0 0 18px rgba(37,211,102,0)}}
@keyframes textShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes borderGlow{0%,100%{border-color:rgba(56,189,248,0.15)}50%{border-color:rgba(56,189,248,0.4)}}
`}</style>

{/* ══════ 1. OFFER STRIP ══════ */}
<div style={{background:C.sk,padding:"10px 20px",textAlign:"center",position:"relative",zIndex:1001,overflow:"hidden"}}>
  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",animation:"textShine 2s linear infinite",backgroundSize:"200% 100%"}}/>
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"14px",flexWrap:"wrap",position:"relative"}}>
    <span style={{fontSize:"14px",fontWeight:800,color:C.nb}}>🔥 خصم 20% لأول 5 مشتركين</span>
    <div style={{display:"flex",gap:"4px",direction:"ltr"}}>
      {[{v:cd.d,l:"د"},{v:cd.h,l:"س"},{v:cd.m,l:"د"},{v:cd.s,l:"ث"}].map((u,i)=>(
        <div key={i} style={{background:C.nb,borderRadius:"6px",padding:"2px 8px",textAlign:"center",minWidth:"36px"}}>
          <span style={{fontSize:"15px",fontWeight:900,color:C.sk,fontFamily:"'Playfair Display',serif"}}>{p2(u.v)}</span>
          <span style={{fontSize:"8px",color:"#667",marginRight:"2px"}}>{u.l}</span>
        </div>))}
    </div>
    <a href={WA_OFF} target="_blank" rel="noopener noreferrer" style={{background:C.nb,color:C.sk,padding:"4px 16px",borderRadius:"100px",fontSize:"12px",fontWeight:800}}>سجّل →</a>
  </div>
</div>

{/* ══════ 2. NAV ══════ */}
<nav style={{position:"sticky",top:0,zIndex:1000,background:scr?"rgba(6,14,28,0.92)":"transparent",backdropFilter:scr?"blur(30px)":"none",borderBottom:scr?"1px solid rgba(56,189,248,0.06)":"none",transition:"all 0.5s",padding:"14px 28px"}}>
  <div style={{...mx,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <span style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:900,color:"#fff",letterSpacing:"-1px"}}><span style={{color:C.sk}}>F</span>luentia</span>
    <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
      <a href="#pricing" style={{color:"#8899aa",fontSize:"13px",fontWeight:500}}>الباقات</a>
      <a href="#reviews" style={{color:"#8899aa",fontSize:"13px",fontWeight:500}}>آراء الطلاب</a>
      <a href={WA} target="_blank" rel="noopener noreferrer" style={{background:C.sk,color:C.nb,padding:"8px 22px",borderRadius:"100px",fontSize:"13px",fontWeight:800}}>احجز لقاءك المجاني</a>
    </div>
  </div>
</nav>

{/* ══════ 3. HERO ══════ */}
<section style={{minHeight:"90vh",display:"flex",alignItems:"center",position:"relative",padding:"60px 28px",overflow:"hidden"}}>
  <div style={{position:"absolute",top:"15%",right:"10%",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%)",animation:"glow 6s ease-in-out infinite,drift 20s ease-in-out infinite",pointerEvents:"none"}}/>
  <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(56,189,248,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
  <div style={{...mx,width:"100%",position:"relative",zIndex:1}}>
    <div style={{maxWidth:"700px"}}>
      <Reveal><div style={{display:"inline-block",padding:"6px 18px",marginBottom:"28px",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"100px",color:C.sk,fontSize:"12px",fontWeight:700,letterSpacing:"1px"}}>أكاديمية سعودية متخصصة</div></Reveal>
      <Reveal d={0.1} y={80}><h1 style={{fontSize:"clamp(42px,8vw,76px)",fontWeight:900,lineHeight:1.05,marginBottom:"24px",color:"#fff",letterSpacing:"-2px"}}>تكلّم<br/><span style={{background:`linear-gradient(135deg,${C.sk},${C.sl},#fff,${C.sk})`,backgroundSize:"300% 100%",animation:"textShine 4s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>إنجليزي</span><br/>بطلاقة<span style={{color:C.sk}}>.</span></h1></Reveal>
      <Reveal d={0.2}><p style={{fontSize:"17px",color:"#8899aa",lineHeight:2,marginBottom:"40px",maxWidth:"440px",fontWeight:300}}>مدربون سعوديون · كلاسات لايف · حد أقصى <span style={{color:C.sk,fontWeight:700}}>٧</span> طلاب<br/>نتائج حقيقية من أول شهر.</p></Reveal>
      <Reveal d={0.3}><div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
        <a href={WA} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"10px",background:C.sk,color:C.nb,padding:"16px 36px",borderRadius:"60px",fontSize:"16px",fontWeight:800,boxShadow:"0 0 40px rgba(56,189,248,0.15)"}}>احجز لقاءك المجاني مع المدرب ←</a>
        <a href="#pricing" style={{display:"inline-flex",alignItems:"center",border:"1px solid rgba(255,255,255,0.1)",color:"#aaa",padding:"16px 28px",borderRadius:"60px",fontSize:"14px",fontWeight:500}}>الباقات والأسعار</a>
      </div></Reveal>
      <Reveal d={0.5}><div style={{display:"flex",gap:"48px",marginTop:"60px"}}>
        {[{n:7,s:"",l:"طالب كحد أقصى"},{n:100,s:"+",l:"طالب وطالبة"}].map((s,i)=>(<div key={i}><div style={{fontFamily:"'Playfair Display',serif",fontSize:"36px",fontWeight:900,color:"#fff",lineHeight:1}}>{React.createElement(NumUp,{target:s.n,suffix:s.s})}</div><div style={{fontSize:"12px",color:"#556677",marginTop:"4px"}}>{s.l}</div></div>))}
        <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:"36px",fontWeight:900,color:"#fff",lineHeight:1}}>4.9</div><div style={{fontSize:"12px",color:"#556677",marginTop:"4px"}}>تقييم ⭐</div></div>
      </div></Reveal>
    </div>
  </div>
</section>

{/* ══════ 4. "هل هذا أنت؟" — المشكلة ══════ */}
<section style={{padding:"80px 28px",background:`linear-gradient(180deg,${C.nb},${C.nd})`}}>
  <div style={mx}>
    <Reveal><div style={{textAlign:"center",marginBottom:"48px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>هل هذا <span style={{color:"#ef4444"}}>أنت</span>؟</span>
      <p style={{color:"#667788",fontSize:"14px",marginTop:"10px"}}>اضغط على اللي يشبه وضعك</p>
    </div></Reveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"12px"}}>
      {[
        {icon:"💸",title:"دفعت آلاف بمعهد غالي وما استفدت",desc:"محتواهم قديم وميت. 30 طالب بالكلاس. طلعت بالكاد تعرف تطلب من مطعم — بعد ما دفعت 7,000+ ريال.",ans:"درسنا نظام المعاهد الكبرى ووفرنا أفضل منه — بمحتوى حي ومحدّث، و7 طلاب بس بالكلاس، ومدرب سعودي يتابعك يومياً. بأقل من خُمس السعر."},
        {icon:"📱",title:"جربت دورة مسجلة وما تطورت",desc:"كملت الدورة كاملة، تطورت شوي، لكن ما عندك ثقة تتكلم ولا تقدر تستخدم اللي تعلمته فعلياً.",ans:"الدورات المسجلة ما تعطيك تفاعل ولا تصحيح ولا بيئة تتكلم فيها. عندنا كل شيء لايف — مدربك يسمعك ويصححك فوراً. وتتمرن مع زملاء حقيقيين."},
        {icon:"😰",title:"تستحي تتكلم بالكلاس",desc:"المعلم ما يفهمك. تحس إنك الوحيد اللي ضعيف. تخاف تغلط قدام الباقي.",ans:"خلال لقائك الأول ندرس شخصيتك. نحطك بقروب شخصياته تتناغم معك. ومدربك يعرف بالضبط كيف يشجعك بدون ما يحرجك. عندنا ما فيه أحد يحكم عليك."},
        {icon:"🎯",title:"تبي IELTS بس ما تعرف تبدأ وين",desc:"الوظيفة أو الابتعاث يطلب 6.5 ومستواك ما يوصلها. كل يوم تأخير يبعدك عن الفرصة.",ans:"نحدد مستواك بدقة ونرسم لك خطة واضحة. مدربون متخصصين بالـ IELTS. ومتابعة يومية تضمن إنك ما تضيع."},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.08}>
          <div onClick={()=>setProb(prob===i?null:i)} style={{background:prob===i?"rgba(56,189,248,0.04)":"rgba(255,255,255,0.015)",border:prob===i?"1px solid rgba(56,189,248,0.15)":"1px solid rgba(255,255,255,0.04)",borderRadius:"18px",padding:"28px 24px",cursor:"pointer",transition:"all 0.4s"}}>
            <div style={{fontSize:"28px",marginBottom:"10px"}}>{item.icon}</div>
            <h3 style={{fontSize:"16px",fontWeight:700,color:prob===i?C.sk:"#fff",marginBottom:"8px",transition:"color 0.3s"}}>{item.title}</h3>
            <p style={{fontSize:"13px",color:"#778899",lineHeight:1.8}}>{item.desc}</p>
            <div style={{maxHeight:prob===i?"300px":"0",overflow:"hidden",transition:"max-height 0.5s ease"}}>
              <div style={{marginTop:"16px",padding:"16px",borderRadius:"12px",background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.08)"}}>
                <div style={{fontSize:"12px",color:C.sk,fontWeight:700,marginBottom:"6px"}}>الحل عندنا:</div>
                <p style={{fontSize:"13px",color:"#aabbcc",lineHeight:1.9}}>{item.ans}</p>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
    <Reveal d={0.4}><p style={{textAlign:"center",marginTop:"32px",color:C.sk,fontSize:"16px",fontWeight:700}}>إذا أي واحد من هذول أنت — أنت بالمكان الصح ✓</p></Reveal>
  </div>
</section>

{/* ══════ 5. "لمن هذي الدورة؟" — 3 شخصيات ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={mx}>
    <Reveal><div style={{textAlign:"center",marginBottom:"48px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>لمن هذي <span style={{color:C.sk}}>الدورة</span>؟</span>
    </div></Reveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"16px"}}>
      {[
        {icon:"🎓",title:"طالب جامعي",desc:"مواد الإنجليزي صعبة عليك والمعدل يتأثر. تبي تنجح وتتفوق — مو بس تعدّي.",result:"خلال فصل واحد: تفهم المحاضرات، تكتب الواجبات بنفسك، وتشارك بالكلاس بثقة."},
        {icon:"💼",title:"خريج أو موظف",desc:"تبي وظيفة تطلب IELTS أو ترقية تحتاج إنجليزي. كل يوم تأخير = فرصة ضايعة.",result:"خلال 3-6 شهور: تجتاز IELTS بالدرجة المطلوبة وتدخل المقابلات الشخصية بثقة."},
        {icon:"🔄",title:"محروق من تجارب سابقة",desc:"جربت معاهد ودورات مسجلة ودفعت مبالغ — وبالنهاية لغتك ما تغيرت.",result:"من أول شهر: تحس بالفرق الحقيقي. لأن المشكلة ما كانت فيك — كانت بالطريقة."},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.1}>
          <div style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"20px",padding:"32px 26px",height:"100%",display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:"36px",marginBottom:"14px"}}>{item.icon}</div>
            <h3 style={{fontSize:"18px",fontWeight:800,color:"#fff",marginBottom:"8px"}}>{item.title}</h3>
            <p style={{fontSize:"13px",color:"#889",lineHeight:1.8,marginBottom:"16px",flex:1}}>{item.desc}</p>
            <div style={{padding:"14px",borderRadius:"12px",background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.08)"}}>
              <div style={{fontSize:"12px",color:C.sk,fontWeight:700,marginBottom:"4px"}}>النتيجة المتوقعة:</div>
              <p style={{fontSize:"13px",color:"#aabbcc",lineHeight:1.8}}>{item.result}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
</section>

{/* ══════ 6. "مو للجميع" — Velvet Rope ══════ */}
<section style={{padding:"60px 28px"}}>
  <div style={{...mx,maxWidth:"750px"}}>
    <Reveal>
      <div style={{textAlign:"center",padding:"48px 36px",borderRadius:"24px",border:"2px solid rgba(239,68,68,0.15)",background:"rgba(239,68,68,0.02)"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,3.5vw,36px)",fontWeight:900,color:"#fff",marginBottom:"20px"}}>Fluentia <span style={{color:"#ef4444"}}>مو لكل أحد</span></div>
        <p style={{color:"#889",fontSize:"15px",lineHeight:2,marginBottom:"24px"}}>ما نقبل كل من يتقدم. نبحث عن طلاب عندهم:</p>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"10px",marginBottom:"24px"}}>
          {["إرادة حقيقية للتعلّم","التزام بالحضور والتفاعل","احترام لزملائهم بالكلاس"].map((item,i)=>(
            <span key={i} style={{padding:"8px 18px",borderRadius:"100px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.12)",color:C.sl,fontSize:"13px",fontWeight:600}}>✓ {item}</span>
          ))}
        </div>
        <p style={{color:"#667",fontSize:"14px",lineHeight:1.9,fontStyle:"italic"}}>إذا تبي مكان تدفع وتنام فيه — مو هنا.<br/>إذا تبي مكان يغيّر مستواك فعلاً — <span style={{color:C.sk,fontWeight:700}}>رحّبنا فيك.</span></p>
      </div>
    </Reveal>
  </div>
</section>

{/* ══════ 7. "نحطّك بالمكان الصح" — الشخصية النفسية ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={{...mx,maxWidth:"900px"}}>
    <Reveal><div style={{marginBottom:"48px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>نحطّك <span style={{color:C.sk}}>بالمكان الصح</span></span>
      <p style={{color:"#667788",fontSize:"15px",marginTop:"10px",maxWidth:"600px"}}>مو بس نعلمك — نفهمك. وهذا اللي يخلي التعلّم عندنا أسرع بمراحل.</p>
    </div></Reveal>
    <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
      {[
        {step:"1",title:"نفهم شخصيتك",desc:"خلال لقائك الأول ندرس طبيعتك: هل تستحي تسأل؟ تحتاج تشجيع أكثر؟ تحب المنافسة أو الهدوء؟",icon:"🧠"},
        {step:"2",title:"نختار قروبك بعناية",desc:"نحطك مع طلاب شخصياتهم تتناغم معك. ما فيه متنمر، ما فيه كسول — بس طلاب جادين ومتعاونين.",icon:"👥"},
        {step:"3",title:"ندرّب مدربك عليك",desc:"مدربك يعرف إنك (مثلاً) تستحي تقول ما فهمت. فبدل ما يسألك، يطلب منك تشرح الفكرة — ويتأكد إنك فاهم بدون ما يحرجك.",icon:"🎯"},
        {step:"4",title:"النتيجة: بيئة تعلّم مثالية",desc:"طلاب متميزين ومنافسين ومتعاونين. نخبة النخبة. وأنت واحد منهم.",icon:"⭐"},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.1}>
          <div style={{display:"flex",gap:"20px",padding:"28px 24px",background:i===3?"rgba(56,189,248,0.03)":"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.03)",borderRadius:"16px",alignItems:"flex-start"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${C.sk}22,${C.nv})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{item.icon}</div>
            <div>
              <div style={{fontSize:"11px",color:C.sk,fontWeight:700,marginBottom:"4px"}}>الخطوة {item.step}</div>
              <h3 style={{fontSize:"16px",fontWeight:700,color:"#fff",marginBottom:"6px"}}>{item.title}</h3>
              <p style={{fontSize:"13px",color:"#889",lineHeight:1.8}}>{item.desc}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
</section>

{/* ══════ 8. ليش مختلفين (نتائج مو مميزات) ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={mx}>
    <Reveal><div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"48px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>ليش <span style={{color:C.sk}}>مختلفين</span>؟</span>
      <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,rgba(56,189,248,0.1),transparent)"}}/>
    </div></Reveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"2px"}}>
      {[
        {n:"01",t:"خلال 3 شهور تتكلم بثقة",d:"مو بس كلمات — محادثات حقيقية. لأن التركيز على السبيكنج من أول يوم.",c:C.sk},
        {n:"02",t:"مدربك معك يومياً — مو بس بالكلاس",d:"يصحح أخطاءك، يجاوب أسئلتك، ويتابع تقدمك عبر تيليجرام كل يوم.",c:C.gd},
        {n:"03",t:"محتوى مصمم بدقة علمية",d:"راعينا الجوانب النفسية والعصبية واللغوية بحكم التخصص والخبرة — مو محتوى منسوخ.",c:"#a78bfa"},
        {n:"04",t:"تشوف تطورك بالأرقام",d:"تقييمات دورية وتقارير تقدم حقيقية — مو إحساس، بيانات.",c:"#f472b6"},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.08}>
          <div style={{background:"rgba(56,189,248,0.02)",border:"1px solid rgba(56,189,248,0.04)",padding:"36px 28px",position:"relative",overflow:"hidden",transition:"all 0.4s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,189,248,0.04)";e.currentTarget.style.borderColor=item.c+"33"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(56,189,248,0.02)";e.currentTarget.style.borderColor="rgba(56,189,248,0.04)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"44px",fontWeight:900,color:item.c,opacity:0.1,position:"absolute",top:"12px",left:"16px"}}>{item.n}</div>
            <h3 style={{fontSize:"17px",fontWeight:800,color:"#fff",marginBottom:"8px",position:"relative"}}>{item.t}</h3>
            <p style={{fontSize:"13px",color:"#889",lineHeight:1.8,position:"relative"}}>{item.d}</p>
          </div>
        </Reveal>))}
    </div>
  </div>
</section>

{/* ══════ MARQUEE ══════ */}
<div style={{overflow:"hidden",padding:"16px 0",borderTop:"1px solid rgba(56,189,248,0.04)",borderBottom:"1px solid rgba(56,189,248,0.04)"}}>
  <div style={{display:"flex",animation:"marquee 20s linear infinite",width:"fit-content"}}>
    {Array(2).fill(["قرامر","سبيكنج","ريدنج","رايتنج","IELTS","نطق","مفردات","محادثة"]).flat().map((w,i)=>(
      <span key={i} style={{padding:"0 24px",fontSize:"14px",color:"#334455",fontWeight:700,whiteSpace:"nowrap"}}>{w} <span style={{color:C.sk,margin:"0 8px",opacity:0.4}}>·</span></span>))}
  </div>
</div>

{/* ══════ 9. Fluentia vs المعاهد ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={{...mx,maxWidth:"900px"}}>
    <Reveal><div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid rgba(56,189,248,0.08)"}}>
      <div style={{background:"rgba(56,189,248,0.04)",padding:"20px",textAlign:"center"}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:900,color:"#fff"}}>Fluentia مقابل <span style={{color:"#ef4444"}}>المعاهد التقليدية</span></span>
      </div>
      <div style={{padding:"4px"}}>
        {[
          {f:"السعر الشهري",us:"750 — 1,500 ريال",them:"2,000 — 7,000+ ريال"},
          {f:"عدد الطلاب",us:"7 طلاب كحد أقصى",them:"15 — 30 طالب"},
          {f:"متابعة يومية",us:"✓ مع المدرب مباشرة",them:"✕ غير متوفرة"},
          {f:"المدرب",us:"سعودي متخصص",them:"غالباً غير سعودي"},
          {f:"فهم شخصية الطالب",us:"✓ تقييم نفسي + قروب مناسب",them:"✕ كلاس عشوائي"},
          {f:"حصص فردية",us:"✓ مشمولة بالباقة",them:"إضافية بـ 200+ ريال"},
          {f:"الالتزام",us:"شهري بدون عقود",them:"فصلي أو سنوي"},
        ].map((row,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",gap:"4px",padding:"12px 16px",background:i%2===0?"rgba(255,255,255,0.015)":"transparent",borderRadius:"6px"}}>
            <div style={{fontSize:"13px",color:"#99aabb",fontWeight:600}}>{row.f}</div>
            <div style={{fontSize:"13px",color:C.sk,fontWeight:700,textAlign:"center"}}>{row.us}</div>
            <div style={{fontSize:"13px",color:"#ef4444",fontWeight:400,textAlign:"center",opacity:0.6}}>{row.them}</div>
          </div>))}
      </div>
    </div></Reveal>
  </div>
</section>

{/* ══════ 10. تكلفة الحصة + كوب القهوة ══════ */}
<section style={{padding:"60px 28px"}}>
  <div style={{...mx,maxWidth:"1000px"}}>
    <Reveal><div style={{textAlign:"center",marginBottom:"40px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>وش يعادل <span style={{color:C.sk}}>٣٧ ريال</span> باليوم؟</span>
      <p style={{color:"#667788",fontSize:"14px",marginTop:"8px"}}>باقة طلاقة = 1,100 ÷ 30 يوم = 37 ريال باليوم</p>
    </div></Reveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"40px"}}>
      {[
        {emoji:"☕",label:"كوب ستاربكس",price:"25-35",note:"تشربه بـ10 دقايق"},
        {emoji:"🍔",label:"وجبة مطعم",price:"35-50",note:"تاكلها بنص ساعة"},
        {emoji:"🎮",label:"اشتراك قيمنق",price:"40-60",note:"ترفيه مؤقت"},
        {emoji:"📚",label:"Fluentia يومياً",price:"37",note:"مهارة تبقى للأبد",hl:true},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.08}>
          <div style={{background:item.hl?"rgba(56,189,248,0.06)":"rgba(255,255,255,0.015)",border:item.hl?"2px solid rgba(56,189,248,0.2)":"1px solid rgba(255,255,255,0.04)",borderRadius:"16px",padding:"24px 18px",textAlign:"center",transform:item.hl?"scale(1.05)":"scale(1)"}}>
            <div style={{fontSize:"32px",marginBottom:"10px"}}>{item.emoji}</div>
            <div style={{fontSize:"13px",color:item.hl?C.sl:"#99aabb",fontWeight:600,marginBottom:"4px"}}>{item.label}</div>
            <div style={{fontSize:"20px",fontWeight:900,color:item.hl?C.sk:"#fff",fontFamily:"'Playfair Display',serif"}}>{item.price} ر.س</div>
            <div style={{fontSize:"11px",color:item.hl?C.sk:"#556677",marginTop:"6px",fontWeight:item.hl?700:400}}>{item.note}</div>
          </div>
        </Reveal>))}
    </div>
    <Reveal d={0.3}><div style={{textAlign:"center",color:"#667",fontSize:"13px"}}>* الحصة الخصوصية عند معلم خاص = <span style={{color:"#ef4444",fontWeight:700}}>200+ ريال</span> — عندنا تبدأ من <span style={{color:C.sk,fontWeight:700}}>94 ريال</span></div></Reveal>
  </div>
</section>

{/* ══════ 11. آراء الطلاب ══════ */}
<section id="reviews" style={{padding:"80px 0",overflow:"hidden"}}>
  <div style={{...mx,marginBottom:"40px"}}><Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>آراء <span style={{color:C.sk}}>طلابنا</span></span></Reveal></div>
  <div ref={sRef} className="hide-sb" style={{display:"flex",gap:"14px",overflowX:"auto",padding:"0 28px 20px",scrollSnapType:"x mandatory"}}>
    {reviews.map((rv,i)=>(
      <div key={i} onClick={()=>setTI(i)} style={{minWidth:"280px",maxWidth:"320px",flex:"0 0 auto",scrollSnapAlign:"center",background:tI===i?"rgba(56,189,248,0.04)":"rgba(255,255,255,0.015)",border:tI===i?"1px solid rgba(56,189,248,0.15)":"1px solid rgba(255,255,255,0.03)",borderRadius:"18px",padding:"28px 22px",cursor:"pointer",transition:"all 0.4s"}}>
        <div style={{display:"inline-block",padding:"3px 10px",borderRadius:"100px",background:"rgba(56,189,248,0.08)",color:C.sk,fontSize:"11px",fontWeight:700,marginBottom:"14px"}}>{rv.tag}</div>
        <p style={{color:"#bbc",fontSize:"13px",lineHeight:2,marginBottom:"20px",minHeight:"70px"}}>"{rv.t}"</p>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:"12px",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",background:`linear-gradient(135deg,${C.sk},${C.nv})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:800,color:"#fff"}}>{rv.n[0]}</div>
          <div><div style={{fontSize:"13px",fontWeight:700,color:"#fff"}}>{rv.n}</div><div style={{fontSize:"11px",color:"#556677"}}>{rv.r}</div></div>
        </div>
      </div>))}
  </div>
  <div style={{display:"flex",justifyContent:"center",gap:"5px",marginTop:"20px"}}>
    {reviews.map((_,i)=>(<div key={i} onClick={()=>setTI(i)} style={{width:tI===i?"28px":"8px",height:"4px",borderRadius:"100px",cursor:"pointer",transition:"all 0.4s",background:tI===i?C.sk:"rgba(255,255,255,0.06)"}}/>))}
  </div>
</section>

{/* ══════ 12. قبل × بعد ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={{...mx,maxWidth:"900px"}}>
    <Reveal><div style={{textAlign:"center",marginBottom:"40px"}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"#fff"}}>قبل <span style={{color:"#ef4444"}}>×</span> بعد <span style={{color:C.sk}}>Fluentia</span></span>
    </div></Reveal>
    {[
      {name:"الجوهرة",period:"6 شهور",before:"ما أعرف أقرأ ولا أتكلم",after:"قراءتها قريبة من المتحدثين الأصليين",bL:"مبتدئ",aL:"متقدم",p:90},
      {name:"الهنوف",period:"3 شهور",before:"مستوى ضعيف وما أقدر أتجاوب",after:"فرق واضح وصرت أقرأ أشياء أكاديمية",bL:"مبتدئ",aL:"متوسط+",p:70},
      {name:"الجوهرة إبراهيم",period:"6 شهور",before:"كل شي بالإنجليزي صعب",after:"عدّت اختباراتها كلها بدرجة ممتازة",bL:"ضعيف",aL:"ممتاز",p:85},
    ].map((s,i)=>(
      <Reveal key={i} d={i*0.1}>
        <div style={{background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"18px",padding:"28px 24px",marginBottom:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"30px",height:"30px",borderRadius:"50%",background:`linear-gradient(135deg,${C.sk},${C.nv})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:800,color:"#fff"}}>{s.name[0]}</div>
              <span style={{fontSize:"14px",fontWeight:700,color:"#fff"}}>{s.name}</span>
            </div>
            <span style={{fontSize:"11px",color:C.sk,fontWeight:600,background:"rgba(56,189,248,0.08)",padding:"3px 10px",borderRadius:"100px"}}>{s.period}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"12px",alignItems:"center"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:"11px",color:"#ef4444",fontWeight:700,marginBottom:"4px"}}>قبل</div><div style={{fontSize:"13px",color:"#99aabb",lineHeight:1.6}}>{s.before}</div><span style={{display:"inline-block",marginTop:"6px",padding:"2px 8px",borderRadius:"100px",background:"rgba(239,68,68,0.1)",color:"#ef4444",fontSize:"10px",fontWeight:700}}>{s.bL}</span></div>
            <div style={{fontSize:"24px",color:C.sk}}>→</div>
            <div style={{textAlign:"center"}}><div style={{fontSize:"11px",color:C.sk,fontWeight:700,marginBottom:"4px"}}>بعد</div><div style={{fontSize:"13px",color:"#dde",lineHeight:1.6,fontWeight:600}}>{s.after}</div><span style={{display:"inline-block",marginTop:"6px",padding:"2px 8px",borderRadius:"100px",background:"rgba(56,189,248,0.1)",color:C.sk,fontSize:"10px",fontWeight:700}}>{s.aL}</span></div>
          </div>
          <div style={{marginTop:"16px",background:"rgba(255,255,255,0.04)",borderRadius:"100px",height:"5px",overflow:"hidden"}}><div style={{width:s.p+"%",height:"100%",background:`linear-gradient(90deg,${C.sk},${C.sl})`,borderRadius:"100px"}}/></div>
        </div>
      </Reveal>))}
  </div>
</section>

{/* ══════ 13. قصة الجوهرة ══════ */}
<section style={{padding:"60px 28px"}}>
  <div style={{...mx,maxWidth:"800px"}}><Reveal>
    <div style={{padding:"44px 32px",background:"linear-gradient(135deg,rgba(56,189,248,0.03),rgba(26,45,80,0.1))",border:"1px solid rgba(56,189,248,0.1)",borderRadius:"24px",animation:"borderGlow 4s ease-in-out infinite",position:"relative"}}>
      <div style={{position:"absolute",top:"-14px",right:"32px",background:C.nb,padding:"4px 18px",border:"1px solid rgba(56,189,248,0.2)",borderRadius:"100px",fontSize:"12px",fontWeight:700,color:C.sk}}>📖 قصة نجاح</div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:900,color:"#fff",marginBottom:"18px",lineHeight:1.4}}>من الصفر إلى مستوى <span style={{color:C.sk}}>المتحدثين الأصليين</span></h3>
      <div style={{color:"#889",fontSize:"14px",lineHeight:2.1,fontWeight:300}}>
        <p style={{marginBottom:"10px"}}>بدأت <strong style={{color:"#fff",fontWeight:700}}>الجوهرة</strong> وهي بآخر سنة بالثانوية. لغتها كانت ضعيفة جداً لكنها كانت متحمسة.</p>
        <p style={{marginBottom:"10px"}}>مرّت بمراحل — حماس ثم فقدان حماس ثم رجوع. لكن المدرب كان يتابع ويحفّز خطوة بخطوة.</p>
        <p style={{color:"#fff",fontWeight:600,marginBottom:"10px"}}>الآن؟ قراءتها قريبة جداً من المتحدثين الأصليين. سبقت الجميع بخطوة أخذتها بدري.</p>
        <p style={{color:C.sk,fontWeight:700}}>السر؟ اجتهاد + مدرب يتابع وحريص ✦</p>
      </div>
    </div>
  </Reveal></div>
</section>

{/* ══════ 14. رحلتك معنا Timeline ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={{...mx,maxWidth:"800px"}}>
    <Reveal><div style={{textAlign:"center",marginBottom:"48px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"#fff"}}>رحلتك <span style={{color:C.sk}}>معنا</span></span></div></Reveal>
    <div style={{position:"relative",paddingRight:"40px"}}>
      <div style={{position:"absolute",right:"15px",top:0,bottom:0,width:"2px",background:`linear-gradient(180deg,${C.sk},rgba(56,189,248,0.05))`}}/>
      {[
        {s:"اليوم",t:"لقاء مبدئي مجاني",d:"تقابل المدرب. نفهم مستواك وشخصيتك. بدون التزام.",i:"🤝",c:C.sk},
        {s:"الأسبوع 1",t:"تبدأ رحلتك",d:"تنضم لقروبك المختار بعناية. 7 طلاب شخصياتهم تتناغم معك.",i:"🚀",c:C.sl},
        {s:"الشهر 1",t:"تحس بالفرق",d:"القرامر يتوضح. تبدأ تكوّن جمل. المدرب يتابعك يومياً.",i:"💡",c:"#a78bfa"},
        {s:"الشهر 3",t:"تتكلم بثقة",d:"محادثات حقيقية. تقرأ وتكتب. مستواك يتقدم بالأرقام.",i:"💪",c:C.gd},
        {s:"الشهر 6+",t:"طلاقة حقيقية",d:"تتكلم بطلاقة. جاهز لـ IELTS أو الوظيفة أو الجامعة.",i:"🎯",c:"#4ade80"},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.1}>
          <div style={{position:"relative",marginBottom:"32px",paddingRight:"32px"}}>
            <div style={{position:"absolute",right:"-40px",top:"4px",width:"28px",height:"28px",borderRadius:"50%",background:C.nb,border:"2px solid "+item.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",zIndex:1}}>{item.i}</div>
            <div style={{fontSize:"11px",color:item.c,fontWeight:700,marginBottom:"3px"}}>{item.s}</div>
            <div style={{fontSize:"16px",fontWeight:800,color:"#fff",marginBottom:"4px"}}>{item.t}</div>
            <div style={{fontSize:"13px",color:"#889",lineHeight:1.8}}>{item.d}</div>
          </div>
        </Reveal>))}
    </div>
  </div>
</section>

{/* ══════ 15. دكتور علي ══════ */}
<section style={{padding:"60px 28px"}}>
  <div style={{...mx,maxWidth:"750px"}}><Reveal>
    <div style={{display:"flex",gap:"24px",alignItems:"center",padding:"36px 28px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"20px",flexWrap:"wrap"}}>
      <div style={{width:"80px",height:"80px",borderRadius:"50%",background:`linear-gradient(135deg,${C.sk},${C.nv})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",flexShrink:0}}>👨‍🏫</div>
      <div style={{flex:1,minWidth:"240px"}}>
        <div style={{fontSize:"11px",color:C.sk,fontWeight:700,marginBottom:"4px"}}>مؤسس الأكاديمية</div>
        <h3 style={{fontSize:"20px",fontWeight:800,color:"#fff",marginBottom:"8px"}}>د. علي</h3>
        <p style={{fontSize:"13px",color:"#889",lineHeight:1.9}}>متخصص في المجال النفسي والعصبي واللغوي. درّب عدد كبير من الطلاب والطالبات ووصلوا لمراحل متميزة. أسس Fluentia لتكون الوجهة الذهبية لتعلّم الإنجليزية — بدقة علمية وجودة لا تقبل التنازل.</p>
      </div>
    </div>
  </Reveal></div>
</section>

{/* ══════ 16. PRICING ══════ */}
<section id="pricing" style={{padding:"80px 28px"}}>
  <div style={mx}>
    <Reveal><div style={{textAlign:"center",marginBottom:"16px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff"}}>اختر <span style={{color:C.sk}}>باقتك</span></span></div>
    <p style={{textAlign:"center",color:"#556677",fontSize:"14px",marginBottom:"12px"}}>لقاء مبدئي مجاني مع المدرب · دفع شهري · بدون التزام</p>
    <div style={{textAlign:"center",marginBottom:"48px"}}><span style={{display:"inline-block",padding:"6px 18px",borderRadius:"100px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.1)",color:C.sl,fontSize:"12px",fontWeight:600}}>📅 الكورسات تبدأ مع بداية كل شهر ميلادي — وتقدر تنضم بأي وقت</span></div></Reveal>
    <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"16px",alignItems:"stretch"}}>
      {pkgs.map((pk,idx)=>{const isH=hC===pk.id,isP=pk.pop,isPr=pk.prem;const ac=isP?C.sk:isPr?C.gd:"#667788";return(
        <Reveal key={pk.id} d={idx*0.1} style={{flex:"1 1 300px",maxWidth:"360px",minWidth:"280px",display:"flex"}}>
          <div onMouseEnter={()=>setHC(pk.id)} onMouseLeave={()=>setHC(null)} style={{width:"100%",borderRadius:"20px",overflow:"hidden",background:isP?"linear-gradient(170deg,rgba(56,189,248,0.06),rgba(56,189,248,0.02))":isPr?"linear-gradient(170deg,rgba(251,191,36,0.05),rgba(251,191,36,0.01))":"rgba(255,255,255,0.015)",border:isP?"1px solid rgba(56,189,248,0.25)":isPr?"1px solid rgba(251,191,36,0.2)":"1px solid rgba(255,255,255,0.04)",transform:isP?"scale(1.03)":isH?"scale(1.02)":"scale(1)",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",boxShadow:isP?"0 30px 80px rgba(56,189,248,0.06)":"none",display:"flex",flexDirection:"column"}}>
            {isP&&<div style={{background:C.sk,color:C.nb,textAlign:"center",padding:"10px",fontSize:"12px",fontWeight:800,letterSpacing:"2px"}}>الأكثر طلباً</div>}
            {isPr&&<div style={{background:"linear-gradient(135deg,#fbbf24,#d97706)",color:C.nb,textAlign:"center",padding:"10px",fontSize:"12px",fontWeight:800}}>✦ لأفضل النتائج</div>}
            <div style={{padding:"28px 24px",flex:1,display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:"11px",fontWeight:700,color:ac,marginBottom:"4px"}}>{pk.sub}</div>
              <h3 style={{fontSize:"26px",fontWeight:900,color:"#fff",marginBottom:"4px"}}>باقة {pk.nm}</h3>
              <span style={{display:"inline-block",width:"fit-content",marginBottom:"14px",fontSize:"11px",fontWeight:700,color:"#ef4444",background:"rgba(239,68,68,0.1)",padding:"3px 10px",borderRadius:"100px"}}>باقي {pk.seats} مقاعد فقط</span>
              <div style={{display:"flex",alignItems:"baseline",gap:"6px",marginBottom:"4px"}}><span style={{fontSize:"15px",color:"#556677",textDecoration:"line-through"}}>{pk.rv.toLocaleString()}</span><span style={{fontSize:"11px",color:"#445566"}}>القيمة الحقيقية</span></div>
              <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"24px",paddingBottom:"18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:"40px",fontWeight:900,color:"#fff",lineHeight:1}}>{pk.pr.toLocaleString()}</span>
                <span style={{color:"#556677",fontSize:"12px"}}>ر.س/شهرياً</span>
                <span style={{fontSize:"11px",color:"#4ade80",fontWeight:700,marginRight:"auto"}}>وفّر {pk.save}%</span>
              </div>
              <div style={{flex:1,marginBottom:"20px"}}>{pk.f.map((ft,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"9px",opacity:ft.ok?1:0.25}}>
                  <span style={{fontSize:"13px",color:ft.ok?(ft.hl?ac:"#4ade80"):"#333"}}>{ft.ok?"✓":"—"}</span>
                  <span style={{fontSize:"12.5px",color:ft.ok?"#ccd":"#333",fontWeight:ft.hl?600:300,textDecoration:ft.ok?"none":"line-through"}}>{ft.t}</span>
                </div>))}</div>
              <a href={waP(pk.nm)} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"14px",borderRadius:"14px",fontSize:"15px",fontWeight:800,background:isP?C.sk:isPr?C.gd:"rgba(255,255,255,0.06)",color:isP||isPr?C.nb:"#ccc",border:isP||isPr?"none":"1px solid rgba(255,255,255,0.08)"}}>احجز لقاءك المجاني ←</a>
              <div style={{textAlign:"center",marginTop:"8px",color:"#556677",fontSize:"11px",lineHeight:1.5}}>لقاء مبدئي مجاني مع المدرب<br/>تتعرف على الأسلوب قبل التسجيل</div>
            </div>
          </div>
        </Reveal>)})}
    </div>
    <Reveal d={0.3}><div style={{maxWidth:"800px",margin:"48px auto 0",padding:"32px 36px",borderRadius:"24px",background:"linear-gradient(135deg,rgba(56,189,248,0.06),rgba(26,45,80,0.15))",border:"2px solid rgba(56,189,248,0.15)",animation:"borderGlow 4s ease-in-out infinite"}}>
      <div style={{fontSize:"20px",fontWeight:800,color:"#fff",marginBottom:"18px",textAlign:"center"}}>💡 ليش باقة <span style={{color:C.sk}}>طلاقة</span> هي الخيار الأذكى؟</div>
      <div style={{fontSize:"16px",color:"#bbc",lineHeight:2,textAlign:"center",marginBottom:"18px"}}>مقابل <span style={{color:C.sk,fontWeight:800,fontSize:"20px"}}>350 ريال</span> فقط زيادة عن أساس:</div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"10px",marginBottom:"20px"}}>
        {["متابعة يومية مع المدرب","محتوى مسجل ترجعله أي وقت","حصة فردية شهرية","تقييم كل أسبوعين","تقرير تقدّم مفصّل"].map((item,i)=>(<span key={i} style={{padding:"7px 16px",borderRadius:"100px",background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.12)",color:C.sl,fontSize:"13px",fontWeight:600}}>✓ {item}</span>))}
      </div>
      <div style={{textAlign:"center",fontSize:"17px",color:"#fff",fontWeight:700}}>كل ميزة إضافية بأقل من <span style={{color:C.sk,fontSize:"22px"}}>٧٠ ريال</span> فقط</div>
      <div style={{textAlign:"center",marginTop:"20px"}}><a href={waP("طلاقة")} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:C.sk,color:C.nb,padding:"14px 32px",borderRadius:"60px",fontSize:"15px",fontWeight:800}}>احجز لقاءك المجاني — باقة طلاقة ←</a></div>
    </div></Reveal>
  </div>
</section>

{/* ══════ 17. FAQ ══════ */}
<section style={{padding:"80px 28px"}}>
  <div style={{...mx,maxWidth:"680px"}}>
    <Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"#fff",display:"block",marginBottom:"36px"}}>أسئلة <span style={{color:C.sk}}>شائعة</span></span></Reveal>
    {fqs.map((f,i)=>(
      <Reveal key={i} d={i*0.04}>
        <div onClick={()=>setFO(fO===i?null:i)} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",padding:"18px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px"}}>
            <span style={{fontSize:"14px",fontWeight:600,color:fO===i?C.sk:"#dde",transition:"color 0.3s"}}>{f.q}</span>
            <span style={{color:C.sk,fontSize:"20px",transition:"transform 0.3s",transform:fO===i?"rotate(45deg)":"rotate(0)",flexShrink:0}}>+</span>
          </div>
          <div style={{maxHeight:fO===i?"250px":"0",overflow:"hidden",transition:"max-height 0.4s ease"}}>
            <p style={{color:"#778899",fontSize:"13px",lineHeight:1.9,paddingTop:"12px",fontWeight:300}}>{f.a}</p>
          </div>
        </div>
      </Reveal>))}
  </div>
</section>

{/* ══════ 18. FINAL CTA ══════ */}
<section style={{padding:"100px 28px",textAlign:"center",position:"relative"}}>
  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.05),transparent 60%)",animation:"glow 5s ease-in-out infinite",pointerEvents:"none"}}/>
  <Reveal>
    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,6vw,52px)",fontWeight:900,color:"#fff",marginBottom:"18px",letterSpacing:"-1px",lineHeight:1.1}}>جاهز تبدأ<span style={{color:C.sk}}>؟</span></h2>
    <p style={{color:"#778899",fontSize:"16px",lineHeight:1.8,marginBottom:"36px",maxWidth:"440px",marginInline:"auto",fontWeight:300}}>احجز لقاء مبدئي مجاني مع المدرب.<br/>تتعرف على أسلوبه — بدون أي التزام.</p>
    <a href={WA} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"10px",background:C.sk,color:C.nb,padding:"18px 44px",borderRadius:"60px",fontSize:"18px",fontWeight:800,boxShadow:"0 0 60px rgba(56,189,248,0.12)"}}>تواصل معنا ←</a>
    <div style={{marginTop:"14px",color:"#556677",fontSize:"13px"}}>+966 55 866 9974</div>
  </Reveal>
</section>

{/* ══════ FOOTER ══════ */}
<footer style={{padding:"24px 28px",borderTop:"1px solid rgba(56,189,248,0.04)"}}>
  <div style={{...mx,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
    <span style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:900,color:"#fff"}}><span style={{color:C.sk}}>F</span>luentia</span>
    <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
      <a href={TT} target="_blank" rel="noopener noreferrer" style={{color:"#556677",fontSize:"12px"}}>TikTok</a>
      <a href={IG} target="_blank" rel="noopener noreferrer" style={{color:"#556677",fontSize:"12px"}}>Instagram</a>
      <span style={{color:"#223344",fontSize:"11px"}}>© 2026</span>
    </div>
  </div>
</footer>

{/* ══════ FLOATING WA ══════ */}
<a href={WA} target="_blank" rel="noopener noreferrer" style={{position:"fixed",bottom:"24px",left:"24px",zIndex:999,width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"24px",animation:"pulse2 2s infinite"}}>💬</a>
</div>)}
