import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3001";

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#070b12",
  surface: "#0d1220",
  card:    "#111827",
  card2:   "#161f30",
  border:  "#1e2d45",
  border2: "#263548",
  accent:  "#3b82f6",
  accent2: "#60a5fa",
  teal:    "#14b8a6",
  green:   "#22c55e",
  red:     "#ef4444",
  amber:   "#f59e0b",
  purple:  "#a78bfa",
  text:    "#e2e8f0",
  muted:   "#64748b",
  muted2:  "#475569",
  cream:   "#f1f5f9",
};

// ─── JOBS ─────────────────────────────────────────────────────────────────────
const BASE_JOBS = [
  { id:1, title:"Senior Frontend Engineer",  company:"TechNova",      location:"San Francisco",  salary:"$130k–$170k", skills:["React","TypeScript","GraphQL","CSS","Node.js"],            category:"Engineering" },
  { id:2, title:"Full Stack Developer",       company:"CloudBase",     location:"Remote",         salary:"$110k–$145k", skills:["Python","React","PostgreSQL","Docker","AWS"],              category:"Engineering" },
  { id:3, title:"Machine Learning Engineer",  company:"AI Dynamics",   location:"New York",       salary:"$150k–$200k", skills:["Python","TensorFlow","PyTorch","NLP","SQL"],               category:"AI/ML"       },
  { id:4, title:"Data Scientist",             company:"DataMind",      location:"Austin TX",      salary:"$120k–$160k", skills:["Python","R","Machine Learning","Statistics","Tableau"],   category:"Data"        },
  { id:5, title:"DevOps Engineer",            company:"InfraScale",    location:"Seattle WA",     salary:"$125k–$165k", skills:["Kubernetes","Docker","AWS","Terraform","CI/CD"],           category:"DevOps"      },
  { id:6, title:"Product Manager",            company:"LaunchPad",     location:"Boston MA",      salary:"$115k–$150k", skills:["Product Strategy","Agile","Roadmapping","Analytics","Communication"], category:"Product" },
  { id:7, title:"UX Designer",               company:"PixelCraft",    location:"Los Angeles",    salary:"$95k–$130k",  skills:["Figma","User Research","Prototyping","CSS","Design Systems"], category:"Design"   },
  { id:8, title:"Backend Engineer",           company:"StreamFlow",    location:"Remote",         salary:"$135k–$175k", skills:["Go","gRPC","Kafka","PostgreSQL","Redis"],                  category:"Engineering" },
  { id:9, title:"Cloud Architect",            company:"NebulaTech",    location:"Austin TX",      salary:"$160k–$210k", skills:["AWS","Azure","Terraform","Kubernetes","Docker"],           category:"DevOps"      },
  { id:10,title:"AI Research Engineer",       company:"DeepMind Labs",  location:"Remote",        salary:"$170k–$220k", skills:["Python","PyTorch","Research","Mathematics","NLP"],        category:"AI/ML"       },
];

function calcMatch(userSkills, jobSkills) {
  if (!userSkills?.length) return 0;
  const n = s => s.toLowerCase().replace(/[^a-z0-9]/g,"");
  const hits = jobSkills.filter(j => userSkills.some(u => n(u).includes(n(j)) || n(j).includes(n(u))));
  return Math.round((hits.length / jobSkills.length) * 100);
}

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
const LS = {
  // users: { email: { name, email, passwordHash } }
  getUsers: () => JSON.parse(localStorage.getItem("raiUsers") || "{}"),
  saveUsers: (u) => localStorage.setItem("raiUsers", JSON.stringify(u)),

  // per-user resume data keyed by email
  getUserData: (email) => JSON.parse(localStorage.getItem(`raiData_${email}`) || "null"),
  saveUserData: (email, data) => localStorage.setItem(`raiData_${email}`, JSON.stringify(data)),
  clearUserData: (email) => localStorage.removeItem(`raiData_${email}`),

  // current session
  getSession: () => JSON.parse(localStorage.getItem("raiSession") || "null"),
  saveSession: (user) => localStorage.setItem("raiSession", JSON.stringify(user)),
  clearSession: () => localStorage.removeItem("raiSession"),
};

function hashPassword(pw) {
  // simple hash for demo (use bcrypt in production)
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  return h.toString(36);
}

// ─── MINI UI ──────────────────────────────────────────────────────────────────
function Spin({ size=20, color=C.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{animation:"spin .8s linear infinite",flexShrink:0}}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="35 57" strokeLinecap="round"/>
    </svg>
  );
}

function Ring({ value=0, size=100, color=C.accent }) {
  const r = (size-10)/2, circ = 2*Math.PI*r, dash = (value/100)*circ;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border2} strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:size*.19,fontWeight:700,color}}>{value}</span>
      </div>
    </div>
  );
}

function Bar({ label, val, color=C.accent }) {
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:13,color:C.text}}>{label}</span>
        <span style={{fontSize:12,color,fontFamily:"'JetBrains Mono',monospace"}}>{val}%</span>
      </div>
      <div style={{height:4,background:C.border2,borderRadius:99,overflow:"hidden"}}>
        <div style={{width:`${val}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${color},${color}bb)`,transition:"width 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
    </div>
  );
}

function Badge({ label, color=C.accent, size="sm" }) {
  const p = size==="sm" ? "2px 9px" : "4px 12px";
  const fs = size==="sm" ? 11 : 12;
  return <span style={{padding:p,borderRadius:99,fontSize:fs,fontWeight:600,letterSpacing:.3,border:`1px solid ${color}44`,background:`${color}14`,color,display:"inline-block"}}>{label}</span>;
}

