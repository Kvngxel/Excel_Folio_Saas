import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Database,
  Lock,
  Mail,
  Play,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';

interface LandingPageProps {
  onAuthSuccess?: (view: 'public' | 'admin_dashboard') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const clearForm = () => {
    setError('');
    setHandle('');
    setEmail('');
    setPassword('');
  };

  const validate = () => {
    if (mode === 'signup' && handle.trim().length < 2) {
      setError('Choose a handle with at least 2 characters.');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      clearForm();
      setIsAuthOpen(false);
      if (onAuthSuccess) {
        onAuthSuccess('admin_dashboard');
      }
    } catch (submitError: any) {
      const message = submitError?.message || '';
      const code = submitError?.code || '';

      if (code === 'auth/email-already-in-use') {
        setError('This email is already connected to an account. Try signing in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address to continue.');
      } else if (code === 'auth/weak-password') {
        setError('Your password should be at least 6 characters long.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Those sign-in details do not match our records. Please check your email and password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(message.replace('Firebase: ', '') || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 via-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-white">PortfolioFlow</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setIsAuthOpen(true);
              clearForm();
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-violet-500/40 hover:text-white"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Next-Gen Portfolio Site Builder for Creators & Engineers
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Build a High-Impact Portfolio in Minutes.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              Launch a polished personal brand, showcase your work, and give visitors an instant AI-powered guide to your expertise.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setIsAuthOpen(true);
                  clearForm();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_35px_rgba(168,85,247,0.45)] transition hover:scale-[1.01]"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => window.open('/p/eze', '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-zinc-100 transition hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <Play className="h-4 w-4" />
                View Demo Portfolio
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                2-minute setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Public share URL
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                AI visitor assistant
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-4xl bg-linear-to-br from-violet-500/20 via-transparent to-cyan-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-cyan-400 text-sm font-black text-white">
                      EE
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Eze Excel</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Developer Designer</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                    Live
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-linear-to-br from-zinc-900 to-zinc-800 p-4">
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    <span>Portfolio Preview</span>
                    <span>/p/eze</span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-zinc-950/80 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300">Available</p>
                      <h3 className="mt-2 text-2xl font-black text-white">Visual Experiences Reimagined.</h3>
                      <p className="mt-2 text-sm text-zinc-300">
                        Designing digital products that turn bold ideas into polished, memorable experiences.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-violet-500/10 p-3 ring-1 ring-violet-500/20">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-violet-200">Design Focus</p>
                        <p className="mt-2 text-sm font-semibold text-white">Interactive 3D & UI</p>
                      </div>
                      <div className="rounded-2xl bg-cyan-500/10 p-3 ring-1 ring-cyan-500/20">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-200">Performance</p>
                        <p className="mt-2 text-sm font-semibold text-white">60 FPS Visuals</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-3">
                      <div className="flex items-center justify-between text-sm font-medium text-zinc-300">
                        <span>AI assistant</span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                          Ready
                        </span>
                      </div>
                      <div className="mt-3 rounded-xl bg-zinc-950 p-3 text-sm text-zinc-300">
                        “What kind of work do you do?”
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">Why creators choose it</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Everything your portfolio needs, in one builder.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="h-5 w-5 text-violet-300" />,
                title: 'Instant Dynamic Subpaths',
                text: 'Claim a unique /p/your-handle URL instantly and publish a live portfolio that feels custom-built from day one.',
              },
              {
                icon: <Database className="h-5 w-5 text-cyan-300" />,
                title: 'Realtime Database Sync',
                text: 'Edits reflect in milliseconds through Firebase RTDB, so your portfolio stays live and responsive as you iterate.',
              },
              {
                icon: <Bot className="h-5 w-5 text-fuchsia-300" />,
                title: 'Embedded AI Showcase',
                text: 'Give visitors a smart assistant trained on your background, expertise, and portfolio story to answer common questions.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/15 to-cyan-500/10 ring-1 ring-white/10">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-4xl border border-violet-500/20 bg-linear-to-r from-violet-500/10 via-zinc-900/80 to-cyan-500/10 p-8 sm:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">Launch faster</p>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Turn your profile into a high-converting portfolio.</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setIsAuthOpen(true);
                clearForm();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in rounded-4xl border border-white/10 bg-zinc-950/95 p-6 shadow-[0_25px_80px_rgba(88,28,135,0.45)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">{mode === 'signup' ? 'Create account' : 'Welcome back'}</p>
                <h3 className="mt-2 text-2xl font-black text-white">{mode === 'signup' ? 'Start building' : 'Sign in'}</h3>
              </div>
              <button type="button" onClick={() => setIsAuthOpen(false)} className="rounded-full bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Claim URL handle</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-3 py-3">
                    <span className="text-sm text-zinc-500">/p/</span>
                    <input
                      value={handle}
                      onChange={(event) => setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24))}
                      placeholder="your-handle"
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 px-3 py-3">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 px-3 py-3">
                  <Lock className="h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : mode === 'signup' ? 'Create portfolio' : 'Sign in'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-zinc-400">
              {mode === 'signup' ? 'Already have an account?' : "Need an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  setError('');
                }}
                className="font-semibold text-violet-300 hover:text-violet-200"
              >
                {mode === 'signup' ? 'Sign in' : 'Create one'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
