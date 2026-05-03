import React, { useRef, useEffect,useState } from 'react';
import { motion, useScroll, useTransform ,AnimatePresence} from 'framer-motion';
import { Brain, ArrowRight, Sparkles, ShieldCheck, Zap, Code, Book, CreditCard ,Badge,Star,Shield,Check,X} from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import axios from 'axios';

const plans = [
  {
    id: 'hobby',
    name: 'Hobby',
    icon: Star,
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for personal projects and learning.',
    features: ['5 Repositories', 'Basic Security Audit', 'AI Logic Mapping', 'Community Support'],
    cta: 'Start for Free'
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: { monthly: 49, yearly: 39 },
    description: 'Advanced tools for professional developers.',
    features: ['Unlimited Repos', 'Deep Security Scan', 'Refactoring Suggestions', 'Priority AI Access'],
    cta: 'Get Started Pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Shield,
    price: { monthly: 199, yearly: 159 },
    description: 'Custom solutions for large scale teams.',
    features: ['Custom AI Training', 'SSO & IAM', 'Dedicated Support', 'SLA Guarantee'],
    cta: 'Contact Sales'
  }
];

const LandingPage = () => {
  const videoRef = useRef(null);
  const [frequency, setFrequency] = useState('monthly');
  const { scrollY } = useScroll();

  const [authMode, setAuthMode] = useState(null); // 'login', 'signup', ya null
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const videoBlur = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(12px)"]);
  const videoOpacity = useTransform(scrollY, [0, 400], [0.6, 0.3]); // Video scroll par thodi dark hogi
  const contentY = useTransform(scrollY, [0, 400], [150, 0]); // Text niche se upar aayega
  const contentOpacity = useTransform(scrollY, [0, 300], [0, 1]); // Shuru mein text hidden rahega

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85; 
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      // Axios request to your backend (port 5000)
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      // Token save karo
      localStorage.setItem('token', res.data.token);
      
      // Modal band karo
      setAuthMode(null);
      
      // Dashboard par bhejo
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[180vh] w-full bg-[#020617] overflow-x-hidden font-sans">
      
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <motion.video
          ref={videoRef}
          style={{ filter: videoBlur, opacity: videoOpacity }}
          autoPlay loop muted playsInline
          className="w-auto h-auto min-w-full min-h-full object-cover pointer-events-none"
        >
          <source src="/video.mp4" type="video/mp4" />
        </motion.video>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]"></div>
      </div>

      {/* 🟢 2. NAVBAR (Updated with more sections) */}
      <nav className="fixed top-3 left-0 right-0 z-50 flex justify-between items-center px-10 py-2 max-w-7xl mx-auto backdrop-blur-md bg-white/5 border-b border-white/10 mt-2 rounded-2xl">
        <div className="flex items-center gap-2 font-bold text-2xl text-white">
          <div className="p-2">
            <Brain size={24} className="text-white" />
          </div>
          <span className="tracking-tighter text-blue-200">DevOnboard<span className="text-amber-50">.ai</span></span>
        </div>

        {/* Professional Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          <a href="#features" className="hover:text-white transition-all flex items-center gap-2"><Code size={14}/> Explore</a>
          <a href="#docs" className="hover:text-white transition-all flex items-center gap-2"><Book size={14}/> Docs</a>
          <a href="#pricing" className="hover:text-white transition-all flex items-center gap-2"><CreditCard size={14}/> Pricing</a>
        </div>

        <div className="flex gap-6 items-center font-bold text-slate-300 text-sm tracking-wide">
          <button 
            onClick={() => setAuthMode('login')} 
            className="hover:text-white transition-all uppercase"
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthMode('signup')}
            className="hover:text-white transition-all uppercase bg-indigo-600 px-6 py-2 rounded-xl text-xs active:scale-95 shadow-lg shadow-indigo-600/30"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 🟢 3. INITIAL VIEW (Empty space so video is visible first) */}
      <section className="relative z-10 h-screen flex items-end justify-center pb-20 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-bounce p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
            <ArrowRight size={24} className="rotate-90 text-indigo-400" />
          </div>
          <span className="text-[15px] font-black uppercase  text-indigo-400">Scroll to Explore Intelligence</span>
        </motion.div>
      </section>

      {/* 🟢 4. REVEALED CONTENT (Appears on Scroll) */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center pt-10 px-6 min-h-screen">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="max-w-5xl flex flex-col items-center"
        >

          <div className="inline-flex items-center gap-2 px-6 py-2  mb-20">
          
        </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-8 tracking-tighter drop-shadow-2xl">
            Lost in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500">
              Unknown Code ?
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-300 text-lg md:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-lg">
            From "What is this?" to "I got this!" in minutes. Maps your repo, audits security, and refactors spaghetti code instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-24">
            <button 
              onClick={() => setAuthMode('signup')}
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155, 135, 245, 0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto">
            
              Let’s Begin 
            </button>
            
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>

          {/* 🟢 ENHANCED FEATURES SECTION */}
        <section id="features" className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-10">

            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
              Engineered for <span className="text-indigo-500">Autonomous</span> Mastery.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
              Everything you need to transform from a stranger to a senior contributor in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Zap size={32} />, 
                title: "Instant Audit", 
                desc: "Deep vector search through your entire repository to find logic flows and bottlenecks in milliseconds.",
                color: "rgba(99, 102, 241, 0.25)" // Indigo
              },
              { 
                icon: <ShieldCheck size={32} />, 
                title: "Security Shield", 
                desc: "Automated scan for hardcoded secrets, SQL injections, and vulnerable patterns across every branch.",
                color: "rgba(16, 185, 129, 0.2)" // Emerald
              },
              { 
                icon: <Brain size={32} />, 
                title: "Semantic Context", 
                desc: "Ask any complex architecture question and get line-by-line citations directly from your source code.",
                color: "rgba(6, 182, 212, 0.2)" // Cyan
              }
            ].map((f, i) => (
              <FeatureCard key={i} spotlightColor={f.color}>
                <div className="flex flex-col h-full">
                  <div className="mb-8 p-4 bg-white/5 w-fit rounded-2xl text-white border border-white/10 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium mb-8">
                    {f.desc}
                  </p>
                  
                </div>
              </FeatureCard>
            ))}
          </div>
        </section>


