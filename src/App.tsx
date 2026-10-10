import React, { useState, useEffect, useRef } from 'react';
import { ref, get, set } from 'firebase/database';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Palette, 
  Eye, 
  Zap, 
  Play, 
  Star,
  ExternalLink,
  Lock,
  Settings,
  LayoutGrid,
  Plus,
  Save,
  Trash2,
  Edit2,
  LogOut,
  X,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';

const customStyles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .animate-slide-in {
    animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .glass-card {
    background: rgba(18, 18, 24, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-pill {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .text-gradient {
    background: linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  stats: string;
  featured?: boolean;
}

interface SiteConfig {
  authorName: string;
  authorTitle: string;
  heroBadge: string;
  heroAvailability: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroDescription: string;
  heroFeature1Label: string;
  heroFeature1Value: string;
  heroFeature2Label: string;
  heroFeature2Value: string;
  heroFeature3Label: string;
  heroFeature3Value: string;
  heroFeature4Label: string;
  heroFeature4Value: string;
  projects: ProjectItem[];
  footerText: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  authorName: "Eze Excel",
  authorTitle: "Developer Designer",
  heroBadge: "Next-Gen Digital Craftsmanship",
  heroAvailability: "Q3 Availability Open",
  heroTitle1: "Visual",
  heroTitleHighlight: "Experiences",
  heroTitle2: "Reimagined.",
  heroDescription: "Blending spatial computing, high-impact brand identities, and immersive UI micro-interactions into unified digital products.",
  heroFeature1Label: "Design Focus",
  heroFeature1Value: "Interactive 3D & UI",
  heroFeature2Label: "Performance",
  heroFeature2Value: "60 FPS Visuals",
  heroFeature3Label: "Brand Systems",
  heroFeature3Value: "Multi-Platform",
  heroFeature4Label: "Client Rating",
  heroFeature4Value: "5.0 Outstanding",
  projects: [
    {
      id: '1',
      title: 'Aetheria Spatial Operating System',
      category: 'Spatial',
      description: 'A revolutionary visionOS design system tailored for immersive 3D gestures and ambient lighting responsive UI.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      stats: '+140% Engagement',
      featured: true
    },
    {
      id: '2',
      title: 'Prism Neon Brand Identity',
      category: 'Branding',
      description: 'Dynamic identity with real-time generative vector logos adapting to user screen dimensions.',
      imageUrl: 'https://images.unsplash.com/photo-1626785773579-c13f6ab88eb5?auto=format&fit=crop&w=800&q=80',
      stats: 'Global Rebrand'
    }
  ],
  footerText: "© 2026 Eze Excel. All rights reserved."
};

const AdminInput: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  textarea?: boolean;
  type?: string;
}> = ({ label, value, onChange, textarea = false, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">{label}</label>
    {textarea ? (
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors resize-none"
        rows={4}
      />
    ) : (
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
      />
    )}
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

const AuthGateway: React.FC<{ setView: (v: 'public' | 'admin_dashboard') => void }> = ({ setView }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setView('admin_dashboard');
    } catch (error: any) {
      setErr(error.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4 py-20">
      <form onSubmit={handleAuth} className="glass-card p-8 md:p-10 rounded-[2rem] w-full max-w-md animate-fade-in shadow-2xl shadow-black/50 border border-white/10">
        <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-zinc-700/50">
          <Lock className="text-violet-400" size={28} />
        </div>
        <h2 className="text-2xl font-black text-center text-white mb-2 tracking-tight">Site Maker Auth</h2>
        <p className="text-zinc-400 text-center text-sm mb-8 font-light">
          {isSignUp ? 'Create an account to build your site.' : 'Sign in to edit your portfolio.'}
        </p>
        
        <AdminInput label="Email Address" type="email" value={email} onChange={setEmail} />
        <AdminInput label="Password" type="password" value={password} onChange={setPassword} />
        
        {err && <p className="text-red-400 text-xs mb-4 font-medium px-1">{err}</p>}
        
        <button type="submit" className="w-full bg-white text-zinc-950 font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] mt-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setErr(''); }} 
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign in.' : "Don't have an account? Create one."}
          </button>
        </div>
        
        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <button type="button" onClick={() => { window.location.hash = ''; setView('public'); }} className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors">
            ← Return to live site
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC<{
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  setView: (v: 'public' | 'admin_dashboard') => void;
  currentUser: User;
}> = ({ config, setConfig, setView, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'projects' | 'settings'>('hero');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveProject = () => {
    if (!editingProject) return;
    
    if (editingProject.id === 'new') {
      setConfig({
        ...config,
        projects: [{ ...editingProject, id: Date.now().toString() }, ...config.projects]
      });
    } else {
      setConfig({
        ...config,
        projects: config.projects.map(p => p.id === editingProject.id ? editingProject : p)
      });
    }
    setEditingProject(null);
  };

  const confirmDeleteProject = (id: string) => {
    setConfig({
      ...config,
      projects: config.projects.filter(p => p.id !== id)
    });
    setDeletingId(null);
  };

  const publishToFirebase = async () => {
    try {
      // Dynamic Path: Saves to a unique node based on the user's ID
      const dbRef = ref(db, `portfolios/${currentUser.uid}`);
      await set(dbRef, config);
      alert('Portfolio successfully published to Realtime Database! 🚀');
    } catch (err) {
      console.error(err);
      alert('Error saving to Realtime Database. Check console for details.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.hash = '';
    setView('public');
  };

  return (
    <div className="min-h-screen relative z-10 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 glass-card p-6 rounded-3xl gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Site Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{config.authorName}'s Workspace</h1>
            <p className="text-xs text-zinc-500 mt-1">Logged in as {currentUser.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={publishToFirebase}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/20"
            >
              Publish Site
            </button>
            <button onClick={() => { window.location.hash = ''; setView('public'); }} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors border border-white/5">
              View Live Site
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20" title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-2 lg:col-span-1 glass-card p-4 rounded-3xl h-fit">
            <TabButton active={activeTab==='hero'} onClick={() => {setActiveTab('hero'); setEditingProject(null);}} icon={<Settings size={18} />} label="Hero & Identity" />
            <TabButton active={activeTab==='projects'} onClick={() => setActiveTab('projects')} icon={<LayoutGrid size={18} />} label="Gallery Projects" />
            <TabButton active={activeTab==='settings'} onClick={() => {setActiveTab('settings'); setEditingProject(null);}} icon={<Zap size={18} />} label="Global Config" />
          </div>

          <div className="lg:col-span-3 glass-card p-6 md:p-8 rounded-3xl">
            {activeTab === 'hero' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UserCheck size={20} className="text-violet-400"/> Personal Identity</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <AdminInput label="Your Full Name (Logo Display)" value={config.authorName} onChange={(v) => setConfig({...config, authorName: v})} />
                    <AdminInput label="Professional Role / Subtitle" value={config.authorTitle} onChange={(v) => setConfig({...config, authorTitle: v})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-violet-400"/> Hero Section Copy</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <AdminInput label="Availability Badge" value={config.heroBadge} onChange={(v) => setConfig({...config, heroBadge: v})} />
                    <AdminInput label="Availability Status" value={config.heroAvailability} onChange={(v) => setConfig({...config, heroAvailability: v})} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 mt-4">
                    <AdminInput label="Title Prefix" value={config.heroTitle1} onChange={(v) => setConfig({...config, heroTitle1: v})} />
                    <AdminInput label="Title Highlight" value={config.heroTitleHighlight} onChange={(v) => setConfig({...config, heroTitleHighlight: v})} />
                    <AdminInput label="Title Suffix" value={config.heroTitle2} onChange={(v) => setConfig({...config, heroTitle2: v})} />
                  </div>
                  <div className="mt-4">
                    <AdminInput label="Main Hero Description" textarea value={config.heroDescription} onChange={(v) => setConfig({...config, heroDescription: v})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="animate-fade-in">
                {!editingProject ? (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2"><LayoutGrid size={20} className="text-violet-400"/> Portfolio Projects</h2>
                      <button onClick={() => setEditingProject({id: 'new', title: '', category: '', description: '', imageUrl: '', stats: ''})} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-violet-600/20">
                        <Plus size={16}/> Add Project
                      </button>
                    </div>
                    
                    {!config.projects || config.projects.length === 0 ? (
                      <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800">
                        <ImageIcon size={48} className="mx-auto text-zinc-700 mb-3" />
                        <p className="text-zinc-400 text-sm">No projects currently available.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {config.projects.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors rounded-2xl border border-zinc-800 group">
                            <div className="flex items-center gap-4">
                              <img src={p.imageUrl} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-zinc-950" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=200&q=80' }} />
                              <div>
                                <div className="font-bold text-white text-sm md:text-base">{p.title}</div>
                                <div className="text-xs text-zinc-400 mt-0.5">{p.category} • {p.stats}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {deletingId === p.id ? (
                                <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/30 p-1.5 rounded-xl">
                                  <span className="text-[10px] text-red-300 font-bold px-1">Delete?</span>
                                  <button onClick={() => confirmDeleteProject(p.id)} className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg">Yes</button>
                                  <button onClick={() => setDeletingId(null)} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg">No</button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => setEditingProject(p)} className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors"><Edit2 size={16}/></button>
                                  <button onClick={() => setDeletingId(p.id)} className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingProject.id === 'new' ? <><Plus size={20} className="text-violet-400"/> New Project</> : <><Edit2 size={20} className="text-violet-400"/> Edit Project</>}
                      </h2>
                      <button onClick={() => setEditingProject(null)} className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors"><X size={18}/></button>
                    </div>
                    
                    <AdminInput label="Project Title" value={editingProject.title} onChange={(v) => setEditingProject({...editingProject, title: v})} />
                    <AdminInput label="Category" value={editingProject.category} onChange={(v) => setEditingProject({...editingProject, category: v})} />
                    <AdminInput label="Highlight Stat" value={editingProject.stats} onChange={(v) => setEditingProject({...editingProject, stats: v})} />
                    <AdminInput label="Image URL" value={editingProject.imageUrl} onChange={(v) => setEditingProject({...editingProject, imageUrl: v})} />
                    <AdminInput label="Detailed Description" textarea value={editingProject.description} onChange={(v) => setEditingProject({...editingProject, description: v})} />
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                      <button onClick={handleSaveProject} className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold flex-1 hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                        <Save size={18}/> Save Project
                      </button>
                      <button onClick={() => setEditingProject(null)} className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold sm:w-1/3 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap size={20} className="text-violet-400"/> Global Site Settings</h2>
                <AdminInput label="Footer Copyright Text" value={config.footerText} onChange={(v) => setConfig({...config, footerText: v})} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BackgroundGlows: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <style>{customStyles}</style>
    <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-violet-600/20 rounded-full blur-[140px] animate-blob" />
    <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] bg-fuchsia-600/15 rounded-full blur-[140px] animate-blob [animation-delay:3s]" />
    <div className="absolute bottom-[-10%] left-[25%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-600/15 rounded-full blur-[140px] animate-blob [animation-delay:6s]" />
  </div>
);

const FeaturePill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
      {icon}
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  </div>
);

const VisualHero: React.FC<{ config: SiteConfig, onExploreClick: () => void }> = ({ config, onExploreClick }) => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/60 border border-violet-500/30 text-xs font-semibold text-zinc-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:bg-zinc-800 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-violet-300 font-medium">{config.heroBadge}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{config.heroAvailability}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.05] mb-8">
            {config.heroTitle1} <span className="text-gradient italic pr-2">{config.heroTitleHighlight}</span>
            <br />
            {config.heroTitle2}
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl font-light leading-relaxed mb-10">
            {config.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <button 
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-zinc-950 font-bold text-sm tracking-wide hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
            >
              Explore Visual Work
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
            <FeaturePill icon={<Sparkles className="w-4 h-4" />} label={config.heroFeature1Label} value={config.heroFeature1Value} />
            <FeaturePill icon={<Zap className="w-4 h-4" />} label={config.heroFeature2Label} value={config.heroFeature2Value} />
            <FeaturePill icon={<Palette className="w-4 h-4" />} label={config.heroFeature3Label} value={config.heroFeature3Value} />
            <FeaturePill icon={<Star className="w-4 h-4" />} label={config.heroFeature4Label} value={config.heroFeature4Value} />
          </div>

        </div>
      </div>
    </section>
  );
};

const PortfolioCard: React.FC<{ item: ProjectItem }> = ({ item }) => (
  <div className="group relative rounded-3xl overflow-hidden glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(139,92,246,0.25)] flex flex-col h-[420px] animate-fade-in">
    <img 
      src={item.imageUrl} 
      alt={item.title} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80' }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

    <div className="relative p-6 flex justify-between items-start z-10">
      <div className="flex items-center gap-2">
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-950/60 backdrop-blur-md text-violet-300 border border-violet-500/20">
          {item.category}
        </span>
      </div>
      <span className="text-[10px] uppercase font-bold text-zinc-300 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {item.stats}
      </span>
    </div>

    <div className="relative mt-auto p-6 z-10 flex flex-col justify-end">
      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
        {item.title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 font-light mb-4 leading-relaxed">
        {item.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1 group-hover:text-violet-300">
          Explore Case Study
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  </div>
);

const HeaderNavbar: React.FC<{ 
  authorName: string;
  authorTitle: string;
  onAdminClick: () => void;
  currentUser: User | null;
}> = ({ authorName, authorTitle, onAdminClick, currentUser }) => {
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';

  return (
    <header className="fixed top-4 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-3xl mx-auto px-4">
        <div className="pointer-events-auto px-6 py-3.5 rounded-full glass-pill flex items-center justify-between gap-4 shadow-2xl hover:border-violet-500/30 transition-all">
          
          <a href="#" className="flex items-center gap-3 group pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-[1px] shadow-sm shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-tighter">
                {initials}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base text-white tracking-tight leading-none group-hover:text-violet-300 transition-colors">
                {authorName}
              </span>
              <span className="text-[10.5px] text-zinc-400 font-medium leading-none mt-1 hidden sm:block">
                {authorTitle}
              </span>
            </div>
          </a>

          <button 
            onClick={onAdminClick}
            className={`p-2 hover:text-white rounded-full transition-colors flex items-center gap-2 text-xs font-semibold ${currentUser ? 'text-violet-400 bg-violet-500/10 hover:bg-violet-500/20' : 'text-zinc-400 hover:bg-white/5'}`}
            title="Open Site Builder"
          >
            {currentUser ? <Edit2 size={15} /> : <Lock size={15} />} 
            <span className="hidden sm:inline">{currentUser ? 'Workspace' : 'Site Builder'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'public' | 'admin_dashboard'>('public');
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin') {
        setView('admin_dashboard');
      } else {
        setView('public');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch unique data when a user logs in
  useEffect(() => {
    const fetchCloudData = async () => {
      // If a user is logged in, we fetch THEIR specific portfolio node.
      // Otherwise, we load the default demo node so the public site has content to show.
      const targetPath = currentUser ? `portfolios/${currentUser.uid}` : 'portfolios/demo-user-1';
      
      try {
        const dbRef = ref(db, targetPath);
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const fetchedData = snapshot.val();
          setConfig({
            ...DEFAULT_CONFIG,
            ...fetchedData,
            projects: fetchedData.projects || []
          });
        } else if (currentUser) {
          // If a new user just signed up, load the default template for them to start editing
          setConfig(DEFAULT_CONFIG);
        }
      } catch (error) {
        console.error("Error loading from Firebase RTDB:", error);
      }
    };

    if (!isAuthChecking) {
      fetchCloudData();
    }
  }, [currentUser, isAuthChecking]);

  if (isAuthChecking) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-violet-400">Loading...</div>;

  const categories = ['All', ...Array.from(new Set((config.projects || []).map(p => p.category)))];
  const filteredProjects = selectedCategory === 'All' 
    ? (config.projects || []) 
    : (config.projects || []).filter(p => p.category === selectedCategory);

  const handleExploreScroll = (): void => {
    const section = document.getElementById('work-gallery');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30 selection:text-white relative overflow-x-hidden">
      <BackgroundGlows />

      <HeaderNavbar 
        authorName={config.authorName}
        authorTitle={config.authorTitle}
        onAdminClick={() => { window.location.hash = '#/admin'; }}
        currentUser={currentUser}
      />

      {/* Security Check: If they are trying to view the dashboard but aren't logged in, show Auth Gateway */}
      {view === 'admin_dashboard' && !currentUser && <AuthGateway setView={setView} />}
      
      {/* If they are viewing the dashboard and ARE logged in, show their workspace */}
      {view === 'admin_dashboard' && currentUser && <AdminDashboard config={config} setConfig={setConfig} setView={setView} currentUser={currentUser} />}

      {view === 'public' && (
        <main className="relative z-10 flex flex-col min-h-screen">
          <VisualHero config={config} onExploreClick={handleExploreScroll} />

          <section id="work-gallery" className="py-20 relative z-10 scroll-mt-12 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-widest uppercase mb-2">
                    <Eye className="w-4 h-4" /> Curated Showcase
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Featured Case Studies
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                          : 'glass-card text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                 <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 font-medium">No projects in this category.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project) => (
                    <PortfolioCard key={project.id} item={project} />
                  ))}
                </div>
              )}

            </div>
          </section>

          <footer className="relative z-10 border-t border-white/10 py-10 mt-auto bg-zinc-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-medium text-zinc-500 text-center sm:text-left">{config.footerText}</p>
              <div className="flex items-center gap-6">
                 <a href="#/admin" className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 hover:text-violet-400 transition-colors flex items-center gap-1.5">
                   <Lock size={12} /> Site Builder Access
                 </a>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
};

export default App;