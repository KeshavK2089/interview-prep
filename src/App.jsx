import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Briefcase, FileText, ChevronRight, Check, AlertCircle, 
  ArrowRight, Copy, Loader2, Menu, X, Shield, Lock, Eye, Server, 
  Cpu, Network, Zap, GraduationCap, Play, Timer, 
  Lightbulb, Target, Hash, BarChart3, Activity,
  ThumbsUp, ThumbsDown, Building, Globe, Users,
  Sliders, Volume2, StopCircle, Settings, MessageSquare,
  FileEdit, Wand2, Download, AlertTriangle, UserCheck,
  BrainCircuit, Layers, CheckCircle2, MousePointerClick, FileSearch,
  Mic, Smartphone, Laptop, Mail, Linkedin, User
} from 'lucide-react';

// --- HELPER: Robust JSON Parser ---
const parseAIResponse = (text) => {
  if (!text) return null;
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
  const firstOpen = cleanText.indexOf('{');
  const lastClose = cleanText.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    cleanText = cleanText.substring(firstOpen, lastClose + 1);
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const sanitized = cleanText.replace(/\\(?![/u"bfnrt])/g, "\\\\");
    try { return JSON.parse(sanitized); } catch (e2) { return null; }
  }
};

const renderSafe = (content) => {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'number') return content;
  if (Array.isArray(content)) return content.map(i => renderSafe(i)).join(', ');
  if (typeof content === 'object') return JSON.stringify(content); 
  return String(content);
};

// --- API FUNCTIONS (Calling Secure Backend) ---

const generateInterviewPrep = async (resume, jobDesc) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDesc })
  });
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server connection failed. Ensure API files are deployed to Vercel.");
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error); // Handle Gatekeeper
  if (!response.ok) throw new Error('Failed to generate prep plan');
  return data;
};

const generateTailoredResume = async (resume, jobDesc) => {
  try {
    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDesc })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error); // Handle Gatekeeper
    if (!response.ok) return null;
    return data;
  } catch (err) { return null; }
};

const getAIFeedback = async (question, answer) => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });
  return await response.json();
};

const getAIVoice = async (text) => {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Voice failed');
  // FIX: Return blob directly, backend handles WAV conversion
  return await response.blob();
};

// --- UI COMPONENTS ---

