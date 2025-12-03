import React, { useState, useEffect } from 'react';
import { 
  Calendar, MessageCircle, Shield, ArrowRight, Menu, X, Bot, Briefcase, CheckCircle, Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo'; // Import Central Logo

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-teal-500/30",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-teal-500 hover:text-teal-600",
  };
  return (
    <button className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${variants[variant]} ${className}`} {...props}>
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
};

const Navbar = ({ onJoinClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/"><Logo /></Link> {/* Central Logo */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-teal-600">Sign In</Link>
            <Button variant="primary" className="py-2.5 px-5" onClick={onJoinClick}>Get Started</Button>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4">
            <Link to="/login" className="text-slate-600 font-medium py-2 px-2 hover:bg-teal-50 hover:text-teal-600 rounded">Sign In</Link>
        </div>
      )}
    </nav>
  );
};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const scrollToCTA = () => { document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' }); };
  
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const { error } = await supabase.from('waitlist').insert([{ email: email, source: 'landing_page_main' }]);
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar onJoinClick={scrollToCTA} />
      
      {/* Hero */}
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

      {/* Waitlist */}
      <section id="waitlist-section" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-12 text-white shadow-2xl border-t-4 border-teal-400">
                <h2 className="text-3xl font-bold mb-6">Ready to Scale?</h2>
                {status === 'success' ? (
                    <div className="bg-white/10 p-8 rounded-xl"><CheckCircle size={48} className="mx-auto mb-4"/>You're on the list!</div>
                ) : (
                    <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                        <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-6 py-4 rounded-lg text-slate-900 w-full focus:ring-4 focus:ring-teal-300" />
                        <button type="submit" disabled={status === 'loading'} className="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">{status === 'loading' ? <Loader2 className="animate-spin"/> : 'Get Started'}</button>
                    </form>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}