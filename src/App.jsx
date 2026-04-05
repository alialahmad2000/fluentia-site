import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

/* ─── WhatsApp ─── */
const WA_BASE = "https://wa.me/966558669974?text=";
const buildWA = (data, utm) => WA_BASE + encodeURIComponent(
  `السلام عليكم، أبي أحجز لقاء مبدئي مجاني\n` +
  `الاسم: ${data.name || "—"}\n` +
  `العمر: ${data.age || "—"}\n` +
  `المسار: ${data.path || "—"}\n` +
  `الباقة: ${data.pkg || "—"}\n` +
  `الهدف: ${data.goal || "—"}\n` +
  (data.startDate ? `موعد البداية: ${data.startDate}\n` : "") +
  (data.ieltsTarget ? `الدرجة المستهدفة IELTS: ${data.ieltsTarget}\n` : "") +
  (data.level ? `مستوى تقريبي: ${data.level}\n` : "") +
  (utm ? `المصدر: ${utm}\n` : "")
);
const WA = WA_BASE + encodeURIComponent("السلام عليكم، أبي أحجز لقاء مبدئي مجاني مع المدرب");
const WA_OFF = WA_BASE + encodeURIComponent("أبي أستفيد من عرض الـ20%");
const TT = "https://www.tiktok.com/@fluentia_";
const IG = "https://www.instagram.com/fluentia__";

