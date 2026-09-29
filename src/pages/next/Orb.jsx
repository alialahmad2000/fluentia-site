import { useEffect, useRef, useState } from "react";
import { markCanvas } from "../../lib/brandMark";

/**
 * Orb — the Fluentia planet (and its moon), one fragment shader on raw WebGL.
 *
 * Render is pure for the prerender: a static CSS orb (the flat disc a visitor
 * sees first, and all a low-tier visitor ever sees) plus an empty canvas. After
 * hydration the shader starts, and the canvas fades in over the disc once its
 * first frame is drawn — the orb "comes alive" rather than popping in.
 *
 *   variant  "planet" (navy, sky → ice currents, rare gold sparks) | "moon"
 *   fill     paint the whole rectangle instead of a disc (the intro's lettering)
 *   gl       tier config from perf.js: { webgl, fps, dpr }
 *   vignette [x, y, radius, strength] in disc space (-1..1, y up): darkens the
 *            region the headline sits over, so the type keeps its contrast
 *   mark     paint the feather-F on the planet: it brushes on once (after the
 *            intro, if one plays), then breathes in the planet's own light
 *
 * Off screen or in a background tab it stops drawing. A lost context falls
 * back to the static orb for good.
 */

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLight;
uniform float uMode;
uniform float uFill;
uniform float uScale;
uniform vec4 uVig;
uniform sampler2D uMark;
uniform float uMarkOn;
uniform float uPaint;
uniform vec3 uMC;
uniform vec3 uME;
uniform vec3 uMN;
uniform vec2 uMHalf;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}

const vec3 NAVY=vec3(.039,.102,.2);
const vec3 SKY=vec3(.22,.741,.973);
const vec3 ICE=vec3(.49,.827,.988);
const vec3 GOLD=vec3(.984,.749,.141);

vec3 planet(vec2 q,float t){
  vec2 w=vec2(fbm(q*1.3+vec2(0.,t*.05)),fbm(q*1.3+vec2(5.2,1.3)-t*.04));
  vec2 w2=vec2(fbm(q*1.1+3.*w+vec2(1.7,9.2)+t*.03),fbm(q*1.1+3.*w+vec2(8.3,2.8)));
  float f=fbm(q*1.2+3.2*w2);
  vec3 c=NAVY*.9;
  c=mix(c,mix(NAVY,SKY,.5),smoothstep(.34,.7,f));
  c=mix(c,ICE,smoothstep(.6,.92,f)*.8);
  c+=SKY*.22*smoothstep(.45,.95,length(w2));
  float s=noise(q*42.+vec2(t*.3,-t*.2));
  c+=GOLD*smoothstep(.975,1.,s)*1.8*smoothstep(.45,.75,f);
  return c;
}

vec3 moon(vec2 q){
  float f=fbm(q*2.4);
  float maria=smoothstep(.45,.66,fbm(q*1.05+7.));
  vec3 c=mix(vec3(.66,.72,.79),vec3(.36,.42,.5),maria);
  c*=.8+.38*f;
  vec2 g=q*3.2;vec2 id=floor(g);vec2 fr=fract(g);float cr=0.;
  for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){
    vec2 o=vec2(float(i),float(j));
    if(hash(id+o+9.)>.72){
      vec2 ce=o+vec2(hash(id+o),hash(id+o+17.));
      float rad=.12+.3*hash(id+o+31.);
      float d=length(fr-ce)/rad;
      cr+=-.14*smoothstep(1.,.55,d)+.12*smoothstep(.8,1.,d)*smoothstep(1.25,1.,d);
    }
  }}
  c*=1.+cr;
  return mix(c,ICE,.1);
}

