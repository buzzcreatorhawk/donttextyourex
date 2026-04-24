import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > 80);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const problems = [
    { icon: "🌙", text: "It's 2am and you can't stop checking their Instagram." },
    { icon: "🔄", text: "The same thoughts on loop. Every conversation replayed." },
    { icon: "📱", text: "Your thumb hovering over their name for the hundredth time." },
    { icon: "🪞", text: "Not recognising the person staring back at you." },
  ];

  const chapters = [
    { num: "01", title: "What's in your mind right now — the five stages, named." },
    { num: "02", title: "Discipline as self-sacrifice — give your pain a job." },
    { num: "03", title: "The power of goals — starting from the floor." },
    { num: "04", title: "Rebuilding — the diamond under the coal." },
    { num: "05", title: "Support system — the message Mark almost didn't send." },
    { num: "06", title: "Moving forward — protecting what's yours." },
  ];

  const features = [
    { icon: "🚫", title: "Don't Text Your Ex", desc: "Intercepts the urge and redirects it into something real. Instantly." },
    { icon: "📊", title: "No Contact Counter", desc: "Track every day of distance. Watch the number grow. That number is you." },
    { icon: "📖", title: "Daily Thought", desc: "One line from the book. Delivered when you need it most." },
    { icon: "🏃", title: "Habit Tracker", desc: "Eight habits. One tap each. Small wins that build a life." },
  ];

  // Palette — dark to light journey
  const dark = "#12120e";
  const darkMid = "#1a1c16";
  const transition1 = "#232b1e"; // dark green
  const transition2 = "#2d3d28"; // forest
  const transition3 = "#3d5235"; // sage
  const light1 = "#f0ede6";      // warm cream
  const light2 = "#e8e4db";      // slightly darker cream
  const accent = "#E94560";      // red — crisis colour
  const green = "#3a7d4a";       // hopeful green
  const greenLight = "#4a9d5a";  // lighter green
  const gold = "#c8963c";        // warm gold

  return (
    <div style={{ margin:0, padding:0, fontFamily:"Georgia,serif", overflowX:"hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.9}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .fu{animation:fadeUp 0.8s ease forwards;opacity:0;}
        .fu1{animation-delay:0.1s}.fu2{animation-delay:0.25s}.fu3{animation-delay:0.4s}.fu4{animation-delay:0.55s}.fu5{animation-delay:0.7s}
        .btn{transition:all 0.2s ease;cursor:pointer;}
        .btn:hover{opacity:0.88;transform:translateY(-2px);}
        .card{transition:transform 0.2s ease,box-shadow 0.2s ease;}
        .card:hover{transform:translateY(-3px);}
        input:focus{outline:none;}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#12120e}::-webkit-scrollbar-thumb{background:#3a7d4a;border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"14px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", background: navVisible ? "rgba(18,18,14,0.96)" : "transparent", backdropFilter: navVisible ? "blur(16px)" : "none", borderBottom: navVisible ? "1px solid rgba(58,125,74,0.15)" : "none", transition:"all 0.4s ease" }}>
        <div style={{ fontSize:10, letterSpacing:4, color: navVisible ? green : "rgba(240,237,230,0.5)", textTransform:"uppercase", transition:"color 0.4s ease" }}>Survival Guide</div>
        <button className="btn" style={{ background:accent, color:"#fff", border:"none", borderRadius:100, padding:"10px 22px", fontSize:12, fontFamily:"Georgia,serif", letterSpacing:0.5 }}>Get the Book →</button>
      </nav>

      {/* ── HERO — DARK ── */}
      <section style={{ minHeight:"100vh", background:`linear-gradient(160deg,${dark} 0%,${darkMid} 60%,${dark} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 40px 100px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {/* Subtle glow */}
        <div style={{ position:"absolute", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(58,125,74,0.06) 0%,transparent 65%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
        {/* Grain texture */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", pointerEvents:"none" }}/>

        <div className="fu fu1" style={{ fontSize:9, letterSpacing:5, color:accent, textTransform:"uppercase", marginBottom:24 }}>How to Get Over a Breakup</div>
        <h1 className="fu fu2" style={{ fontSize:"clamp(44px,7vw,84px)", fontWeight:"normal", lineHeight:1.05, color:light1, marginBottom:18, maxWidth:680 }}>A Survival Guide<br/>For Men</h1>
        <p className="fu fu3" style={{ fontSize:"clamp(15px,2vw,20px)", color:"rgba(58,125,74,0.9)", fontStyle:"italic", marginBottom:28, letterSpacing:0.5 }}>Written by someone who's been there.</p>
        <p className="fu fu4" style={{ fontSize:15, lineHeight:1.95, color:"rgba(240,237,230,0.45)", maxWidth:500, marginBottom:52, fontStyle:"italic" }}>
          You're not sleeping. You're checking their Instagram at midnight.<br/>
          You're replaying conversations that go nowhere.<br/>
          This book — and this app — were built for that moment.
        </p>
        <div className="fu fu5" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          <button className="btn" style={{ background:accent, color:"#fff", border:"none", borderRadius:100, padding:"17px 38px", fontSize:14, fontFamily:"Georgia,serif", boxShadow:"0 8px 32px rgba(233,69,96,0.28)" }}>Get the Book on Amazon →</button>
          <button className="btn" style={{ background:"transparent", color:"rgba(58,125,74,0.9)", border:"1px solid rgba(58,125,74,0.3)", borderRadius:100, padding:"17px 38px", fontSize:14, fontFamily:"Georgia,serif" }}>Download the App</button>
        </div>
        <div style={{ position:"absolute", bottom:38, display:"flex", flexDirection:"column", alignItems:"center", gap:8, color:"rgba(240,237,230,0.2)", fontSize:9, letterSpacing:3 }}>
          <div style={{ width:1, height:44, background:`linear-gradient(to bottom,rgba(58,125,74,0.6),transparent)`, animation:"pulse 2s ease-in-out infinite" }}/>
          SCROLL
        </div>
      </section>

      {/* ── PROBLEM — STILL DARK ── */}
      <section style={{ padding:"100px 40px", background:`linear-gradient(180deg,${dark} 0%,${darkMid} 100%)` }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:9, letterSpacing:4, color:green, textTransform:"uppercase", marginBottom:18 }}>Sound familiar?</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,50px)", fontWeight:"normal", color:light1, lineHeight:1.2, marginBottom:18 }}>You know exactly<br/>what this feels like.</h2>
          <p style={{ fontSize:15, color:"rgba(240,237,230,0.4)", fontStyle:"italic", lineHeight:1.9, maxWidth:480, margin:"0 auto 52px" }}>And you also know you shouldn't text them. But knowing and doing are two different things at 2am.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:14 }}>
            {problems.map((p,i) => (
              <div key={i} className="card" style={{ background:"rgba(233,69,96,0.04)", border:"1px solid rgba(233,69,96,0.1)", borderRadius:20, padding:"28px 22px", textAlign:"left" }}>
                <div style={{ fontSize:28, marginBottom:16 }}>{p.icon}</div>
                <p style={{ fontSize:13, lineHeight:1.8, color:"rgba(240,237,230,0.55)", fontStyle:"italic" }}>{p.text}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize:16, color:"rgba(240,237,230,0.35)", fontStyle:"italic", lineHeight:1.85, maxWidth:520, margin:"52px auto 0" }}>
            This isn't a therapy manual. This isn't a list of affirmations.<br/>
            This is a blueprint — written by a man who's been on the floor<br/>and figured out how to get back up.
          </p>
        </div>
      </section>

      {/* ── TRANSITION — DARK TO FOREST ── */}
      <section style={{ padding:"100px 40px", background:`linear-gradient(180deg,${darkMid} 0%,${transition1} 50%,${transition2} 100%)` }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:60, alignItems:"center" }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:4, color:greenLight, textTransform:"uppercase", marginBottom:18 }}>The Book</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:"normal", color:light1, lineHeight:1.2, marginBottom:20 }}>Six chapters.<br/>One goal.<br/>Get you back.</h2>
            <p style={{ fontSize:14, color:"rgba(240,237,230,0.55)", lineHeight:1.9, marginBottom:36, fontStyle:"italic" }}>Short on purpose. We won't dwell on what went wrong. We'll focus on how to get out of the hole you're in.</p>
            {/* Book cover */}
            <div style={{ marginBottom:36 }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                <img
                  src="https://m.media-amazon.com/images/I/8155kpdVNkL._SY522_.jpg"
                  alt="How to Get Over a Breakup — A Survival Guide For Men by Kamil Zalenski"
                  style={{ width:160, borderRadius:8, boxShadow:"0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(233,69,96,0.2)", display:"block" }}
                />
                <div style={{ position:"absolute", top:-8, right:-8, background:accent, color:"#fff", borderRadius:100, padding:"4px 10px", fontSize:9, letterSpacing:1, fontWeight:"bold", fontFamily:"Georgia,serif" }}>ON AMAZON</div>
              </div>
            </div>
            <button className="btn" style={{ background:accent, color:"#fff", border:"none", borderRadius:100, padding:"15px 34px", fontSize:14, fontFamily:"Georgia,serif", boxShadow:"0 6px 24px rgba(233,69,96,0.25)" }}>Read on Amazon →</button>
          </div>
          <div className="card" style={{ background:"rgba(240,237,230,0.04)", border:"1px solid rgba(240,237,230,0.1)", borderRadius:24, padding:"32px 28px" }}>
            <div style={{ fontSize:8, letterSpacing:3, color:greenLight, marginBottom:18 }}>WHAT'S INSIDE</div>
            <div style={{ fontSize:19, color:light1, marginBottom:6, fontWeight:"normal" }}>How to Get Over a Breakup</div>
            <div style={{ fontSize:11, color:greenLight, marginBottom:26, letterSpacing:1 }}>A Survival Guide For Men — Kamil Zalenski</div>
            {chapters.map((c,i) => (
              <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"12px 0", borderBottom:"1px solid rgba(240,237,230,0.07)", fontSize:13, color:"rgba(240,237,230,0.58)", lineHeight:1.55 }}>
                <span style={{ fontSize:9, color:greenLight, letterSpacing:2, minWidth:26, paddingTop:2 }}>{c.num}</span>
                <span>{c.title}</span>
              </div>
            ))}
            <div style={{ fontSize:11, color:"rgba(240,237,230,0.28)", fontStyle:"italic", marginTop:18 }}>+ The 25-quality exercise that changes everything.</div>
          </div>
        </div>
      </section>

      {/* ── QUOTE 1 — FOREST ── */}
      <section style={{ padding:"90px 40px", background:transition2, textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ width:36, height:1, background:greenLight, margin:"0 auto 32px" }}/>
          <p style={{ fontSize:"clamp(19px,3vw,32px)", fontStyle:"italic", lineHeight:1.65, color:light1, marginBottom:20 }}>"The pain is fuel. The only question is what you point it at."</p>
          <p style={{ fontSize:11, color:greenLight, letterSpacing:3 }}>— CHAPTER 4, REBUILDING YOUR LIFE</p>
        </div>
      </section>

      {/* ── APP — SAGE TO LIGHT ── */}
      <section style={{ padding:"100px 40px", background:`linear-gradient(180deg,${transition2} 0%,${transition3} 40%,#5a7a4a 100%)` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontSize:9, letterSpacing:4, color:"rgba(240,237,230,0.7)", textTransform:"uppercase", marginBottom:18 }}>The App</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:"normal", color:light1, lineHeight:1.3 }}>For the 2am moment.<br/>Right in your pocket.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:56, alignItems:"center" }}>
            {/* Phone mockup */}
            <div style={{ background:"#141814", borderRadius:30, padding:"24px 18px 18px", border:"1px solid rgba(240,237,230,0.1)", boxShadow:"0 32px 70px rgba(0,0,0,0.4)", maxWidth:320, margin:"0 auto", animation:"float 4s ease-in-out infinite" }}>
              <div style={{ fontSize:8, letterSpacing:3, color:accent, marginBottom:14, textAlign:"center" }}>DON'T TEXT YOUR EX</div>
              <div style={{ background:"linear-gradient(135deg,#1c0810,#2a0d18)", border:`2px solid ${accent}`, borderRadius:14, padding:"16px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>🚫</span>
                <div>
                  <div style={{ fontSize:13, color:accent, fontWeight:"bold", marginBottom:2 }}>Don't Text Your Ex</div>
                  <div style={{ fontSize:9, color:"rgba(233,69,96,0.5)" }}>Tap for an instant redirect</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:10 }}>
                {["🚿 Cold Shower ✓","🏃 Exercise ✓","🚫 No Contact","📓 Journal"].map((h,i) => (
                  <div key={i} style={{ background:i<2?"rgba(39,174,96,0.13)":"rgba(42,157,110,0.04)", border:`1px solid ${i<2?"#27AE60":"rgba(42,157,110,0.1)"}`, borderRadius:9, padding:"9px", fontSize:10, color:i<2?"#27AE60":"#8a9a88" }}>{h}</div>
                ))}
              </div>
              <div style={{ background:"rgba(42,157,110,0.06)", border:"1px solid rgba(42,157,110,0.12)", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:7, letterSpacing:2, color:"#2a9d6e", marginBottom:5 }}>TODAY'S THOUGHT</div>
                <div style={{ fontSize:10, color:"rgba(240,240,236,0.55)", fontStyle:"italic", lineHeight:1.5 }}>"The goal right now isn't transformation. It's interruption."</div>
              </div>
            </div>
            {/* Features */}
            <div style={{ display:"flex", flexDirection:"column", gap:26 }}>
              {features.map((f,i) => (
                <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:"rgba(240,237,230,0.1)", border:"1px solid rgba(240,237,230,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize:14, color:light1, marginBottom:5, fontWeight:"bold" }}>{f.title}</div>
                    <div style={{ fontSize:12, color:"rgba(240,237,230,0.55)", lineHeight:1.7 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
              <button className="btn" style={{ background:"rgba(240,237,230,0.1)", color:light1, border:"1px solid rgba(240,237,230,0.2)", borderRadius:100, padding:"14px 28px", fontSize:13, fontFamily:"Georgia,serif", alignSelf:"flex-start", marginTop:8 }}>Download Free →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTE 2 — EMERGING INTO LIGHT ── */}
      <section style={{ padding:"90px 40px", background:`linear-gradient(180deg,#5a7a4a 0%,#8aaa7a 50%,#b5c9a5 100%)`, textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ width:36, height:1, background:"rgba(255,255,255,0.4)", margin:"0 auto 32px" }}/>
          <p style={{ fontSize:"clamp(18px,2.8vw,28px)", fontStyle:"italic", lineHeight:1.7, color:"#1a2a14", marginBottom:20 }}>"Somewhere underneath the coal of all this pain, there is a diamond. It was always there. The breakup didn't create it. But it created the pressure."</p>
          <p style={{ fontSize:11, color:"rgba(26,42,20,0.6)", letterSpacing:3 }}>— CHAPTER 4, REBUILDING YOUR LIFE</p>
        </div>
      </section>

      {/* ── EMAIL — FULL LIGHT ── */}
      <section style={{ padding:"110px 40px", background:`linear-gradient(180deg,#b5c9a5 0%,${light1} 40%,${light2} 100%)`, textAlign:"center" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ fontSize:9, letterSpacing:4, color:green, textTransform:"uppercase", marginBottom:18 }}>Free download</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:"normal", color:"#1a2a14", lineHeight:1.3, marginBottom:16 }}>Get the free<br/>habit tracker.</h2>
          <p style={{ fontSize:15, color:"rgba(26,42,20,0.55)", fontStyle:"italic", lineHeight:1.9, marginBottom:40 }}>A companion to the book. 12 months of habit tracking, progress charts, and weekly reflections. Free when you join the list.</p>
          {!submitted ? (
            <>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                <input
                  style={{ flex:1, minWidth:210, background:"rgba(26,42,20,0.06)", border:"1px solid rgba(26,42,20,0.2)", borderRadius:100, padding:"15px 24px", fontSize:14, color:"#1a2a14", fontFamily:"Georgia,serif" }}
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e=>setEmail(e.target.value)}
                />
                <button className="btn" onClick={()=>email&&setSubmitted(true)} style={{ background:green, color:"#fff", border:"none", borderRadius:100, padding:"15px 28px", fontSize:14, fontFamily:"Georgia,serif", whiteSpace:"nowrap", boxShadow:"0 6px 20px rgba(58,125,74,0.25)" }}>Send it →</button>
              </div>
              <p style={{ fontSize:11, color:"rgba(26,42,20,0.35)", marginTop:14, fontStyle:"italic" }}>No spam. One email with your tracker. That's it.</p>
            </>
          ) : (
            <div style={{ padding:"28px", background:"rgba(58,125,74,0.08)", border:"1px solid rgba(58,125,74,0.2)", borderRadius:20 }}>
              <div style={{ fontSize:20, color:green, marginBottom:8 }}>Done. Check your inbox.</div>
              <div style={{ fontSize:13, color:"rgba(26,42,20,0.45)", fontStyle:"italic" }}>Your tracker is on its way.</div>
            </div>
          )}
        </div>
      </section>

      {/* ── AUTHOR NOTE — LIGHT ── */}
      <section style={{ padding:"80px 40px", background:light2, textAlign:"center" }}>
        <div style={{ maxWidth:620, margin:"0 auto" }}>
          <div style={{ width:36, height:1, background:green, margin:"0 auto 32px" }}/>
          <p style={{ fontSize:"clamp(14px,2vw,17px)", fontStyle:"italic", lineHeight:1.9, color:"rgba(26,42,20,0.6)", marginBottom:24 }}>
            "I'm not a therapist. I'm not a life coach. What I have is this — I've been the person you are right now. The 2am person. I also know, because I've been here more than once, how to get out."
          </p>
          <p style={{ fontSize:13, color:green, letterSpacing:1 }}>— Kamil Zalenski</p>
        </div>
      </section>

      {/* ── FOOTER — WARM LIGHT ── */}
      <footer style={{ padding:"44px 40px", background:light1, borderTop:"1px solid rgba(26,42,20,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
        <div style={{ fontSize:11, color:"rgba(26,42,20,0.3)", letterSpacing:1 }}>© 2025 Kamil Zalenski · How to Get Over a Breakup</div>
        <div style={{ fontSize:13, color:green, fontStyle:"italic" }}>"Go live your life."</div>
      </footer>
    </div>
  );
}