/* ─── Static Colors (don't change with theme) ─── */
const SKY = "#38bdf8";
const SKY_L = "#7dd3fc";
const GOLD = "#fbbf24";
const NAVY = "#1a2d50";
const RED = "#ef4444";
const GREEN = "#4ade80";

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
  { id:1, nm:"أساس", sub:"للتطوير بوتيرة مريحة", pr:750, rv:1050, pop:false, prem:false, seats:5, save:"29", f:[
    {t:"8 ساعات تدريب شهرياً",ok:1},{t:"7 طلاب كحد أقصى",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم شهري",ok:1},{t:"مواد تعليمية مختارة بعناية",ok:1},{t:"مدربك يتابعك يومياً",ok:0},{t:"محتوى مسجل ترجعله أي وقت",ok:0},{t:"حصص فردية وجهاً لوجه",ok:0},{t:"تقرير تقدّم بالأرقام",ok:0}
  ]},
  { id:2, nm:"طلاقة", sub:"الأنسب للتأسيس والتطوير", pr:1100, rv:1600, pop:true, prem:false, seats:3, save:"31", f:[
    {t:"8 ساعات تدريب شهرياً",ok:1},{t:"7 طلاب كحد أقصى",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم كل أسبوعين — ضعف التقدم",ok:1,hl:1},{t:"مواد شاملة + تمارين تفاعلية",ok:1,hl:1},{t:"مدربك يصحح أخطاءك يومياً",ok:1,hl:1},{t:"دروس مسجلة ترجعلها أي وقت",ok:1,hl:1},{t:"حصة فردية شهرية مع مدربك",ok:1,hl:1},{t:"تقرير شهري — تشوف تطورك بالأرقام",ok:1,hl:1}
  ]},
  { id:3, nm:"تميّز", sub:"الباقة الأقوى — لمن يريد الأفضل", pr:1500, rv:2200, pop:false, prem:true, seats:2, save:"32", f:[
    {t:"8 ساعات تدريب شهرياً",ok:1},{t:"7 طلاب كحد أقصى",ok:1},{t:"مجتمع تيليجرام داعم",ok:1},{t:"تقييم أسبوعي — 4× أسرع تقدماً",ok:1,hl:1},{t:"مواد حصرية + بنك أسئلة كامل",ok:1,hl:1},{t:"متابعة مكثفة + ملاحظات شخصية يومياً",ok:1,hl:1},{t:"مكتبة دروس مسجلة غير محدودة",ok:1,hl:1},{t:"حصة فردية كل أسبوع مع مدربك",ok:1,hl:1},{t:"تقرير أسبوعي + خطة تطوير شخصية",ok:1,hl:1}
  ]},
];
const fqs = [
  {q:"وش اللقاء المبدئي المجاني؟",a:"لقاء مباشر مع المدرب — نفهم مستواك وأهدافك وشخصيتك. وأنت تتعرف على أسلوب المدرب. بناءً عليه نقرر مع بعض إذا Fluentia المكان الصح لك."},
  {q:"متى تبدأ الدورات؟",a:"نعتمد الأشهر الميلادية — الكورسات تبدأ مع بداية كل شهر. ومع ذلك تقدر تنضم بأي وقت والمدرب يعوّضك."},
  {q:"هل أقدر أدخل IELTS مباشرة؟",a:"دورة IELTS مصممة لمن عنده أساس متين. إذا مستواك مبتدئ ننصحك تبدأ بالتأسيس أو التطوير أولاً — وبعدها تنتقل لـ IELTS بجاهزية كاملة."},
  {q:"كم عدد الطلاب بالكلاس؟",a:"حد أقصى 7 طلاب فقط. مو 20 أو 30 مثل المعاهد الثانية."},
  {q:"جربت دورات قبل وما استفدت — ليش عندكم بيختلف؟",a:"لأننا ندرس كل طالب بشكل فردي، نفهم شخصيته، ونحطه بالقروب اللي يناسبه. المدرب يتابعك يومياً. والمحتوى مصمم بعناية علمية."},
  {q:"أقدر أتعلم من اليوتيوب ببلاش — ليش أدفع؟",a:"لو اليوتيوب يكفي كان الكل يتكلم إنجليزي. المشكلة مو بالمحتوى — المشكلة بالمتابعة والتصحيح والالتزام والبيئة."},
  {q:"هل أقدر أغير الباقة؟",a:"نعم! الدفع شهري بدون أي التزام."},
  {q:"هل المدربين سعوديين؟",a:"نعم، جميع مدربينا سعوديون متخصصون."},
];
const quizQs = [
  {type:"self",q:"كيف تقيّم مستواك الحالي بالإنجليزي؟",opts:[{t:"ما أعرف شيء تقريباً",pts:0},{t:"أعرف كلمات بس ما أكوّن جمل",pts:1},{t:"أتكلم شوي بس أتلعثم",pts:2},{t:"أفهم وأتكلم لكن القرامر ضعيف",pts:3}]},
  {type:"grammar",q:"She _____ to the gym every morning.",opts:[{t:"go",pts:0},{t:"goes",pts:2},{t:"going",pts:1},{t:"gone",pts:0}]},
  {type:"grammar",q:'I _____ English for two years now.',opts:[{t:"study",pts:0},{t:"studied",pts:1},{t:"have been studying",pts:3},{t:"am study",pts:0}]},
  {type:"reading",q:'"The meeting has been postponed until next week due to unforeseen circumstances."\n\nوش معنى الجملة؟',opts:[{t:"الاجتماع تم إلغاؤه نهائياً",pts:0},{t:"الاجتماع تأجل للأسبوع الجاي لظروف غير متوقعة",pts:3},{t:"الاجتماع بيكون اليوم",pts:0},{t:"ما فهمت الجملة",pts:0}]},
  {type:"situation",q:'أنت بمقابلة شغل والمدير سألك:\n"Tell me about yourself."\nوش تقدر تقول؟',opts:[{t:"ما أعرف أجاوب",pts:0},{t:'أقول "My name is... I am..."',pts:1},{t:"أتكلم بجمل بسيطة بس أتلعثم",pts:2},{t:"أعطي إجابة واضحة ومرتبة",pts:3}]},
  {type:"self",q:"لو أحد كلمك إنجليزي بالشارع — وش تسوي؟",opts:[{t:"أتوتر وما أرد",pts:0},{t:"أفهم شوي بس ما أقدر أرد",pts:1},{t:"أفهم وأرد بكلمات بسيطة",pts:2},{t:"أفهم وأرد بجمل واضحة",pts:3}]},
];
function getLevel(score){if(score<=4)return{lv:"مبتدئ",rec:"تأسيس",color:"#ef4444",pkg:"طلاقة أو تميّز"};if(score<=9)return{lv:"متوسط",rec:"تطوير",color:GOLD,pkg:"طلاقة أو تميّز"};return{lv:"متقدم",rec:"IELTS أو تطوير متقدم",color:"#4ade80",pkg:"تميّز أو IELTS"}}

/* ─── Hooks ─── */
function useVis(th=0.1){const r=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const e=r.current;if(!e)return;const o=new IntersectionObserver(([x])=>{if(x.isIntersecting)setV(true)},{threshold:th});o.observe(e);return()=>o.disconnect()},[th]);return[r,v]}
function Reveal({children,d=0,y=50,style={}}){const[r,v]=useVis();return React.createElement("div",{ref:r,style:{opacity:v?1:0,transform:v?"translateY(0)":`translateY(${y}px)`,transition:`all 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,...style}},children)}
function NumUp({target,suffix=""}){const[r,v]=useVis();const[val,setVal]=useState(0);useEffect(()=>{if(!v)return;let s=0;const step=Math.max(1,Math.floor(target/40));const id=setInterval(()=>{s+=step;if(s>=target){setVal(target);clearInterval(id)}else setVal(s)},30);return()=>clearInterval(id)},[v,target]);return React.createElement("span",{ref:r},val+suffix)}
function useCD(td){const[t,setT]=useState({d:0,h:0,m:0,s:0});useEffect(()=>{const tick=()=>{const diff=new Date(td)-new Date();if(diff<=0)return;setT({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)})};tick();const i=setInterval(tick,1000);return()=>clearInterval(i)},[td]);return t}

/* ─── Quiz Component ─── */
function Quiz({onClose}){
  const[step,setStep]=useState(0);const[score,setScore]=useState(0);const[done,setDone]=useState(false);
  const pick=(pts)=>{const ns=score+pts;setScore(ns);if(step<quizQs.length-1)setStep(step+1);else setDone(true)};
  const result=getLevel(score);
  const labels={self:"تقييم ذاتي",grammar:"قرامر",reading:"فهم نص",situation:"موقف حياتي"};
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(6,14,28,0.95)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onClose}>
      <div style={{background:"var(--popup)",border:"1px solid var(--card-b)",borderRadius:"24px",padding:"36px 28px",maxWidth:"500px",width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:"16px",left:"16px",background:"none",border:"none",color:"var(--t3)",fontSize:"24px",cursor:"pointer"}}>✕</button>
        {!done?(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
              <span style={{fontSize:"13px",color:SKY,fontWeight:700}}>اكتشف مستواك</span>
              <span style={{fontSize:"12px",color:"var(--t3)"}}>{step+1} / {quizQs.length}</span>
            </div>
            <div style={{background:"var(--card)",borderRadius:"100px",height:"4px",marginBottom:"24px"}}><div style={{width:((step+1)/quizQs.length*100)+"%",height:"100%",background:SKY,borderRadius:"100px",transition:"width 0.4s"}}/></div>
            <div style={{display:"inline-block",padding:"3px 10px",borderRadius:"100px",background:"var(--sky-bg)",color:SKY,fontSize:"11px",fontWeight:700,marginBottom:"12px"}}>{labels[quizQs[step].type]}</div>
            <p style={{fontSize:"16px",fontWeight:700,color:"var(--t1)",lineHeight:1.7,marginBottom:"24px",whiteSpace:"pre-line"}}>{quizQs[step].q}</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {quizQs[step].opts.map((o,i)=>(
                <button key={i} onClick={()=>pick(o.pts)} style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"14px",padding:"14px 18px",textAlign:"right",color:"var(--t2)",fontSize:"14px",cursor:"pointer",transition:"all 0.3s",fontFamily:"'Tajawal',sans-serif"}} onMouseEnter={e=>{e.currentTarget.style.background="var(--sky-bg)";e.currentTarget.style.borderColor="var(--sky-b)"}} onMouseLeave={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.borderColor="var(--card-b)"}}>{o.t}</button>
              ))}
            </div>
          </div>
        ):(
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>📊</div>
            <div style={{fontSize:"14px",color:"var(--t3)",marginBottom:"8px"}}>مستواك التقريبي</div>
            <div style={{fontSize:"32px",fontWeight:900,color:result.color,marginBottom:"8px",fontFamily:"'Playfair Display',serif"}}>{result.lv}</div>
            <div style={{fontSize:"14px",color:"var(--t2)",marginBottom:"6px"}}>المسار المقترح: <span style={{color:SKY,fontWeight:700}}>{result.rec}</span></div>
            <div style={{fontSize:"13px",color:"var(--t3)",marginBottom:"24px"}}>الباقة الأنسب: <span style={{color:GOLD,fontWeight:700}}>{result.pkg}</span></div>
            <div style={{padding:"16px",borderRadius:"14px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)",marginBottom:"20px"}}>
              <p style={{fontSize:"13px",color:"var(--t2)",lineHeight:1.8}}>هذا تقييم مبدئي. في لقائك المجاني مع المدرب بنحدد مستواك بدقة ونرسم لك خطة واضحة.</p>
            </div>
            <a href={WA_BASE+encodeURIComponent(`السلام عليكم، سويت اختبار تحديد المستوى\nالنتيجة: ${result.lv}\nالمسار المقترح: ${result.rec}\nأبي أحجز لقاء مبدئي مجاني`)} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:SKY,color:"#060e1c",padding:"14px 32px",borderRadius:"60px",fontSize:"15px",fontWeight:800}}>احجز لقاءك المجاني ←</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Registration Form ─── */
function RegForm({pkg:initPkg,path:initPath,onClose}){
  const[step,setStep]=useState(initPath&&initPkg?3:initPath?2:initPkg?2:1);
  const[form,setForm]=useState({name:"",age:"",goal:"",ieltsTarget:"",path:initPath||"",pkg:initPkg||"",level:"",startDate:""});
  const[doQuiz,setDoQuiz]=useState(false);const[qStep,setQStep]=useState(0);const[qScore,setQScore]=useState(0);const[qDone,setQDone]=useState(false);
  const u=(k,v)=>setForm({...form,[k]:v});
  // Save to Google Sheets + open WhatsApp
  const send=()=>{if(!form.name){alert("اكتب اسمك");return}
    const utm=new URLSearchParams(window.location.search).get("utm_source")||"";
    // Auto-save to Google Sheets (silent)
    try{const sheetData={...form,utm,date:new Date().toLocaleString("ar-SA")};
    fetch("https://script.google.com/macros/s/YOUR_SHEET_ID/exec",{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(sheetData)}).catch(()=>{})}catch(e){}
    // TikTok Pixel: track form submission as conversion
    if(window.ttq){
      window.ttq.track('SubmitForm',{content_name:'fluentia_registration',content_category:form.path||'general',value:form.pkg||'unknown',description:form.goal||''});
      window.ttq.track('CompleteRegistration',{content_name:'fluentia_lead',content_category:form.path||'general'});
    }
    // Google Analytics event
    if(window.gtag){window.gtag('event','generate_lead',{event_category:'registration',event_label:form.path||'general',value:1})}
    window.open(buildWA(form,utm),"_blank");onClose()};
  const pickPath=(p)=>{u("path",p);setStep(2)};
  const pickPkg=(p)=>{u("pkg",p);setStep(3)};
  const qPick=(pts)=>{const ns=qScore+pts;setQScore(ns);if(qStep<quizQs.length-1)setQStep(qStep+1);else{setQDone(true);const lv=getLevel(ns);setForm(f=>({...f,level:lv.lv}));}};
  const labels={self:"تقييم ذاتي",grammar:"قرامر",reading:"فهم نص",situation:"موقف حياتي"};
  const paths=[
    {id:"تأسيس",icon:"📗",title:"تأسيس",desc:"من الصفر — بناء أساس متين",recPkg:"طلاقة أو تميّز",color:SKY},
    {id:"تطوير",icon:"📘",title:"تطوير",desc:"عندك أساس — تبي ترفع مستواك",recPkg:"طلاقة أو تميّز",color:SKY_L},
    {id:"IELTS",icon:"📙",title:"IELTS",desc:"تدريب مكثف على الاختبار",recPkg:"دورة IELTS (2,000 ر.س)",color:GOLD,warn:"ينصح بأساس متين قبل الدخول"},
  ];
  const pkgOpts=form.path==="IELTS"?[{nm:"IELTS",pr:"2,000",desc:"تدريب مكثف + اختبارات تجريبية + حصص فردية",color:"#ef4444"}]:[
    {nm:"أساس",pr:"750",desc:"8 حصص شهرياً — للتطوير بوتيرة مريحة",color:"#667788",loss:"بدون متابعة يومية · بدون محتوى مسجل · بدون حصص فردية"},
    {nm:"طلاقة",pr:"1,100",desc:"متابعة يومية + حصة فردية + محتوى مسجل",color:SKY,pop:true,badge:"الأنسب لك"},
    {nm:"تميّز",pr:"1,500",desc:"4 حصص فردية + تقرير أسبوعي + متابعة مكثفة",color:GOLD,badge2:"👑 الأقوى على الإطلاق"},
  ];
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(6,14,28,0.95)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onClose}>
      <div style={{background:"var(--popup)",border:"1px solid var(--card-b)",borderRadius:"24px",padding:"32px 26px",maxWidth:"480px",width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:"16px",left:"16px",background:"none",border:"none",color:"var(--t3)",fontSize:"24px",cursor:"pointer"}}>✕</button>
        {/* Progress */}
        <div style={{display:"flex",gap:"4px",marginBottom:"24px"}}>{[1,2,3].map(s=>(<div key={s} style={{flex:1,height:"3px",borderRadius:"100px",background:step>=s?SKY:"var(--card-b)",transition:"all 0.3s"}}/>))}</div>

        {/* Step 1: اختر المسار */}
        {step===1&&(<div>
          <div style={{textAlign:"center",marginBottom:"20px"}}><div style={{fontSize:"18px",fontWeight:800,color:"var(--t1)"}}>اختر مسارك</div><div style={{fontSize:"12px",color:"var(--t3)",marginTop:"4px"}}>الخطوة 1 من 3</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {paths.map(p=>(<button key={p.id} onClick={()=>pickPath(p.id)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"18px 16px",borderRadius:"14px",border:"1px solid var(--card-b)",background:"var(--card)",cursor:"pointer",textAlign:"right",fontFamily:"'Tajawal',sans-serif",transition:"all 0.3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+"44";e.currentTarget.style.background="var(--card-h)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--card-b)";e.currentTarget.style.background="var(--card)"}}>
              <span style={{fontSize:"28px"}}>{p.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:"15px",fontWeight:700,color:p.color}}>{p.title}</div><div style={{fontSize:"12px",color:"var(--t3)",marginTop:"2px"}}>{p.desc}</div>{p.warn&&<div style={{fontSize:"10px",color:GOLD,marginTop:"4px"}}>⚠️ {p.warn}</div>}</div>
              <span style={{color:"var(--t4)",fontSize:"18px"}}>←</span>
            </button>))}
          </div>
        </div>)}

        {/* Step 2: اختر الباقة */}
        {step===2&&(<div>
          <div style={{textAlign:"center",marginBottom:"16px"}}><div style={{fontSize:"18px",fontWeight:800,color:"var(--t1)"}}>اختر باقتك</div><div style={{fontSize:"12px",color:"var(--t3)",marginTop:"4px"}}>الخطوة 2 من 3 · مسار: <span style={{color:SKY}}>{form.path}</span></div></div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {pkgOpts.map(p=>(<button key={p.nm} onClick={()=>pickPkg(p.nm)} style={{padding:"18px 16px",borderRadius:"14px",border:p.pop?"2px solid "+SKY+"44":p.badge2?"2px solid "+GOLD+"33":"1px solid var(--card-b)",background:p.pop?"var(--sky-bg)":p.badge2?"rgba(251,191,36,0.04)":"var(--card)",cursor:"pointer",textAlign:"right",fontFamily:"'Tajawal',sans-serif",position:"relative",transition:"all 0.3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+"44"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=p.pop?SKY+"44":p.badge2?GOLD+"33":"var(--card-b)"}}>
              {p.pop&&<span style={{position:"absolute",top:"-8px",right:"16px",background:SKY,color:"#060e1c",padding:"2px 10px",borderRadius:"100px",fontSize:"10px",fontWeight:800}}>{p.badge}</span>}
              {p.badge2&&<span style={{position:"absolute",top:"-8px",right:"16px",background:GOLD,color:"#060e1c",padding:"2px 10px",borderRadius:"100px",fontSize:"10px",fontWeight:800}}>{p.badge2}</span>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:"15px",fontWeight:700,color:p.color}}>باقة {p.nm}</div><div style={{fontSize:"11px",color:"var(--t3)",marginTop:"3px"}}>{p.desc}</div>
                {p.loss&&<div style={{fontSize:"10px",color:RED,marginTop:"6px",opacity:0.7}}>⚠ {p.loss}</div>}
                </div>
                <div style={{textAlign:"left"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:900,color:"var(--t1)"}}>{p.pr}</div><div style={{fontSize:"10px",color:"var(--t4)"}}>ر.س/شهرياً</div></div>
              </div>
            </button>))}
          </div>
          <button onClick={()=>setStep(1)} style={{marginTop:"14px",background:"none",border:"none",color:"var(--t3)",fontSize:"12px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>→ رجوع للمسارات</button>
        </div>)}

        {/* Step 3: بياناتك + اختبار اختياري */}
        {step===3&&(<div>
          <div style={{textAlign:"center",marginBottom:"16px"}}>
            <div style={{fontSize:"18px",fontWeight:800,color:"var(--t1)"}}>بياناتك</div>
            <div style={{fontSize:"12px",color:"var(--t3)",marginTop:"4px"}}>الخطوة 3 من 3</div>
            <div style={{marginTop:"8px",display:"flex",justifyContent:"center",gap:"6px",flexWrap:"wrap"}}>
              {form.path&&<span style={{padding:"3px 10px",borderRadius:"100px",background:"var(--sky-bg)",color:SKY,fontSize:"11px",fontWeight:700}}>{form.path}</span>}
              {form.pkg&&<span style={{padding:"3px 10px",borderRadius:"100px",background:"rgba(251,191,36,0.08)",color:GOLD,fontSize:"11px",fontWeight:700}}>باقة {form.pkg}</span>}
            </div>
          </div>
          <div style={{marginBottom:"12px"}}><label style={{fontSize:"12px",color:"var(--t3)",fontWeight:600,display:"block",marginBottom:"5px"}}>اسمك *</label><input value={form.name} onChange={e=>u("name",e.target.value)} placeholder="الاسم الأول" style={{width:"100%",padding:"11px 14px",borderRadius:"12px",border:"1px solid var(--card-b)",background:"var(--card)",color:"var(--t1)",fontSize:"14px",fontFamily:"'Tajawal',sans-serif",outline:"none"}}/></div>
          <div style={{marginBottom:"12px"}}><label style={{fontSize:"12px",color:"var(--t3)",fontWeight:600,display:"block",marginBottom:"5px"}}>عمرك</label><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{["15-18","18-22","22-30","30+"].map(a=>(<button key={a} onClick={()=>u("age",a)} style={{padding:"7px 14px",borderRadius:"100px",border:form.age===a?"1px solid "+SKY:"1px solid var(--card-b)",background:form.age===a?"var(--sky-bg)":"var(--card)",color:form.age===a?SKY:"var(--t2)",fontSize:"12px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>{a}</button>))}</div></div>
          <div style={{marginBottom:"12px"}}><label style={{fontSize:"12px",color:"var(--t3)",fontWeight:600,display:"block",marginBottom:"5px"}}>هدفك</label><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{["أكاديمي","وظيفة","IELTS","ابتعاث","تطوير شخصي","أخرى"].map(g=>(<button key={g} onClick={()=>u("goal",g)} style={{padding:"7px 12px",borderRadius:"100px",border:form.goal===g?"1px solid "+SKY:"1px solid var(--card-b)",background:form.goal===g?"var(--sky-bg)":"var(--card)",color:form.goal===g?SKY:"var(--t2)",fontSize:"11px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>{g}</button>))}</div></div>
          {(form.goal==="IELTS"||form.path==="IELTS")&&(<div style={{marginBottom:"12px"}}><label style={{fontSize:"12px",color:"var(--t3)",fontWeight:600,display:"block",marginBottom:"5px"}}>الدرجة المستهدفة IELTS</label><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{["5.5","6","6.5","7","7.5+","ما حددت"].map(d=>(<button key={d} onClick={()=>u("ieltsTarget",d)} style={{padding:"7px 12px",borderRadius:"100px",border:form.ieltsTarget===d?"1px solid "+GOLD:"1px solid var(--card-b)",background:form.ieltsTarget===d?"rgba(251,191,36,0.1)":"var(--card)",color:form.ieltsTarget===d?GOLD:"var(--t2)",fontSize:"11px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>{d}</button>))}</div></div>)}

          {/* متى تبي تبدأ */}
          <div style={{marginBottom:"14px"}}><label style={{fontSize:"12px",color:"var(--t3)",fontWeight:600,display:"block",marginBottom:"5px"}}>متى تبي تبدأ؟</label>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              <button onClick={()=>u("startDate","هالشهر — أبي أبدأ فوراً")} style={{padding:"10px 14px",borderRadius:"12px",border:form.startDate.includes("هالشهر")?"1px solid #4ade80":"1px solid var(--card-b)",background:form.startDate.includes("هالشهر")?"rgba(74,222,128,0.08)":"var(--card)",color:form.startDate.includes("هالشهر")?GREEN:"var(--t2)",fontSize:"12px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",textAlign:"right"}}>
                <span style={{fontWeight:700}}>🔥 هالشهر — أبي أبدأ فوراً!</span>
                <div style={{fontSize:"10px",color:"var(--t3)",marginTop:"3px"}}>نحسب لك من تاريخ تسجيلك وما يفوتك شيء</div>
              </button>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={()=>u("startDate","الشهر الجاي")} style={{flex:1,padding:"8px 12px",borderRadius:"10px",border:form.startDate==="الشهر الجاي"?"1px solid "+SKY:"1px solid var(--card-b)",background:form.startDate==="الشهر الجاي"?"var(--sky-bg)":"var(--card)",color:form.startDate==="الشهر الجاي"?SKY:"var(--t2)",fontSize:"11px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>الشهر الجاي</button>
                <button onClick={()=>u("startDate","لاحقاً — أبي أستفسر بس")} style={{flex:1,padding:"8px 12px",borderRadius:"10px",border:form.startDate.includes("لاحقاً")?"1px solid "+GOLD:"1px solid var(--card-b)",background:form.startDate.includes("لاحقاً")?"rgba(251,191,36,0.06)":"var(--card)",color:form.startDate.includes("لاحقاً")?GOLD:"var(--t2)",fontSize:"11px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>لاحقاً — أبي أستفسر</button>
              </div>
            </div>
          </div>

          {/* Optional Quiz */}
          {!doQuiz&&!form.level&&(<div style={{marginBottom:"14px",padding:"14px",borderRadius:"14px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:"13px",fontWeight:700,color:SKY}}>📊 اختبر مستواك (اختياري)</div><div style={{fontSize:"11px",color:"var(--t3)",marginTop:"2px"}}>6 أسئلة سريعة — يساعدنا نحدد مستواك بدقة</div></div>
              <button onClick={()=>setDoQuiz(true)} style={{background:SKY,color:"#060e1c",padding:"6px 14px",borderRadius:"100px",fontSize:"11px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",whiteSpace:"nowrap"}}>ابدأ</button>
            </div>
          </div>)}
          {form.level&&(<div style={{marginBottom:"14px",padding:"12px",borderRadius:"12px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)"}}>
            <div style={{fontSize:"12px",color:"#4ade80",fontWeight:700}}>✓ مستواك التقريبي: {form.level}</div>
          </div>)}
          {doQuiz&&!qDone&&(<div style={{marginBottom:"14px",padding:"16px",borderRadius:"14px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"11px",color:SKY,fontWeight:700}}>{labels[quizQs[qStep].type]}</span><span style={{fontSize:"10px",color:"var(--t4)"}}>{qStep+1}/{quizQs.length}</span></div>
            <div style={{background:"var(--card)",borderRadius:"100px",height:"3px",marginBottom:"12px"}}><div style={{width:((qStep+1)/quizQs.length*100)+"%",height:"100%",background:SKY,borderRadius:"100px",transition:"width 0.3s"}}/></div>
            <p style={{fontSize:"13px",fontWeight:600,color:"var(--t1)",lineHeight:1.6,marginBottom:"12px",whiteSpace:"pre-line"}}>{quizQs[qStep].q}</p>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>{quizQs[qStep].opts.map((o,i)=>(<button key={i} onClick={()=>qPick(o.pts)} style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"10px",padding:"10px 14px",textAlign:"right",color:"var(--t2)",fontSize:"12px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>{o.t}</button>))}</div>
          </div>)}

          <button onClick={send} style={{width:"100%",padding:"14px",borderRadius:"14px",background:SKY,color:"#060e1c",fontSize:"16px",fontWeight:800,border:"none",cursor:"pointer",marginTop:"6px",fontFamily:"'Tajawal',sans-serif"}}>أرسل عبر واتساب ←</button>
          <button onClick={()=>setStep(2)} style={{display:"block",margin:"10px auto 0",background:"none",border:"none",color:"var(--t3)",fontSize:"12px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>→ رجوع</button>
        </div>)}
      </div>
    </div>
  );
}

/* ─── Main ─── */
function HomePage(){
  const[hC,setHC]=useState(null);const[scr,setScr]=useState(false);const[tI,setTI]=useState(0);const[fO,setFO]=useState(null);const[prob,setProb]=useState(null);const sRef=useRef(null);
  const[showQuiz,setShowQuiz]=useState(false);const[showReg,setShowReg]=useState(null);
  const[dark,setDark]=useState(true);const[mobileMenu,setMobileMenu]=useState(false);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{setTimeout(()=>setLoading(false),600)},[]);
  const[visitors,setVisitors]=useState(null);
  useEffect(()=>{fetch("https://api.counterapi.dev/v1/fluentia-academy/page-visits/up").then(r=>r.json()).then(d=>{if(d&&d.count)setVisitors(d.count)}).catch(()=>{})},[]);
  const[mousePos,setMousePos]=useState({x:0,y:0});const[scrollPct,setScrollPct]=useState(0);const[scrollY,setScrollY]=useState(0);
  const[spShow,setSpShow]=useState(false);const[spIdx,setSpIdx]=useState(0);
  const spData=[
    {n:"محمد",c:"الرياض",g:"m"},{n:"نورة",c:"جدة",g:"f"},{n:"فهد",c:"الدمام",g:"m"},{n:"ريم",c:"الرياض",g:"f"},
    {n:"عبدالله",c:"مكة",g:"m"},{n:"سارة",c:"الخبر",g:"f"},{n:"خالد",c:"الرياض",g:"m"},{n:"لمى",c:"جدة",g:"f"},
    {n:"تركي",c:"الطائف",g:"m"},{n:"هيا",c:"الرياض",g:"f"},{n:"سلطان",c:"أبها",g:"m"},{n:"دانة",c:"الدمام",g:"f"},
    {n:"بندر",c:"جدة",g:"m"},{n:"العنود",c:"الرياض",g:"f"},{n:"ماجد",c:"مكة",g:"m"},{n:"رهف",c:"الخبر",g:"f"},
    {n:"يزيد",c:"الرياض",g:"m"},{n:"أصايل",c:"جدة",g:"f"},{n:"راكان",c:"الدمام",g:"m"},{n:"غادة",c:"مكة",g:"f"},
  ];
  const[dl]=useState(()=>{const d=new Date();d.setDate(d.getDate()+3);return d.toISOString()});
  const cd=useCD(dl);const p2=n=>String(n).padStart(2,"0");
  useEffect(()=>{const h=()=>{setScr(window.scrollY>60);setScrollY(window.scrollY);const docH=document.documentElement.scrollHeight-window.innerHeight;setScrollPct(docH>0?(window.scrollY/docH)*100:0)};window.addEventListener("scroll",h);const mm=(e)=>setMousePos({x:e.clientX,y:e.clientY});window.addEventListener("mousemove",mm);return()=>{window.removeEventListener("scroll",h);window.removeEventListener("mousemove",mm)}},[]);
  useEffect(()=>{const i=setInterval(()=>setTI(p=>(p+1)%reviews.length),5000);return()=>clearInterval(i)},[]);
  useEffect(()=>{const c=sRef.current;if(!c||!c.children[tI])return;const ch=c.children[tI];c.scrollTo({left:ch.offsetLeft-c.offsetWidth/2+ch.offsetWidth/2,behavior:"smooth"})},[tI]);
  useEffect(()=>{const t1=setTimeout(()=>{setSpShow(true);setTimeout(()=>setSpShow(false),5000)},30000);const iv=setInterval(()=>{setSpIdx(p=>(p+1)%spData.length);setSpShow(true);setTimeout(()=>setSpShow(false),5000)},50000);return()=>{clearTimeout(t1);clearInterval(iv)}},[]);
  // Dynamic tab title
  useEffect(()=>{const origTitle="Fluentia Academy — تكلّم إنجليزي بطلاقة";const onBlur=()=>{document.title="🔥 ارجع! العرض ينتهي قريباً"};const onFocus=()=>{document.title=origTitle};window.addEventListener("blur",onBlur);window.addEventListener("focus",onFocus);return()=>{window.removeEventListener("blur",onBlur);window.removeEventListener("focus",onFocus)}},[]);
  const mx={maxWidth:"1200px",margin:"0 auto",padding:"0 28px"};
  const smartCTA = scrollY < 800 ? "احجز لقاءك المجاني ←" : scrollY < 2000 ? "جرّبت قبل وما نفع؟ جرّب معنا ←" : scrollY < 4000 ? "اختر باقتك وابدأ ←" : "لسا متردد؟ اللقاء مجاني ←";
  const openReg=(pkg,path)=>setShowReg({pkg,path});
  const goPrice=()=>{const el=document.getElementById("pricing");if(el)el.scrollIntoView({behavior:"smooth"})};
  // Section navigation
  const navSections=[{id:"problem",label:"هل هذا أنت؟"},{id:"personas",label:"لمن الدورة"},{id:"different",label:"ليش مختلفين"},{id:"reviews",label:"آراء الطلاب"},{id:"journey",label:"رحلتك معنا"},{id:"paths",label:"المسارات"},{id:"pricing",label:"الباقات"},{id:"faq",label:"أسئلة شائعة"}];
  const[activeSection,setActiveSection]=useState("");
  const[showSections,setShowSections]=useState(false);
  const[showExit,setShowExit]=useState(false);const exitShownRef=useRef(false);
  useEffect(()=>{const h=(e)=>{if(e.clientY<10&&!exitShownRef.current){exitShownRef.current=true;setShowExit(true)}};window.addEventListener("mouseout",h);return()=>window.removeEventListener("mouseout",h)},[]);
  // Mobile: detect quick scroll up
  const lastScrollRef=useRef(0);
  useEffect(()=>{const h=()=>{const curr=window.scrollY;if(lastScrollRef.current-curr>200&&curr>500&&!exitShownRef.current){exitShownRef.current=true;setShowExit(true)}lastScrollRef.current=curr};window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);
  useEffect(()=>{const h=()=>{let current="";navSections.forEach(s=>{const el=document.getElementById(s.id);if(el&&window.scrollY>=el.offsetTop-300)current=s.id});setActiveSection(current)};window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);
  // UTM tracking
  const getUTM=()=>{try{const p=new URLSearchParams(window.location.search);return p.get("utm_source")||""}catch(e){return""}};
  const utmSource=getUTM();

  return(
<div style={{minHeight:"100vh",overflowX:"hidden",direction:"rtl"}}>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Tajawal',sans-serif}
html{scroll-behavior:smooth}::selection{background:rgba(56,189,248,0.25)}
a{text-decoration:none;color:inherit}.hide-sb::-webkit-scrollbar{display:none}

/* ═══ CSS VARIABLES ═══ */
:root{
  --bg:#060e1c;--bg2:#0a1225;--bg3:#0f1b33;
  --popup:#0a1225;
  --card:rgba(255,255,255,0.015);--card-b:rgba(255,255,255,0.04);--card-h:rgba(255,255,255,0.03);
  --t1:#f8fafc;--t2:#8899aa;--t3:#556677;--t4:#334455;
  --sky-bg:rgba(56,189,248,0.06);--sky-b:rgba(56,189,248,0.12);
  --red-bg:rgba(239,68,68,0.02);--red-b:rgba(239,68,68,0.15);
  --divider:rgba(56,189,248,0.04);
  --glow:rgba(56,189,248,0.08);
  --nav-bg:rgba(6,14,28,0.92);
  --sticky-bg:rgba(6,14,28,0.95);
  --grain:0.03;
  --shadow:rgba(0,0,0,0.3);
  --marquee-c:#334455;
  --progress-shadow:rgba(56,189,248,0.5);
  --cursor-glow:rgba(56,189,248,0.04);
  --glass:rgba(255,255,255,0.02);--glass-b:rgba(255,255,255,0.06);--glass-blur:blur(12px);
}
.light{
  --bg:#f8fafc;--bg2:#eef2f7;--bg3:#e2e8f0;
  --popup:#ffffff;
  --card:rgba(26,45,80,0.03);--card-b:rgba(26,45,80,0.08);--card-h:rgba(26,45,80,0.06);
  --t1:#1a2d50;--t2:#4a5568;--t3:#718096;--t4:#a0aec0;
  --sky-bg:rgba(56,189,248,0.08);--sky-b:rgba(56,189,248,0.15);
  --red-bg:rgba(239,68,68,0.04);--red-b:rgba(239,68,68,0.2);
  --divider:rgba(26,45,80,0.06);
  --glow:rgba(56,189,248,0.12);
  --nav-bg:rgba(248,250,252,0.85);
  --sticky-bg:rgba(248,250,252,0.9);
  --grain:0.015;
  --shadow:rgba(0,0,0,0.08);
  --marquee-c:#a0aec0;
  --progress-shadow:rgba(56,189,248,0.3);
  --cursor-glow:rgba(56,189,248,0.06);
  --glass:rgba(255,255,255,0.5);--glass-b:rgba(26,45,80,0.08);--glass-blur:blur(16px);
}

@keyframes glow{0%,100%{filter:blur(60px) brightness(1)}50%{filter:blur(80px) brightness(1.3)}}
@keyframes drift{0%{transform:translate(0,0)}33%{transform:translate(30px,-20px)}66%{transform:translate(-20px,15px)}100%{transform:translate(0,0)}}
@keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}70%{box-shadow:0 0 0 18px rgba(37,211,102,0)}}
@keyframes textShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes borderGlow{0%,100%{border-color:rgba(56,189,248,0.15)}50%{border-color:rgba(56,189,248,0.4)}}
@keyframes rgbBorder{0%{border-color:rgba(56,189,248,0.3)}33%{border-color:rgba(125,211,252,0.3)}66%{border-color:rgba(251,191,36,0.2)}100%{border-color:rgba(56,189,248,0.3)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes stickyIn{0%{transform:translateY(-100%)}100%{transform:translateY(0)}}
@keyframes loadPulse{0%,100%{opacity:0.4;transform:scale(0.95)}50%{opacity:1;transform:scale(1.05)}}
@keyframes loadFade{0%{opacity:1}60%{opacity:1}100%{opacity:0;pointer-events:none}}
@keyframes aurora{0%{transform:rotate(0deg) scale(1.5)}25%{transform:rotate(90deg) scale(1.8)}50%{transform:rotate(180deg) scale(1.5)}75%{transform:rotate(270deg) scale(1.8)}100%{transform:rotate(360deg) scale(1.5)}}
@keyframes orbFloat1{0%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.1)}66%{transform:translate(-30px,30px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
@keyframes orbFloat2{0%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,30px) scale(1.15)}66%{transform:translate(40px,-20px) scale(0.85)}100%{transform:translate(0,0) scale(1)}}
@keyframes orbFloat3{0%{transform:translate(0,0)}50%{transform:translate(30px,40px)}100%{transform:translate(0,0)}}
@keyframes headingShine{0%{background-position:200% center}100%{background-position:-200% center}}
.shine-heading{background:linear-gradient(90deg,var(--t1) 0%,var(--t1) 40%,#38bdf8 50%,var(--t1) 60%,var(--t1) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:headingShine 6s linear infinite}
/* Animated emojis */
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.emoji-wiggle{display:inline-block;animation:wiggle 2s ease-in-out infinite}
.emoji-bounce{display:inline-block;animation:bounce 2s ease-in-out infinite}
.emoji-pulse{display:inline-block;animation:pulse 2s ease-in-out infinite}
.emoji-spin{display:inline-block;animation:spin 4s linear infinite}
/* Micro-interactions */
@keyframes checkPop{0%{transform:scale(0)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes buttonPulse{0%{box-shadow:0 0 0 0 rgba(56,189,248,0.4)}100%{box-shadow:0 0 0 12px rgba(56,189,248,0)}}
button:active{transform:scale(0.97) !important}
/* Mobile responsive */
@media(max-width:768px){
  .desktop-nav{display:none !important}
  .mobile-burger{display:flex !important}
  .mobile-menu{display:flex !important}
}
@media(min-width:769px){
  .mobile-burger{display:none !important}
  .mobile-menu{display:none !important}
  .mobile-sections-btn{display:none !important}
}
/* Dot navigator */
.dot-nav{position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:997;display:flex;flex-direction:column;gap:10px}
.dot-nav .dot{width:6px;height:6px;border-radius:50%;background:var(--t4);cursor:pointer;transition:all 0.3s;position:relative}
.dot-nav .dot:hover,.dot-nav .dot.active{width:8px;height:8px;background:var(--t1)}
.dot-nav .dot.active{background:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,0.4)}
.dot-nav .dot .dot-label{position:absolute;right:18px;top:50%;transform:translateY(-50%);background:var(--popup);border:1px solid var(--card-b);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--t1);white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.2s;font-family:'Tajawal',sans-serif}
.dot-nav .dot:hover .dot-label{opacity:1}
@media(max-width:768px){.dot-nav{display:none}.mobile-sections-btn{display:flex !important}}
/* Color accent sections */
.accent-red{--section-accent:239,68,68}.accent-sky{--section-accent:56,189,248}.accent-gold{--section-accent:251,191,36}.accent-purple{--section-accent:167,139,250}.accent-green{--section-accent:74,222,128}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:var(--grain);background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
section{position:relative}
section+section::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,var(--divider),var(--divider),transparent);margin:0 auto;max-width:600px}
`}</style>

{/* LOADING SCREEN */}
{loading&&<div style={{position:"fixed",inset:0,zIndex:99999,background:"#060e1c",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"loadFade 1.5s ease forwards"}}>
  <div style={{animation:"loadPulse 1.2s ease-in-out infinite"}}>
    <span style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",fontWeight:900,color:"#fff"}}><span style={{color:SKY}}>F</span>luentia</span>
  </div>
  <div style={{marginTop:"20px",width:"120px",height:"3px",borderRadius:"100px",background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{width:"100%",height:"100%",background:`linear-gradient(90deg,transparent,${SKY},transparent)`,animation:"textShine 1s linear infinite",backgroundSize:"200% 100%"}}/></div>
</div>}

<div className={dark?"":"light"} style={{background:"var(--bg)",color:"var(--t1)",transition:"background 0.5s,color 0.5s"}}>

{showQuiz&&<Quiz onClose={()=>setShowQuiz(false)}/>}
{showReg&&<RegForm pkg={showReg.pkg} path={showReg.path} onClose={()=>setShowReg(null)}/>}

{/* EXIT INTENT POPUP */}
{showExit&&<div style={{position:"fixed",inset:0,zIndex:3000,background:"rgba(6,14,28,0.95)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setShowExit(false)}>
  <div style={{background:"var(--popup)",border:"2px solid var(--sky-b)",borderRadius:"24px",padding:"40px 32px",maxWidth:"420px",width:"100%",textAlign:"center",position:"relative",boxShadow:"0 30px 80px rgba(0,0,0,0.4)"}} onClick={e=>e.stopPropagation()}>
    <button onClick={()=>setShowExit(false)} style={{position:"absolute",top:"16px",left:"16px",background:"none",border:"none",color:"var(--t3)",fontSize:"22px",cursor:"pointer"}}>✕</button>
    <div style={{fontSize:"48px",marginBottom:"16px"}}>⏳</div>
    <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:900,color:"var(--t1)",marginBottom:"12px"}}>قبل لا تطلع!</h3>
    <p style={{color:"var(--t2)",fontSize:"14px",lineHeight:1.8,marginBottom:"8px"}}>اكتشف مستواك بالإنجليزي بـ <strong style={{color:SKY}}>دقيقتين</strong> فقط — مجاناً.</p>
    <p style={{color:"var(--t3)",fontSize:"12px",marginBottom:"24px"}}>6 أسئلة سريعة + نتيجة فورية + المسار الأنسب لك</p>
    <button onClick={()=>{setShowExit(false);setShowQuiz(true)}} style={{width:"100%",padding:"14px",borderRadius:"14px",background:SKY,color:"#060e1c",fontSize:"16px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",marginBottom:"10px",boxShadow:"0 0 30px rgba(56,189,248,0.15)"}}>ابدأ الاختبار المجاني ←</button>
    <button onClick={()=>{setShowExit(false);goPrice()}} style={{width:"100%",padding:"12px",borderRadius:"14px",background:"var(--card)",border:"1px solid var(--card-b)",color:"var(--t2)",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>أو شوف الباقات والأسعار ↓</button>
  </div>
</div>}

{/* PROGRESS BAR */}
<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9990,height:"3px",background:"transparent",pointerEvents:"none"}}><div style={{height:"100%",width:scrollPct+"%",background:`linear-gradient(90deg,${SKY},${SKY_L},${GOLD})`,borderRadius:"0 4px 4px 0",transition:"width 0.1s",boxShadow:"0 0 10px var(--progress-shadow)"}}/></div>

{/* SPOTLIGHT */}
<div style={{position:"fixed",left:mousePos.x-250,top:mousePos.y-250,width:"500px",height:"500px",borderRadius:"50%",background:`radial-gradient(circle,var(--cursor-glow),transparent 50%)`,pointerEvents:"none",zIndex:1,transition:"left 0.15s,top 0.15s",mixBlendMode:"screen"}}/>

{/* STICKY CTA */}
{scr&&<div style={{position:"fixed",top:"56px",left:0,right:0,zIndex:998,background:"var(--sticky-bg)",backdropFilter:"var(--glass-blur) saturate(1.5)",borderBottom:"1px solid var(--glass-b)",padding:"8px 20px",animation:"stickyIn 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:"16px",flexWrap:"wrap"}}>
  <span style={{fontSize:"13px",color:"var(--t2)",fontWeight:600}}>🔥 خصم 20% لأول 5 مشتركين</span>
  <div style={{display:"flex",gap:"3px",direction:"ltr"}}>{[{v:cd.d,l:"د"},{v:cd.h,l:"س"},{v:cd.m,l:"د"},{v:cd.s,l:"ث"}].map((u,i)=>(<span key={i} style={{fontSize:"13px",fontWeight:800,color:SKY,fontFamily:"'Playfair Display',serif"}}>{p2(u.v)}{i<3?":":""}</span>))}</div>
  <button onClick={goPrice} style={{background:SKY,color:"#060e1c",padding:"6px 18px",borderRadius:"100px",fontSize:"12px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",transition:"all 0.3s"}}>{smartCTA}</button>
</div>}

{/* SOCIAL PROOF */}
<div style={{position:"fixed",bottom:"90px",left:"22px",zIndex:998,transform:spShow?"translateX(0)":"translateX(-120%)",opacity:spShow?1:0,transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",background:"var(--glass)",backdropFilter:"var(--glass-blur) saturate(1.5)",border:"1px solid var(--glass-b)",borderRadius:"14px",padding:"12px 18px",display:"flex",alignItems:"center",gap:"10px",boxShadow:"0 10px 30px var(--shadow)"}}>
  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:`linear-gradient(135deg,${SKY},${NAVY})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:"#fff"}}>✓</div>
  <div><div style={{fontSize:"12px",color:"var(--t1)",fontWeight:700}}>{spData[spIdx].n} من {spData[spIdx].c}</div><div style={{fontSize:"10px",color:SKY}}>{spData[spIdx].g==="f"?"توها سجّلت":"توه سجّل"} — قبل {[3,7,12,18,25,8,15,22,5,11,20,9,14,6,17,10,23,4,16,19][spIdx]} دقيقة</div></div>
</div>

{/* 1. OFFER STRIP */}
<div style={{background:SKY,padding:"10px 20px",textAlign:"center",position:"relative",zIndex:1001,overflow:"hidden"}}>
  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",animation:"textShine 2s linear infinite",backgroundSize:"200% 100%"}}/>
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"14px",flexWrap:"wrap",position:"relative"}}>
    <span style={{fontSize:"14px",fontWeight:800,color:"#060e1c"}}>🔥 خصم 20% لأول 5 مشتركين</span>
    <div style={{display:"flex",gap:"4px",direction:"ltr"}}>{[{v:cd.d,l:"د"},{v:cd.h,l:"س"},{v:cd.m,l:"د"},{v:cd.s,l:"ث"}].map((u,i)=>(<div key={i} style={{background:"#060e1c",borderRadius:"6px",padding:"2px 8px",textAlign:"center",minWidth:"36px"}}><span style={{fontSize:"15px",fontWeight:900,color:SKY,fontFamily:"'Playfair Display',serif"}}>{p2(u.v)}</span><span style={{fontSize:"8px",color:"#667",marginRight:"2px"}}>{u.l}</span></div>))}</div>
    <a href={WA_OFF} target="_blank" rel="noopener noreferrer" style={{background:"#060e1c",color:SKY,padding:"4px 16px",borderRadius:"100px",fontSize:"12px",fontWeight:800}}>سجّل →</a>
  </div>
</div>

{/* 2. NAV */}
<nav style={{position:"sticky",top:0,zIndex:1000,background:scr?"var(--nav-bg)":"transparent",backdropFilter:scr?"var(--glass-blur) saturate(1.5)":"none",borderBottom:scr?"1px solid var(--glass-b)":"none",transition:"all 0.5s",padding:"14px 28px"}}>
  <div style={{...mx,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <span style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:900,color:"var(--t1)"}}><span style={{color:SKY}}>F</span>luentia</span>
    {/* Desktop nav */}
    <div className="desktop-nav" style={{display:"flex",alignItems:"center",gap:"16px"}}>
      <a href="#pricing" style={{color:"var(--t2)",fontSize:"13px",fontWeight:500}}>الباقات</a>
      <button onClick={()=>setShowQuiz(true)} style={{color:"var(--t2)",fontSize:"13px",fontWeight:500,background:"none",border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>اختبر مستواك</button>
      <button onClick={()=>setDark(!dark)} style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>{dark?"☀️":"🌙"}</button>
      <a href="https://app.fluentia.academy" target="_blank" rel="noopener noreferrer" style={{color:"var(--t2)",fontSize:"13px",fontWeight:500,padding:"6px 14px",borderRadius:"100px",border:"1px solid var(--card-b)",transition:"all 0.3s"}}>دخول الطلاب</a>
      <button onClick={goPrice} style={{background:SKY,color:"#060e1c",padding:"8px 20px",borderRadius:"100px",fontSize:"13px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>احجز لقاءك المجاني</button>
    </div>
    {/* Mobile hamburger */}
    <div className="mobile-burger" style={{display:"none",alignItems:"center",gap:"10px"}}>
      <button onClick={()=>setDark(!dark)} style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
      <button onClick={()=>setMobileMenu(!mobileMenu)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"22px",color:"var(--t1)",display:"flex",alignItems:"center",fontFamily:"'Tajawal',sans-serif"}}>{mobileMenu?"✕":"☰"}</button>
    </div>
  </div>
  {/* Mobile menu dropdown */}
  <div className="mobile-menu" style={{display:"none",flexDirection:"column",gap:"12px",paddingTop:mobileMenu?"20px":"0",maxHeight:mobileMenu?"300px":"0",overflow:"hidden",transition:"all 0.4s ease"}}>
    <a href="#pricing" onClick={()=>setMobileMenu(false)} style={{color:"var(--t2)",fontSize:"15px",fontWeight:600,padding:"8px 0",borderBottom:"1px solid var(--card-b)"}}>الباقات والأسعار</a>
    <button onClick={()=>{setShowQuiz(true);setMobileMenu(false)}} style={{color:"var(--t2)",fontSize:"15px",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",padding:"8px 0",borderBottom:"1px solid var(--card-b)",textAlign:"right"}}>📊 اختبر مستواك</button>
    <a href="https://app.fluentia.academy" target="_blank" rel="noopener noreferrer" style={{color:"var(--t2)",fontSize:"15px",fontWeight:500,padding:"8px 0",borderBottom:"1px solid var(--card-b)",textAlign:"right",display:"block"}}>دخول الطلاب</a>
    <button onClick={()=>{goPrice();setMobileMenu(false)}} style={{background:SKY,color:"#060e1c",padding:"12px 20px",borderRadius:"14px",fontSize:"15px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",marginTop:"4px"}}>احجز لقاءك المجاني ←</button>
  </div>
</nav>

{/* 3. HERO */}
<section style={{minHeight:"90vh",display:"flex",alignItems:"center",position:"relative",padding:"60px 28px",overflow:"hidden"}}>
  {/* Aurora */}
  <div style={{position:"absolute",top:"-50%",left:"-25%",width:"150%",height:"200%",background:"conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(56,189,248,0.04) 60deg,transparent 120deg,rgba(125,211,252,0.03) 180deg,transparent 240deg,rgba(251,191,36,0.02) 300deg,transparent 360deg)",animation:"aurora 30s linear infinite",pointerEvents:"none",opacity:dark?1:0.3}}/>
  {/* Orb 1 - Sky */}
  <div style={{position:"absolute",top:"10%",right:"15%",width:"350px",height:"350px",borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.1),transparent 65%)",animation:"orbFloat1 18s ease-in-out infinite",pointerEvents:"none",transform:`translateY(${scrollY*0.12}px)`}}/>
  {/* Orb 2 - Purple */}
  <div style={{position:"absolute",top:"50%",left:"5%",width:"250px",height:"250px",borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.06),transparent 65%)",animation:"orbFloat2 22s ease-in-out infinite",pointerEvents:"none",transform:`translateY(${scrollY*-0.08}px)`}}/>
  {/* Orb 3 - Gold */}
  <div style={{position:"absolute",bottom:"15%",right:"30%",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.05),transparent 65%)",animation:"orbFloat3 15s ease-in-out infinite",pointerEvents:"none",transform:`translateY(${scrollY*-0.1}px)`}}/>
  {/* Orb 4 - Sky small */}
  <div style={{position:"absolute",top:"60%",right:"60%",width:"150px",height:"150px",borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.06),transparent 65%)",animation:"orbFloat2 20s ease-in-out infinite 5s",pointerEvents:"none"}}/>
  {/* Grid dots */}
  <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(var(--divider) 1px,transparent 1px)`,backgroundSize:"40px 40px",pointerEvents:"none",transform:`translateY(${scrollY*0.05}px)`}}/>
  {/* Floating particles */}
  {[...Array(8)].map((_,i)=>(<div key={i} style={{position:"absolute",width:i%2===0?"3px":"2px",height:i%2===0?"3px":"2px",borderRadius:"50%",background:i%3===0?SKY:i%3===1?"rgba(125,211,252,0.4)":"rgba(251,191,36,0.3)",top:(10+i*11)+"%",left:(5+i*12)+"%",animation:`float ${4+i*0.7}s ease-in-out infinite ${i*0.5}s`,pointerEvents:"none",opacity:0.6}}/>))}
  <div style={{...mx,width:"100%",position:"relative",zIndex:1}}>
    <div style={{maxWidth:"700px"}}>
      <Reveal><div style={{display:"inline-block",padding:"6px 18px",marginBottom:"28px",border:"1px solid var(--sky-b)",borderRadius:"100px",color:SKY,fontSize:"12px",fontWeight:700}}>أكاديمية سعودية متخصصة</div></Reveal>
      <Reveal d={0.1} y={80}><h1 style={{fontSize:"clamp(42px,8vw,76px)",fontWeight:900,lineHeight:1.05,marginBottom:"24px",color:"var(--t1)",letterSpacing:"-2px",textShadow:dark?"0 0 80px rgba(56,189,248,0.2)":"none"}}>تكلّم<br/><span style={{background:`linear-gradient(135deg,${SKY},${SKY_L},#fff,${SKY})`,backgroundSize:"300% 100%",animation:"textShine 4s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:dark?"drop-shadow(0 0 30px rgba(56,189,248,0.3))":"none"}}>إنجليزي</span><br/>بطلاقة<span style={{color:SKY}}>.</span></h1></Reveal>
      <Reveal d={0.2}><p style={{fontSize:"17px",color:"var(--t2)",lineHeight:2,marginBottom:"36px",maxWidth:"460px",fontWeight:300}}>مدربون سعوديون · كلاسات لايف · حد أقصى <span style={{color:SKY,fontWeight:700}}>٧</span> طلاب<br/>3 مسارات: تأسيس · تطوير · IELTS</p></Reveal>
      <Reveal d={0.3}><div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
        <button onClick={goPrice} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:SKY,color:"#060e1c",padding:"16px 32px",borderRadius:"60px",fontSize:"16px",fontWeight:800,border:"none",cursor:"pointer",boxShadow:"0 0 40px rgba(56,189,248,0.15)",fontFamily:"'Tajawal',sans-serif"}}>احجز لقاءك المجاني ←</button>
        <button onClick={()=>setShowQuiz(true)} style={{display:"inline-flex",alignItems:"center",border:"1px solid var(--sky-b)",background:"var(--sky-bg)",color:SKY,padding:"16px 24px",borderRadius:"60px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>📊 اكتشف مستواك بـ 2 دقيقة</button>
      </div></Reveal>
      <Reveal d={0.5}><div style={{display:"flex",gap:"40px",marginTop:"56px"}}>
        {[{n:7,s:"",l:"طالب كحد أقصى"},{n:100,s:"+",l:"طالب وطالبة"}].map((s,i)=>(<div key={i}><div style={{fontFamily:"'Playfair Display',serif",fontSize:"34px",fontWeight:900,color:"var(--t1)",lineHeight:1}}>{React.createElement(NumUp,{target:s.n,suffix:s.s})}</div><div style={{fontSize:"12px",color:"var(--t3)",marginTop:"4px"}}>{s.l}</div></div>))}
        <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:"34px",fontWeight:900,color:"var(--t1)",lineHeight:1}}>4.9</div><div style={{fontSize:"12px",color:"var(--t3)",marginTop:"4px"}}>تقييم ⭐</div></div>
      </div></Reveal>
    </div>
  </div>
</section>

{/* 4. "هل هذا أنت؟" */}
<section id="problem" style={{padding:"80px 28px",background:`linear-gradient(180deg,var(--bg),var(--bg2))`}}>
  <div style={mx}>
    <Reveal><div style={{textAlign:"center",marginBottom:"44px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)",textShadow:dark?"0 0 60px rgba(56,189,248,0.15)":"none"}}>هل هذا <span style={{color:RED}}>أنت</span>؟</span><p style={{color:"var(--t3)",fontSize:"14px",marginTop:"8px"}}>اضغط على اللي يشبه وضعك</p></div></Reveal>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px"}}>
      {[
        {icon:"💸",cls:"emoji-wiggle",title:"دفعت آلاف بمعهد وما استفدت",desc:"محتوى قديم. 30 طالب بالكلاس. طلعت بالكاد تعرف تطلب من مطعم.",ans:"درسنا نظام المعاهد الكبرى ووفرنا أفضل منه — بمحتوى حي، و7 طلاب بس، ومدرب سعودي يتابعك يومياً."},
        {icon:"📱",cls:"emoji-bounce",title:"جربت دورة مسجلة وما تطورت",desc:"كملت الدورة بس ما عندك ثقة تتكلم ولا تقدر تستخدم اللي تعلمته.",ans:"عندنا كل شيء لايف — مدربك يسمعك ويصححك فوراً. وتتمرن مع زملاء حقيقيين."},
        {icon:"😰",cls:"emoji-pulse",title:"تستحي تتكلم بالكلاس",desc:"المعلم ما يفهمك. تحس إنك الوحيد اللي ضعيف.",ans:"ندرس شخصيتك ونحطك بقروب يناسبك. مدربك يعرف كيف يشجعك بدون ما يحرجك."},
        {icon:"🎯",cls:"emoji-spin",title:"تبي IELTS بس ما تعرف تبدأ",desc:"الوظيفة أو الابتعاث يطلب 6.5 ومستواك ما يوصلها.",ans:"نحدد مستواك بدقة ونرسم لك خطة واضحة. مدربون متخصصين بالـ IELTS."},
      ].map((item,i)=>(
        <Reveal key={i} d={i*0.08}><div onClick={()=>setProb(prob===i?null:i)} style={{background:prob===i?"var(--sky-bg)":"var(--card)",border:prob===i?"1px solid var(--sky-b)":"1px solid var(--card-b)",borderRadius:"18px",padding:"26px 22px",cursor:"pointer",transition:"all 0.4s"}}>
          <div style={{fontSize:"26px",marginBottom:"8px"}}><span className={item.cls}>{item.icon}</span></div>
          <h3 style={{fontSize:"15px",fontWeight:700,color:prob===i?SKY:"var(--t1)",marginBottom:"6px",transition:"color 0.3s"}}>{item.title}</h3>
          <p style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.8}}>{item.desc}</p>
          <div style={{maxHeight:prob===i?"250px":"0",overflow:"hidden",transition:"max-height 0.5s ease"}}>
            <div style={{marginTop:"14px",padding:"14px",borderRadius:"12px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}>
              <div style={{fontSize:"11px",color:SKY,fontWeight:700,marginBottom:"4px"}}>الحل عندنا:</div>
              <p style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.9}}>{item.ans}</p>
            </div>
          </div>
        </div></Reveal>))}
    </div>
    <Reveal d={0.4}><p style={{textAlign:"center",marginTop:"28px",color:SKY,fontSize:"15px",fontWeight:700}}>إذا أي واحد من هذول أنت — أنت بالمكان الصح ✓</p></Reveal>
  </div>
</section>

{/* 5. 3 شخصيات */}
<section id="personas" style={{padding:"80px 28px"}}><div style={mx}>
  <Reveal><div style={{textAlign:"center",marginBottom:"44px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)"}}>لمن هذي <span style={{color:SKY}}>الدورة</span>؟</span></div></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"14px"}}>
    {[{icon:"🎓",cls:"emoji-bounce",title:"طالب جامعي",desc:"مواد الإنجليزي صعبة والمعدل يتأثر.",result:"خلال فصل: تفهم المحاضرات وتشارك بثقة."},{icon:"💼",cls:"emoji-wiggle",title:"خريج أو موظف",desc:"تبي وظيفة تطلب IELTS أو ترقية.",result:"خلال 3-6 شهور: تجتاز IELTS وتدخل المقابلات بثقة."},{icon:"🔄",cls:"emoji-spin",title:"محروق من تجارب سابقة",desc:"جربت معاهد ودورات ودفعت مبالغ — وما تغيرت.",result:"من أول شهر: تحس بالفرق. المشكلة ما كانت فيك."}].map((item,i)=>(
      <Reveal key={i} d={i*0.1}><div style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"20px",padding:"28px 24px",height:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:"32px",marginBottom:"12px"}}><span className={item.cls}>{item.icon}</span></div>
        <h3 style={{fontSize:"17px",fontWeight:800,color:"var(--t1)",marginBottom:"6px"}}>{item.title}</h3>
        <p style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.8,marginBottom:"14px",flex:1}}>{item.desc}</p>
        <div style={{padding:"12px",borderRadius:"12px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}>
          <div style={{fontSize:"11px",color:SKY,fontWeight:700,marginBottom:"3px"}}>النتيجة المتوقعة:</div>
          <p style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.8}}>{item.result}</p>
        </div>
      </div></Reveal>))}
  </div>
