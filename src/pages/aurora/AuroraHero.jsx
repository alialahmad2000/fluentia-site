import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import "./AuroraHero.css";

/**
 * AuroraHero — faithful React port of "Fluentia Hero Aurora.dc.html"
 * (Claude Design). Preview route only: mounted at /aurora. Arabic-first RTL,
 * navy universe with the word طلاقة / FLUENCY breathing at the core, three
 * "moon" chips orbiting three rings, and a chaos→order load sequence where the
 * moons gather inward as «نُزيل» resolves from blur to clarity.
 *
 * Colors kept exactly: navy #1a2d50, sky-blue #38bdf8, single gold spark #fbbf24.
 */
export default function AuroraHero() {
  const stageRef = useRef(null);
  const cursorRef = useRef(null);

  // cursor parallax light — ported 1:1 from the design file's DCLogic mousemove
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const c = cursorRef.current;
      if (c) {
        c.style.background = `radial-gradient(480px 480px at ${x}% ${y}%,rgba(56,189,248,0.13),rgba(56,189,248,0) 60%)`;
      }
    };
    root.addEventListener("mousemove", onMove);
    return () => root.removeEventListener("mousemove", onMove);
  }, []);

  // paint the navy universe onto <html>/<body> while mounted; restore on leave
  // (so the live / and other routes are never affected)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.background;
    const prevBody = body.style.background;
    html.style.background = "#070b14";
    body.style.background = "#070b14";
    return () => {
      html.style.background = prevHtml;
      body.style.background = prevBody;
    };
  }, []);

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        id="flstage"
        dir="rtl"
        ref={stageRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          fontFamily: "'Readex Pro',sans-serif",
          background: "linear-gradient(150deg,#091020 0%,#0a1424 50%,#070b14 100%)",
        }}
      >
        {/* aurora */}
        <div style={{ position: "absolute", inset: "-10%", pointerEvents: "none", animation: "au_hueShift 16s ease-in-out infinite" }}>
          <div style={{ position: "absolute", top: "6%", right: "8%", width: "660px", height: "660px", borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%,rgba(56,189,248,0.32),rgba(56,189,248,0) 68%)", filter: "blur(42px)", animation: "au_aur1 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-6%", left: "2%", width: "740px", height: "740px", borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%,rgba(26,45,80,0.85),rgba(26,45,80,0) 66%)", filter: "blur(46px)", animation: "au_aur2 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "30%", left: "34%", width: "540px", height: "540px", borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%,rgba(127,212,255,0.16),rgba(56,189,248,0) 64%)", filter: "blur(48px)", animation: "au_aur3 26s ease-in-out infinite" }} />
        </div>

        {/* grain + vignette + cursor light */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, mixBlendMode: "soft-light", backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.82%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 320px 70px rgba(5,8,16,0.72)" }} />
        <div ref={cursorRef} data-cursor style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", background: "radial-gradient(460px 460px at 32% 46%,rgba(56,189,248,0.10),rgba(56,189,248,0) 60%)", transition: "background .22s ease-out" }} />

        {/* top bar */}
        <div style={{ position: "relative", zIndex: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "34px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(145deg,#38bdf8,#1a2d50)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(56,189,248,0.4)" }}>
              <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "#eaf3ff" }} />
            </div>
            <div style={{ fontSize: "19px", fontWeight: 600, color: "#eaf3ff", letterSpacing: "-0.01em" }}>طلاقة</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "28px", fontSize: "14.5px", color: "rgba(234,243,255,0.5)", fontWeight: 300 }}>
            <span style={{ cursor: "pointer" }}>الطريقة</span>
            <span style={{ cursor: "pointer" }}>المسارات</span>
            <span style={{ cursor: "pointer" }}>IELTS</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 500, color: "#eaf3ff", padding: "9px 18px", border: "1px solid rgba(120,160,210,0.25)", borderRadius: "10px", cursor: "pointer" }}>تسجيل الدخول</span>
          </div>
        </div>

        {/* main split */}
        <div style={{ position: "relative", zIndex: 6, display: "flex", alignItems: "center", gap: "40px", maxWidth: "1340px", margin: "0 auto", padding: "4px 56px 64px", minHeight: "calc(100vh - 188px)" }}>

          {/* text column */}
          <div style={{ flex: "1.2", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "right" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 16px", border: "1px solid rgba(56,189,248,0.28)", borderRadius: "999px", background: "rgba(56,189,248,0.06)", marginBottom: "30px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 0 4px rgba(56,189,248,0.18)" }} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#7fd4ff" }}>أكاديمية طلاقة · تعليم الإنجليزية للكبار</span>
            </div>

            <h1 style={{ margin: 0, fontSize: "clamp(30px,3.4vw,50px)", lineHeight: 1.34, fontWeight: 500, letterSpacing: "-0.02em", color: "#eaf3ff" }}>
              مهمّتنا ليست أن نُعطيك الإنجليزية… بل أن{" "}
              <span style={{ position: "relative", color: "#6cc8ff", fontWeight: 600, animation: "au_nzClarify 1.1s cubic-bezier(.2,.7,.2,1) .7s both, au_nzGlow 4.5s ease-in-out 1.9s infinite" }}>نُزيل</span>{" "}
              ما يمنعك من امتلاكها.
            </h1>

            <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: "12px", fontSize: "21px", fontWeight: 300, color: "#93a6c4" }}>
              <span>العائق ليس اللغة — بل</span>
              <span style={{ position: "relative", display: "inline-block", minWidth: "182px", height: "32px" }}>
                <span style={{ position: "absolute", right: 0, top: 0, color: "#eaf3ff", fontWeight: 500, animation: "au_wcycle 12s ease-in-out infinite", animationDelay: "0s" }}>التوتّر</span>
                <span style={{ position: "absolute", right: 0, top: 0, color: "#eaf3ff", fontWeight: 500, animation: "au_wcycle 12s ease-in-out infinite", animationDelay: "3s" }}>الخوف من الخطأ</span>
                <span style={{ position: "absolute", right: 0, top: 0, color: "#eaf3ff", fontWeight: 500, animation: "au_wcycle 12s ease-in-out infinite", animationDelay: "6s" }}>«ما تنفع لها»</span>
                <span style={{ position: "absolute", right: 0, top: 0, color: "#eaf3ff", fontWeight: 500, animation: "au_wcycle 12s ease-in-out infinite", animationDelay: "9s" }}>ما يقف حولها</span>
              </span>
            </div>

            <div style={{ marginTop: "42px", display: "flex", alignItems: "center", gap: "16px" }}>
              <a className="aurora-cta" style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#38bdf8", color: "#0b1322", fontSize: "16.5px", fontWeight: 600, padding: "17px 36px", borderRadius: "13px", textDecoration: "none", cursor: "pointer", boxShadow: "0 12px 40px rgba(56,189,248,0.4)", transition: "all .3s cubic-bezier(.2,.7,.2,1)" }}>احجز لقاءً مبدئيًا مجانيًا</a>
              <span style={{ fontSize: "13.5px", color: "rgba(234,243,255,0.42)", fontWeight: 300 }}>دون التزام · ١٥ دقيقة</span>
            </div>
          </div>

          {/* orbital universe */}
          <div style={{ flex: "none", width: "520px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "500px", height: "500px", animation: "au_groupIn 1.5s cubic-bezier(.2,.7,.2,1) both" }}>

              {/* halo */}
              <div style={{ position: "absolute", inset: "6%", borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%,rgba(56,189,248,0.12),rgba(56,189,248,0) 70%)" }} />

              {/* rings (coalesce inward on load) */}
              <div style={{ position: "absolute", inset: "2.5%", borderRadius: "50%", border: "1px solid rgba(120,160,210,0.15)", animation: "au_ringGlow 8s ease-in-out infinite, au_ringsIn 1.5s cubic-bezier(.2,.7,.2,1) both" }} />
              <div style={{ position: "absolute", inset: "13%", borderRadius: "50%", border: "1px dashed rgba(56,189,248,0.26)", animation: "au_spin 40s linear infinite, au_ringsIn 1.5s cubic-bezier(.2,.7,.2,1) .1s both" }} />
              <div style={{ position: "absolute", inset: "24%", borderRadius: "50%", border: "1px solid rgba(127,212,255,0.22)", animation: "au_spinR 30s linear infinite, au_ringGlow2 7s ease-in-out infinite, au_ringsIn 1.5s cubic-bezier(.2,.7,.2,1) .2s both" }} />

              {/* core halo + core (behind moons) */}
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "230px", height: "230px", borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(50% 50% at 50% 50%,rgba(56,189,248,0.22),rgba(56,189,248,0) 70%)", animation: "au_coreHalo 6s ease-in-out infinite", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "150px", height: "150px", borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(50% 50% at 50% 42%,rgba(20,38,70,0.96),rgba(9,16,32,0.98))", border: "1px solid rgba(56,189,248,0.42)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "au_corePulse 6s ease-in-out infinite, au_coreIn 1.3s cubic-bezier(.2,.7,.2,1) both" }}>
                <div style={{ fontSize: "31px", fontWeight: 600, color: "#eaf3ff", animation: "au_coreText 6s ease-in-out infinite" }}>طلاقة</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", letterSpacing: "0.22em", color: "rgba(127,212,255,0.7)", marginTop: "4px" }}>FLUENCY</div>
              </div>

              {/* moon 1 · outer · ثقة في التحدّث */}
              <div style={{ position: "absolute", inset: "2.5%", animation: "au_spin 32s linear infinite" }}>
                <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)" }}>
                  <div style={{ animation: "au_spinR 32s linear infinite" }}>
                    <div style={{ animation: "au_gather1 1.6s cubic-bezier(.16,.84,.3,1) .15s both", display: "flex", alignItems: "center", gap: "8px", padding: "9px 15px", borderRadius: "999px", background: "rgba(16,28,52,0.82)", border: "1px solid rgba(56,189,248,0.35)", boxShadow: "0 8px 24px rgba(5,8,16,0.5)", backdropFilter: "blur(6px)" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.9)" }} />
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "#eaf3ff", whiteSpace: "nowrap" }}>ثقة في التحدّث</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* moon 2 · mid · نُطق سليم (reverse orbit) */}
              <div style={{ position: "absolute", inset: "13%", animation: "au_spinR 26s linear -8.6s infinite" }}>
                <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)" }}>
                  <div style={{ animation: "au_spin 26s linear -8.6s infinite" }}>
                    <div style={{ animation: "au_gather2 1.6s cubic-bezier(.16,.84,.3,1) .3s both", display: "flex", alignItems: "center", gap: "8px", padding: "9px 15px", borderRadius: "999px", background: "rgba(16,28,52,0.82)", border: "1px solid rgba(127,212,255,0.35)", boxShadow: "0 8px 24px rgba(5,8,16,0.5)", backdropFilter: "blur(6px)" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7fd4ff", boxShadow: "0 0 8px rgba(127,212,255,0.9)" }} />
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "#eaf3ff", whiteSpace: "nowrap" }}>نُطق سليم</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* moon 3 · inner · حضور واثق */}
              <div style={{ position: "absolute", inset: "24%", animation: "au_spin 38s linear -25.3s infinite" }}>
                <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)" }}>
                  <div style={{ animation: "au_spinR 38s linear -25.3s infinite" }}>
                    <div style={{ animation: "au_gather3 1.6s cubic-bezier(.16,.84,.3,1) .45s both", display: "flex", alignItems: "center", gap: "8px", padding: "9px 15px", borderRadius: "999px", background: "rgba(16,28,52,0.82)", border: "1px solid rgba(56,189,248,0.32)", boxShadow: "0 8px 24px rgba(5,8,16,0.5)", backdropFilter: "blur(6px)" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.9)" }} />
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "#eaf3ff", whiteSpace: "nowrap" }}>حضور واثق</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* orbiting light dots */}
              <div style={{ position: "absolute", inset: "13%", animation: "au_spin 22s linear -11s infinite" }}>
                <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%)", width: "9px", height: "9px", borderRadius: "50%", background: "#7fd4ff", boxShadow: "0 0 12px rgba(127,212,255,0.9)" }} />
              </div>
              <div style={{ position: "absolute", inset: "24%", animation: "au_spinR 18s linear -5s infinite" }}>
                <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px rgba(56,189,248,0.9)" }} />
              </div>

              {/* twinkles (gold appears once) */}
              <div style={{ position: "absolute", top: "14%", left: "22%", width: "4px", height: "4px", borderRadius: "50%", background: "#7fd4ff", animation: "au_twinkle 3.6s ease-in-out infinite" }} />
              <div style={{ position: "absolute", top: "78%", left: "80%", width: "4px", height: "4px", borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 8px rgba(251,191,36,0.7)", animation: "au_twinkle 4.2s ease-in-out infinite .8s" }} />
              <div style={{ position: "absolute", top: "84%", left: "18%", width: "3px", height: "3px", borderRadius: "50%", background: "#38bdf8", animation: "au_twinkle 4.6s ease-in-out infinite 1.4s" }} />
            </div>
          </div>
        </div>

        {/* bottom meta */}
        <div style={{ position: "absolute", zIndex: 6, bottom: "32px", right: "56px", fontFamily: "'Inter',sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: "rgba(234,243,255,0.34)" }}>٠١ — الأطروحة</div>
        <div style={{ position: "absolute", zIndex: 6, bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", animation: "au_scrollCue 2.6s ease-in-out infinite" }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", letterSpacing: "0.24em", color: "rgba(234,243,255,0.5)" }}>SCROLL</span>
          <div style={{ width: "1px", height: "24px", background: "linear-gradient(180deg,rgba(56,189,248,0.7),rgba(56,189,248,0))" }} />
        </div>

      </div>
    </>
  );
}
