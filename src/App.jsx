import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Briefcase, FileText, ChevronRight, Check, AlertCircle, 
  ArrowRight, Copy, Loader2, Menu, X, Shield, Lock, Eye, Server, 
  Cpu, Network, Zap, GraduationCap, Play, Timer, 
  Lightbulb, Target, Hash, BarChart3, Activity,
  ThumbsUp, ThumbsDown, Building, Globe, Users,
  Sliders, Settings, MessageSquare,
  FileEdit, Wand2, Download, AlertTriangle, UserCheck
} from 'lucide-react';

// --- API Helpers ---

const generateInterviewPrep = async (resume, jobDesc, numQuestions) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDesc, numQuestions })
  });
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server Error: API route not found or timed out.");
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to generate prep plan');
  return data;
};

const generateTailoredResume = async (resume, jobDesc) => {
  const response = await fetch('/api/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDesc })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Tailor API unavailable");
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to tailor resume');
  return data;
};

// --- Visualization Components ---

const VibeEqualizer = ({ vibe }) => {
  const data = vibe || { scope: 50, social: 50, structure: 50, techNature: 50 };
  const SpectrumRow = ({ labelLeft, labelRight, value, colorClass }) => (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        <span className={value < 40 ? "text-slate-800" : ""}>{labelLeft}</span>
        <span className={value > 60 ? "text-slate-800" : ""}>{labelRight}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full relative overflow-hidden">
        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${colorClass}`} style={{ width: `${value || 50}%` }} />
        <div className="absolute top-0 h-full w-1 bg-white shadow-md z-10 transition-all duration-1000 ease-out" style={{ left: `${value || 50}%`, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  );
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-2">
         <Sliders size={16} className="text-slate-400"/>
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role DNA Profile</span>
      </div>
      <SpectrumRow labelLeft="Execution" labelRight="Strategy" value={data.scope} colorClass="from-emerald-300 to-emerald-500"/>
      <SpectrumRow labelLeft="Independent" labelRight="Collaborative" value={data.social} colorClass="from-blue-300 to-blue-500"/>
      <SpectrumRow labelLeft="Structured" labelRight="Ambiguous" value={data.structure} colorClass="from-purple-300 to-purple-500"/>
      <SpectrumRow labelLeft="Generalist" labelRight="Specialist" value={data.techNature} colorClass="from-pink-300 to-pink-500"/>
    </div>
  );
};

const RadarChart = ({ data }) => {
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(d => d && typeof d.label === 'string' && typeof d.score === 'number');
  }, [data]);

  if (validData.length < 3) return <div className="flex h-64 items-center justify-center text-xs text-slate-400 italic">Not enough data for chart</div>;

  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 40;
  const levels = 4;
  
  const getCoordinates = (value, index) => {
    const angleStep = (Math.PI * 2) / validData.length;
    const angle = (Math.PI / 2) + (index * angleStep);
    const r = (value / 100) * radius;
    const rotatedAngle = angle - Math.PI; 
    const x = center + r * Math.cos(rotatedAngle);
    const y = center + r * Math.sin(rotatedAngle);
    return { x, y };
  };

  const webPoints = Array.from({ length: levels }).map((_, levelIndex) => {
    const levelRadius = (radius / levels) * (levelIndex + 1);
    return validData.map((_, i) => {
      const angleStep = (Math.PI * 2) / validData.length;
      const angle = (Math.PI / 2) + (i * angleStep) - Math.PI;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  const dataPoints = validData.map((d, i) => {
    const coords = getCoordinates(d.score, i);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {webPoints.map((points, i) => (<polygon key={i} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />))}
        {validData.map((_, i) => {
          const end = getCoordinates(100, i);
          return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        <polygon points={dataPoints} fill="rgba(56, 189, 248, 0.2)" stroke="#0ea5e9" strokeWidth="2" className="drop-shadow-sm" />
        {validData.map((d, i) => {
          const coords = getCoordinates(d.score, i);
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={coords.x} cy={coords.y} r="4" fill="#0ea5e9" stroke="white" strokeWidth="2" className="group-hover:r-6 transition-all" />
              <text x={getCoordinates(120, i).x} y={getCoordinates(120, i).y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-slate-500 uppercase tracking-wider">{d.label}</text>
               <text x={coords.x} y={coords.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white">{d.score}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const SkillCloud = ({ skills }) => {
  if (!Array.isArray(skills) || skills.length === 0) return <div className="text-sm text-slate-400 italic">No specific skills extracted.</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, i) => {
        if (!skill || !skill.skill) return null; 
        let styles = "bg-slate-100 text-slate-500 border-slate-200"; 
        let icon = null;
        if (skill.status === 'match') {
          styles = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100";
          icon = <Check size={12} className="text-emerald-500" />;
        } else if (skill.status === 'partial') {
          styles = "bg-amber-50 text-amber-700 border-amber-200";
          icon = <Activity size={12} className="text-amber-500" />;
        }
        return (
          <div key={i} className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${styles}`}>
            {icon}
            {skill.skill}
          </div>
        );
      })}
    </div>
  );
};