</div></section>

{/* 6. مو للجميع */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"750px"}}><Reveal>
  <div style={{textAlign:"center",padding:"44px 32px",borderRadius:"24px",border:"2px solid var(--red-b)",background:"var(--red-bg)"}}>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3.5vw,34px)",fontWeight:900,color:"var(--t1)",marginBottom:"18px"}}>Fluentia <span style={{color:RED}}>مو لكل أحد</span></div>
    <p style={{color:"var(--t3)",fontSize:"14px",lineHeight:2,marginBottom:"20px"}}>ما نقبل كل من يتقدم. نبحث عن طلاب عندهم:</p>
    <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px",marginBottom:"20px"}}>
      {["إرادة حقيقية","التزام بالحضور","احترام لزملائهم"].map((item,i)=>(<span key={i} style={{padding:"6px 14px",borderRadius:"100px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)",color:SKY_L,fontSize:"12px",fontWeight:600}}>✓ {item}</span>))}
    </div>
    <p style={{color:"var(--t3)",fontSize:"13px",lineHeight:1.9,fontStyle:"italic"}}>إذا تبي مكان تدفع وتنام فيه — مو هنا.<br/>إذا تبي مكان يغيّر مستواك — <span style={{color:SKY,fontWeight:700}}>رحّبنا فيك.</span></p>
  </div>
