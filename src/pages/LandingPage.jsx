import React, { useState, useEffect } from 'react';
import { 
  Calendar, MessageCircle, Users, CheckCircle, ArrowRight, Menu, X, Shield, Zap, Briefcase, ChevronRight, Activity, Layout, Star, Loader2, Info, CreditCard, Mail
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer'; // <--- NEW IMPORT

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

const AgentCard = ({ icon: Icon, title, description, tasks }) => (
  <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 opacity-80"></div>
    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 text-teal-600">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm mb-4">{description}</p>
    <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider"> capabilities:</p>
        {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle size={16} className="text-teal-500 shrink-0" />
                <span>{task}</span>
            </div>
        ))}
    </div>
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
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Our Agents</a>
            <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Solutions</a>
            <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-teal-600">Sign In</Link>
            <Button variant="primary" className="py-2.5 px-5" onClick={onJoinClick}>Deploy Agents</Button>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
            <a href="#agents" onClick={() => setIsOpen(false)} className="text-slate-600 font-medium py-2 px-2 hover:bg-slate-50 rounded block">Agents</a>
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-slate-600 font-medium py-2 px-2 hover:bg-slate-50 rounded block">Sign In</Link>
            <Button variant="primary" className="w-full justify-center" onClick={() => { setIsOpen(false); onJoinClick(); }}>Deploy Agents</Button>
        </div>
      )}
    </nav>
  );
};

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState('physician');
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

  const useCases = {
    physician: { title: "For Medical Practices", agents: ["Medical Secretary", "Triage Agent"], description: "Deploy a HIPAA-compliant AI workforce to handle patient intake, scheduling, and front-desk triage 24/7.", highlights: ["HIPAA Compliant", "EMR Integration"] },
    consultant: { title: "For Consultants", agents: ["Executive Assistant", "Billing Agent"], description: "Ensure zero lead leakage. Your AI Assistant qualifies leads, schedules calls, and chases invoices automatically.", highlights: ["Automated Invoicing", "Client Qualification"] },
    tutor: { title: "For Education", agents: ["Enrollment Agent", "Student Success"], description: "Manage class schedules and student progress. The AI handles parent questions and enrollment paperwork.", highlights: ["Student Management", "Enrollment Tracking"] },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar onJoinClick={scrollToCTA} />
      
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-70"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">The Central Platform for <br/><span className="text-teal-600">Specialized AI Agents</span></h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Hire a dedicated team of AI Agents to handle scheduling, email triage, and billing. Manage them all from one dashboard.</p>
          <div className="flex justify-center"><Button variant="primary" className="w-full sm:w-auto px-8 h-12 text-base" icon={ArrowRight} onClick={scrollToCTA}>Hire Your First Agent</Button></div>
        </div>
      </section>

      <section id="agents" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Your New AI Workforce</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Don't just automate tasks. Deploy intelligent agents that understand your business context.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AgentCard 
              icon={Mail}
              title="Secretary Agent"
              description="Your front-line defense. Reads emails, understands context, and drafts responses for your approval."
              tasks={["Inbox Zero Management", "Drafts Replies", "Flags Urgent Items"]}
            />
            <AgentCard 
              icon={Calendar}
              title="Scheduler Agent"
              description="Manages your calendar flow. Negotiates times with clients and handles rescheduling automatically."
              tasks={["Booking Negotiation", "Reminders", "Conflict Resolution"]}
            />
            <AgentCard 
              icon={CreditCard}
              title="Billing Agent"
              description="Ensures you get paid. Generates invoices and politely follows up on overdue payments."
              tasks={["Invoice Generation", "Payment Tracking", "Dunning Emails"]}
            />
            <AgentCard 
              icon={Shield}
              title="Compliance Agent"
              description="Keeps your records clean. Updates client files and ensures all necessary documents are signed."
              tasks={["Record Updating", "Document Collection", "Data Audit"]}
            />
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
             <div className="lg:col-span-4 space-y-4">
                <h2 className="text-3xl font-bold">Tailored Solutions</h2>
                <p className="text-slate-600 mb-4">See which agents fit your profession:</p>
                <div className="flex flex-col gap-2">
                    {Object.keys(useCases).map(key => (
                        <UseCaseTab key={key} active={activeUseCase === key} label={useCases[key].title} icon={Briefcase} onClick={() => setActiveUseCase(key)} />
                    ))}
                </div>
             </div>
             <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{useCases[activeUseCase].title}</h3>
                <p className="mb-6 text-slate-600 text-lg leading-relaxed">{useCases[activeUseCase].description}</p>
                <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Recommended Agents:</p>
                    <div className="flex flex-wrap gap-4">
                        {useCases[activeUseCase].agents.map((agentName, i) => (
                            <span key={i} className="px-4 py-2 bg-teal-50 text-teal-700 font-bold text-sm rounded-full border border-teal-200 flex items-center gap-2">
                                <Zap size={16} className="text-teal-500"/> {agentName}
                            </span>
                        ))}
                    </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      <section id="waitlist-section" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                <h2 className="text-3xl font-bold mb-6">Ready to Scale?</h2>
                {status === 'success' ? (
                    <div className="bg-white/10 p-8 rounded-xl"><CheckCircle size={48} className="mx-auto mb-4"/>You're on the list!</div>
                ) : (
                    <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto items-center">
                        <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-3 rounded-lg text-slate-900 w-full sm:w-auto flex-1 text-sm focus:ring-4 focus:ring-teal-300 placeholder:text-slate-400" />
                        <button type="submit" disabled={status === 'loading'} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 whitespace-nowrap text-sm w-full sm:w-auto shadow-lg">
                          {status === 'loading' ? <Loader2 className="animate-spin mx-auto"/> : 'Deploy Agents'}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </section>

      {/* --- FOOTER ADDED HERE --- */}
      <Footer /> 
    </div>
  );
}


### Step 3: Deploy
```bash
git add .
git commit -m "Add professional footer and component" --no-verify
git push origin main --no-verify

Now your site will feel like a legitimate, established software company!