{/* 🟢 2. PRICING SECTION (Fixed Version) */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-center text-white">
        <div className="mb-16">

          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Choose Your Plan</h2>
          
          {/* Custom Tabs Switcher (No shadcn needed) */}
          <div className="flex bg-white/5 p-1 rounded-2xl w-fit mx-auto border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => setFrequency('monthly')}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${frequency === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setFrequency('yearly')}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${frequency === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Yearly <span className="ml-1 text-[10px] text-emerald-400 font-black">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -10 }}
              className={`relative p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 flex flex-col text-left ${
                plan.popular ? 'bg-white/10 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Recommended
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <plan.icon className="text-indigo-400" size={28} />
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">
                    ${plan.price[frequency]}
                  </span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <Check size={16} className="text-indigo-500" /> {feat}
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 ${
                plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

        </motion.div>
      </main>


      {/* 🟢 NEW: AUTHENTICATION MODAL */}
      <AnimatePresence>
        {authMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthMode(null)} // Click outside to close
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setAuthMode(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                {authMode === 'login' ? 'Enter your credentials to access your workspace.' : 'Join the future of codebase intelligence.'}
              </p>

              {/* Error Message Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" 
                  />
                )}
                
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" 
                />
                
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" 
                />
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              {/* Switch Mode */}
              <p className="mt-6 text-center text-sm text-slate-500 font-medium">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setError(''); // Clear error on switch
                  }}
                  className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Space */}
      <footer className="h-20 flex items-center justify-center opacity-30 border-t border-white/40">
        <p className="text-[15px] font-black uppercase  text-white">@2026 DevOnboard.AI</p>
      </footer>
      
    </div>
  );
};

export default LandingPage;