</Reveal></div></section>

{/* 7. نحطّك بالمكان الصح */}
<section style={{padding:"80px 28px"}}><div style={{...mx,maxWidth:"900px"}}>
  <Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)"}}>نحطّك <span style={{color:SKY}}>بالمكان الصح</span></span><p style={{color:"var(--t3)",fontSize:"14px",marginTop:"8px"}}>مو بس نعلمك — نفهمك.</p></Reveal>
  <div style={{display:"flex",flexDirection:"column",gap:"2px",marginTop:"32px"}}>
    {[{s:"1",t:"نفهم شخصيتك",d:"هل تستحي تسأل؟ تحتاج تشجيع؟ تحب المنافسة أو الهدوء؟",i:"🧠"},{s:"2",t:"نختار قروبك بعناية",d:"طلاب شخصياتهم تتناغم معك. ما فيه متنمر ولا كسول.",i:"👥"},{s:"3",t:"ندرّب مدربك عليك",d:"يعرف إنك تستحي تقول ما فهمت — فيتأكد بطريقة ذكية بدون إحراج.",i:"🎯"},{s:"4",t:"النتيجة: نخبة النخبة",d:"طلاب متميزين ومتعاونين ومتفاعلين. وأنت واحد منهم.",i:"⭐"}].map((item,i)=>(
      <Reveal key={i} d={i*0.1}><div style={{display:"flex",gap:"18px",padding:"24px 20px",background:i===3?"var(--sky-bg)":"var(--card)",border:"1px solid var(--card-b)",borderRadius:"14px",alignItems:"flex-start"}}>
        <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"var(--sky-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{item.i}</div>
        <div><div style={{fontSize:"11px",color:SKY,fontWeight:700,marginBottom:"3px"}}>الخطوة {item.s}</div><h3 style={{fontSize:"15px",fontWeight:700,color:"var(--t1)",marginBottom:"4px"}}>{item.t}</h3><p style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.8}}>{item.d}</p></div>
      </div></Reveal>))}
  </div>
