// Slide templates for «مجلة طلاقة» carousels. Pure string builders, no DOM.
// Inline markup in any text: {{English}} → LTR span · **bold** · ==lime marker==

export const SIZES = {
  "4x5": { cls: "r45", w: 1080, h: 1350, img: "post" },
  "9x16": { cls: "r916", w: 1080, h: 1920, img: "story" },
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inline(text) {
  return esc(text)
    // «و{{this}}»: the joined و reads as a Latin "g" glued to the word — keep a narrow no-break gap
    .replace(/(^|[\s«(])و\{\{/g, "$1و\u202F{{")
    .replace(/\{\{([\s\S]+?)\}\}/g, (_, t) => `<span class="en${t.length <= 24 ? " nw" : ""}" dir="ltr" lang="en">${t}</span>`)
    .replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>")
    .replace(/==([\s\S]+?)==/g, "<mark>$1</mark>");
}
const en = (text) => inline(text); // English-only lines: same markup, the container is LTR
const two = (n) => String(n).padStart(2, "0");
const style = (vars) => {
  const s = Object.entries(vars || {}).filter(([, v]) => v != null).map(([k, v]) => `--${k}:${typeof v === "number" ? v + "px" : v}`).join(";");
  return s ? ` style="${s}"` : "";
};

const lbl = (t) => (t ? `<span class="lbl">${inline(t)}</span>` : "");
const src = (t) => (t ? `<div class="src">${esc(t)}</div>` : "");
const body = (t) => (t ? `<p class="body">${inline(t)}</p>` : "");
const big = (t, bs) => (t ? `<p class="big"${style({ bs })}>${inline(t)}</p>` : "");

function chrome(ctx) {
  const { i, n, mark } = ctx;
  const ticks = Array.from({ length: n }, (_, k) => `<i class="${k < i ? "on" : k === i ? "now" : ""}"></i>`).join("");
  return `
  <div class="cols"><i></i><i></i><i></i><i></i></div>
  <div class="rule-top"></div><div class="rule-bot"></div>
  <header class="hd"><div class="brand">${mark}<b>طلاقة</b></div><div class="ctr"><em>${two(i + 1)}</em> / ${two(n)}</div></header>
  <footer class="ft"><div class="mast"><b>مجلة طلاقة</b> · العدد ${esc(ctx.issue)}</div><div class="prog">${ticks}</div></footer>`;
}
const ghost = (i) => `<div class="ghost">${two(i + 1)}</div>`;

/* ───── slide types ───── */
const T = {
  cover(s, ctx) {
    const v = s.variant || "photo";
    const img = v === "type" && !s.image ? "" : ctx.img(s.image);
    const sz = ctx.size;
    let art = "";
    let tone = "paper";
    let ctT = null;
    if (v === "photo") {
      tone = "ink";
      art = `<div class="cv-img" style="background-image:url(${img});background-position:${s.pos || "center"}"></div><div class="cv-shade"></div>`;
    } else if (v === "frame") {
      // image framed inside the grid, a lime block offset behind it (twist: optional lime duotone)
      const f = sz === "9x16" ? { t: 360, h: 560, r: 150, l: 300 } : { t: 176, h: 440, r: 84, l: 330 };
      ctT = f.t + 28 + f.h + 32;
      art = `<div class="cv-block" style="top:${f.t + 28}px;height:${f.h}px;right:${f.r - 28}px;left:${f.l + 28}px"></div>
        <div class="cv-frame" style="top:${f.t}px;height:${f.h}px;right:${f.r}px;left:${f.l}px"><div class="cv-pic" style="background-image:url(${img});background-position:${s.pos || "center"}"></div>${s.duo ? '<div class="cv-duo"></div>' : ""}</div>`;
    } else if (v === "split") {
      const f = sz === "9x16" ? { t: 330, h: 600 } : { t: 132, h: 480 };
      ctT = f.t + f.h + 32;
      art = `<div class="cv-frame" style="top:${f.t}px;height:${f.h}px;right:0;left:0"><div class="cv-pic" style="background-image:url(${img});background-position:${s.pos || "center"}"></div></div>`;
    } else if (v === "type") {
      tone = s.tone || "ink";
    }
    const pre = s.pre ? `<div class="pre${s.strike ? " x" : ""}"${style({ ps: s.ps })}>${en(s.pre)}</div>` : "";
    return {
      tone: s.tone || tone,
      cls: `cv cv-${v}`,
      html: `${art}<div class="ct"${ctT ? ` style="--ctT:${ctT}px"` : ""}>${lbl(s.kicker)}${pre}<h1 class="hook"${style({ hs: (sz === "9x16" && s.hs916) || s.hs })}>${inline(s.hook)}</h1>${s.sub ? `<p class="sub">${inline(s.sub)}</p>` : ""}</div>`,
      ghost: false,
    };
  },

  text(s, ctx) {
    let art = "";
    if (s.image) art = `<div class="cv-img" style="background-image:url(${ctx.img(s.image)});opacity:.34"></div>`;
    return { html: `${art}<div class="ct">${lbl(s.label)}${big(s.big, s.bs)}${body(s.body)}${src(s.src)}</div>` };
  },

  swap(s) {
    const many = s.pairs.length > 1;
    const vars = many ? { rs: s.rs || (s.pairs.length > 2 ? 50 : 56), ws: s.ws || 44, ys: s.ys || 44 } : { rs: s.rs, ws: s.ws, ys: s.ys };
    const rows = s.pairs
      .map(
        (p) => `<div class="sw">
        ${p.no ? `<div class="row no"><span class="tg">بدل</span><span class="t">${en(p.no)}</span></div>` : ""}
        <div class="row yes"><span class="tg">${esc(p.tag || "قل")}</span><span class="t">${en(p.yes)}</span></div>
        ${p.why ? `<p class="why">${inline(p.why)}</p>` : ""}</div>`
      )
      .join("");
    return { html: `<div class="ct"${style(vars)}>${lbl(s.label)}${rows}${s.why ? `<p class="body">${inline(s.why)}</p>` : ""}${src(s.src)}</div>` };
  },

  phrases(s) {
    const items = s.items.map(([e, g]) => `<div class="enb"><div class="l">${en(e)}</div>${g ? `<div class="g">${inline(g)}</div>` : ""}</div>`).join("");
    return { html: `<div class="ct"${style({ es: s.es })}>${lbl(s.label)}<div class="phr">${items}</div>${body(s.note)}</div>` };
  },

  myth(s) {
    return {
      cls: "mythS",
      tone: "ink",
      ghost: false,
      html: `<div class="myth"${style({ split: s.split, ms: s.ms, ts: s.ts })}>
        <div class="m"><span class="x">${esc(s.mythLabel || "الشائع")}</span><p>${inline(s.myth)}</p></div>
        <div class="tr"><span class="lbl">${esc(s.truthLabel || "الحقيقة")}</span><p>${inline(s.truth)}</p>${src(s.src)}</div></div>`,
    };
  },

  list(s) {
    const items = s.items
      .map(([h, p], k) => `<div><span class="n">${two(k + 1)}</span><div><h4>${inline(h)}</h4>${p ? `<p>${inline(p)}</p>` : ""}</div></div>`)
      .join("");
    return { html: `<div class="ct">${lbl(s.label)}${big(s.big, s.bs)}<div class="lst">${items}</div>${body(s.body)}${src(s.src)}</div>` };
  },

  step(s) {
    const e = s.en ? `<div class="enb"><div class="l">${en(s.en[0])}</div>${s.en[1] ? `<div class="g">${inline(s.en[1])}</div>` : ""}</div>` : "";
    return {
      ghost: false,
      html: `<div class="ct stp"${style({ es: s.es || 50 })}>${lbl(s.label)}<div class="num">${two(s.n)}</div><h3>${inline(s.title)}</h3>${body(s.body)}${e}${src(s.src)}</div>`,
    };
  },

  punch(s) {
    return { tone: s.tone || "lime", cls: "pn", html: `<div class="ct">${big(s.text, s.bs)}${s.after ? `<p class="after">${inline(s.after)}</p>` : ""}</div>` };
  },

  dialog(s) {
    const lines = s.lines
      .map((l) => `<div>${l.who ? `<div class="who">${inline(l.who)}</div>` : ""}${l.say ? `<div class="say${l.sm ? " sm" : ""}">${en(l.say)}</div>` : ""}${l.stage ? `<p class="stage">${inline(l.stage)}</p>` : ""}</div>`)
      .join("");
    return { html: `<div class="ct">${lbl(s.label)}<div class="dlg">${lines}</div></div>` };
  },

  stress(s) {
    const items = s.items
      .map(([w, g]) => `<div><div class="w">${en(w).replace(/ · /g, '<span class="dot">·</span>')}</div>${g ? `<div class="g">${inline(g)}</div>` : ""}</div>`)
      .join("");
    return { html: `<div class="ct"${style({ ss: s.ss })}>${lbl(s.label)}<div class="str">${items}</div>${body(s.body)}</div>` };
  },

  pairs(s) {
    const items = s.items.map(([a, b]) => `<div><span>${en(a)}</span><span class="ne">≠</span><span>${en(b)}</span></div>`).join("");
    return { html: `<div class="ct">${lbl(s.label)}<div class="prs">${items}</div>${body(s.body)}</div>` };
  },

  timeline(s) {
    const pts = s.points.map((p) => `<div><i></i><span>${inline(p)}</span></div>`).join("");
    const e = s.en ? `<div class="enb"><div class="l">${en(s.en)}</div></div>` : "";
    return { html: `<div class="ct">${lbl(s.label)}${e}<div class="tl">${pts}</div>${body(s.body)}${src(s.src)}</div>` };
  },

  verdict(s) {
    const fix = s.fix ? `<div class="sw"><div class="row yes"><span class="tg">${esc(s.fixTag || "الأوضح")}</span><span class="t">${en(s.fix)}</span></div></div>` : "";
    return {
      html: `<div class="ct"${style({ es: s.es || 58 })}>${lbl(s.label)}<div class="vd"><div class="enb"><div class="l">${en(s.en)}</div></div><span class="tag${s.ok ? " ok" : ""}">${inline(s.tag)}</span><p class="body">${inline(s.note)}</p>${fix}</div></div>`,
    };
  },

  cta(s, ctx) {
    return {
      tone: s.tone || "ink",
      ghost: false,
      html: `<div class="ct">${lbl(s.label || "قبل ما تكمّل")}
        <p class="save">${inline(s.save)}</p>
        <div class="read"><span class="k">اقرأ المقال كامل في مجلة طلاقة — الرابط في البايو</span><span class="t">«${esc(ctx.articleTitle)}»</span></div>
        <span class="btn">احجز لقاءك المبدئي</span>
        <div class="url">fluentia.academy/journal</div></div>`,
    };
  },
};

export function slideHTML(car, s, i, ctx) {
  const fn = T[s.type];
  if (!fn) throw new Error(`${car.id}: unknown slide type "${s.type}" (slide ${i + 1})`);
  const r = fn(s, ctx);
  const tone = r.tone || s.tone || car.base || "paper";
  const g = r.ghost === false || s.ghost === false ? "" : ghost(i);
  return `<section class="s ${SIZES[ctx.size].cls} ${tone} ${r.cls || ""} t-${s.type}" data-i="${i}">${chrome({ ...ctx, i })}${g}${r.html}</section>`;
}

export function docHTML(car, ctx, css) {
  const n = car.slides.length;
  const slides = car.slides.map((s, i) => slideHTML(car, s, i, { ...ctx, n })).join("\n");
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(car.id)} ${esc(car.title)}</title>
<style>${css}
section.s{display:none}section.s.show{display:block}body.all section.s{display:block;margin-bottom:24px}</style></head>
<body>${slides}</body></html>`;
}