const BackgroundGradient = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow"></div>
    <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow delay-1000"></div>
    <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow delay-2000"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
  </div>
);

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
  
  // REMOVED ABOUT TAB
  const tabs = [
    { id: 'strategy', label: 'Interview Strategy' },
    { id: 'resume-info', label: 'Tailored Resume' },
    { id: 'safety', label: 'Privacy' }
  ];
  
  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveTab('home');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo onClick={handleLogoClick} />
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/50 rounded-full border border-slate-200/50">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => handleTabClick(tab.id)} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-xl">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`text-left text-lg font-medium ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-600'}`}>
              {tab.label}
            </button>
          ))} 
        </div>
      )}
    </nav>
  );
};

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
        <span className={value.length < 50 ? "text-red-400" : "text-emerald-600"}>
          {value.length} chars {value.length < 50 && "(min 50)"}
        </span>
        <span className="group-hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer">Paste text <Copy size={12} /></span>
      </div>
    </div>
  </div>
);

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
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>{renderSafe(item.category)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{renderSafe(item.difficulty)}</span>
          </div>
          <h4 className={`font-medium text-lg leading-snug transition-colors duration-300 ${isOpen ? 'text-sky-600' : 'text-slate-900'}`}>{renderSafe(item.question)}</h4>
        </div>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-sky-100 rotate-90 text-sky-600' : 'text-slate-300 group-hover:bg-slate-50'}`}><ChevronRight size={18} /></div>
      </button>
      {isOpen && (<div className="px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300"><div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-300"><p className="text-sm text-slate-600 italic"><span className="font-bold not-italic text-slate-900 mr-2">Goal:</span> {renderSafe(item.intent)}</p></div><div className="grid md:grid-cols-3 gap-4"><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Target</div><p className="text-sm text-slate-700 leading-relaxed">{renderSafe(item.starGuide?.situation)}</p></div><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Action</div><p className="text-sm text-slate-700 leading-relaxed">{renderSafe(item.starGuide?.action)}</p></div><div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100"><div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2">Result</div><p className="text-sm text-slate-700 leading-relaxed">{renderSafe(item.starGuide?.result)}</p></div></div></div>)}
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
            {String(skill.skill)}
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
        <div><h3 className="text-lg font-bold text-white leading-none">{renderSafe(intel.name || "Company Intelligence")}</h3><span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reconnaissance Data</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-3"><AlertTriangle size={14} /> Hiring Manager's Pain Points</h4>
            <ul className="space-y-3">
              {(intel.hiringManagerPainPoints || intel.keyChallenges || []).map((pain, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0"></span>{renderSafe(pain)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-3"><Globe size={14} /> Mission Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {(intel.missionKeywords || []).map((kw, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">#{renderSafe(kw)}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4"><Users size={14} /> "Insider" Talking Points</h4>
          <div className="space-y-4">
            {(intel.talkingPoints || []).map((point, i) => (
              <div key={i} className="flex gap-3"><div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold font-mono">{i + 1}</div><p className="text-sm text-slate-300 leading-relaxed">{renderSafe(point)}</p></div>
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
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Hook:</span> {renderSafe(pitch.hook)}</p>
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Value:</span> {renderSafe(pitch.body)}</p>
        <p><span className="font-bold text-amber-700 uppercase text-xs tracking-wider mr-2">The Close:</span> {renderSafe(pitch.close)}</p>
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
    const text = generateResumeText(tailoredData);
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(err => { fallbackCopyTextToClipboard(text); });
    } else {
        fallbackCopyTextToClipboard(text);
    }
  };
  
  const fallbackCopyTextToClipboard = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0"; textArea.style.left = "0"; textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus(); textArea.select();
      try {
          const successful = document.execCommand('copy');
          if (successful) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
      } catch (err) {}
      document.body.removeChild(textArea);
  };

  const generateResumeText = (data) => {
    if (!data) return '';
    let text = `${renderSafe(data.contact?.name)}\n${renderSafe(data.contact?.details)}\n\n`;
    
    text += `EDUCATION\n`;
    (data.education || []).forEach(edu => {
        text += `${renderSafe(edu.line)}\n`;
        if(edu.details) text += `${renderSafe(edu.details)}\n`;
        text += `\n`;
    });
    
    text += `EXPERIENCE\n`;
    (data.experience || []).forEach(exp => {
        text += `${renderSafe(exp.header)}\n`;
        (exp.bullets || []).forEach(bull => text += `• ${renderSafe(bull)}\n`);
        text += `\n`;
    });
    
    text += `PROJECTS\n`;
    (data.projects || []).forEach(proj => {
        text += `${renderSafe(proj.header)}\n`;
        (proj.bullets || []).forEach(bull => text += `• ${renderSafe(bull)}\n`);
        text += `\n`;
    });
    
    text += `SKILLS\n`;
    (data.skills || []).forEach(skill => {
      text += `${renderSafe(skill.category)}: ${renderSafe(skill.items)}\n`;
    });

    return text;
  };

  const handleDownload = () => {
    const text = generateResumeText(tailoredData);
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Tailored_Resume_PrepFlow.txt"; 
    document.body.appendChild(element);
    element.click();
  };

  if (!tailoredData) return <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 mt-8">Resume tailoring was skipped or failed. Focusing on interview prep.</div>;

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

      {tailoredData.resumeTalkingPoints && tailoredData.resumeTalkingPoints.length > 0 && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2"><MessageSquare size={20}/> How to Talk About Your Experience</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {tailoredData.resumeTalkingPoints.map((tp, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm mb-2">{renderSafe(tp.role)}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">"{renderSafe(tp.script)}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-lg border border-slate-200 overflow-hidden max-w-[850px] mx-auto text-slate-900 font-sans">
         <div className="p-12 space-y-6">
            <div className="text-center border-b border-slate-300 pb-6"><h1 className="text-3xl font-serif font-bold mb-2">{renderSafe(tailoredData.contact?.name || 'Candidate Name')}</h1><p className="text-sm text-slate-600 font-medium">{renderSafe(tailoredData.contact?.details || 'Email | Phone | LinkedIn')}</p></div>
            <div><h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 mb-3 pb-1 text-slate-800">Education</h2>{tailoredData.education?.map((edu, i) => (<div key={i} className="mb-3"><div className="flex justify-between font-bold text-sm"><span>{renderSafe(edu.line.split('|')[1] || edu.line)}</span><span>{renderSafe(edu.line.split('|')[2] || '')}</span></div><div className="flex justify-between text-sm italic mb-1"><span>{renderSafe(edu.line.split('|')[0])}</span><span>{renderSafe(edu.line.split('|')[4] || '')}</span></div><div className="text-xs text-slate-500 hidden">{edu.line}</div> {edu.details && <p className="text-sm text-slate-700">{renderSafe(edu.details)}</p>}</div>))}</div>
            <div><h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 mb-3 pb-1 text-slate-800">Experience</h2>{tailoredData.experience?.map((exp, i) => (<div key={i} className="mb-4"><div className="flex justify-between font-bold text-sm"><span>{renderSafe(exp.header.split('|')[0])}</span><span>{renderSafe(exp.header.split('|')[2] || '')}</span></div><div className="flex justify-between text-sm italic mb-1"><span>{renderSafe(exp.header.split('|')[1])}</span><span>{renderSafe(exp.header.split('|')[3] || '')}</span></div><ul className="list-disc list-outside ml-4 space-y-1">{exp.bullets?.map((b, j) => (<li key={j} className="text-sm text-slate-700 leading-relaxed pl-1">{renderSafe(b)}</li>))}</ul></div>))}</div>
             {tailoredData.projects && tailoredData.projects.length > 0 && (<div><h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 mb-3 pb-1 text-slate-800">Projects</h2>{tailoredData.projects.map((proj, i) => (<div key={i} className="mb-3"><div className="flex justify-between font-bold text-sm"><span>{renderSafe(proj.header.split('|')[0])}</span><span>{renderSafe(proj.header.split('|')[2] || '')}</span></div><div className="text-xs italic text-slate-600 mb-1">{renderSafe(proj.header.split('|')[1])}</div><ul className="list-disc list-outside ml-4 space-y-1">{proj.bullets?.map((b, j) => (<li key={j} className="text-sm text-slate-700 leading-relaxed pl-1">{renderSafe(b)}</li>))}</ul></div>))}</div>)}
             <div><h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 mb-3 pb-1 text-slate-800">Skills</h2><div className="space-y-1">{tailoredData.skills?.map((skill, i) => (<div key={i} className="text-sm text-slate-800"><span className="font-bold">{renderSafe(skill.category)}:</span> {renderSafe(skill.items)}</div>))}</div></div>
         </div>
      </div>
    </div>
  );
};

// --- INFO VIEWS (Populated) ---

const StrategyView = () => (
  <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4"><BrainCircuit size={14} /> AI Strategy Engine</div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Decode the Interview</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our system analyzes the job description to predict questions and simulate the actual interview environment.</p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8 mb-20">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Target size={24} /></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Targeted Questions</h3>
        <p className="text-slate-500 text-sm leading-relaxed">We generate 6 specific questions based on the role's requirements, not generic lists.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><MessageSquare size={24} /></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Feedback</h3>
        <p className="text-slate-500 text-sm leading-relaxed">Type your answer and get an instant score (1-10) with actionable coaching tips.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Volume2 size={24} /></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Voice Simulation</h3>
        <p className="text-slate-500 text-sm leading-relaxed">Listen to questions read aloud to practice your listening and pacing.</p>
      </div>
    </div>

    {/* Step-by-Step Guide */}
    <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
       <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">How to Master Your Prep</h3>
       <div className="space-y-8">
          <div className="flex gap-6 items-start">
             <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">1</div>
             <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Generate the Plan</h4>
                <p className="text-slate-600">Use the "Generate Interview Plan" button on the home screen. This analyzes your resume against the job description.</p>
             </div>
          </div>
          <div className="flex gap-6 items-start">
             <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">2</div>
             <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Study the Intel</h4>
                <p className="text-slate-600">Review the "Company Intelligence" card to understand the hiring manager's pain points and mission.</p>
             </div>
          </div>
          <div className="flex gap-6 items-start">
             <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">3</div>
             <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Enter Practice Mode</h4>
                <p className="text-slate-600">Click "Start Practice Session". Answer questions, get graded, and refine your "Elevator Pitch" until it's perfect.</p>
             </div>
          </div>
       </div>
    </div>
  </div>
);

const ResumeInfoView = () => (
  <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4"><FileEdit size={14} /> ATS Optimization</div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Beat the Screening Bots</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">We rewrite your resume to match the job description using high-impact language that passes ATS filters.</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8 mb-16">
       <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-900"><CheckCircle2 size={24} className="text-emerald-500"/> What We Optimize</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-slate-600"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5"/> <strong>Keyword Matching:</strong> We inject specific hard skills from the JD.</li>
            <li className="flex gap-3 text-slate-600"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5"/> <strong>Impact Verbs:</strong> Passive phrases are replaced with "Engineered", "Led", "Optimized".</li>
            <li className="flex gap-3 text-slate-600"><Check size={20} className="text-emerald-500 shrink-0 mt-0.5"/> <strong>Structure:</strong> We reorder sections (Education/Skills first) to match recruiter reading patterns.</li>
          </ul>
       </div>
       <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-900"><Layers size={24} className="text-blue-500"/> The Output</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-slate-600"><ChevronRight size={20} className="text-blue-500 shrink-0 mt-0.5"/> <strong>Formatted Markdown:</strong> A clean, professional document structure.</li>
            <li className="flex gap-3 text-slate-600"><ChevronRight size={20} className="text-blue-500 shrink-0 mt-0.5"/> <strong>Talking Points:</strong> "Human translation" notes for your interview.</li>
            <li className="flex gap-3 text-slate-600"><ChevronRight size={20} className="text-blue-500 shrink-0 mt-0.5"/> <strong>ATS Score:</strong> A match percentage to give you confidence.</li>
          </ul>
       </div>
    </div>

    {/* Visual Workflow */}
    <div className="bg-slate-900 text-white rounded-3xl p-10 text-center">
        <h3 className="text-2xl font-bold mb-8">The Optimization Pipeline</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"><FileText size={32} /></div>
                <span className="font-bold text-sm uppercase tracking-wider mt-2">Your Resume</span>
            </div>
            <ArrowRight size={24} className="text-slate-500 rotate-90 md:rotate-0"/>
            <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center"><Cpu size={32} /></div>
                <span className="font-bold text-sm uppercase tracking-wider mt-2">AI Analysis</span>
            </div>
            <ArrowRight size={24} className="text-slate-500 rotate-90 md:rotate-0"/>
             <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"><FileEdit size={32} /></div>
                <span className="font-bold text-sm uppercase tracking-wider mt-2">Tailored Draft</span>
            </div>
        </div>
    </div>
  </div>
);

const SafetyView = () => (<div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4"><Shield size={14} /> Enterprise Grade</div><h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Your data is yours.</h2><p className="text-lg text-slate-600">We believe interview preparation shouldn't come at the cost of privacy.</p></div><div className="space-y-6">{[{ icon: Lock, title: "Zero Retention Policy", desc: "Your resume and job descriptions are processed in memory and immediately discarded." }, { icon: Eye, title: "No Model Training", desc: "We do not use your inputs to train our public models. Your career history remains private to you." }, { icon: Server, title: "Encrypted Transport", desc: "All data sent between your browser and our analysis engine is encrypted via TLS 1.3 standards." }].map((item, i) => (<div key={i} className="flex gap-6 p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors"><div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-900"><item.icon size={24} strokeWidth={1.5} /></div><div><h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3><p className="text-slate-500 leading-relaxed">{item.desc}</p></div></div>))}
    <div className="mt-12 pt-10 border-t border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Questions? Contact the Developer</h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Keshav Kotteswaran</h4>
            <p className="text-sm text-slate-500">Bioengineer & Developer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="mailto:kotteswaran.k@northeastern.edu" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Mail size={16} /> Email
          </a>
          <a href="https://www.linkedin.com/in/keshav-kotteswaran/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-lg text-sm font-medium text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors">
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      </div>
    </div>
</div></div>);

// --- Practice Mode Component ---
const PracticeSession = ({ questions, onClose }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef(null);
  const audioCache = useRef({});
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(new Set());

  const question = (questions && questions.length > 0) ? questions[currentQIndex] : null;

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => { setTimer(seconds => seconds + 1); }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  useEffect(() => {
    if (!question) return;
    setAudioUrl(null); 
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    const loadVoice = async () => {
      if (audioCache.current[currentQIndex]) { setAudioUrl(audioCache.current[currentQIndex]); return; }
      setVoiceLoading(true);
      try { const blob = await getAIVoice(question.question); const url = URL.createObjectURL(blob); audioCache.current[currentQIndex] = url; setAudioUrl(url); } catch (e) { console.error("Voice failed", e); } finally { setVoiceLoading(false); }
    };
    loadVoice();
    setUserAnswer(''); setFeedback(null); setTimer(0); setIsActive(false); setShowHint(false);
  }, [currentQIndex, question]);

  // Speech Recognition Hook
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Stop logic would go here for a real continuous stream, but browser handles single shot well
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support voice recording. Please use Chrome or Edge.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => (prev ? prev + " " + transcript : transcript));
        if (!isActive) setIsActive(true);
      };
      
      recognition.start();
    }
  };

  const handlePlayAudio = () => { if (audioRef.current) { if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play(); setIsPlaying(true); } } };
  const handleGetFeedback = async () => { if (!userAnswer.trim() || !question) return; setLoadingFeedback(true); setIsActive(false); try { const data = await getAIFeedback(question.question, userAnswer); setFeedback(data); } catch (err) { console.error(err); } finally { setLoadingFeedback(false); } };
  const formatTime = (time) => { const minutes = Math.floor(time / 60); const seconds = time % 60; return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; };
  const markComplete = (score) => { const newCompleted = new Set(completed); newCompleted.add(currentQIndex); setCompleted(newCompleted); if (questions && currentQIndex < questions.length - 1) { setTimeout(() => { setCurrentQIndex(prev => prev + 1); }, 500); } };

  if (!question) return <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
      <div className="px-6 h-20 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg shadow-slate-900/20">{currentQIndex + 1}</div><span className="text-sm font-medium text-slate-500">Question {currentQIndex + 1} of {questions.length}</span></div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">{renderSafe(question.category)} • {renderSafe(question.difficulty)}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight relative group">{renderSafe(question.question)}</h2>
            <div className="flex justify-center">
              {audioUrl && (<audio ref={audioRef} src={audioUrl} autoPlay onEnded={() => setIsPlaying(false)} className="hidden" />)}
              <button onClick={handlePlayAudio} disabled={!audioUrl && !voiceLoading} className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${isPlaying ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{voiceLoading ? (<Loader2 size={20} className="animate-spin text-slate-400" />) : isPlaying ? (<StopCircle size={20} className="animate-pulse"/>) : (<Volume2 size={20} />)}<span className="text-sm font-medium">{voiceLoading ? 'Loading Voice...' : isPlaying ? 'Stop' : 'Listen to Question'}</span></button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-mono font-medium ${isActive ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}><Timer size={16} />{formatTime(timer)}</div>
              <div className="flex gap-2">
                 {/* Microphone Button */}
                 <button 
                   onClick={toggleListening}
                   className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                   title="Record Answer"
                 >
                   <Mic size={18} />
                 </button>
                 <button onClick={() => setIsActive(!isActive)} className="text-sm font-medium text-sky-600 hover:underline">{isActive ? 'Pause Timer' : 'Start Timer'}</button>
              </div>
            </div>
            <textarea value={userAnswer} onChange={(e) => { setUserAnswer(e.target.value); if (!isActive && !feedback) setIsActive(true); }} placeholder="Type your answer here or click the microphone to record..." className="w-full h-40 p-4 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-sky-500 text-slate-700 resize-none" disabled={!!feedback} />
            {!feedback && (<div className="mt-4 flex justify-end"><button onClick={handleGetFeedback} disabled={loadingFeedback || !userAnswer.trim()} className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all ${loadingFeedback || !userAnswer.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 hover:scale-105'}`}>{loadingFeedback ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />} Get AI Feedback</button></div>)}
          </div>
          {feedback && (<div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-8 border border-sky-100 animate-in slide-in-from-bottom-5"><div className="flex items-center gap-3 mb-6"><div className="p-2 bg-white rounded-lg shadow-sm text-sky-600"><Sparkles size={24} /></div><div><h3 className="text-lg font-bold text-slate-900">Coach Feedback</h3><div className="flex items-center gap-2"><div className="flex">{[...Array(10)].map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full mr-1 ${i < feedback.score ? 'bg-sky-500' : 'bg-slate-200'}`} />))}</div><span className="text-sm font-bold text-sky-700">{feedback.score}/10</span></div></div></div><div className="space-y-6"><div className="bg-white/60 rounded-xl p-4 border border-sky-100/50"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis</h4><p className="text-slate-700 leading-relaxed">{renderSafe(feedback.feedback)}</p></div><div className="bg-white rounded-xl p-4 border border-emerald-100/50 shadow-sm"><h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Check size={12} /> Better Example</h4><p className="text-slate-700 leading-relaxed italic">"{renderSafe(feedback.betterAnswer)}"</p></div></div><div className="mt-8 flex justify-end"><button onClick={() => { if (currentQIndex < questions.length - 1) { setCurrentQIndex(prev => prev + 1); } else { onClose(); } }} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all">Next Question <ArrowRight size={18} /></button></div></div>)}
          {!feedback && (<div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto mt-8"><button onClick={() => markComplete('high')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all gap-2"><ThumbsUp size={24} /><span className="font-bold text-sm">Nailed It (Skip)</span></button><button onClick={() => markComplete('low')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:scale-105 transition-all gap-2"><ThumbsDown size={24} /><span className="font-bold text-sm">Skip & Practice Later</span></button></div>)}
          {showHint ? (<div className="w-full max-w-3xl bg-white p-8 rounded-2xl text-left border border-sky-100 shadow-xl shadow-sky-100/50 animate-in slide-in-from-bottom-5 ring-4 ring-sky-50"><h4 className="font-bold text-sky-900 mb-4 flex items-center gap-2 text-lg"><Lightbulb size={20} className="text-sky-500" /> Strategic Approach</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"><div className="bg-sky-50 p-4 rounded-xl"><span className="font-bold block text-sky-700 mb-1 uppercase text-xs tracking-wider">Situation</span><p className="text-slate-700 leading-relaxed">{renderSafe(question.starGuide?.situation)}</p></div><div className="bg-sky-50 p-4 rounded-xl"><span className="font-bold block text-sky-700 mb-1 uppercase text-xs tracking-wider">Action</span><p className="text-slate-700 leading-relaxed">{renderSafe(question.starGuide?.action)}</p></div><div className="bg-sky-50 p-4 rounded-xl"><span className="font-bold block text-sky-700 mb-1 uppercase text-xs tracking-wider">Result</span><p className="text-slate-700 leading-relaxed">{renderSafe(question.starGuide?.result)}</p></div></div></div>) : (<button onClick={() => setShowHint(true)} className="text-slate-400 hover:text-sky-600 text-sm font-medium transition-colors flex items-center gap-2 mx-auto block"><Eye size={16} /> Reveal Strategy Hints</button>)}
        </div>
      </div>
    </div>
  );
};

// --- Main View Controller ---

const ProductView = () => {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [error, setError] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [resultTab, setResultTab] = useState('prep'); 
  const resultRef = useRef(null);

  const handleGenerate = async () => {
    if (!resume.trim() || !jobDesc.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setTailoredResume(null);
    
    try {
      // Sequential Loading
      const resumeData = await generateTailoredResume(resume, jobDesc)
        .catch(err => { console.error("Resume Error:", err); return null; });
      
      if (resumeData) {
        setTailoredResume(resumeData);
      }

      const prepData = await generateInterviewPrep(resume, jobDesc)
        .catch(err => { console.error("Prep Error:", err); return null; });

      if (prepData) {
        setResult(prepData);
        setResultTab('prep'); // Default to strategy
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
      {practiceMode && result && (
        <PracticeSession questions={result.questions || []} onClose={() => setPracticeMode(false)} />
      )}

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900">Master your <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 animate-gradient-x">next interview.</span></h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">Deep-dive analysis, visualization, and AI-simulated interviews tailored to your unique profile.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="h-96"><InputCard title="Your Resume" icon={FileText} placeholder="Paste your full resume text here..." value={resume} onChange={setResume} colorClass="from-pink-300 to-rose-300" /></div>
        <div className="h-96"><InputCard title="Job Description" icon={Briefcase} placeholder="Paste the job requirements and responsibilities here..." value={jobDesc} onChange={setJobDesc} colorClass="from-sky-300 to-blue-300" /></div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-24">
        <button onClick={handleGenerate} disabled={loading || !resume || !jobDesc} className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 ${!resume || !jobDesc ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 hover:shadow-2xl hover:shadow-sky-200/50'}`}>{loading ? (<><Loader2 className="animate-spin" size={20} /><span>Analyzing & Tailoring...</span></>) : (<><span>Generate Prep Plan</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>)}</button>
        {error && (<div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-4 py-2 rounded-lg text-sm border border-pink-100"><AlertCircle size={16} />{error}</div>)}
      </div>

      {(result || tailoredResume) && (
        <div ref={resultRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-full flex gap-1">
              <button onClick={() => setResultTab('prep')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${resultTab === 'prep' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Interview Strategy</button>
              <button onClick={() => setResultTab('resume')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${resultTab === 'resume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tailored Resume</button>
            </div>
          </div>

          {resultTab === 'resume' && tailoredResume && (
            <ResumeTailor originalResume={resume} tailoredData={tailoredResume} />
          )}

          {resultTab === 'prep' && result && (
            <div className="space-y-16">
              <div><div className="flex items-center gap-3 mb-8"><BarChart3 className="text-sky-500" size={28} /><h2 className="text-3xl font-bold text-slate-900 tracking-tight">Role Intelligence</h2></div><div className="grid md:grid-cols-3 gap-8"><div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center"><h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Candidate Fit Dimension</h3><RadarChart data={result.dimensions} /></div><div className="md:col-span-2 space-y-6"><div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"><VibeEqualizer vibe={result.roleVibe} /></div><div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Skill Match Network</h3><div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider"><span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Match</span><span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Partial</span></div></div><SkillCloud skills={result.skillAnalysis} /></div></div></div></div>
              
              <CompanyIntelCard intel={result.companyIntel} />
              
              {/* NEW: Elevator Pitch Section */}
              <ElevatorPitch pitch={result.elevatorPitch} />

              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div><div className="flex items-end justify-between mb-8"><div><h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interview Simulation</h2><p className="text-slate-500 mt-2">Questions sorted by probability of being asked.</p></div><button onClick={() => setPracticeMode(true)} className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/10"><Play size={16} fill="currentColor" /> Start Practice Session</button></div><div className="space-y-4">{(result.questions || []).map((q, index) => (<QuestionCard key={index} item={q} index={index} />))}</div><button onClick={() => setPracticeMode(true)} className="md:hidden w-full mt-8 flex justify-center items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full font-medium shadow-xl"><Play size={16} fill="currentColor" /> Start Practice Session</button></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-sky-100 relative"><BackgroundGradient /><Nav activeTab={activeTab} setActiveTab={setActiveTab} /><main className="min-h-[calc(100vh-8rem)]">{activeTab === 'home' && <ProductView />}{activeTab === 'strategy' && <StrategyView />}{activeTab === 'resume-info' && <ResumeInfoView />}{activeTab === 'safety' && <SafetyView />}</main><footer className="border-t border-slate-100 bg-white/50 backdrop-blur-md py-12 relative z-10"><div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"><div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"><div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white"><Sparkles size={12} fill="currentColor" /></div><span className="font-bold tracking-tight text-slate-900">PrepFlow AI</span></div><p className="text-slate-400 text-sm">© 2025 PrepFlow AI. Designed with focus.</p></div></footer></div>
  );
}