</div></section>

{/* 8. ليش مختلفين */}
<section id="different" style={{padding:"80px 28px"}}><div style={mx}>
  <Reveal><div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"44px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)"}}>ليش <span style={{color:SKY}}>مختلفين</span>؟</span><div style={{flex:1,height:"1px",background:`linear-gradient(90deg,var(--divider),transparent)`}}/></div></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"2px"}}>
    {[{n:"01",t:"خلال 3 شهور تتكلم بثقة",d:"التركيز على السبيكنج من أول يوم.",c:SKY},{n:"02",t:"مدربك معك يومياً",d:"يصحح أخطاءك ويتابع تقدمك كل يوم.",c:GOLD},{n:"03",t:"محتوى بدقة علمية",d:"مصمم بخبرة نفسية وعصبية ولغوية.",c:"#a78bfa"},{n:"04",t:"تشوف تطورك بالأرقام",d:"تقييمات دورية وتقارير تقدم حقيقية.",c:"#f472b6"}].map((item,i)=>(
      <Reveal key={i} d={i*0.08}><div style={{background:"var(--card)",border:"1px solid var(--card-b)",padding:"32px 24px",position:"relative",overflow:"hidden",transition:"all 0.4s",borderRadius:"2px"}} onMouseEnter={e=>{e.currentTarget.style.background="var(--card-h)";e.currentTarget.style.borderColor=item.c+"33"}} onMouseLeave={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.borderColor="var(--card-b)"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"40px",fontWeight:900,color:item.c,opacity:0.1,position:"absolute",top:"10px",left:"14px"}}>{item.n}</div>
        <h3 style={{fontSize:"16px",fontWeight:800,color:"var(--t1)",marginBottom:"6px",position:"relative"}}>{item.t}</h3>
        <p style={{fontSize:"13px",color:"var(--t3)",lineHeight:1.8,position:"relative"}}>{item.d}</p>
      </div></Reveal>))}
  </div>
</div></section>

{/* ═══ LMS — نظام التعلم الذكي ═══ */}
<section style={{padding:"80px 28px",position:"relative"}}><div style={mx}>
  <Reveal><div style={{textAlign:"center",marginBottom:"12px"}}><span style={{display:"inline-block",padding:"5px 14px",borderRadius:"100px",border:"1px solid var(--sky-b)",color:SKY,fontSize:"11px",fontWeight:700}}>✦ حصرياً في طلاقة</span></div></Reveal>
  <Reveal d={0.1}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,40px)",fontWeight:900,color:"var(--t1)",textAlign:"center",marginBottom:"12px",letterSpacing:"-0.5px",lineHeight:1.3}}>مدرب شخصي <span style={{color:SKY}}>+</span> نظام ذكي <span style={{color:SKY}}>=</span> نتائج <span style={{color:GOLD}}>مضاعفة</span></h2></Reveal>
  <Reveal d={0.15}><p style={{textAlign:"center",color:"var(--t3)",fontSize:"14px",maxWidth:"460px",margin:"0 auto 44px",lineHeight:1.9}}>نظام تعلم متكامل يدعم مدربك — مش يستبدله. التكنولوجيا أداة تضاعف النتائج.</p></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px"}}>
    {[
      {icon:"📋",t:"واجبات أسبوعية ذكية",d:"النظام يصمم لك تمارين تناسب مستواك ومدربك يتابع تقدمك",c:SKY},
      {icon:"📊",t:"تقارير تقدّم بالأرقام",d:"تشوف تطورك الحقيقي أسبوع بأسبوع",c:SKY_L},
      {icon:"🤖",t:"مساعد ذكاء اصطناعي",d:"يساعدك تتمرن أي وقت — والمدرب يراجع ويوجّه",c:"#a78bfa"},
      {icon:"📱",t:"كل شي في مكان واحد",d:"واجبات، درجات، حضور، تقييمات المدرب",c:"#f472b6"},
      {icon:"🏆",t:"نظام تحفيز وإنجازات",d:"نقاط، شارات، مستويات تخليك ملتزم",c:GOLD},
      {icon:"📈",t:"لوحة تحكم شخصية",d:"تعرض رحلتك كاملة من أول يوم",c:GREEN},
    ].map((f,i)=>(
      <Reveal key={i} d={i*0.07}><div style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"18px",padding:"28px 22px",transition:"all 0.4s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.background="var(--card-h)";e.currentTarget.style.borderColor=f.c+"40";e.currentTarget.style.transform="translateY(-3px)"}} onMouseLeave={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.borderColor="var(--card-b)";e.currentTarget.style.transform="translateY(0)"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"var(--sky-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",marginBottom:"16px"}}>{f.icon}</div>
        <h3 style={{fontSize:"15px",fontWeight:800,color:"var(--t1)",marginBottom:"6px"}}>{f.t}</h3>
        <p style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.9}}>{f.d}</p>
      </div></Reveal>))}
  </div>
  <Reveal d={0.4}><div style={{maxWidth:"620px",margin:"36px auto 0",textAlign:"center",padding:"16px 22px",borderRadius:"14px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}>
    <p style={{color:"var(--t2)",fontSize:"13px",lineHeight:1.9}}>✦ <span style={{color:"var(--t1)",fontWeight:700}}>المدرب هو الأساس دائماً</span> — التكنولوجيا تدعم رحلتك، مش تستبدل العلاقة الشخصية مع مدربك.</p>
  </div></Reveal>
</div></section>

{/* MARQUEE */}
<div style={{overflow:"hidden",padding:"14px 0",borderTop:"1px solid var(--divider)",borderBottom:"1px solid var(--divider)"}}><div style={{display:"flex",animation:"marquee 20s linear infinite",width:"fit-content"}}>{Array(2).fill(["قرامر","سبيكنج","ريدنج","رايتنج","IELTS","نطق","مفردات","محادثة"]).flat().map((w,i)=>(<span key={i} style={{padding:"0 22px",fontSize:"13px",color:"var(--marquee-c)",fontWeight:700,whiteSpace:"nowrap"}}>{w} <span style={{color:SKY,margin:"0 6px",opacity:0.4}}>·</span></span>))}</div></div>

{/* 9. المقارنة */}
<section style={{padding:"80px 28px"}}><div style={{...mx,maxWidth:"900px"}}><Reveal><div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid var(--sky-b)"}}>
  <div style={{background:"var(--sky-bg)",padding:"18px",textAlign:"center"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"var(--t1)"}}>Fluentia مقابل <span style={{color:RED}}>المعاهد التقليدية</span></span></div>
  <div style={{padding:"4px"}}>{[
    {f:"السعر",us:"750 — 1,500",them:"2,000 — 7,000+"},{f:"عدد الطلاب",us:"7 كحد أقصى",them:"15 — 30"},{f:"متابعة يومية",us:"✓ مباشرة",them:"✕"},{f:"المدرب",us:"سعودي متخصص",them:"غالباً غير سعودي"},{f:"فهم الشخصية",us:"✓ تقييم + قروب مناسب",them:"✕ عشوائي"},{f:"حصص فردية",us:"✓ مشمولة",them:"200+ ريال إضافي"},{f:"الالتزام",us:"شهري",them:"فصلي/سنوي"},
  ].map((r,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",gap:"4px",padding:"11px 14px",background:i%2===0?"var(--card)":"transparent",borderRadius:"6px"}}><div style={{fontSize:"12px",color:"var(--t2)",fontWeight:600}}>{r.f}</div><div style={{fontSize:"12px",color:SKY,fontWeight:700,textAlign:"center"}}>{r.us}</div><div style={{fontSize:"12px",color:RED,textAlign:"center",opacity:0.6}}>{r.them}</div></div>))}</div>
</div></Reveal></div></section>

{/* 10. وش يعادل 37 ريال */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"900px"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:"36px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,40px)",fontWeight:900,color:"var(--t1)"}}>وش يعادل <span style={{color:SKY}}>٣٧ ريال</span> باليوم؟</span></div></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"12px"}}>
    {[{e:"☕",l:"ستاربكس",p:"25-35",n:"10 دقايق"},{e:"🍔",l:"وجبة مطعم",p:"35-50",n:"نص ساعة"},{e:"🎮",l:"اشتراك قيمنق",p:"40-60",n:"ترفيه مؤقت"},{e:"📚",l:"Fluentia يومياً",p:"37",n:"مهارة للأبد",hl:1}].map((item,i)=>(
      <Reveal key={i} d={i*0.08}><div style={{background:item.hl?"var(--sky-bg)":"var(--card)",border:item.hl?"2px solid var(--sky-b)":"1px solid var(--card-b)",borderRadius:"16px",padding:"22px 16px",textAlign:"center",transform:item.hl?"scale(1.05)":"scale(1)"}}>
        <div style={{fontSize:"28px",marginBottom:"8px"}}>{item.e}</div>
        <div style={{fontSize:"12px",color:item.hl?SKY_L:"var(--t2)",fontWeight:600}}>{item.l}</div>
        <div style={{fontSize:"18px",fontWeight:900,color:item.hl?SKY:"var(--t1)",fontFamily:"'Playfair Display',serif"}}>{item.p} ر.س</div>
        <div style={{fontSize:"10px",color:item.hl?SKY:"var(--t3)",marginTop:"4px",fontWeight:item.hl?700:400}}>{item.n}</div>
      </div></Reveal>))}
  </div>
</div></section>

{/* 10.5 الأرقام تتكلم */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"900px"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:"40px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,36px)",fontWeight:900,color:"var(--t1)"}}>الأرقام <span style={{color:GOLD}}>تتكلم</span></span></div></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"16px"}}>
    {[
      {n:93,s:"%",label:"حسّوا بفرق خلال أول شهر",color:SKY},
      {n:100,s:"+",label:"طالب وطالبة سجّلوا معنا",color:SKY_L},
      {n:7,s:"",label:"طلاب فقط بكل كلاس",color:GOLD},
      {n:4.9,s:"",label:"تقييم من طلابنا",color:GREEN,noCount:true},
    ].map((item,i)=>(
      <Reveal key={i} d={i*0.1}><div style={{textAlign:"center",padding:"28px 16px",background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"18px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"36px",fontWeight:900,color:item.color,lineHeight:1,marginBottom:"8px"}}>{item.noCount?item.n+item.s:React.createElement(NumUp,{target:item.n,suffix:item.s})}</div>
        <div style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.6}}>{item.label}</div>
      </div></Reveal>))}
  </div>
</div></section>

{/* 10.6 تكلفة الحصة */}
<section style={{padding:"40px 28px"}}><div style={{...mx,maxWidth:"800px"}}><Reveal>
  <div style={{background:"var(--sky-bg)",border:"1px solid var(--sky-b)",borderRadius:"20px",padding:"32px 28px"}}>
    <div style={{textAlign:"center",marginBottom:"24px"}}><div style={{fontSize:"16px",color:"var(--t1)",fontWeight:700}}>تكلفة الحصة الواحدة بكل باقة</div></div>
    <div style={{display:"flex",justifyContent:"center",gap:"20px",flexWrap:"wrap"}}>
      {[
        {name:"أساس",total:750,sessions:8,color:"var(--t3)"},
        {name:"طلاقة",total:1100,sessions:9,color:SKY,pop:true},
        {name:"تميّز",total:1500,sessions:12,color:GOLD},
      ].map((b,i)=>(
        <div key={i} style={{textAlign:"center",padding:"18px 24px",borderRadius:"16px",background:b.pop?"var(--sky-bg)":"var(--card)",border:b.pop?"1px solid var(--sky-b)":"1px solid var(--card-b)",minWidth:"140px"}}>
          <div style={{fontSize:"12px",color:b.color,fontWeight:700,marginBottom:"8px"}}>باقة {b.name}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:900,color:"var(--t1)",lineHeight:1}}>{Math.round(b.total/b.sessions)}</div>
          <div style={{fontSize:"11px",color:"var(--t3)",marginTop:"4px"}}>ريال / الحصة</div>
          <div style={{fontSize:"10px",color:"var(--t4)",marginTop:"4px"}}>{b.sessions} حصة شهرياً</div>
        </div>))}
    </div>
    <div style={{textAlign:"center",marginTop:"20px",color:"var(--t3)",fontSize:"13px"}}>
      * الحصة الخصوصية عند معلم خاص = <span style={{color:RED,fontWeight:700}}>200+ ريال</span> — عندنا تبدأ من <span style={{color:SKY,fontWeight:700}}>94 ريال</span>
    </div>
  </div>
</Reveal></div></section>

