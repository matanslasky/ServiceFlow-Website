import React, { useState, useEffect } from 'react';
import { 
  Calendar, MessageCircle, Users, CheckCircle, ArrowRight, Menu, X, Bot, Shield, Zap, Briefcase, ChevronRight, Activity, Layout, Star, Loader2, Info
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Button = ({ children, variant = 'primary', className = '', icon: Icon, disabled, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
    outline: "border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm disabled:opacity-70 disabled:cursor-not-allowed"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
};

const UseCaseTab = ({ active, label, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-all w-full md:w-auto text-left ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'}`}>
    <Icon size={18} className={active ? 'text-teal-200' : 'text-slate-400'} />
    <span>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
  </button>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group bg-white p-8 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-teal-100 hover:shadow-[0_8px_30px_-4px_rgba(20,184,166,0.1)] transition-all duration-300">
    <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
    <Info size={20} className="text-teal-400" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white"><X size={16} /></button>
  </div>
);

const Navbar = ({ onJoinClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ServiceFlow" className="h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-teal-600">Sign In</Link>
            <Button variant="primary" className="py-2.5 px-5" onClick={onJoinClick}>Get Started</Button>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link to="/login" className="text-slate-600 font-medium py-2 px-2 hover:bg-slate-50 rounded">Sign In</Link>
        </div>
      )}
    </nav>
  );
};

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState('consultants');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const scrollToCTA = () => { document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' }); };
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setErrorMessage('');
    try {
      const { error } = await supabase.from('waitlist').insert([{ email: email, source: 'landing_page_main' }]);
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please check your connection.");
      setStatus('error');
    }
  };

  const useCases = {
    therapists: { title: "Private Practice Therapy", description: "Automate intake forms, appointment reminders, and waitlist management.", points: ["Secure patient data", "Empathetic responses", "Gap filling"], stats: "20+ hrs saved" },
    tutors: { title: "Tutoring & Education", description: "Let students book their own slots based on your availability.", points: ["Package tracking", "Homework reminders", "Parent updates"], stats: "Zero no-shows" },
    coaches: { title: "Wellness & Life Coaching", description: "Keep clients accountable between sessions automatically.", points: ["Daily nudges", "Discovery screening", "Group coordination"], stats: "2x conversions" },
    consultants: { title: "Professional Consulting", description: "Operate with the efficiency of a large firm.", points: ["Client qualification", "Project milestones", "Automated invoicing"], stats: "Faster deals" }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar onJoinClick={scrollToCTA} />
      {notification && <Toast message={notification} onClose={() => setNotification(null)} />}
      
      {/* --- HERO --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-70"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">The Virtual Assistant <br/><span className="text-teal-600">That Never Sleeps</span></h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">A professional automation suite for consultants, therapists, and coaches.</p>
          <div className="flex justify-center"><Button variant="primary" className="w-full sm:w-auto px-8 h-12 text-base" icon={ArrowRight} onClick={scrollToCTA}>Start Free Trial</Button></div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Calendar} title="Smart Scheduling" description="Eliminate back-and-forth emails." />
            <FeatureCard icon={MessageCircle} title="AI Communication" description="Respond to inquiries instantly." />
            <FeatureCard icon={Shield} title="Enterprise Security" description="Bank-grade encryption." />
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section id="use-cases" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
             <div className="lg:col-span-4 space-y-4">
                <h2 className="text-3xl font-bold">Tailored to You</h2>
                <div className="flex flex-col gap-2">
                    {Object.keys(useCases).map(key => (
                        <UseCaseTab key={key} active={activeUseCase === key} label={key.charAt(0).toUpperCase() + key.slice(1)} icon={Briefcase} onClick={() => setActiveUseCase(key)} />
                    ))}
                </div>
             </div>
             <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold mb-4">{useCases[activeUseCase].title}</h3>
                <p className="mb-6 text-slate-600">{useCases[activeUseCase].description}</p>
                <div className="grid sm:grid-cols-3 gap-4">
                    {useCases[activeUseCase].points.map((p, i) => (
                        <div key={i} className="bg-white p-3 rounded border border-slate-100 text-sm font-semibold flex gap-2"><CheckCircle size={16} className="text-teal-600"/>{p}</div>
                    ))}
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* --- WAITLIST --- */}
      <section id="waitlist-section" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-8 md:p-10 text-white shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Scale?</h2>
                {status === 'success' ? (
                    <div className="bg-white/10 p-6 rounded-xl"><CheckCircle size={40} className="mx-auto mb-4"/>You're on the list!</div>
                ) : (
                    <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                        <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-2.5 rounded-lg text-slate-900 w-full text-sm" />
                        <button type="submit" disabled={status === 'loading'} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 whitespace-nowrap text-sm">{status === 'loading' ? <Loader2 className="animate-spin"/> : 'Get Started'}</button>
                    </form>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}