void main(){
  float hs=.5*min(uRes.x,uRes.y);
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/hs;
  float t=uTime;
  if(uFill>.5){
    vec3 c=planet(uv*1.15,t*1.6)*1.75+ICE*.14;
    gl_FragColor=vec4(c,1.);
    return;
  }
  vec2 p=uv/uScale;
  float r=length(p);
  vec3 halo=mix(SKY,ICE,.4);
  float ha=exp(-max(r-1.,0.)*13.)*(uMode>.5?.28:.5);
  // The halo must reach zero before the canvas edge, or the square shows.
  ha*=smoothstep(1.,.8,max(abs(uv.x),abs(uv.y)));
  if(r>1.02){gl_FragColor=vec4(halo*ha,ha);return;}
  float z=sqrt(max(0.,1.-r*r));
  vec3 n=vec3(p,z);
  float lon=atan(n.x,n.z);
  float lat=asin(clamp(n.y,-1.,1.));
  vec3 c;
  if(uMode>.5){c=moon(vec2(lon*1.1+t*.012,lat*1.3));}
  else{c=planet(vec2(lon*1.25+t*.035,lat*1.9),t);}
  vec3 L=normalize(vec3(uLight*.7+vec2(-.35,.42),.95));
  float dif=clamp(dot(n,L),0.,1.);
  float lim=pow(z,.45);
  c*=(.16+.98*dif)*mix(.5,1.,lim);
  float fres=pow(1.-z,2.6);
  c+=halo*fres*(uMode>.5?.3:.95)*(.3+.7*clamp(dot(n,L)+.45,0.,1.));
  if(uMarkOn>.5&&dot(n,uMC)>.5){
    // the feather-F, painted on the sphere: brushed up the stem, then out along each feather
    vec2 mu=vec2(dot(n,uME),dot(n,uMN))/uMHalf*.5+.5;
    if(mu.x>0.&&mu.x<1.&&mu.y>0.&&mu.y<1.){
      vec3 mk=texture2D(uMark,mu).rgb;
      float nz=noise(mu*vec2(7.,9.));
      float wet=uPaint*1.25-((1.-mu.y)*.55+mu.x*.45+(nz-.5)*.14);
      float laid=smoothstep(0.,.05,wet);
      float bristle=noise(vec2(mu.x*4.,mu.y*170.))*.6+noise(vec2(mu.x*9.,mu.y*60.))*.4;
      float fray=noise(mu*90.)*.6+noise(mu*24.)*.4;
      float body=smoothstep(.2+fray*.5,.6+fray*.35,mk.r);
      vec3 ink=mix(vec3(.118,.91,1.),vec3(.184,.56,.91),mk.b*.75)*(.62+.55*bristle);
      float breath=.82+.18*sin(t*1.3);
      float sheen=smoothstep(.1,0.,abs(mu.x*.7+mu.y*.3-(mod(t*.16,1.6)-.3)))*body;
      float we=smoothstep(.035,0.,abs(wet-.03))*(1.-uPaint)*(body*.8+mk.g*.15);
      vec3 paint=ink*body*(.5+.2*breath)*(.55+.6*dif);
      // the letter lights the planet around it, the way the limb lights space
      paint+=halo*mk.g*(1.-body*.85)*.55*breath;
      paint+=vec3(.75,.95,1.)*(sheen*.3+we*1.2);
      c=mix(c,c*.55,body*laid*.6)+paint*laid;
    }
  }
  float vd=length(p-uVig.xy);
  c*=1.-uVig.w*smoothstep(uVig.z,0.,vd);
  float edge=smoothstep(1.,1.-2.5/(hs*uScale),r);
  gl_FragColor=mix(vec4(halo*ha,ha),vec4(c,1.),edge);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log || "shader compile failed");
  }
  return s;
}

const NO_VIG = [0, 0, 0, 0];