{/* 11. آراء الطلاب */}
<section id="reviews" style={{padding:"80px 0",overflow:"hidden"}}>
  <div style={{...mx,marginBottom:"36px"}}><Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"var(--t1)"}}>آراء <span style={{color:"#f472b6"}}>طلابنا</span></span></Reveal></div>
  <div ref={sRef} className="hide-sb" style={{display:"flex",gap:"14px",overflowX:"auto",padding:"0 28px 16px",scrollSnapType:"x mandatory"}}>{reviews.map((rv,i)=>(
    <div key={i} onClick={()=>setTI(i)} style={{minWidth:"270px",maxWidth:"310px",flex:"0 0 auto",scrollSnapAlign:"center",background:tI===i?"var(--sky-bg)":"var(--card)",border:tI===i?"1px solid var(--sky-b)":"1px solid var(--card-b)",borderRadius:"18px",padding:"26px 20px",cursor:"pointer",transition:"all 0.4s"}}>
      <div style={{display:"inline-block",padding:"3px 10px",borderRadius:"100px",background:"var(--sky-bg)",color:SKY,fontSize:"10px",fontWeight:700,marginBottom:"12px"}}>{rv.tag}</div>
      <p style={{color:"var(--t2)",fontSize:"13px",lineHeight:2,marginBottom:"18px",minHeight:"60px"}}>"{rv.t}"</p>
      <div style={{borderTop:"1px solid var(--card-b)",paddingTop:"10px",display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{width:"28px",height:"28px",borderRadius:"50%",background:`linear-gradient(135deg,${SKY},${NAVY})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:800,color:"#fff"}}>{rv.n[0]}</div>
        <div><div style={{fontSize:"12px",fontWeight:700,color:"var(--t1)"}}>{rv.n}</div><div style={{fontSize:"10px",color:"var(--t3)"}}>{rv.r}</div></div>
      </div>
    </div>))}</div>
  <div style={{display:"flex",justifyContent:"center",gap:"5px",marginTop:"16px"}}>{reviews.map((_,i)=>(<div key={i} onClick={()=>setTI(i)} style={{width:tI===i?"24px":"7px",height:"4px",borderRadius:"100px",cursor:"pointer",transition:"all 0.4s",background:tI===i?SKY:"var(--card-b)"}}/>))}</div>
</section>

{/* 11.5 اكتشف مستواك */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"700px"}}><Reveal>
  <div style={{background:"var(--sky-bg)",border:"2px solid var(--sky-b)",borderRadius:"24px",padding:"40px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"-50px",right:"-50px",width:"200px",height:"200px",borderRadius:"50%",background:`radial-gradient(circle,var(--glow),transparent)`,pointerEvents:"none"}}/>
    <div style={{fontSize:"48px",marginBottom:"16px"}}>📊</div>
    <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3.5vw,32px)",fontWeight:900,color:"var(--t1)",marginBottom:"12px"}}>اكتشف مستواك بـ <span style={{color:SKY}}>دقيقتين</span></h3>
    <p style={{color:"var(--t3)",fontSize:"14px",lineHeight:1.8,marginBottom:"8px"}}>6 أسئلة سريعة — قرامر + فهم + مواقف حياتية</p>
    <p style={{color:"var(--t4)",fontSize:"13px",marginBottom:"24px"}}>تعرف مستواك + المسار المناسب + الباقة الأنسب لك</p>
    <button onClick={()=>setShowQuiz(true)} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:SKY,color:"#060e1c",padding:"14px 36px",borderRadius:"60px",fontSize:"16px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",boxShadow:"0 0 30px rgba(56,189,248,0.15)"}}>ابدأ الاختبار الآن ←</button>
    <div style={{marginTop:"12px",fontSize:"11px",color:"var(--t4)"}}>مجاني 100% · النتيجة فورية</div>
  </div>
</Reveal></div></section>

{/* 12. قبل × بعد */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"900px"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:"36px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,36px)",fontWeight:900,color:"var(--t1)"}}>قبل <span style={{color:RED}}>×</span> بعد <span style={{color:SKY}}>Fluentia</span></span></div></Reveal>
  {[{name:"الجوهرة",p:"6 شهور",b:"ما أعرف أقرأ ولا أتكلم",a:"قراءتها قريبة من المتحدثين الأصليين",bL:"مبتدئ",aL:"متقدم",pr:90},{name:"الهنوف",p:"3 شهور",b:"مستوى ضعيف",a:"فرق واضح وتقرأ أشياء أكاديمية",bL:"مبتدئ",aL:"متوسط+",pr:70}].map((s,i)=>(
    <Reveal key={i} d={i*0.1}><div style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"18px",padding:"24px 20px",marginBottom:"12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"6px"}}><span style={{fontSize:"14px",fontWeight:700,color:"var(--t1)"}}>{s.name}</span><span style={{fontSize:"11px",color:SKY,fontWeight:600,background:"var(--sky-bg)",padding:"3px 10px",borderRadius:"100px"}}>{s.p}</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"10px",alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:"10px",color:RED,fontWeight:700}}>قبل</div><div style={{fontSize:"12px",color:"var(--t2)",lineHeight:1.6,marginTop:"4px"}}>{s.b}</div></div>
        <div style={{fontSize:"22px",color:SKY}}>→</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:"10px",color:SKY,fontWeight:700}}>بعد</div><div style={{fontSize:"12px",color:"var(--t1)",lineHeight:1.6,fontWeight:600,marginTop:"4px"}}>{s.a}</div></div>
      </div>
      <div style={{marginTop:"14px",background:"var(--card)",borderRadius:"100px",height:"4px",overflow:"hidden"}}><div style={{width:s.pr+"%",height:"100%",background:`linear-gradient(90deg,${SKY},${SKY_L})`,borderRadius:"100px"}}/></div>
    </div></Reveal>))}
</div></section>

{/* 12.5 تخيّل نفسك */}
<section style={{padding:"80px 28px",position:"relative",overflow:"hidden"}}>
  <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center,var(--glow),transparent 60%)`,pointerEvents:"none"}}/>
  <div style={{...mx,maxWidth:"700px",textAlign:"center",position:"relative"}}>
    <Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"var(--t1)"}}>تخيّل نفسك بعد <span style={{color:"#a78bfa"}}>6 شهور</span>...</span></Reveal>
    <div style={{marginTop:"40px",display:"flex",flexDirection:"column",gap:"16px"}}>
      {[{text:"تدخل مقابلة شغل بالإنجليزي — بثقة كاملة",icon:"💼",d:0.1},{text:"تفتح إيميل بالإنجليزي — وتفهمه من أول مرة",icon:"📧",d:0.2},{text:"صديقك يتكلم إنجليزي — وأنت ترد عليه بطلاقة",icon:"🗣️",d:0.3},{text:"تقدّم على وظيفة أحلامك — وأنت جاهز",icon:"🚀",d:0.4},{text:"تسافر وتتكلم مع أي أحد — بدون خوف",icon:"✈️",d:0.5}].map((item,i)=>(
        <Reveal key={i} d={item.d}><div style={{display:"flex",alignItems:"center",gap:"16px",padding:"18px 24px",borderRadius:"16px",background:"var(--card)",border:"1px solid var(--card-b)",transition:"all 0.4s"}} onMouseEnter={e=>{e.currentTarget.style.background="var(--sky-bg)";e.currentTarget.style.borderColor="var(--sky-b)";e.currentTarget.style.transform="translateX(-8px)"}} onMouseLeave={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.borderColor="var(--card-b)";e.currentTarget.style.transform="translateX(0)"}}>
          <span style={{fontSize:"28px",flexShrink:0}}>{item.icon}</span>
          <span style={{fontSize:"16px",color:"var(--t1)",fontWeight:600,lineHeight:1.6}}>{item.text}</span>
        </div></Reveal>))}
    </div>
    <Reveal d={0.6}><p style={{marginTop:"32px",color:SKY,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>كل هذا يبدأ بلقاء مبدئي مجاني — بدون التزام ✦</p>
    <button onClick={goPrice} style={{display:"inline-flex",alignItems:"center",gap:"6px",background:SKY,color:"#060e1c",padding:"12px 28px",borderRadius:"60px",fontSize:"14px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>اختر باقتك وابدأ ←</button></Reveal>
  </div>
</section>

{/* 13. رحلتك معنا */}
<section id="journey" style={{padding:"80px 28px"}}><div style={{...mx,maxWidth:"750px"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:"40px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"var(--t1)"}}>رحلتك <span style={{color:GREEN}}>معنا</span></span></div></Reveal>
  <div style={{position:"relative",paddingRight:"36px"}}>
    <div style={{position:"absolute",right:"14px",top:0,bottom:0,width:"2px",background:`linear-gradient(180deg,${SKY},transparent)`}}/>
    {[{s:"اليوم",t:"لقاء مبدئي مجاني",d:"نفهم مستواك وشخصيتك. بدون التزام.",i:"🤝",c:SKY},{s:"أسبوع 1",t:"تنضم لقروبك",d:"7 طلاب مختارين بعناية.",i:"🚀",c:SKY_L},{s:"شهر 1",t:"تحس بالفرق",d:"القرامر يتوضح. تبدأ تكوّن جمل.",i:"💡",c:"#a78bfa"},{s:"شهر 3",t:"تتكلم بثقة",d:"محادثات حقيقية وقراءة وكتابة.",i:"💪",c:GOLD},{s:"شهر 6+",t:"طلاقة حقيقية",d:"جاهز لـ IELTS أو الوظيفة.",i:"🎯",c:GREEN}].map((item,i)=>(
      <Reveal key={i} d={i*0.08}><div style={{position:"relative",marginBottom:"28px",paddingRight:"28px"}}>
        <div style={{position:"absolute",right:"-36px",top:"2px",width:"26px",height:"26px",borderRadius:"50%",background:"var(--bg)",border:"2px solid "+item.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",zIndex:1}}>{item.i}</div>
        <div style={{fontSize:"10px",color:item.c,fontWeight:700}}>{item.s}</div>
        <div style={{fontSize:"15px",fontWeight:800,color:"var(--t1)",marginBottom:"3px"}}>{item.t}</div>
        <div style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.8}}>{item.d}</div>
      </div></Reveal>))}
  </div>
</div></section>

{/* 14. د. علي */}
<section style={{padding:"60px 28px"}}><div style={{...mx,maxWidth:"700px"}}><Reveal>
  <div style={{display:"flex",gap:"20px",alignItems:"center",padding:"32px 24px",background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"20px",flexWrap:"wrap"}}>
    <div style={{width:"70px",height:"70px",borderRadius:"50%",background:`linear-gradient(135deg,${SKY},${NAVY})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",flexShrink:0}}>👨‍🏫</div>
    <div style={{flex:1,minWidth:"220px"}}>
      <div style={{fontSize:"11px",color:SKY,fontWeight:700,marginBottom:"3px"}}>مؤسس الأكاديمية</div>
      <h3 style={{fontSize:"18px",fontWeight:800,color:"var(--t1)",marginBottom:"6px"}}>د. علي الأحمد</h3>
      <p style={{fontSize:"12px",color:"var(--t3)",lineHeight:1.9}}>متخصص في المجال النفسي والعصبي واللغوي. أسس Fluentia لتكون الوجهة الذهبية لتعلّم الإنجليزية — بدقة علمية وجودة لا تقبل التنازل.</p>
    </div>
  </div>
</Reveal></div></section>

{/* 15. المسارات */}
<section id="paths" style={{padding:"60px 28px"}}><div style={mx}>
  <Reveal><div style={{textAlign:"center",marginBottom:"16px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)"}}>حدد <span style={{color:SKY}}>مسارك</span></span></div>
  <div style={{textAlign:"center",marginBottom:"40px"}}><div style={{display:"inline-flex",gap:"24px",flexWrap:"wrap",justifyContent:"center"}}>
    <div style={{padding:"10px 20px",borderRadius:"12px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)"}}><div style={{fontSize:"13px",fontWeight:800,color:SKY,marginBottom:"2px"}}>المسار = وش تتعلم</div><div style={{fontSize:"11px",color:"var(--t3)"}}>تأسيس من الصفر؟ تطوير؟ IELTS؟</div></div>
    <div style={{padding:"10px 20px",borderRadius:"12px",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.12)"}}><div style={{fontSize:"13px",fontWeight:800,color:GOLD,marginBottom:"2px"}}>الباقة = كيف تتعلم</div><div style={{fontSize:"11px",color:"var(--t3)"}}>كم متابعة؟ كم حصة فردية؟</div></div>
  </div></div></Reveal>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"14px"}}>
    {[
      {icon:"📗",title:"تأسيس",desc:"تبدأ من الصفر وتبني أساس متين",who:"ما عندك أساس أو أساسك ضعيف جداً",rec:"طلاقة أو تميّز",recNote:"تحتاج متابعة يومية وحصص فردية",color:SKY,path:"تأسيس"},
      {icon:"📘",title:"تطوير",desc:"عندك أساس وتبي ترفع مستواك",who:"تفهم شوي بس تبي تتكلم وتكتب بثقة",rec:"طلاقة أو تميّز",recNote:"حسب السرعة اللي تبيها",color:SKY_L,path:"تطوير"},
      {icon:"📙",title:"IELTS",desc:"تدريب مكثف على الاختبار",who:"عندك أساس متين وجاهز تتدرب",rec:"دورة IELTS المخصصة",recNote:"2,000 ريال شهرياً",color:GOLD,path:"IELTS"},
    ].map((item,i)=>(
      <Reveal key={i} d={i*0.1}><div style={{background:"var(--card)",border:"1px solid var(--card-b)",borderRadius:"20px",padding:"28px 24px",height:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:"32px",marginBottom:"10px"}}>{item.icon}</div>
        <h3 style={{fontSize:"18px",fontWeight:800,color:item.color,marginBottom:"6px"}}>{item.title}</h3>
        <p style={{fontSize:"13px",color:"var(--t2)",lineHeight:1.8,marginBottom:"12px"}}>{item.desc}</p>
        <div style={{fontSize:"11px",color:"var(--t3)",marginBottom:"12px"}}>مناسب لك إذا: <span style={{color:"var(--t2)"}}>{item.who}</span></div>
        <div style={{padding:"12px",borderRadius:"12px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)",marginBottom:"16px",flex:1}}>
          <div style={{fontSize:"11px",color:SKY,fontWeight:700,marginBottom:"3px"}}>الباقة المقترحة:</div>
          <div style={{fontSize:"14px",color:"var(--t1)",fontWeight:700}}>{item.rec}</div>
          <div style={{fontSize:"11px",color:"var(--t3)",marginTop:"2px"}}>{item.recNote}</div>
        </div>
        {item.path==="IELTS"&&<div style={{padding:"10px",borderRadius:"10px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.1)",marginBottom:"14px"}}><p style={{fontSize:"11px",color:GOLD,lineHeight:1.7}}>⚠️ ينصح بأساس متين قبل دخول مسار IELTS. إذا مستواك مبتدئ ابدأ بالتأسيس أولاً.</p></div>}
        <a href="#pricing" style={{display:"block",width:"100%",padding:"12px",borderRadius:"12px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)",color:SKY,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",textAlign:"center"}}>شوف الباقات المناسبة ↓</a>
      </div></Reveal>))}
  </div>
</div></section>

{/* 16. PRICING */}
<section id="pricing" style={{padding:"80px 28px"}}><div style={mx}>
  <Reveal><div style={{textAlign:"center",marginBottom:"12px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"var(--t1)"}}>اختر <span style={{color:SKY}}>باقتك</span></span></div>
  <p style={{textAlign:"center",color:"var(--t3)",fontSize:"13px",marginBottom:"10px"}}>لقاء مبدئي مجاني · دفع شهري · بدون التزام</p>
  <div style={{textAlign:"center",marginBottom:"44px"}}><span style={{display:"inline-block",padding:"5px 16px",borderRadius:"100px",background:"var(--sky-bg)",border:"1px solid var(--sky-b)",color:SKY_L,fontSize:"11px",fontWeight:600}}>📅 الكورسات تبدأ مع بداية كل شهر ميلادي — تقدر تنضم بأي وقت</span></div></Reveal>
  <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"14px",alignItems:"stretch"}}>
    {pkgs.map((pk,idx)=>{const isH=hC===pk.id,isP=pk.pop,isPr=pk.prem;const ac=isP?SKY:isPr?GOLD:"var(--t3)";return(
      <Reveal key={pk.id} d={idx*0.1} style={{flex:"1 1 280px",maxWidth:"340px",minWidth:"260px",display:"flex"}}>
        <div onMouseEnter={()=>setHC(pk.id)} onMouseLeave={()=>setHC(null)} style={{width:"100%",borderRadius:"20px",overflow:"hidden",background:isP?"var(--glass)":isPr?"var(--glass)":"var(--glass)",backdropFilter:"var(--glass-blur)",border:isP?"2px solid "+SKY+"44":isPr?"2px solid "+GOLD+"33":"1px solid var(--glass-b)",transform:isP?"scale(1.03)":isH?"scale(1.02)":"scale(1)",transition:"all 0.4s",boxShadow:isP?"0 25px 60px rgba(56,189,248,0.06), 0 0 0 1px rgba(56,189,248,0.1)":isPr?"0 25px 60px rgba(251,191,36,0.04)":isH?"0 15px 40px var(--shadow)":"none",animation:isP?"rgbBorder 4s ease-in-out infinite":isPr?"rgbBorder 4s ease-in-out infinite 2s":"none",display:"flex",flexDirection:"column"}}>
          {isP&&<div style={{background:SKY,color:"#060e1c",textAlign:"center",padding:"9px",fontSize:"11px",fontWeight:800,letterSpacing:"2px"}}>⭐ الأنسب لك</div>}
          {isPr&&<div style={{background:`linear-gradient(135deg,${GOLD},#d97706)`,color:"#060e1c",textAlign:"center",padding:"9px",fontSize:"11px",fontWeight:800}}>👑 الباقة الأقوى على الإطلاق</div>}
          <div style={{padding:"26px 22px",flex:1,display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:"10px",fontWeight:700,color:ac,marginBottom:"3px"}}>{pk.sub}</div>
            <h3 style={{fontSize:"24px",fontWeight:900,color:"var(--t1)",marginBottom:"4px"}}>باقة {pk.nm}</h3>
            <span style={{display:"inline-block",width:"fit-content",marginBottom:"12px",fontSize:"10px",fontWeight:700,color:RED,background:"rgba(239,68,68,0.1)",padding:"3px 8px",borderRadius:"100px"}}>باقي {pk.seats} مقاعد</span>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"3px"}}><span style={{fontSize:"14px",color:"var(--t3)",textDecoration:"line-through"}}>{pk.rv.toLocaleString()}</span><span style={{fontSize:"10px",color:"var(--t4)"}}>القيمة الحقيقية</span></div>
            <div style={{display:"flex",alignItems:"baseline",gap:"6px",marginBottom:"20px",paddingBottom:"16px",borderBottom:"1px solid var(--card-b)"}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:"38px",fontWeight:900,color:"var(--t1)",lineHeight:1}}>{pk.pr.toLocaleString()}</span>
              <span style={{color:"var(--t3)",fontSize:"11px"}}>ر.س/شهرياً</span>
              <span style={{fontSize:"10px",color:GREEN,fontWeight:700,marginRight:"auto"}}>وفّر {pk.save}%</span>
            </div>
            <div style={{flex:1,marginBottom:"18px"}}>{pk.f.map((ft,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",opacity:ft.ok?1:0.4}}><span style={{fontSize:"12px",color:ft.ok?(ft.hl?ac:GREEN):RED}}>{ft.ok?"✓":"✗"}</span><span style={{fontSize:"12px",color:ft.ok?"var(--t2)":"var(--t4)",fontWeight:ft.hl?600:300,textDecoration:ft.ok?"none":"line-through"}}>{ft.t}</span></div>))}</div>
            {!isP&&!isPr&&<div style={{padding:"8px 12px",borderRadius:"10px",background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.08)",marginBottom:"12px"}}><div style={{fontSize:"10px",color:RED,opacity:0.7}}>⚠ بدون متابعة يومية · بدون محتوى مسجل · بدون حصص فردية</div></div>}
            <button onClick={()=>openReg("","")} style={{display:"block",textAlign:"center",width:"100%",padding:"13px",borderRadius:"14px",fontSize:"14px",fontWeight:800,background:isP?SKY:isPr?GOLD:"var(--card-h)",color:isP||isPr?"#060e1c":"var(--t2)",border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>احجز لقاءك المجاني ←</button>
            <div style={{textAlign:"center",marginTop:"6px",color:"var(--t3)",fontSize:"10px",lineHeight:1.5}}>لقاء مبدئي مجاني مع المدرب</div>
          </div>
        </div>
      </Reveal>)})}
    {/* IELTS */}
    <Reveal d={0.3} style={{flex:"1 1 280px",maxWidth:"340px",minWidth:"260px",display:"flex"}}>
      <div style={{width:"100%",borderRadius:"20px",overflow:"hidden",background:"var(--glass)",backdropFilter:"var(--glass-blur)",border:"1px solid rgba(251,191,36,0.15)",display:"flex",flexDirection:"column"}}>
        <div style={{background:`linear-gradient(135deg,${RED},#dc2626)`,color:"#fff",textAlign:"center",padding:"9px",fontSize:"11px",fontWeight:800,letterSpacing:"1px"}}>🎯 مسار IELTS المتخصص</div>
        <div style={{padding:"26px 22px",flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:"10px",fontWeight:700,color:RED,marginBottom:"3px"}}>تدريب مكثف على الاختبار</div>
          <h3 style={{fontSize:"24px",fontWeight:900,color:"var(--t1)",marginBottom:"4px"}}>دورة IELTS</h3>
          <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"3px"}}><span style={{fontSize:"14px",color:"var(--t3)",textDecoration:"line-through"}}>3,000</span><span style={{fontSize:"10px",color:"var(--t4)"}}>القيمة الحقيقية</span></div>
          <div style={{display:"flex",alignItems:"baseline",gap:"6px",marginBottom:"20px",paddingBottom:"16px",borderBottom:"1px solid var(--card-b)"}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"38px",fontWeight:900,color:"var(--t1)",lineHeight:1}}>2,000</span>
            <span style={{color:"var(--t3)",fontSize:"11px"}}>ر.س/شهرياً</span>
            <span style={{fontSize:"10px",color:GREEN,fontWeight:700,marginRight:"auto"}}>وفّر 33%</span>
          </div>
          <div style={{flex:1,marginBottom:"18px"}}>{["تدريب مباشر مع المدرب على المهارات الأربع","استراتيجيات حل الأسئلة وإدارة الوقت","اختبارات تجريبية أصعب من الاختبار الحقيقي","تدريب متكرر لين تتأكد من تجاوز درجتك المستهدفة","حصص فردية مكثفة + متابعة يومية","تقارير أسبوعية بتقدمك"].map((ft,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}><span style={{fontSize:"12px",color:GOLD}}>✓</span><span style={{fontSize:"12px",color:"var(--t2)",fontWeight:600}}>{ft}</span></div>))}</div>
          <div style={{padding:"10px",borderRadius:"10px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.1)",marginBottom:"14px"}}><p style={{fontSize:"11px",color:GOLD,lineHeight:1.7}}>⚠️ يُنصح بأساس متين قبل الدخول. إذا مستواك مبتدئ ابدأ بالتأسيس أو التطوير أولاً.</p></div>
          <button onClick={()=>openReg("","")} style={{display:"block",textAlign:"center",width:"100%",padding:"13px",borderRadius:"14px",fontSize:"14px",fontWeight:800,background:`linear-gradient(135deg,${RED},#dc2626)`,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>احجز لقاءك المجاني — IELTS ←</button>
        </div>
      </div>
    </Reveal>
  </div>
  {/* Comparison */}
  <Reveal d={0.3}><div style={{maxWidth:"750px",margin:"44px auto 0",padding:"28px 32px",borderRadius:"24px",background:"var(--sky-bg)",border:"2px solid var(--sky-b)",animation:"borderGlow 4s ease-in-out infinite"}}>
    <div style={{fontSize:"18px",fontWeight:800,color:"var(--t1)",marginBottom:"16px",textAlign:"center"}}>💡 ليش باقة <span style={{color:SKY}}>طلاقة</span> هي الخيار الأذكى؟</div>
    <div style={{fontSize:"15px",color:"var(--t2)",lineHeight:2,textAlign:"center",marginBottom:"16px"}}>مقابل <span style={{color:SKY,fontWeight:800,fontSize:"18px"}}>350 ريال</span> فقط زيادة عن أساس:</div>
    <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px",marginBottom:"18px"}}>{["متابعة يومية","محتوى مسجل","حصة فردية","تقييم كل أسبوعين","تقرير تقدّم"].map((item,i)=>(<span key={i} style={{padding:"6px 14px",borderRadius:"100px",background:"var(--card)",border:"1px solid var(--sky-b)",color:SKY_L,fontSize:"12px",fontWeight:600}}>✓ {item}</span>))}</div>
    <div style={{textAlign:"center",fontSize:"16px",color:"var(--t1)",fontWeight:700}}>كل ميزة بأقل من <span style={{color:SKY,fontSize:"20px"}}>٧٠ ريال</span></div>
    <div style={{textAlign:"center",marginTop:"18px"}}><button onClick={goPrice} style={{display:"inline-flex",alignItems:"center",gap:"6px",background:SKY,color:"#060e1c",padding:"12px 28px",borderRadius:"60px",fontSize:"14px",fontWeight:800,border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>اختر باقتك الآن ←</button></div>
  </div></Reveal>

  {/* Trust & Guarantee */}
  <Reveal d={0.4}><div style={{maxWidth:"750px",margin:"28px auto 0",display:"flex",justifyContent:"center",gap:"24px",flexWrap:"wrap"}}>
    {[
      {icon:"🤝",text:"اللقاء المبدئي مجاني — شوف بنفسك وقرر"},
      {icon:"📅",text:"دفع شهري — بدون عقود أو التزامات"},
      {icon:"↔️",text:"غيّر باقتك أي وقت — مرونة كاملة"},
    ].map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"16px"}}>{t.icon}</span><span style={{fontSize:"12px",color:"var(--t3)",fontWeight:500}}>{t.text}</span></div>))}
  </div></Reveal>
</div></section>

{/* 17. FAQ */}
<section id="faq" style={{padding:"80px 28px"}}><div style={{...mx,maxWidth:"680px"}}>
  <Reveal><span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:900,color:"var(--t1)",display:"block",marginBottom:"32px"}}>أسئلة <span style={{color:SKY}}>شائعة</span></span></Reveal>
  {fqs.map((f,i)=>(<Reveal key={i} d={i*0.04}><div onClick={()=>setFO(fO===i?null:i)} style={{borderBottom:"1px solid var(--card-b)",cursor:"pointer",padding:"16px 0"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"14px"}}><span style={{fontSize:"14px",fontWeight:600,color:fO===i?SKY:"var(--t1)",transition:"color 0.3s"}}>{f.q}</span><span style={{color:SKY,fontSize:"18px",transition:"transform 0.3s",transform:fO===i?"rotate(45deg)":"rotate(0)",flexShrink:0}}>+</span></div>
    <div style={{maxHeight:fO===i?"250px":"0",overflow:"hidden",transition:"max-height 0.4s ease"}}><p style={{color:"var(--t3)",fontSize:"13px",lineHeight:1.9,paddingTop:"10px"}}>{f.a}</p></div>
  </div></Reveal>))}
</div></section>

{/* 18. FINAL CTA */}
<section style={{padding:"100px 28px",textAlign:"center",position:"relative"}}>
  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"350px",height:"350px",borderRadius:"50%",background:`radial-gradient(circle,var(--glow),transparent 60%)`,animation:"glow 5s ease-in-out infinite",pointerEvents:"none"}}/>
  <Reveal>
    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,6vw,50px)",fontWeight:900,color:"var(--t1)",marginBottom:"16px",letterSpacing:"-1px",lineHeight:1.1}}>كل يوم تأخره<br/><span style={{color:SKY}}>يبعدك عن هدفك</span></h2>
    <p style={{color:"var(--t3)",fontSize:"15px",lineHeight:1.8,marginBottom:"32px",maxWidth:"400px",marginInline:"auto"}}>الباقي عليك خطوة وحدة — اختر باقتك وابدأ.<br/>بدون أي التزام. الدفع شهري.</p>
    <button onClick={goPrice} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:SKY,color:"#060e1c",padding:"16px 40px",borderRadius:"60px",fontSize:"17px",fontWeight:800,boxShadow:"0 0 60px rgba(56,189,248,0.12)",border:"none",cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>اختر باقتك الآن ←</button>
    <div style={{marginTop:"12px",color:"var(--t3)",fontSize:"12px"}}>+966 55 866 9974</div>
  </Reveal>
</section>

{/* FOOTER */}
<footer style={{padding:"22px 28px",borderTop:"1px solid var(--divider)",background:"var(--bg2)"}}><div style={{...mx,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"var(--t1)"}}><span style={{color:SKY}}>F</span>luentia</span>
  <div style={{display:"flex",gap:"16px",alignItems:"center"}}><a href={TT} target="_blank" rel="noopener noreferrer" style={{color:"var(--t3)",fontSize:"11px"}}>TikTok</a><a href={IG} target="_blank" rel="noopener noreferrer" style={{color:"var(--t3)",fontSize:"11px"}}>Instagram</a>{visitors&&<span style={{color:"var(--t4)",fontSize:"9px",direction:"ltr"}}>👁 {visitors.toLocaleString()}</span>}<span style={{color:"var(--t4)",fontSize:"10px"}}>© 2026</span></div>
</div></footer>

{/* BACK TO TOP */}
{scrollY>600&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:"22px",right:"22px",zIndex:999,width:"42px",height:"42px",borderRadius:"50%",background:"var(--glass)",border:"1px solid var(--glass-b)",backdropFilter:"var(--glass-blur)",display:"flex",alignItems:"center",justifyContent:"center",color:SKY,fontSize:"18px",cursor:"pointer",transition:"all 0.3s",boxShadow:"0 4px 15px var(--shadow)"}}>↑</button>}