const CompanyIntelCard = ({ intel }) => {
  if (!intel) return null;
  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/20">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-sky-400"><Building size={20} /></div>
        <div><h3 className="text-lg font-bold text-white leading-none">{intel.name || "Company Intelligence"}</h3><span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reconnaissance Data</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-3"><AlertTriangle size={14} /> Hiring Manager's Pain Points</h4>
            <ul className="space-y-3">
              {(intel.hiringManagerPainPoints || intel.keyChallenges || []).map((pain, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0"></span>{typeof pain === 'string' ? pain : JSON.stringify(pain)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-3"><Globe size={14} /> Mission Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {(intel.missionKeywords || []).map((kw, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">#{typeof kw === 'string' ? kw : ''}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4"><Users size={14} /> "Insider" Talking Points</h4>
          <div className="space-y-4">
            {(intel.talkingPoints || []).map((point, i) => (
              <div key={i} className="flex gap-3"><div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold font-mono">{i + 1}</div><p className="text-sm text-slate-300 leading-relaxed">{typeof point === 'string' ? point : JSON.stringify(point)}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ElevatorPitch = ({ pitch }) => {
  if (!pitch) return null;
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600"><UserCheck size={24} /></div>
        <div>
          <h3 className="text-lg font-bold text-amber-900">The "Tell Me About Yourself" Script</h3>
          <p className="text-xs text-amber-800/60 uppercase tracking-wider font-bold">60-Second Elevator Pitch</p>
        </div>
      </div>
      <div className="space-y-4 text-amber-900/80 leading-relaxed">
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Hook:</span> {typeof pitch.hook === 'string' ? pitch.hook : ''}</p>
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Value:</span> {typeof pitch.body === 'string' ? pitch.body : ''}</p>
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Close:</span> {typeof pitch.close === 'string' ? pitch.close : ''}</p>
      </div>
      <div className="mt-6 bg-white/60 p-4 rounded-xl border border-amber-100 text-sm italic text-amber-800">
        "Read this aloud 5 times. Memorize the flow, not just the words."
      </div>
    </div>
  );
};

const ResumeTailor = ({ originalResume, tailoredData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tailoredData.tailoredContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([tailoredData.tailoredContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Tailored_Resume_PrepFlow.md"; 
    document.body.appendChild(element);
    element.click();
  };

  if (!tailoredData) return <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 mt-8">Resume tailoring failed. Please try again.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/20">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke="#4ade80" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - ((tailoredData.atsScore || 85) / 100) * 251} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold">{tailoredData.atsScore || 85}%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">ATS Score</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Resume Optimized</h2>
            <p className="text-slate-400 text-sm max-w-md">Your resume has been rewritten with high-perplexity phrasing to bypass AI detectors while targeting specific ATS keywords.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all active:scale-95 border border-white/10">{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'Copied' : 'Copy Text'}</button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 transition-all active:scale-95"><Download size={18} /> Download</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100"><h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2"><Wand2 size={16}/> Burstiness Check</h4><p className="text-sm text-purple-800/80">Sentence structures varied to mimic human writing rhythm and avoid monotonous AI patterns.</p></div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100"><h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Target size={16}/> Keyword Density</h4><p className="text-sm text-blue-800/80">Critical hard skills and soft skills from the job description injected naturally into experience bullets.</p></div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100"><h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2"><Shield size={16}/> Impact Focus</h4><p className="text-sm text-emerald-800/80">Passive language converted to active, results-oriented statements (e.g., "Led," "Optimized").</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center"><div className="flex items-center gap-2 text-sm font-medium text-slate-600"><FileEdit size={16} /> Tailored Draft</div><span className="text-xs text-slate-400 font-mono">Markdown Format</span></div>
        <textarea className="w-full h-[600px] p-8 font-mono text-sm leading-relaxed text-slate-700 resize-none focus:outline-none" readOnly value={tailoredData.tailoredContent} />
      </div>
    </div>
  );
};

const QuestionCard = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!item) return null;
  const getCategoryColor = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'behavioral': return 'bg-purple-100 text-purple-700';
      case 'technical': return 'bg-blue-100 text-blue-700';
      case 'system design': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  return (
    <div className="group border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-start gap-4 p-5 text-left transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{item.difficulty}</span>
          </div>
          <h4 className={`font-medium text-lg leading-snug transition-colors duration-300 ${isOpen ? 'text-sky-600' : 'text-slate-900'}`}>{item.question}</h4>
        </div>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-sky-100 rotate-90 text-sky-600' : 'text-slate-300 group-hover:bg-slate-50'}`}><ChevronRight size={18} /></div>
      </button>
      {isOpen && (<div className="px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300"><div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-300"><p className="text-sm text-slate-600 italic"><span className="font-bold not-italic text-slate-900 mr-2">Goal:</span> {typeof item.intent === 'string' ? item.intent : ''}</p></div><div className="grid md:grid-cols-3 gap-4"><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Target</div><p className="text-sm text-slate-700 leading-relaxed">{item.starGuide?.situation}</p></div><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Action</div><p className="text-sm text-slate-700 leading-relaxed">{item.starGuide?.action}</p></div><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Result</div><p className="text-sm text-slate-700 leading-relaxed">{item.starGuide?.result}</p></div></div></div>)}
    </div>
  );
};

// --- Core UI Components ---

const Logo = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900 hover:opacity-80 transition-opacity">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-sky-200/50">
      <Sparkles size={16} fill="currentColor" />
    </div>
    Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">Flow</span>
  </button>
);

const Nav = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabs = [
    { id: 'product', label: 'Planner' },
    { id: 'research', label: 'Methodology' },
    { id: 'safety', label: 'Privacy' }
  ];
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo onClick={() => setActiveTab('product')} />
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/50 rounded-full border border-slate-200/50">
          {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}>{tab.label}</button>))}
        </div>
        <div className="hidden md:flex items-center gap-4">
           <a href="https://keshavk2089.github.io/ResumeInteractiveKesh/" target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 flex items-center gap-2">About Me</a>
        </div>
        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      {mobileMenuOpen && (<div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-xl">{tabs.map(tab => (<button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`text-left text-lg font-medium ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-600'}`}>{tab.label}</button>))} <a href="https://keshavk2089.github.io/ResumeInteractiveKesh/" target="_blank" rel="noopener noreferrer" className="text-left text-lg font-medium text-slate-600 hover:text-sky-600">About Me</a></div>)}
    </nav>
  );
};

const BackgroundGradient = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow"></div>
    <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow delay-1000"></div>
    <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow delay-2000"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
  </div>
);

const InputCard = ({ title, icon: Icon, placeholder, value, onChange, colorClass }) => (
  <div className="group relative h-full flex flex-col">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClass} rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur`}></div>
    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 flex-1 flex flex-col shadow-sm border border-slate-100 transition-transform duration-300 group-hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-10 text-slate-800 shadow-sm`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <textarea
        className="flex-1 w-full resize-none bg-transparent border-0 focus:ring-0 p-0 text-slate-600 placeholder:text-slate-400/70 text-sm leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
      />
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
        <span className={value.length > 0 ? "text-sky-600" : ""}>{value.length} chars</span>
        <span className="group-hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer">Paste text <Copy size={12} /></span>
      </div>
    </div>
  </div>
);

const ResearchView = () => (<div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4"><Cpu size={14} /> Algorithm Beta 2.5</div><h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">How we analyze fit.</h2><p className="text-lg text-slate-600 max-w-2xl mx-auto">Our model decomposes your resume into semantic vectors to understand not just keywords, but underlying capabilities.</p></div><div className="grid md:grid-cols-3 gap-8 mb-20 relative"><div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>{[{ icon: FileText, title: "Tokenization", desc: "Parsing unstructured text from resumes and JDs into structured skill ontologies.", color: "text-blue-500", bg: "bg-blue-50" }, { icon: Network, title: "Semantic Mapping", desc: "Mapping your experience against a high-dimensional vector space of job requirements.", color: "text-purple-500", bg: "bg-purple-50" }, { icon: Zap, title: "Gap Analysis", desc: "Identifying the precise distance between candidate capabilities and role demands.", color: "text-pink-500", bg: "bg-pink-50" }].map((item, i) => (<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative"><div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-inner`}><item.icon size={24} /></div><h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p></div>))}</div></div>);
const SafetyView = () => (<div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4"><Shield size={14} /> Enterprise Grade</div><h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Your data is yours.</h2><p className="text-lg text-slate-600">We believe interview preparation shouldn't come at the cost of privacy.</p></div><div className="space-y-6">{[{ icon: Lock, title: "Zero Retention Policy", desc: "Your resume and job descriptions are processed in memory and immediately discarded." }, { icon: Eye, title: "No Model Training", desc: "We do not use your inputs to train our public models. Your career history remains private to you." }, { icon: Server, title: "Encrypted Transport", desc: "All data sent between your browser and our analysis engine is encrypted via TLS 1.3 standards." }].map((item, i) => (<div key={i} className="flex gap-6 p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors"><div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-900"><item.icon size={24} strokeWidth={1.5} /></div><div><h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3><p className="text-slate-500 leading-relaxed">{item.desc}</p></div></div>))}</div></div>);

const ProductView = () => {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [numQuestions, setNumQuestions] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [error, setError] = useState(null);
  const [resultTab, setResultTab] = useState('resume'); 
  const resultRef = useRef(null);

  const handleGenerate = async () => {
    if (!resume.trim() || !jobDesc.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setTailoredResume(null);
    
    // SEQUENTIAL LOADING: Safer for API limits and Timeouts
    try {
      // 1. Get Resume First (Priority)
      const resumeData = await generateTailoredResume(resume, jobDesc)
        .catch(err => { console.error("Resume Error:", err); return null; });
      
      if (resumeData) {
        setTailoredResume(resumeData);
        setResultTab('resume');
      }

      // 2. Get Interview Plan Second
      const prepData = await generateInterviewPrep(resume, jobDesc, numQuestions)
        .catch(err => { console.error("Prep Error:", err); return null; });

      if (prepData) {
        setResult(prepData);
        if (!resumeData) setResultTab('prep'); // Switch if resume failed
      }

      if (!resumeData && !prepData) {
        throw new Error("Failed to generate content. Please check your inputs.");
      }

      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-500">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900">Master your <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 animate-gradient-x">next interview.</span></h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">Deep-dive analysis, visualization, and AI-simulated interviews tailored to your unique profile.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="h-96"><InputCard title="Your Resume" icon={FileText} placeholder="Paste your full resume text here..." value={resume} onChange={setResume} colorClass="from-pink-300 to-rose-300" /></div>
        <div className="h-96"><InputCard title="Job Description" icon={Briefcase} placeholder="Paste the job requirements and responsibilities here..." value={jobDesc} onChange={setJobDesc} colorClass="from-sky-300 to-blue-300" /></div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-24">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium"><Settings size={16} /><span>Depth:</span></div>
          <input type="range" min="3" max="10" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"/>
          <span className="text-slate-900 font-bold min-w-[2ch]">{numQuestions}</span><span className="text-slate-400 text-xs uppercase tracking-wider">Questions</span>
        </div>
        <button onClick={handleGenerate} disabled={loading || !resume || !jobDesc} className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 ${!resume || !jobDesc ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 hover:shadow-2xl hover:shadow-sky-200/50'}`}>{loading ? (<><Loader2 className="animate-spin" size={20} /><span>Analyzing & Tailoring...</span></>) : (<><span>Generate Prep Plan</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>)}</button>
        {error && (<div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-4 py-2 rounded-lg text-sm border border-pink-100"><AlertCircle size={16} />{error}</div>)}
      </div>

      {(result || tailoredResume) && (
        <div ref={resultRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-full flex gap-1">
              <button onClick={() => setResultTab('resume')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${resultTab === 'resume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tailored Resume</button>
              <button onClick={() => setResultTab('prep')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${resultTab === 'prep' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Interview Strategy</button>
            </div>
          </div>

          {resultTab === 'resume' && tailoredResume && (
            <ResumeTailor originalResume={resume} tailoredData={tailoredResume} />
          )}

          {resultTab === 'prep' && result && (
            <div className="space-y-16">
              <div><div className="flex items-center gap-3 mb-8"><BarChart3 className="text-sky-500" size={28} /><h2 className="text-3xl font-bold text-slate-900 tracking-tight">Role Intelligence</h2></div><div className="grid md:grid-cols-3 gap-8"><div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center"><h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Candidate Fit Dimension</h3><RadarChart data={result.dimensions} /></div><div className="md:col-span-2 space-y-6"><div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"><VibeEqualizer vibe={result.roleVibe} /></div><div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Skill Match Network</h3><div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider"><span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Match</span><span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Partial</span></div></div><SkillCloud skills={result.skillAnalysis} /></div></div></div></div>
              
              <CompanyIntelCard intel={result.companyIntel} />
              <ElevatorPitch pitch={result.elevatorPitch} />

              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="bg-gradient-to-r from-indigo-50 to-sky-50 p-8 rounded-3xl border border-indigo-100 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20"></div><div className="relative z-10"><h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2"><Sparkles className="text-indigo-500" size={20} /> Strategic Edge</h3><p className="text-indigo-900/80 leading-relaxed text-lg">{result.strategicAdvice}</p></div></div>
              <div><div className="flex items-end justify-between mb-8"><div><h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interview Simulation</h2><p className="text-slate-500 mt-2">Questions sorted by probability of being asked.</p></div></div><div className="space-y-4">{(result.questions || []).map((q, index) => (<QuestionCard key={index} item={q} index={index} />))}</div></div>
              <div className="bg-slate-900 text-slate-300 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden"><div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-pink-500 to-purple-500"></div><div className="relative z-10"><h3 className="text-2xl font-bold text-white">Feeling prepared?</h3><p className="max-w-xl mx-auto my-6 text-slate-400">You can generate a new plan for a different role, or keep practicing these questions until you feel 100% confident.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-medium hover:bg-slate-100 transition-colors">Analyze Another Role <GraduationCap size={18} /></button></div></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('product');
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-sky-100 relative"><BackgroundGradient /><Nav activeTab={activeTab} setActiveTab={setActiveTab} /><main className="min-h-[calc(100vh-8rem)]">{activeTab === 'product' && <ProductView />}{activeTab === 'research' && <ResearchView />}{activeTab === 'safety' && <SafetyView />}</main><footer className="border-t border-slate-100 bg-white/50 backdrop-blur-md py-12 relative z-10"><div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"><div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"><div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white"><Sparkles size={12} fill="currentColor" /></div><span className="font-bold tracking-tight text-slate-900">PrepFlow AI</span></div><p className="text-slate-400 text-sm">© 2025 PrepFlow AI. Designed with focus.</p></div></footer></div>
  );
}