export default function Orb({
  variant = "planet",
  fill = false,
  gl: cfg,
  vignette = NO_VIG,
  scale = 0.84,
  mark = false,
  className = "",
  onLive,
}) {
  const wrapRef = useRef(null);
  const vigRef = useRef(vignette);
  const onLiveRef = useRef(onLive);
  const [live, setLive] = useState(false);
  const [dead, setDead] = useState(false);
  vigRef.current = vignette;
  onLiveRef.current = onLive;

  const enabled = Boolean(cfg && cfg.webgl) && !dead;
  const fps = cfg ? cfg.fps : 0;
  const dprCap = cfg ? cfg.dpr : 1;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!enabled || !wrap) return undefined;
    // A fresh canvas per run: a context lost in a cleanup can never be reused,
    // so re-running on the same element (StrictMode, a tier change) would fail.
    const canvas = document.createElement("canvas");
    canvas.className = "fx-orb-gl";
    wrap.appendChild(canvas);

    let gl;
    try {
      gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.remove();
      setDead(true);
      return undefined;
    }

    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link failed");
    } catch {
      canvas.remove();
      setDead(true);
      return undefined;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uLight = u("uLight");
    const uVig = u("uVig");
    gl.uniform1f(u("uMode"), variant === "moon" ? 1 : 0);
    gl.uniform1f(u("uFill"), fill ? 1 : 0);
    gl.uniform1f(u("uScale"), scale);

    // The mark sits on the planet's upper left: clear of the headline on a phone
    // (below the orb) and on a desktop (over its right half).
    const withMark = mark && variant === "planet" && !fill;
    let tex = null;
    const uPaint = u("uPaint");
    if (withMark) {
      try {
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, markCanvas());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(u("uMark"), 0);
        const [cx, cy] = [-0.3, 0.3];
        const cz = Math.sqrt(1 - cx * cx - cy * cy);
        // east = up × centre, north = centre × east: the letter stands upright
        const el = Math.hypot(cz, cx);
        const E = [cz / el, 0, -cx / el];
        const N = [cy * E[2] - cz * E[1], cz * E[0] - cx * E[2], cx * E[1] - cy * E[0]];
        gl.uniform3f(u("uMC"), cx, cy, cz);
        gl.uniform3f(u("uME"), E[0], E[1], E[2]);
        gl.uniform3f(u("uMN"), N[0], N[1], N[2]);
        gl.uniform2f(u("uMHalf"), 0.5, 0.6);
        gl.uniform1f(u("uMarkOn"), 1);
      } catch {
        tex = null;
      }
    }
    // The brush waits for the hero to be seen: after the intro, if one plays.
    const root = document.documentElement;
    let paintAt = -1;

    let w = 0;
    let h = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      // Cap the pixel count: a full-screen intro on a 3x phone is 3M pixels of fBm.
      const k = Math.min(dpr, Math.sqrt(1400000 / Math.max(1, cw * ch)));
      const nw = Math.max(1, Math.round(cw * k));
      const nh = Math.max(1, Math.round(ch * k));
      if (nw !== w || nh !== h) {
        w = nw;
        h = nh;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    size();
    const ro = "ResizeObserver" in window ? new ResizeObserver(size) : null;
    ro?.observe(canvas);

    // Pointer / touch nudges the light a little.
    const light = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e) => {
      light.tx = (e.clientX / window.innerWidth) * 2 - 1;
      light.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let onScreen = true;
    let visible = document.visibilityState === "visible";
    let raf = 0;
    let last = 0;
    let first = true;
    const t0 = performance.now() - 24000 * (variant === "moon" ? 0.3 : 1);
    const minDt = fps >= 60 ? 0 : 1000 / fps - 2;

    const draw = (now) => {
      raf = 0;
      if (!onScreen || !visible) return;
      raf = requestAnimationFrame(draw);
      if (minDt && now - last < minDt) return;
      last = now;
      light.x += (light.tx - light.x) * 0.04;
      light.y += (light.ty - light.y) * 0.04;
      const v = vigRef.current;
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uLight, light.x, light.y);
      gl.uniform4f(uVig, v[0], v[1], v[2], v[3]);
      if (tex) {
        if (paintAt < 0 && (!root.classList.contains("fx-intro") || root.classList.contains("fx-intro-done"))) paintAt = now + 700;
        const k = paintAt < 0 ? 0 : Math.min(1, Math.max(0, (now - paintAt) / 3200));
        // an even hand: the brush keeps a steady pace instead of snapping through the middle
        gl.uniform1f(uPaint, k * k * (3 - 2 * k));
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (first) {
        first = false;
        setLive(true);
        onLiveRef.current?.();
      }
    };
    const kick = () => {
      if (!raf && onScreen && visible) raf = requestAnimationFrame(draw);
    };

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([e]) => {
              onScreen = e.isIntersecting;
              kick();
            },
            { rootMargin: "120px 0px" }
          )
        : null;
    io?.observe(wrap);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      kick();
    };
    document.addEventListener("visibilitychange", onVis);

    const onLost = (e) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setDead(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      if (tex) gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      setLive(false);
    };
  }, [enabled, variant, fill, scale, mark, fps, dprCap]);

  return (
    <div
      ref={wrapRef}
      className={`fx-orb fx-orb--${variant}${fill ? " fx-orb--fill" : ""} ${className}`}
      data-live={enabled && live ? "" : undefined}
      aria-hidden="true"
    >
      {!fill && <div className="fx-orb-static" />}
    </div>
  );
}