function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
      <div style={{flex:1,height:1,background:C.border}}/>
      {label && <span style={{fontSize:12,color:C.muted2}}>{label}</span>}
      <div style={{flex:1,height:1,background:C.border}}/>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // auth
  const [user, setUser]         = useState(null);
  const [page, setPage]         = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"" });
  const [authErr, setAuthErr]   = useState("");

  // resume
  const [resumeText, setResumeText]   = useState("");
  const [fileName, setFileName]       = useState("");
  const [parseStatus, setParseStatus] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  // results
  const [result, setResult]     = useState(null);
  const [jobs, setJobs]         = useState(BASE_JOBS);
  const [tab, setTab]           = useState("overview");
  const [catFilter, setCat]     = useState("All");

  // features
  const [cover, setCover]             = useState("");
  const [coverJob, setCoverJob]       = useState(null);
  const [genCover, setGenCover]       = useState(false);
  const [rewrittenResume, setRewritten] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  // chat
  const [chat, setChat]       = useState([]);
  const [chatIn, setChatIn]   = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  const fileRef    = useRef();
  const chatEndRef = useRef();

  // ── restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const session = LS.getSession();
    if (session) {
      setUser(session);
      const saved = LS.getUserData(session.email);
      if (saved) {
        setResult(saved.result || null);
        setJobs(saved.jobs || BASE_JOBS);
        setCover(saved.cover || "");
        setCoverJob(saved.coverJob || null);
        setChat(saved.chat || []);
        setRewritten(saved.rewrittenResume || "");
        setPage("dashboard");
      } else {
        setPage("upload");
      }
    }
  }, []);

  // ── save user data whenever anything changes ──────────────────────────────
  useEffect(() => {
    if (user && result) {
      LS.saveUserData(user.email, { result, jobs, cover, coverJob, chat, rewrittenResume });
    }
  }, [result, jobs, cover, coverJob, chat, rewrittenResume]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chat]);

  // ── CSS injection ─────────────────────────────────────────────────────────
  useEffect(() => {
    const s = document.createElement("style");
    s.id = "rai-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{background:${C.bg};color:${C.text};font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;min-height:100vh}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      @keyframes slideR{from{transform:translateX(-12px);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes slideL{from{transform:translateX(12px);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes borderGlow{0%,100%{border-color:${C.accent}44}50%{border-color:${C.accent}99}}
      .pu{animation:fadeUp .45s ease forwards}
      .sl{animation:slideR .35s ease forwards}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:99px}

      .btn{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:9px;
        font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .18s;font-size:14px}
      .btn:disabled{opacity:.45;cursor:not-allowed!important;transform:none!important}

      .btn-primary{background:${C.accent};color:#fff;padding:11px 26px}
      .btn-primary:hover:not(:disabled){background:${C.accent2};transform:translateY(-1px);box-shadow:0 6px 20px ${C.accent}44}

      .btn-ghost{background:transparent;color:${C.text};border:1px solid ${C.border2};padding:10px 22px}
      .btn-ghost:hover{border-color:${C.accent}88;color:${C.accent2}}

      .btn-sm{padding:7px 15px;font-size:12px;border-radius:7px}
      .btn-teal{background:${C.teal};color:#fff;padding:11px 24px}
      .btn-teal:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
      .btn-danger{background:transparent;color:${C.red};border:1px solid ${C.red}44;padding:7px 14px;font-size:12px;border-radius:7px}
      .btn-danger:hover{background:${C.red}11}

      input,textarea{
        background:${C.surface};border:1px solid ${C.border};color:${C.text};
        border-radius:9px;padding:11px 15px;font-size:14px;
        font-family:'Plus Jakarta Sans',sans-serif;outline:none;
        transition:border-color .2s,box-shadow .2s;width:100%
      }
      input:focus,textarea:focus{border-color:${C.accent}77;box-shadow:0 0 0 3px ${C.accent}11}
      input::placeholder,textarea::placeholder{color:${C.muted2}}

      .card{background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:22px}
      .card-hover{transition:all .22s}
      .card-hover:hover{border-color:${C.border2};transform:translateY(-2px);box-shadow:0 8px 28px #00000055}

      .tab-nav{display:flex;gap:3px;background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:4px}
      .tab-item{padding:7px 16px;border-radius:7px;border:none;cursor:pointer;font-size:13px;
        font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;white-space:nowrap}
      .tab-item.on{background:${C.card2};color:${C.accent2};box-shadow:0 1px 4px #00000033}
      .tab-item.off{background:transparent;color:${C.muted}}
      .tab-item:hover{color:${C.text}}

      .input-label{font-size:11px;font-weight:700;letter-spacing:.8px;color:${C.muted};display:block;margin-bottom:7px;text-transform:uppercase}

      .upload-zone{border:2px dashed ${C.border2};border-radius:14px;padding:44px 28px;
        text-align:center;cursor:pointer;transition:all .25s;background:${C.surface}}
      .upload-zone:hover,.upload-zone.ready{border-color:${C.teal}77;background:${C.teal}08}

      .step-progress{display:flex;gap:6px;align-items:center}
      .step-dot{height:4px;border-radius:99px;transition:all .4s}

      .nav{padding:13px 36px;display:flex;justify-content:space-between;align-items:center;
        border-bottom:1px solid ${C.border};position:sticky;top:0;z-index:100;
        background:${C.bg}f5;backdrop-filter:blur(20px)}

      .logo{display:flex;align-items:center;gap:9px}
      .logo-icon{width:30px;height:30px;background:${C.accent};border-radius:8px;
        display:flex;align-items:center;justify-content:center}
      .logo-text{font-weight:800;font-size:17px;color:${C.cream};letter-spacing:-.3px}

      .section-title{font-size:22px;font-weight:800;color:${C.cream};letter-spacing:-.4px;margin-bottom:4px}
      .section-sub{font-size:13px;color:${C.muted};margin-bottom:20px}

      .stat-card{background:${C.card};border:1px solid ${C.border};border-radius:12px;
        padding:18px 22px;display:flex;flex-direction:column;gap:4px}
      .stat-value{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700}
      .stat-label{font-size:11px;color:${C.muted};letter-spacing:.6px;text-transform:uppercase}

      .job-row{background:${C.card};border:1px solid ${C.border};border-radius:12px;
        padding:18px 22px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;
        transition:all .2s;cursor:default}
      .job-row:hover{border-color:${C.border2};transform:translateY(-1px);box-shadow:0 6px 20px #00000044}

      .check-row{display:flex;align-items:center;gap:9px;margin-bottom:9px;font-size:13px}
      .check-icon{width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

      .chat-bubble-ai{background:${C.card2};border:1px solid ${C.border};border-radius:14px 14px 14px 3px}
      .chat-bubble-user{background:${C.accent}22;border:1px solid ${C.accent}44;border-radius:14px 14px 3px 14px}

      .download-btn{
        display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:9px;
        background:${C.teal};color:#fff;font-weight:700;font-size:13px;cursor:pointer;
        border:none;transition:all .18s;font-family:'Plus Jakarta Sans',sans-serif
      }
      .download-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
      .download-btn:disabled{opacity:.45;cursor:not-allowed}

      .glassmorphism{background:${C.card}cc;backdrop-filter:blur(12px);border:1px solid ${C.border}}
    `;
    document.head.appendChild(s);
    return () => { const el = document.getElementById("rai-styles"); if(el) el.remove(); };
  }, []);

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  function handleAuth(e) {
    e.preventDefault();
    setAuthErr("");
    const { name, email, password } = authForm;
    if (!email.trim() || !password.trim()) { setAuthErr("Please fill all fields."); return; }
    if (authMode === "register" && !name.trim()) { setAuthErr("Please enter your name."); return; }
    if (password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }

    const users = LS.getUsers();

    if (authMode === "register") {
      if (users[email]) { setAuthErr("This email is already registered."); return; }
      const newUser = { name: name.trim(), email: email.trim().toLowerCase(), passwordHash: hashPassword(password) };
      users[email] = newUser;
      LS.saveUsers(users);
      const sessionUser = { name: newUser.name, email: newUser.email };
      LS.saveSession(sessionUser);
      setUser(sessionUser);
      setPage("upload");
    } else {
      const found = users[email.trim().toLowerCase()];
      if (!found || found.passwordHash !== hashPassword(password)) {
        setAuthErr("Incorrect email or password.");
        return;
      }
      const sessionUser = { name: found.name, email: found.email };
      LS.saveSession(sessionUser);
      setUser(sessionUser);
      const saved = LS.getUserData(found.email);
      if (saved?.result) {
        setResult(saved.result);
        setJobs(saved.jobs || BASE_JOBS);
        setCover(saved.cover || "");
        setCoverJob(saved.coverJob || null);
        setChat(saved.chat || []);
        setRewritten(saved.rewrittenResume || "");
        setPage("dashboard");
      } else {
        setPage("upload");
      }
    }
  }

  function logout() {
    LS.clearSession();
    setUser(null);
    setResult(null);
    setJobs(BASE_JOBS);
    setCover("");
    setCoverJob(null);
    setChat([]);
    setResumeText("");
    setFileName("");
    setParseStatus("");
    setRewritten("");
    setTab("overview");
    setPage("landing");
  }

  // ─── FILE PARSE ───────────────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setParseStatus("parsing");
    setResumeText("");
    const fd = new FormData();
    fd.append("resume", file);
    try {
      const res = await fetch(`${API}/api/parse-resume`, { method:"POST", body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setResumeText(data.text);
      setParseStatus("done");
    } catch (err) {
      setParseStatus("error");
      setFileName("");
      alert(`Could not read file: ${err.message}\n\nPlease paste your resume text manually.`);
    }
  }

  // ─── AI ANALYZE ───────────────────────────────────────────────────────────
  const STEPS = [
    "Reading document structure…",
    "Extracting skills & experience…",
    "Scoring ATS compatibility…",
    "Matching jobs from database…",
    "Building recommendations…",
  ];

  async function analyzeResume() {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    const t = setInterval(() => setAnalyzeStep(s => Math.min(s+1, STEPS.length-1)), 2500);

    try {
      const prompt = `You are an expert ATS resume analyzer. Analyze the resume below carefully and return ONLY a valid JSON object. No markdown, no explanation, no code fences — pure JSON only.

{
  "name": "Full Name from resume",
  "title": "Current or target job title",
  "email": "email if found",
  "phone": "phone if found",
  "location": "city/country if found",
  "summary": "3-sentence professional summary you write about this candidate",
  "skills": ["skill1","skill2"],
  "softSkills": ["skill1","skill2"],
  "experience": [{"role":"Title","company":"Name","years":"2020–2023","highlights":["bullet1","bullet2"]}],
  "education": [{"degree":"Degree","school":"University","year":"2020","gpa":"if mentioned"}],
  "certifications": ["cert1","cert2"],
  "languages": ["English","etc"],
  "atsScore": 78,
  "resumeStrength": 72,
  "skillScore": 85,
  "overallScore": 78,
  "sections": {"hasContact":true,"hasSummary":true,"hasExperience":true,"hasEducation":true,"hasSkills":true,"hasProjects":false,"hasCertifications":false},
  "improvements": ["specific tip 1","specific tip 2","specific tip 3","specific tip 4","specific tip 5"],
  "missingSkills": ["skill1","skill2","skill3"],
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "atsIssues": ["issue1","issue2","issue3"],
  "strengths": ["strength1","strength2","strength3"],
  "careerPath": ["next role","then this","long term"],
  "interviewTips": ["tip1","tip2","tip3"],
  "industryFit": ["industry1","industry2","industry3"]
}

Resume:
${resumeText.slice(0, 4500)}`;

      const raw = await callAI([{ role:"user", content:prompt }]);
      const clean = raw.replace(/```json|```/g,"").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : clean);

      const scored = BASE_JOBS
        .map(j => ({ ...j, match: calcMatch(parsed.skills, j.skills) }))
        .sort((a,b) => b.match - a.match);

      setResult(parsed);
      setJobs(scored);
      setPage("dashboard");
      setTab("overview");
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check your server connection and try again.");
    }

    clearInterval(t);
    setIsAnalyzing(false);
  }

  // ─── GROQ CALL ────────────────────────────────────────────────────────────
  async function callAI(messages, system="") {
    const res = await fetch(`${API}/api/chat`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ messages, system }),
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    return (await res.json()).reply || "";
  }

  // ─── AI RESUME REWRITE ────────────────────────────────────────────────────
  async function rewriteResume() {
    if (!result || !resumeText) return;
    setIsRewriting(true);
    setTab("rewrite");
    try {
      const prompt = `You are a professional resume writer. Rewrite the resume below to be ATS-optimized, professional, and compelling. 

Rules:
- Fix all the issues: ${result.atsIssues?.join(", ")}
- Add the missing keywords: ${result.keywords?.join(", ")}
- Quantify achievements where possible
- Use strong action verbs
- Write a compelling professional summary
- Organize sections clearly: Contact → Summary → Experience → Skills → Education → Certifications
- Make it ready to copy-paste into any ATS system
- Format with clear section headers in ALL CAPS
- Use bullet points starting with •

Original resume:
${resumeText.slice(0, 4000)}

Candidate info from analysis:
Name: ${result.name}
Title: ${result.title}
Key skills: ${result.skills?.join(", ")}
Missing skills to add if relevant: ${result.missingSkills?.join(", ")}

Write the complete improved resume now:`;

      const reply = await callAI([{ role:"user", content:prompt }]);
      setRewritten(reply);
    } catch {
      setRewritten("Failed to generate. Please check server connection and try again.");
    }
    setIsRewriting(false);
  }

  // ─── DOWNLOAD AS TXT ─────────────────────────────────────────────────────
  function downloadResume() {
    if (!rewrittenResume) return;
    const blob = new Blob([rewrittenResume], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result?.name?.replace(/\s+/g,"_") || "resume"}_AI_Optimized.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── DOWNLOAD AS HTML (looks like a real resume) ─────────────────────────
  function downloadResumeHTML() {
    if (!rewrittenResume) return;
    const lines = rewrittenResume.split("\n");
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${result?.name || "Resume"} - AI Optimized</title>
<style>
  body{font-family:Georgia,serif;max-width:750px;margin:40px auto;padding:0 40px;color:#1a1a1a;line-height:1.6}
  h1{font-size:26px;margin-bottom:4px;color:#0a0a0a}
  .contact{font-size:13px;color:#555;margin-bottom:20px}
  h2{font-size:13px;font-weight:700;letter-spacing:1.5px;color:#0a0a0a;border-bottom:2px solid #0a0a0a;padding-bottom:4px;margin:20px 0 10px}
  p,li{font-size:13.5px;color:#222;margin-bottom:4px}
  ul{padding-left:18px;margin-bottom:10px}
  .summary{font-style:italic;color:#444;margin-bottom:16px}
</style></head><body>`;

    lines.forEach(line => {
      line = line.trim();
      if (!line) { html += "<br>"; return; }
      if (line.match(/^[A-Z\s&]+$/) && line.length > 2 && line.length < 40) {
        html += `<h2>${line}</h2>`;
      } else if (line.startsWith("•") || line.startsWith("-")) {
        html += `<ul><li>${line.replace(/^[•\-]\s*/,"")}</li></ul>`;
      } else if (lines.indexOf(line) < 3) {
        html += `<h1>${line}</h1>`;
      } else {
        html += `<p>${line}</p>`;
      }
    });

    html += "</body></html>";
    const blob = new Blob([html], { type:"text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result?.name?.replace(/\s+/g,"_") || "resume"}_AI_Optimized.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── COVER LETTER ─────────────────────────────────────────────────────────
  async function generateCover(job) {
    setGenCover(true);
    setCoverJob(job);
    setTab("cover");
    try {
      const txt = await callAI([{role:"user",content:`Write a professional, tailored cover letter for ${result?.name||"the candidate"} applying for ${job.title} at ${job.company}. Candidate skills: ${result?.skills?.join(", ")}. Job requires: ${job.skills.join(", ")}. 3 paragraphs, under 280 words. Be specific and enthusiastic. Include a strong opening hook.`}]);
      setCover(txt);
    } catch {
      setCover(`Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${job.company}. With my background in ${result?.skills?.slice(0,3).join(", ")}, I am confident I can make a meaningful contribution.\n\nThank you for your consideration.\n\nSincerely,\n${result?.name||"Candidate"}`);
    }
    setGenCover(false);
  }

  function downloadCoverLetter() {
    if (!cover) return;
    const blob = new Blob([cover], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CoverLetter_${coverJob?.company || "Company"}_${result?.name?.replace(/\s+/g,"_") || "candidate"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── AI CHAT ──────────────────────────────────────────────────────────────
  async function sendChat() {
    if (!chatIn.trim() || chatBusy) return;
    const msg = chatIn.trim();
    setChatIn("");
    const msgs = [...chat, { role:"user", content:msg }];
    setChat(msgs);
    setChatBusy(true);
    try {
      const ctx = result ? `Candidate: ${result.name}. Title: ${result.title}. Skills: ${result.skills?.join(", ")}. ATS: ${result.atsScore}/100. Overall: ${result.overallScore}/100.` : "";
      const reply = await callAI(msgs, `You are ResumeAI, an expert career coach and resume specialist. ${ctx} Give concise, specific, actionable advice. Use bullet points when listing items. Be direct and professional.`);
      setChat([...msgs, { role:"assistant", content:reply }]);
    } catch {
      setChat([...msgs, { role:"assistant", content:"Sorry, connection failed. Please try again." }]);
    }
    setChatBusy(false);
  }

  // ─── CLEAR USER DATA ──────────────────────────────────────────────────────
  function clearMyData() {
    if (!confirm("Delete your saved resume data? You'll need to re-upload.")) return;
    LS.clearUserData(user.email);
    setResult(null);
    setJobs(BASE_JOBS);
    setCover("");
    setCoverJob(null);
    setChat([]);
    setResumeText("");
    setFileName("");
    setParseStatus("");
    setRewritten("");
    setPage("upload");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LANDING
  // ═══════════════════════════════════════════════════════════════════════════
  if (page === "landing") return (
    <div style={{minHeight:"100vh",position:"relative"}}>
      <div style={{position:"fixed",top:"-10%",left:"-5%",width:600,height:600,background:`radial-gradient(circle,${C.accent}0c,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-5%",right:"-5%",width:700,height:700,background:`radial-gradient(circle,${C.teal}08,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>

      <nav className="nav">
        <div className="logo">
          <div className="logo-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <span className="logo-text">ResumeAI</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>{setAuthMode("login");setPage("auth")}}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={()=>{setAuthMode("register");setPage("auth")}}>Get Started Free</button>
        </div>
      </nav>

      <div style={{maxWidth:1060,margin:"0 auto",padding:"80px 40px 60px",textAlign:"center",position:"relative",zIndex:1}} className="pu">
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.teal}15`,border:`1px solid ${C.teal}33`,borderRadius:99,padding:"5px 14px",marginBottom:24}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite",display:"inline-block"}}/>
          <span style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1.2}}>POWERED BY GROQ AI · FREE TO USE</span>
        </div>

        <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:62,fontWeight:800,lineHeight:1.06,marginBottom:22,letterSpacing:-2,color:C.cream}}>
          The Smartest Way<br/>to Land Your{" "}
          <span style={{background:`linear-gradient(135deg,${C.accent},${C.teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Next Job
          </span>
        </h1>

        <p style={{fontSize:17,color:C.muted,maxWidth:500,margin:"0 auto 40px",lineHeight:1.8}}>
          Upload your resume. Get an instant ATS score, skill gaps, job matches, an AI-rewritten resume, and a personalized cover letter.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn btn-primary" style={{fontSize:15,padding:"13px 32px"}} onClick={()=>{setAuthMode("register");setPage("auth")}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Analyze My Resume
          </button>
          <button className="btn btn-ghost" style={{fontSize:15,padding:"13px 28px"}} onClick={()=>{setAuthMode("login");setPage("auth")}}>
            Sign In →
          </button>
        </div>

        {/* feature grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:72,textAlign:"left"}}>
          {[
            {icon:"🧠",title:"Deep AI Analysis",desc:"NLP-powered skill extraction, experience scoring, and ATS compatibility check."},
            {icon:"📄",title:"Resume Rewriter",desc:"AI rewrites your entire resume, optimized for ATS and tailored to your target role. Downloadable."},
            {icon:"💼",title:"Job Matching",desc:"Ranked job recommendations with color-coded skill gap visualization."},
            {icon:"✉️",title:"Cover Letter",desc:"One-click personalized cover letters for any job. Download instantly."},
            {icon:"📊",title:"Skill Gap Analysis",desc:"Know exactly which skills to learn for your dream role."},
            {icon:"🎯",title:"AI Career Coach",desc:"Chat with your AI coach for interview prep, salary negotiation, and career advice."},
          ].map(f => (
            <div key={f.title} className="card card-hover" style={{padding:22}}>
              <div style={{fontSize:26,marginBottom:12,animation:"float 4s ease-in-out infinite"}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════════
  if (page === "auth") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative"}}>
      <div style={{position:"fixed",top:"15%",left:"10%",width:400,height:400,background:`radial-gradient(circle,${C.accent}0b,transparent 70%)`,pointerEvents:"none"}}/>

      <div className="pu" style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>
        <div className="card" style={{padding:36}}>
          <div className="logo" style={{marginBottom:28}}>
            <div className="logo-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            <span className="logo-text">ResumeAI</span>
          </div>

          <h2 style={{fontSize:24,fontWeight:800,color:C.cream,marginBottom:5}}>
            {authMode==="login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{fontSize:13,color:C.muted,marginBottom:26}}>
            {authMode==="login" ? "Sign in to access your resume dashboard" : "Your data is saved privately per account"}
          </p>

          <form onSubmit={handleAuth} style={{display:"flex",flexDirection:"column",gap:14}}>
            {authMode==="register" && (
              <div>
                <label className="input-label">Full Name</label>
                <input placeholder="Alex Johnson" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/>
              </div>
            )}
            <div>
              <label className="input-label">Email</label>
              <input placeholder="you@example.com" type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})}/>
            </div>
            <div>
              <label className="input-label">Password</label>
              <input placeholder="Min. 6 characters" type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/>
            </div>

            {authErr && (
              <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"9px 13px",fontSize:13,color:C.red}}>
                {authErr}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",marginTop:4}}>
              {authMode==="login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <Divider/>

          <p style={{textAlign:"center",fontSize:13,color:C.muted}}>
            {authMode==="login" ? "Don't have an account? " : "Already registered? "}
            <span style={{color:C.accent2,cursor:"pointer",fontWeight:600}}
              onClick={()=>{setAuthMode(authMode==="login"?"register":"login");setAuthErr("")}}>
              {authMode==="login" ? "Sign up free" : "Sign in"}
            </span>
          </p>

          <button onClick={()=>setPage("landing")} style={{display:"block",margin:"14px auto 0",fontSize:12,color:C.muted2,background:"none",border:"none",cursor:"pointer"}}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════
  if (page === "upload") return (
    <div style={{minHeight:"100vh"}}>
      {/* analyzing overlay */}
      {isAnalyzing && (
        <div style={{position:"fixed",inset:0,background:`${C.bg}f5`,zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
          <div className="card" style={{padding:"40px 52px",textAlign:"center",maxWidth:380,border:`1px solid ${C.border2}`}}>
            <div style={{marginBottom:20}}><Spin size={44} color={C.accent}/></div>
            <h3 style={{fontSize:20,fontWeight:800,color:C.cream,marginBottom:8}}>Analyzing Resume</h3>
            <p style={{color:C.accent2,fontSize:14,marginBottom:22,minHeight:20}}>{STEPS[analyzeStep]}</p>
            <div className="step-progress" style={{justifyContent:"center"}}>
              {STEPS.map((_,i) => (
                <div key={i} className="step-dot" style={{width:i===analyzeStep?28:8,background:i===analyzeStep?C.accent:C.border2}}/>
              ))}
            </div>
            <p style={{fontSize:12,color:C.muted2,marginTop:14}}>Powered by Groq · usually 5–15 seconds</p>
          </div>
        </div>
      )}

      <nav className="nav">
        <div className="logo">
          <div className="logo-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <span className="logo-text">ResumeAI</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${C.accent}22`,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.accent2}}>
            {user?.name?.[0]?.toUpperCase()||"U"}
          </div>
          <span style={{fontSize:13,color:C.muted}}>{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:660,margin:"0 auto",padding:"60px 32px"}} className="pu">
        <div style={{textAlign:"center",marginBottom:36}}>
          <h1 style={{fontSize:38,fontWeight:800,color:C.cream,letterSpacing:-1.2,marginBottom:10}}>Upload Your Resume</h1>
          <p style={{color:C.muted,fontSize:15,lineHeight:1.7}}>PDF, DOCX, or TXT — our server reads every word accurately</p>
        </div>

        {/* upload zone */}
        <div className={`upload-zone${parseStatus==="done"?" ready":""}`}
          onClick={()=>fileRef.current.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0])}}
          style={{marginBottom:18}}>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>

          {parseStatus==="parsing" && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <Spin size={32} color={C.teal}/>
              <p style={{color:C.teal,fontWeight:600,fontSize:14}}>Reading {fileName}…</p>
              <p style={{color:C.muted,fontSize:13}}>Extracting all text from your document</p>
            </div>
          )}

          {parseStatus==="done" && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{width:48,height:48,borderRadius:13,background:`${C.teal}22`,border:`1px solid ${C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{fontWeight:700,fontSize:16,color:C.teal}}>{fileName}</p>
              <p style={{color:C.muted,fontSize:13}}>{resumeText.length.toLocaleString()} characters extracted</p>
              <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setParseStatus("");setFileName("");setResumeText("")}}>
                Change file
              </button>
            </div>
          )}

          {parseStatus==="" && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{width:52,height:52,borderRadius:13,background:`${C.accent}11`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",animation:"float 3s ease-in-out infinite"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent2} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </div>
              <p style={{fontWeight:700,fontSize:16,color:C.cream}}>Drop your resume here</p>
              <p style={{color:C.muted,fontSize:13}}>or click to browse</p>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                {["PDF","DOCX","TXT"].map(t=><Badge key={t} label={t} color={C.muted2}/>)}
              </div>
            </div>
          )}
        </div>

        <Divider label="or paste resume text"/>

        <textarea value={resumeText} onChange={e=>setResumeText(e.target.value)}
          placeholder="Paste your resume content here…"
          style={{minHeight:150,resize:"vertical",lineHeight:1.7,fontSize:13,marginBottom:20}}/>

        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <button className="btn btn-primary" style={{fontSize:14,padding:"12px 28px",opacity:!resumeText?.trim()?0.4:1}}
            onClick={analyzeResume} disabled={isAnalyzing||!resumeText?.trim()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Analyze Resume
          </button>
          <button className="btn btn-ghost btn-sm" onClick={()=>{
            setResumeText(`JOHN SMITH\nSoftware Engineer\njohn.smith@email.com | +1-555-0123 | linkedin.com/in/johnsmith | github.com/johnsmith\nNew York, NY\n\nPROFESSIONAL SUMMARY\nFull-stack software engineer with 5+ years building scalable web applications. Expert in React, Python, and cloud infrastructure. Led teams of 3-8 engineers delivering products used by 100K+ users.\n\nEXPERIENCE\n\nSenior Software Engineer — TechCorp Inc. (Jan 2021 – Present)\n• Built React dashboards serving 50,000+ daily active users, improving load time by 40%\n• Architected microservices migration on AWS, reducing costs by $120K/year\n• Mentored 4 junior engineers, conducting weekly code reviews\n• Implemented CI/CD pipeline with Jenkins + Docker, cutting deployment time by 85%\n\nSoftware Engineer — StartupXYZ (Jun 2019 – Dec 2020)\n• Developed Python/Django REST APIs handling 2M+ daily requests\n• Built real-time features using WebSockets and Redis\n• Improved PostgreSQL query performance by 60% through indexing\n\nEDUCATION\nB.S. Computer Science — State University, 2019 | GPA: 3.8/4.0\n\nSKILLS\nLanguages: JavaScript, TypeScript, Python, Java, SQL\nFrameworks: React, Node.js, Django, FastAPI\nDatabases: PostgreSQL, MongoDB, Redis\nCloud: AWS, Docker, Kubernetes, Terraform\nTools: Git, Jira, Figma`);
            setParseStatus("done"); setFileName("demo-resume.txt");
          }}>Load Demo</button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (page === "dashboard" && result) {
    const r = result;
    const cats = ["All", ...new Set(BASE_JOBS.map(j=>j.category))];
    const filteredJobs = catFilter==="All" ? jobs : jobs.filter(j=>j.category===catFilter);

    return (
      <div style={{minHeight:"100vh"}}>
        <div style={{position:"fixed",top:0,right:0,width:500,height:500,background:`radial-gradient(circle,${C.accent}07,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

        {/* NAV */}
        <nav className="nav">
          <div className="logo">
            <div className="logo-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            <span className="logo-text">ResumeAI</span>
          </div>

          <div className="tab-nav" style={{overflow:"auto"}}>
            {[["overview","📊 Overview"],["jobs","💼 Jobs"],["skills","⚡ Skills"],["rewrite","✨ AI Rewrite"],["cover","✉️ Cover Letter"],["chat","🎯 AI Coach"]].map(([id,label])=>(
              <button key={id} className={`tab-item ${tab===id?"on":"off"}`} onClick={()=>setTab(id)}>{label}</button>
            ))}
          </div>

          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${C.accent}22`,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.accent2}}>
              {user?.name?.[0]?.toUpperCase()||"U"}
            </div>
            <div style={{display:"flex",flexDirection:"column"}}>
              <span style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.2}}>{user?.name}</span>
              <span style={{fontSize:10,color:C.muted2,lineHeight:1.2}}>{user?.email}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setPage("upload");setResult(null);setJobs(BASE_JOBS);setCover("");setCoverJob(null);setResumeText("");setFileName("");setParseStatus("");setRewritten("");}}>New Resume</button>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </nav>

        <div style={{maxWidth:1280,margin:"0 auto",padding:"26px 28px",position:"relative",zIndex:1}} className="pu">

          {/* ── OVERVIEW ───────────────────────────────────────────────── */}
          {tab==="overview" && (
            <div style={{display:"grid",gap:18}}>
              {/* Profile + scores */}
              <div className="card" style={{padding:28,display:"flex",gap:28,flexWrap:"wrap",background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.border2}`}}>
                <div style={{flex:1,minWidth:240}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
                    <div style={{width:46,height:46,borderRadius:12,background:`${C.accent}22`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:C.accent2}}>
                      {r.name?.[0]?.toUpperCase()||"?"}
                    </div>
                    <div>
                      <div style={{fontWeight:800,fontSize:20,color:C.cream,letterSpacing:-.3}}>{r.name}</div>
                      <div style={{fontSize:13,color:C.accent2,fontWeight:600}}>{r.title}</div>
                    </div>
                  </div>
                  {(r.email||r.phone||r.location) && (
                    <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
                      {r.email && <span style={{fontSize:12,color:C.muted}}>{r.email}</span>}
                      {r.phone && <span style={{fontSize:12,color:C.muted}}>{r.phone}</span>}
                      {r.location && <span style={{fontSize:12,color:C.muted}}>{r.location}</span>}
                    </div>
                  )}
                  <p style={{color:C.muted,fontSize:13,lineHeight:1.8,marginBottom:14,maxWidth:440}}>{r.summary}</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {r.skills?.slice(0,7).map(s=><Badge key={s} label={s} color={C.accent}/>)}
                  </div>
                  <div style={{marginTop:16,display:"flex",gap:8}}>
                    <button className="btn btn-primary btn-sm" onClick={()=>{setTab("rewrite");if(!rewrittenResume)rewriteResume()}}>
                      ✨ Get AI-Rewritten Resume
                    </button>
                    <button className="btn-danger btn" onClick={clearMyData}>🗑 Clear Data</button>
                  </div>
                </div>
                {/* Score rings */}
                <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
                  {[
                    {v:r.overallScore,c:C.accent,l:"OVERALL"},
                    {v:r.atsScore,c:r.atsScore>=80?C.green:r.atsScore>=60?C.amber:C.red,l:"ATS SCORE"},
                    {v:r.skillScore,c:C.teal,l:"SKILLS"},
                    {v:r.resumeStrength,c:C.purple,l:"STRENGTH"},
                  ].map(s=>(
                    <div key={s.l} style={{textAlign:"center"}}>
                      <Ring value={s.v} size={96} color={s.c}/>
                      <div style={{fontSize:10,color:C.muted,marginTop:7,letterSpacing:1.2}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 col */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                <div className="card">
                  <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>📋 Sections</p>
                  {Object.entries(r.sections||{}).map(([k,v])=>(
                    <div key={k} className="check-row">
                      <div className="check-icon" style={{background:v?`${C.green}1a`:`${C.red}11`,border:`1px solid ${v?C.green:C.red}33`}}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={v?C.green:C.red} strokeWidth="3">
                          {v?<polyline points="20 6 9 17 4 12"/>:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
                        </svg>
                      </div>
                      <span style={{color:v?C.text:C.muted2}}>{k.replace("has","").replace(/([A-Z])/g," $1").trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>✅ Strengths</p>
                  {r.strengths?.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:C.green,marginTop:7,flexShrink:0}}/>
                      <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>⚠️ ATS Issues</p>
                  {r.atsIssues?.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:C.amber,marginTop:7,flexShrink:0}}/>
                      <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* improvements + keywords */}
              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16}}>
                <div className="card">
                  <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>🚀 Improvement Suggestions</p>
                  {r.improvements?.map((tip,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:10,padding:"10px 13px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.accent,fontWeight:700,minWidth:18}}>0{i+1}</span>
                      <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{tip}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div className="card" style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:12}}>🔑 Power Keywords</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {r.keywords?.map(k=><Badge key={k} label={k} color={C.purple}/>)}
                    </div>
                    {r.industryFit?.length > 0 && (
                      <>
                        <p style={{fontWeight:600,fontSize:12,color:C.muted,marginTop:14,marginBottom:8}}>INDUSTRY FIT</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {r.industryFit?.map(k=><Badge key={k} label={k} color={C.teal}/>)}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="card" style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:12}}>🗺️ Career Path</p>
                    {r.careerPath?.map((p,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:`${C.accent}1a`,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.accent,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <span style={{fontSize:13,color:C.text}}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── JOBS ───────────────────────────────────────────────────── */}
          {tab==="jobs" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
                <div>
                  <div className="section-title">Job Matches</div>
                  <div className="section-sub">Ranked by AI compatibility · <span style={{color:C.green}}>green</span> = you have it · <span style={{color:C.muted}}>grey</span> = skill gap</div>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {cats.map(c=>(
                    <button key={c} className={`tab-item ${catFilter===c?"on":"off"}`} onClick={()=>setCat(c)} style={{fontSize:12}}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gap:10}}>
                {filteredJobs.map((job,idx)=>(
                  <div key={job.id} className="job-row">
                    <div style={{width:40,height:40,background:`${C.accent}11`,border:`1px solid ${C.accent}22`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent2} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                    </div>
                    <div style={{flex:1,minWidth:180}}>
                      <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                        {idx===0&&<Badge label="TOP MATCH" color={C.green}/>}
                        {idx===1&&<Badge label="GREAT FIT" color={C.teal}/>}
                        <span style={{fontWeight:700,fontSize:15,color:C.cream}}>{job.title}</span>
                      </div>
                      <div style={{display:"flex",gap:14,marginBottom:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,color:C.muted}}>{job.company}</span>
                        <span style={{fontSize:12,color:C.muted}}>{job.location}</span>
                        <span style={{fontSize:12,color:C.amber,fontWeight:600}}>{job.salary}</span>
                      </div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {job.skills.map(s=>{
                          const has = r.skills?.some(u=>u.toLowerCase().includes(s.toLowerCase())||s.toLowerCase().includes(u.toLowerCase()));
                          return <Badge key={s} label={s} color={has?C.green:C.muted2}/>;
                        })}
                      </div>
                    </div>
                    <div style={{textAlign:"center",minWidth:80}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,color:job.match>=70?C.green:job.match>=50?C.amber:C.muted,lineHeight:1}}>{job.match}%</div>
                      <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:6}}>MATCH</div>
                      <div style={{height:3,width:80,background:C.border2,borderRadius:99}}>
                        <div style={{width:`${job.match}%`,height:"100%",background:job.match>=70?C.green:job.match>=50?C.amber:C.muted,borderRadius:99}}/>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <button className="btn btn-primary btn-sm" onClick={()=>generateCover(job)}>
                        {genCover&&coverJob?.id===job.id?<Spin size={12} color="#fff"/>:"✉️ Cover Letter"}
                      </button>
                      <button className="btn btn-ghost btn-sm">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SKILLS ─────────────────────────────────────────────────── */}
          {tab==="skills" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div className="card">
                <p style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:18}}>⚡ Technical Skills</p>
                {r.skills?.map((s,i)=><Bar key={s} label={s} val={Math.max(58,96-i*5)} color={C.accent}/>)}
              </div>
              <div className="card">
                <p style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:18}}>🤝 Soft Skills</p>
                {r.softSkills?.map((s,i)=><Bar key={s} label={s} val={Math.max(54,92-i*7)} color={C.purple}/>)}
                <div style={{marginTop:20,paddingTop:18,borderTop:`1px solid ${C.border}`}}>
                  <p style={{fontSize:13,fontWeight:600,color:C.red,marginBottom:10}}>⚠️ Missing Skills to Learn</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {r.missingSkills?.map(s=>(
                      <div key={s} style={{display:"flex",alignItems:"center",gap:5,background:`${C.red}0d`,border:`1px solid ${C.red}33`,borderRadius:99,padding:"3px 10px"}}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span style={{fontSize:11,color:C.red}}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <p style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:16}}>💼 Work Experience</p>
                {r.experience?.map((exp,i)=>(
                  <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<r.experience.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontWeight:700,fontSize:14,color:C.cream}}>{exp.role}</span>
                      <span style={{fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>{exp.years}</span>
                    </div>
                    <div style={{color:C.accent2,fontSize:13,marginBottom:7}}>{exp.company}</div>
                    {exp.highlights?.map((h,j)=>(
                      <div key={j} style={{fontSize:12,color:C.muted,marginBottom:3,paddingLeft:10,borderLeft:`2px solid ${C.border2}`}}>{h}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div className="card">
                  <p style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:14}}>🎓 Education</p>
                  {r.education?.map((e,i)=>(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.cream}}>{e.degree}</div>
                      <div style={{color:C.accent2,fontSize:13}}>{e.school}{e.year?` · ${e.year}`:""}{e.gpa?` · GPA ${e.gpa}`:""}</div>
                    </div>
                  ))}
                  {r.certifications?.length>0 && (
                    <>
                      <Divider label="Certifications"/>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {r.certifications.map(c=><Badge key={c} label={c} color={C.teal}/>)}
                      </div>
                    </>
                  )}
                </div>
                <div className="card" style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:14}}>🎯 Interview Tips</p>
                  {r.interviewTips?.map((tip,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:C.teal,marginTop:7,flexShrink:0}}/>
                      <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── AI REWRITE ─────────────────────────────────────────────── */}
          {tab==="rewrite" && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="section-title">✨ AI Resume Rewriter</div>
                <div className="section-sub">AI rewrites your full resume — ATS-optimized, keyword-rich, and professionally formatted. Download as TXT or HTML.</div>
              </div>

              {!rewrittenResume && !isRewriting && (
                <div className="card" style={{textAlign:"center",padding:52}}>
                  <div style={{fontSize:48,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>✨</div>
                  <h3 style={{fontSize:20,fontWeight:800,color:C.cream,marginBottom:8}}>Rewrite My Resume with AI</h3>
                  <p style={{color:C.muted,fontSize:14,maxWidth:420,margin:"0 auto 24px",lineHeight:1.7}}>
                    AI will fix ATS issues, add missing keywords, quantify achievements, and produce a polished resume ready to download.
                  </p>
                  <button className="btn btn-teal" style={{fontSize:15,padding:"13px 32px"}} onClick={rewriteResume}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Generate AI Resume
                  </button>
                </div>
              )}

              {isRewriting && (
                <div className="card" style={{textAlign:"center",padding:52}}>
                  <Spin size={40} color={C.teal}/>
                  <p style={{color:C.teal,fontWeight:700,marginTop:16,fontSize:15}}>Rewriting your resume…</p>
                  <p style={{color:C.muted,fontSize:13,marginTop:6}}>Fixing ATS issues, adding keywords, polishing every bullet point</p>
                </div>
              )}

              {rewrittenResume && !isRewriting && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1.8fr",gap:18}}>
                  {/* Controls */}
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div className="card">
                      <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>📥 Download Options</p>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        <button className="download-btn" style={{width:"100%",justifyContent:"center"}} onClick={downloadResume}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Download as .TXT
                        </button>
                        <button className="download-btn" style={{width:"100%",justifyContent:"center",background:C.accent}} onClick={downloadResumeHTML}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Download as .HTML
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>navigator.clipboard.writeText(rewrittenResume)}>
                          📋 Copy to Clipboard
                        </button>
                      </div>
                    </div>
                    <div className="card">
                      <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:10}}>✅ What was improved</p>
                      {[
                        "ATS-friendly formatting",
                        "Keywords added: "+r.keywords?.slice(0,3).join(", "),
                        "Professional summary added",
                        "Action verbs strengthened",
                        "Achievements quantified",
                        "Sections reorganized",
                      ].map((item,i)=>(
                        <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                          <div style={{width:16,height:16,borderRadius:5,background:`${C.green}1a`,border:`1px solid ${C.green}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span style={{fontSize:12,color:C.text,lineHeight:1.5}}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>{setRewritten("");rewriteResume()}}>
                      🔄 Regenerate
                    </button>
                  </div>
                  {/* Resume content */}
                  <div className="card" style={{background:C.surface}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <p style={{fontWeight:700,fontSize:14,color:C.cream}}>AI-Optimized Resume</p>
                      <Badge label="ATS READY" color={C.green}/>
                    </div>
                    <div style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.9,color:C.text,fontFamily:"'JetBrains Mono',monospace",maxHeight:600,overflowY:"auto"}}>
                      {rewrittenResume}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COVER LETTER ───────────────────────────────────────────── */}
          {tab==="cover" && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="section-title">✉️ Cover Letter Generator</div>
                <div className="section-sub">AI-personalized for each job · downloadable</div>
              </div>

              {genCover && (
                <div className="card" style={{textAlign:"center",padding:48,marginBottom:18}}>
                  <Spin size={36} color={C.accent}/>
                  <p style={{color:C.accent2,fontWeight:700,marginTop:14}}>Writing your cover letter…</p>
                  <p style={{color:C.muted,fontSize:13,marginTop:6}}>Personalizing for {coverJob?.title} at {coverJob?.company}</p>
                </div>
              )}

              {!cover && !genCover && (
                <div className="card" style={{textAlign:"center",padding:52}}>
                  <div style={{fontSize:44,marginBottom:14,animation:"float 3s ease-in-out infinite"}}>✉️</div>
                  <h3 style={{fontSize:20,fontWeight:800,color:C.cream,marginBottom:8}}>Generate a Cover Letter</h3>
                  <p style={{color:C.muted,fontSize:14,marginBottom:22}}>Go to the <strong style={{color:C.text}}>Jobs</strong> tab and click "✉️ Cover Letter" on any listing</p>
                  <button className="btn btn-primary" onClick={()=>setTab("jobs")}>Browse Jobs →</button>
                </div>
              )}

              {cover && !genCover && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1.7fr",gap:18}}>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div className="card">
                      <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:12}}>Job Applied For</p>
                      {coverJob && (
                        <>
                          <div style={{fontWeight:700,fontSize:15,color:C.cream,marginBottom:2}}>{coverJob.title}</div>
                          <div style={{color:C.accent2,fontSize:13,marginBottom:10}}>{coverJob.company}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                            {coverJob.skills.map(s=><Badge key={s} label={s} color={C.accent}/>)}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="card">
                      <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:12}}>📥 Download</p>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <button className="download-btn" style={{width:"100%",justifyContent:"center"}} onClick={downloadCoverLetter}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Download Cover Letter
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>navigator.clipboard.writeText(cover)}>
                          📋 Copy to Clipboard
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>setTab("jobs")}>
                          Try Another Job
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card" style={{background:C.surface}}>
                    <p style={{fontWeight:700,fontSize:14,color:C.cream,marginBottom:14}}>Your Cover Letter</p>
                    <div style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.9,color:C.text}}>{cover}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI CHAT ─────────────────────────────────────────────────── */}
          {tab==="chat" && (
            <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)",maxHeight:700}}>
              <div style={{marginBottom:16}}>
                <div className="section-title">🎯 AI Career Coach</div>
                <div className="section-sub">Powered by Groq · Knows your resume · Chat history saved per account</div>
              </div>
              <div className="card" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14,marginBottom:12,padding:18}}>
                {chat.length===0 && (
                  <div style={{textAlign:"center",margin:"auto"}}>
                    <div style={{fontSize:44,marginBottom:14,animation:"float 3s ease-in-out infinite"}}>🎯</div>
                    <p style={{color:C.cream,fontWeight:700,fontSize:16,marginBottom:6}}>Your AI Career Coach</p>
                    <p style={{color:C.muted,fontSize:13,marginBottom:18}}>Ask me anything about your resume or career:</p>
                    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                      {["How can I improve my resume?","What salary should I ask for?","Help me prepare for interviews","What roles suit my skills?"].map(q=>(
                        <button key={q} className="btn btn-ghost btn-sm" onClick={()=>setChatIn(q)}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chat.map((m,i)=>(
                  <div key={i} className="sl" style={{display:"flex",gap:9,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant" && (
                      <div style={{width:28,height:28,background:C.accent,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </div>
                    )}
                    <div className={m.role==="user"?"chat-bubble-user":"chat-bubble-ai"} style={{maxWidth:"76%",padding:"10px 14px",fontSize:13,lineHeight:1.7,color:C.text,whiteSpace:"pre-wrap"}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div style={{display:"flex",gap:9}}>
                    <div style={{width:28,height:28,background:C.accent,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <div className="chat-bubble-ai" style={{padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
                      {[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:C.accent2,animation:`pulse 1.2s ${i*.2}s infinite`,display:"inline-block"}}/>)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div style={{display:"flex",gap:9}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()}
                  placeholder="Ask your AI career coach…" style={{flex:1}}/>
                <button className="btn btn-primary" onClick={sendChat} disabled={chatBusy} style={{padding:"11px 18px",flexShrink:0}}>
                  {chatBusy?<Spin size={16} color="#fff"/>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
}