{/* DOT NAVIGATOR (desktop) */}
{scrollY>400&&<div className="dot-nav">{navSections.map(s=>(
  <div key={s.id} className={"dot"+(activeSection===s.id?" active":"")} onClick={()=>{const el=document.getElementById(s.id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})}}>
    <span className="dot-label">{s.label}</span>
  </div>
))}</div>}

{/* MOBILE SECTIONS MENU */}
{scrollY>400&&<>
  <button className="mobile-sections-btn" onClick={()=>setShowSections(!showSections)} style={{position:"fixed",bottom:"82px",right:"22px",zIndex:999,width:"42px",height:"42px",borderRadius:"50%",background:"var(--glass)",border:"1px solid var(--glass-b)",backdropFilter:"var(--glass-blur)",display:"none",alignItems:"center",justifyContent:"center",color:SKY,fontSize:"16px",cursor:"pointer",boxShadow:"0 4px 15px var(--shadow)"}}>☰</button>
  {showSections&&<div className="mobile-sections-btn" onClick={()=>setShowSections(false)} style={{position:"fixed",bottom:"130px",right:"22px",zIndex:999,background:"var(--popup)",border:"1px solid var(--glass-b)",backdropFilter:"var(--glass-blur)",borderRadius:"16px",padding:"12px 6px",display:"none",flexDirection:"column",gap:"2px",boxShadow:"0 10px 30px var(--shadow)",maxHeight:"60vh",overflowY:"auto"}}>
    {navSections.map(s=>(<button key={s.id} onClick={()=>{const el=document.getElementById(s.id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});setShowSections(false)}} style={{background:activeSection===s.id?"var(--sky-bg)":"transparent",border:"none",borderRadius:"10px",padding:"10px 16px",fontSize:"13px",fontWeight:activeSection===s.id?700:500,color:activeSection===s.id?SKY:"var(--t2)",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",textAlign:"right",whiteSpace:"nowrap",transition:"all 0.2s"}}>{s.label}</button>))}
  </div>}
</>}

{/* MINI CHAT */}
<div style={{position:"fixed",bottom:"80px",left:"22px",zIndex:999,display:"flex",alignItems:"center",gap:"8px",opacity:scrollY>400?1:0,transform:scrollY>400?"translateX(0)":"translateX(-20px)",transition:"all 0.4s",pointerEvents:scrollY>400?"auto":"none"}}>
  <a href={WA} target="_blank" rel="noopener noreferrer" style={{background:"var(--glass)",backdropFilter:"var(--glass-blur)",border:"1px solid var(--glass-b)",borderRadius:"100px",padding:"8px 16px",fontSize:"12px",color:"var(--t1)",fontWeight:600,boxShadow:"0 4px 15px var(--shadow)",display:"flex",alignItems:"center",gap:"6px",fontFamily:"'Tajawal',sans-serif"}}>
    <span style={{fontSize:"14px"}}>💬</span> محتاج مساعدة؟
  </a>
</div>

{/* FLOATING WA */}
<a href={WA} target="_blank" rel="noopener noreferrer" style={{position:"fixed",bottom:"22px",left:"22px",zIndex:999,width:"52px",height:"52px",borderRadius:"50%",background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"22px",animation:"pulse2 2s infinite"}}>💬</a>

</div>{/* end theme container */}
</div>)}

/* ═══════════════════════════════════════════════════════════════
   START PAGE — /start — Google Ads Campaign Landing Page
   ═══════════════════════════════════════════════════════════════ */

function StartPage(){
  const [name,setName]=React.useState("");
  const [phone,setPhone]=React.useState("");
  const [path,setPath]=React.useState("");
  const [pkg,setPkg]=React.useState("");
  const [goal,setGoal]=React.useState("");
  const [errors,setErrors]=React.useState({});
  const [submitted,setSubmitted]=React.useState(false);
  const [utm,setUtm]=React.useState({});

  React.useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setUtm({source:p.get("utm_source")||"",medium:p.get("utm_medium")||"",campaign:p.get("utm_campaign")||"",content:p.get("utm_content")||""});
    // TikTok Pixel: fire PageView for SPA route
    if(window.ttq) window.ttq.page();
  },[]);

  const pkgData=[
    {name:"أساس",price:"٧٥٠",color:"rgba(102,119,136",accent:"#667788"},
    {name:"طلاقة",price:"١,١٠٠",color:"rgba(56,189,248",accent:"#38bdf8"},
    {name:"تميّز",price:"١,٥٠٠",color:"rgba(251,191,36",accent:"#fbbf24"},
    {name:"IELTS",price:"٢,٠٠٠",color:"rgba(239,68,68",accent:"#ef4444"}
  ];

  // Auto-select IELTS package when IELTS path chosen
  React.useEffect(()=>{
    if(path==="IELTS"){setPkg("IELTS");}
    else if(pkg==="IELTS"){setPkg("");}
  },[path]);

  const valid=name.trim().length>=2 && /^05\d{8}$/.test(phone) && path && pkg;

  function validate(){
    const e={};
    if(name.trim().length<2) e.name="الاسم لازم يكون حرفين على الأقل";
    if(!/^05\d{8}$/.test(phone)) e.phone="رقم الجوال لازم يبدأ بـ 05 ويكون 10 أرقام";
    if(!path) e.path="اختر المسار";
    if(!pkg) e.pkg="اختر الباقة";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  function handleSubmit(e){
    e.preventDefault();
    if(!validate()) return;
    const src=utm.source?`${utm.source} / ${utm.campaign||""}`.trim():"إعلان جوجل";
    const pkgInfo=pkgData.find(p=>p.name===pkg);
    const msg=`السلام عليكم، أبي أحجز لقاء مبدئي مجاني
الاسم: ${name}
الجوال: ${phone}
المسار: ${path}
الباقة: ${pkg} (${pkgInfo?pkgInfo.price:""}  ر.س)
${goal?`الهدف: ${goal}\n`:""}المصدر: ${src}`;
    if (window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'start_page_form',
        path: path,
        package: pkg,
        source: 'google_ads',
      });
    }
    // TikTok Pixel: track form submission as conversion
    if(window.ttq){
      window.ttq.track('SubmitForm',{content_name:'fluentia_registration',content_category:path||'general',value:pkg||'unknown',description:goal||''});
      window.ttq.track('CompleteRegistration',{content_name:'fluentia_lead',content_category:path||'general'});
    }
    window.open("https://wa.me/966558669974?text="+encodeURIComponent(msg),"_blank");
    setSubmitted(true);
  }

  const paths=["تأسيس","تطوير","IELTS"];
  const goals=["أكاديمي","وظيفة","IELTS","تطوير شخصي"];

  const glow=`@keyframes startGlow{0%,100%{box-shadow:0 0 20px rgba(56,189,248,0.15),0 0 60px rgba(56,189,248,0.05)}50%{box-shadow:0 0 30px rgba(56,189,248,0.25),0 0 80px rgba(56,189,248,0.1)}}`;
  const pulse=`@keyframes startPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}`;
  const fadeIn=`@keyframes startFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
  const waPulse=`@keyframes waFloat{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`;

  const cardStyle={background:"rgba(255,255,255,0.03)",border:"1px solid rgba(56,189,248,0.12)",borderRadius:"16px",padding:"20px",textAlign:"center"};
  const labelStyle={display:"block",fontSize:"14px",fontWeight:600,color:"#e2e8f0",marginBottom:"8px",fontFamily:"'Tajawal',sans-serif"};
  const inputStyle={width:"100%",padding:"14px 16px",borderRadius:"12px",border:"1px solid rgba(56,189,248,0.2)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"16px",fontFamily:"'Tajawal',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl"};
  const errStyle={color:"#ef4444",fontSize:"12px",marginTop:"4px",fontFamily:"'Tajawal',sans-serif"};
  const pillBtnStyle=(active)=>({padding:"10px 20px",borderRadius:"100px",border:active?"2px solid #38bdf8":"1px solid rgba(255,255,255,0.15)",background:active?"rgba(56,189,248,0.15)":"rgba(255,255,255,0.03)",color:active?"#38bdf8":"#94a3b8",fontWeight:active?700:500,fontSize:"14px",cursor:"pointer",fontFamily:"'Tajawal',sans-serif",transition:"all 0.2s"});

  return(
    <div style={{minHeight:"100vh",background:"#060e1c",color:"#fff",direction:"rtl",fontFamily:"'Tajawal',sans-serif",width:"100%",margin:0,padding:0,overflowX:"hidden"}}>
      <style>{glow}{pulse}{fadeIn}{waPulse}</style>

      {/* MINI NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:"rgba(6,14,28,0.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(56,189,248,0.08)",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Link to="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:"#38bdf8"}}>F</span>
          <span style={{fontSize:"16px",fontWeight:600,color:"#e2e8f0"}}>Fluentia</span>
        </Link>
        <Link to="/" style={{fontSize:"13px",color:"#7dd3fc",textDecoration:"none",fontWeight:500}}>الصفحة الرئيسية →</Link>
      </nav>

      {/* HERO + FORM */}
      <div style={{maxWidth:"540px",margin:"0 auto",padding:"80px 20px 40px",animation:"startFadeIn 0.6s ease-out"}}>

        {/* Badge */}
        <div style={{display:"inline-block",background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.05))",border:"1px solid rgba(251,191,36,0.3)",borderRadius:"100px",padding:"6px 18px",marginBottom:"20px"}}>
          <span style={{fontSize:"13px",fontWeight:600,color:"#fbbf24"}}>إعلان خاص — مقاعد محدودة</span>
        </div>

        {/* Headline */}
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,6vw,42px)",fontWeight:700,color:"#fff",marginBottom:"12px",lineHeight:1.3}}>ابدأ رحلتك مع <span style={{color:"#38bdf8"}}>Fluentia</span></h1>
        <p style={{fontSize:"17px",color:"#94a3b8",marginBottom:"24px",lineHeight:1.6}}>لقاء مبدئي مجاني مع المدرب · بدون أي التزام</p>

        {/* Quick Pills */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"10px",marginBottom:"32px",justifyContent:"center"}}>
          {[["🎓","مدربون سعوديون"],["👥","٧ طلاب كحد أقصى"],["📱","كلاسات لايف أونلاين"]].map(([icon,text])=>(
            <span key={text} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"100px",padding:"8px 16px",fontSize:"13px",color:"#cbd5e1",display:"flex",alignItems:"center",gap:"6px"}}>{icon} {text}</span>
          ))}
        </div>

        {/* PRICING CARDS */}
        <div style={{marginBottom:"32px",textAlign:"center"}}>
          <h2 style={{fontSize:"17px",fontWeight:700,color:"#e2e8f0",marginBottom:"16px",textAlign:"center"}}>الأسعار والباقات</h2>
          <p style={{fontSize:"13px",fontWeight:600,color:"#8899aa",marginBottom:"4px"}}>الباقات تبدأ من ٧٥٠ ر.س/شهرياً</p>
          <p style={{fontSize:"11px",color:"#556677",marginBottom:"20px"}}>دفع شهري · بدون التزام</p>

          <div className="pricing-cards-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
            {/* أساس */}
            <div style={{borderRadius:"16px",padding:"16px 12px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(102,119,136,0.2)",textAlign:"center"}}>
              <div style={{fontSize:"14px",fontWeight:800,color:"#fff",marginBottom:"6px"}}>باقة أساس</div>
              <div style={{marginBottom:"6px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"#fff"}}>٧٥٠</span> <span style={{fontSize:"11px",color:"#556677"}}>ر.س<span style={{fontSize:"10px",color:"#778899"}}>/شهرياً</span></span></div>
              <div style={{fontSize:"11px",color:"#8899aa",lineHeight:1.7}}>8 ساعات تدريب · 7 طلاب كحد أقصى</div>
            </div>

            {/* طلاقة — HIGHLIGHTED */}
            <div style={{borderRadius:"16px",padding:"16px 12px",background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.3)",textAlign:"center",transform:"scale(1.03)"}}>
              <div style={{background:"#38bdf8",color:"#060e1c",fontSize:"10px",fontWeight:700,padding:"3px 10px",borderRadius:"100px",display:"inline-block",marginBottom:"8px"}}>⭐ الأنسب</div>
              <div style={{fontSize:"14px",fontWeight:800,color:"#fff",marginBottom:"6px"}}>باقة طلاقة</div>
              <div style={{marginBottom:"6px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"#fff"}}>١,١٠٠</span> <span style={{fontSize:"11px",color:"#556677"}}>ر.س<span style={{fontSize:"10px",color:"#778899"}}>/شهرياً</span></span></div>
              <div style={{fontSize:"11px",color:"#8899aa",lineHeight:1.7}}>متابعة يومية · حصة فردية · محتوى مسجل</div>
            </div>

            {/* تميّز */}
            <div style={{borderRadius:"16px",padding:"16px 12px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(251,191,36,0.15)",textAlign:"center",transform:"scale(1.01)"}}>
              <div style={{background:"rgba(251,191,36,0.15)",color:"#fbbf24",fontSize:"10px",fontWeight:700,padding:"3px 10px",borderRadius:"100px",display:"inline-block",marginBottom:"8px"}}>🚀 الأفضل</div>
              <div style={{fontSize:"14px",fontWeight:800,color:"#fff",marginBottom:"6px"}}>باقة تميّز</div>
              <div style={{marginBottom:"6px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"#fbbf24"}}>١,٥٠٠</span> <span style={{fontSize:"11px",color:"#556677"}}>ر.س<span style={{fontSize:"10px",color:"#778899"}}>/شهرياً</span></span></div>
              <div style={{fontSize:"11px",color:"#8899aa",lineHeight:1.7}}>4 حصص فردية · تقرير أسبوعي · متابعة مكثفة</div>
            </div>

            {/* IELTS */}
            <div style={{borderRadius:"16px",padding:"16px 12px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(239,68,68,0.12)",textAlign:"center"}}>
              <div style={{fontSize:"14px",fontWeight:800,color:"#fff",marginBottom:"6px"}}>دورة IELTS</div>
              <div style={{marginBottom:"6px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"#ef4444"}}>٢,٠٠٠</span> <span style={{fontSize:"11px",color:"#556677"}}>ر.س<span style={{fontSize:"10px",color:"#778899"}}>/شهرياً</span></span></div>
              <div style={{fontSize:"11px",color:"#8899aa",lineHeight:1.7}}>تدريب مكثف · اختبارات تجريبية · حصص فردية</div>
              <div style={{fontSize:"10px",color:"#556677",marginTop:"4px"}}>يُنصح بأساس متين</div>
            </div>
          </div>

          <a href="/#pricing" style={{display:"inline-block",marginTop:"16px",fontSize:"12px",color:"#38bdf8",fontWeight:600,textDecoration:"none"}}>← شوف المقارنة الكاملة</a>
        </div>

        <style>{`
          @media(max-width:768px){
            .pricing-cards-row{
              grid-template-columns:repeat(2,1fr)!important;
              padding:0 16px!important;
            }
          }
        `}</style>

        {/* FORM CARD */}
        <form onSubmit={handleSubmit} id="start-form" data-page="start" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:"20px",padding:"28px 24px",animation:"startGlow 3s ease-in-out infinite"}}>
          <h2 style={{fontSize:"18px",fontWeight:700,color:"#e2e8f0",marginBottom:"24px",textAlign:"center",lineHeight:1.5}}>سجّل الحين — نتواصل معك خلال ٢٤ ساعة</h2>

          {/* Name */}
          <div style={{marginBottom:"16px"}}>
            <label style={labelStyle}>الاسم</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك الأول" required style={inputStyle}/>
            {errors.name&&<div style={errStyle}>{errors.name}</div>}
          </div>

          {/* Phone */}
          <div style={{marginBottom:"16px"}}>
            <label style={labelStyle}>رقم الجوال</label>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="05xxxxxxxx" required style={{...inputStyle,direction:"ltr",textAlign:"right"}}/>
            {errors.phone&&<div style={errStyle}>{errors.phone}</div>}
          </div>

          {/* Path */}
          <div style={{marginBottom:"16px"}}>
            <label style={labelStyle}>المسار</label>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center"}}>
              {paths.map(p=><button type="button" key={p} onClick={()=>setPath(p)} style={pillBtnStyle(path===p)}>{p}</button>)}
            </div>
            {errors.path&&<div style={errStyle}>{errors.path}</div>}
          </div>

          {/* Package */}
          <div style={{marginBottom:"16px"}}>
            <label style={labelStyle}>الباقة المفضلة</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}} className="start-pkg-grid">
              {pkgData.map(p=>{
                const isIelts=p.name==="IELTS";
                const disabled=path==="IELTS"?!isIelts:isIelts&&path;
                const active=pkg===p.name;
                return(<button type="button" key={p.name} disabled={disabled} onClick={()=>!disabled&&setPkg(p.name)} style={{padding:"12px 8px",borderRadius:"12px",border:active?`1px solid ${p.color},0.5)`:"1px solid rgba(255,255,255,0.08)",background:active?`${p.color},0.08)`:"rgba(255,255,255,0.04)",textAlign:"center",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.35:1,fontFamily:"'Tajawal',sans-serif",transition:"all 0.2s"}}>
                  <div style={{fontSize:"13px",fontWeight:700,color:active?p.accent:"#fff"}}>{p.name}</div>
                  <div style={{fontSize:"11px",color:active?"#94a3b8":"#667788",marginTop:"2px"}}>{p.price} ر.س</div>
                </button>);
              })}
            </div>
            {errors.pkg&&<div style={errStyle}>{errors.pkg}</div>}
          </div>

          {/* Goal */}
          <div style={{marginBottom:"24px"}}>
            <label style={labelStyle}>الهدف <span style={{fontWeight:400,color:"#64748b"}}>(اختياري)</span></label>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center"}}>
              {goals.map(g=><button type="button" key={g} onClick={()=>setGoal(goal===g?"":g)} style={pillBtnStyle(goal===g)}>{g}</button>)}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" id="start-submit-btn" data-action="submit-lead" data-tracking="google-ads-start" disabled={!valid} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"none",background:valid?"linear-gradient(135deg,#38bdf8,#0ea5e9)":"rgba(56,189,248,0.2)",color:valid?"#fff":"#64748b",fontSize:"17px",fontWeight:700,cursor:valid?"pointer":"not-allowed",fontFamily:"'Tajawal',sans-serif",transition:"all 0.3s",animation:valid?"startPulse 2s ease-in-out infinite":"none"}}>احجز لقاءك المجاني ←</button>

          {submitted&&<p style={{textAlign:"center",fontSize:"14px",color:"#4ade80",marginTop:"16px"}}>تم الإرسال! نتواصل معك قريباً إن شاء الله 🎉</p>}
          <p style={{textAlign:"center",fontSize:"13px",color:"#64748b",marginTop:"12px"}}>أو تواصل مباشرة: <a href="tel:+966558669974" style={{color:"#7dd3fc",textDecoration:"none",direction:"ltr",unicodeBidi:"embed"}}>0558669974</a></p>
        </form>

        <style>{`
          @media(max-width:500px){
            .start-pkg-grid{
              grid-template-columns:repeat(2,1fr)!important;
            }
          }
        `}</style>

        {/* SOCIAL PROOF STRIP */}
        <div style={{display:"flex",justifyContent:"center",gap:"24px",flexWrap:"wrap",marginTop:"32px",paddingTop:"24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          {[["+100","طالب وطالبة"],["⭐ 4.9","تقييم"],["🔥 3","مسارات متخصصة"]].map(([num,label])=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontSize:"18px",fontWeight:700,color:"#38bdf8"}}>{num}</div>
              <div style={{fontSize:"12px",color:"#64748b"}}>{label}</div>
            </div>
          ))}
        </div>

        {/* 3 FEATURE CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"12px",marginTop:"32px"}}>
          {[
            ["👨‍🏫","مدربون سعوديون متخصصون","مو أجانب، مو ذكاء اصطناعي. مدرب يفهمك ويتابعك يومياً"],
            ["📊","نظام تعلّم ذكي","منصة حديثة تتابع تقدمك بالأرقام"],
            ["🎯","نتائج مضمونة","الجوهرة: من صفر إلى قراءة بطلاقة في ٦ شهور"]
          ].map(([icon,title,desc])=>(
            <div key={title} style={cardStyle}>
              <div style={{fontSize:"24px",marginBottom:"8px"}}>{icon}</div>
              <div style={{fontSize:"15px",fontWeight:700,color:"#e2e8f0",marginBottom:"4px"}}>{title}</div>
              <div style={{fontSize:"13px",color:"#94a3b8",lineHeight:1.5}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING WHATSAPP */}
      <a href={"https://wa.me/966558669974?text="+encodeURIComponent("السلام عليكم، أبي أحجز لقاء مبدئي مجاني (إعلان جوجل)")} target="_blank" rel="noopener noreferrer" style={{position:"fixed",bottom:"22px",left:"22px",zIndex:999,width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"24px",boxShadow:"0 4px 15px rgba(37,211,102,0.3)",animation:"waFloat 2s infinite"}}>💬</a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROUTER
   ═══════════════════════════════════════════════════════════════ */

function AppRoutes(){
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-19G2SJ1WYL', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<StartPage />} />
    </Routes>
  );
}

export default function App(){
  return(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
