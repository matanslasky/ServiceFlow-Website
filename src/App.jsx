import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Menu,
  X,
  Bot,
  Shield,
  Zap,
  Briefcase,
  ChevronRight,
  Activity,
  Layout,
  Star,
  Loader2,
  Info
} from 'lucide-react';

// --- SUPABASE SETUP FOR PRODUCTION ---
// 1. Install library: npm install @supabase/supabase-js
// 2. Uncomment the import below:
import { createClient } from '@supabase/supabase-js';

// 3. Uncomment and add your keys:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Fallback for demo purposes if keys aren't set
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: (table) => ({
        insert: async (data) => {
          console.warn("[MOCK MODE] Supabase keys missing. Simulating success.", data);
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          return { error: null };
        }
      })
    };

// --- Components ---

const Button = ({ children, variant = 'primary', className = '', icon: Icon, disabled, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
    outline: "border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm disabled:opacity-70 disabled:cursor-not-allowed"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group bg-white p-8 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-teal-100 hover:shadow-[0_8px_30px_-4px_rgba(20,184,166,0.1)] transition-all duration-300">
    <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const UseCaseTab = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-all w-full md:w-auto text-left ${
      active 
        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' 
        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
    }`}
  >
    <Icon size={18} className={active ? 'text-teal-200' : 'text-slate-400'} />
    <span>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
  </button>
);

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
    <Info size={20} className="text-teal-400" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white">
      <X size={16} />
    </button>
  </div>
);

const Navbar = ({ onJoinClick, onSignInClick }) => {
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
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <Bot size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ServiceFlow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Solutions</a>
            <div className="h-4 w-px bg-slate-200"></div>
            <button onClick={onSignInClick} className="text-sm font-medium text-slate-900 hover:text-teal-600">Sign In</button>
            <Button variant="primary" className="py-2.5 px-5" onClick={onJoinClick}>Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
          <a href="#features" className="text-slate-600 font-medium py-2 px-2 hover:bg-slate-50 rounded" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#use-cases" className="text-slate-600 font-medium py-2 px-2 hover:bg-slate-50 rounded" onClick={() => setIsOpen(false)}>Solutions</a>
          <div className="border-t border-slate-100 my-2"></div>
          <Button variant="secondary" className="w-full justify-center" onClick={() => { setIsOpen(false); onSignInClick(); }}>Sign In</Button>
          <Button variant="primary" className="w-full justify-center" onClick={() => {
            setIsOpen(false);
            onJoinClick();
          }}>Start Free Trial</Button>
        </div>
      )}
    </nav>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeUseCase, setActiveUseCase] = useState('consultants');
  
  // Waitlist Form State
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  // Interaction State
  const [notification, setNotification] = useState(null);
  const [mockApproved, setMockApproved] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Scroll to CTA handler
  const scrollToCTA = () => {
    document.getElementById('waitlist-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = () => {
    showNotification("Customer portal is currently invite-only.");
  };

  const handleLinkClick = (e, name) => {
    e.preventDefault();
    showNotification(`${name} page is coming soon.`);
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank');
  };

  // --- Supabase Waitlist Submission ---
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      // Supabase Insertion
      // Ensure you have a table named 'waitlist' with an 'email' and 'source' column
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { email: email, source: 'landing_page_main' }
        ]);

      if (error) throw error;

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      setErrorMessage("Something went wrong. Please check your connection.");
      setStatus('error');
    }
  };

  const useCases = {
    therapists: {
      title: "Private Practice Therapy",
      description: "Automate intake forms, appointment reminders, and waitlist management while maintaining full HIPAA compliance and a compassionate tone.",
      points: ["Secure patient data handling", "Empathetic automated responses", "Cancellation gap filling"],
      stats: "20+ hrs saved / mo"
    },
    tutors: {
      title: "Tutoring & Education",
      description: "Stop playing phone tag with parents. Let students book their own slots based on your real-time availability, and automate payment reminders.",
      points: ["Session package tracking", "Homework reminder SMS", "Parent progress updates"],
      stats: "Zero no-shows"
    },
    coaches: {
      title: "Wellness & Life Coaching",
      description: "Keep clients accountable between sessions. Send automated check-ins and schedule discovery calls without lifting a finger.",
      points: ["Daily accountability nudges", "Discovery call screening", "Group session coordination"],
      stats: "2x lead conversion"
    },
    consultants: {
      title: "Professional Consulting",
      description: "Operate with the efficiency of a large firm. Manage project inquiries, schedule deliverables, and handle contracts automatically.",
      points: ["Client qualification workflows", "Project milestone updates", "Automated invoicing & contracts"],
      stats: "Faster deal cycles"
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar onJoinClick={scrollToCTA} onSignInClick={handleSignIn} />
      
      {notification && <Toast message={notification} onClose={() => setNotification(null)} />}

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-70"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 hover:border-teal-200 transition-colors cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New: Google Calendar & Zoom 2-way sync
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            The Virtual Assistant <br/>
            <span className="text-teal-600 relative inline-block">
              That Never Sleeps
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-teal-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A professional automation suite for consultants, therapists, and coaches. Handle scheduling, client follow-ups, and admin tasks automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" className="w-full sm:w-auto px-8 h-12 text-base" icon={ArrowRight} onClick={scrollToCTA}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Complete Business Autopilot</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We've stripped away the complexity of enterprise software to build a tool that feels like a natural extension of your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Calendar}
              title="Smart Scheduling"
              description="Eliminate the back-and-forth. Clients book directly into your available slots, with automated conflict checking and buffer times."
            />
            <FeatureCard 
              icon={MessageCircle}
              title="Intelligent Communication"
              description="Our AI responds to common inquiries instantly. Whether it's pricing questions or rescheduling, your clients get answers immediately."
            />
            <FeatureCard 
              icon={Users}
              title="Client CRM"
              description="Keep track of every detail. Automated intake forms, session notes organization, and follow-up reminders ensure no client feels neglected."
            />
            <FeatureCard 
              icon={Activity}
              title="Lead Nurturing"
              description="Ghosting isn't an option. Systematically follow up with leads and re-engage past clients to keep your pipeline full."
            />
            <FeatureCard 
              icon={Shield}
              title="Enterprise Security"
              description="Enterprise-grade encryption keeps your client data safe. SOC-2 compliant and perfect for businesses handling sensitive information."
            />
            <FeatureCard 
              icon={Zap}
              title="Zero-Touch Workflow"
              description="Connects with your favorite tools. From invoicing to Zoom links, the entire workflow happens automatically in the background."
            />
          </div>
        </div>
      </section>

      {/* Interactive Use Cases */}
      <section id="use-cases" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Menu */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Tailored to You</h2>
                <p className="text-slate-600">
                  Select your industry to see how ServiceFlow adapts to your specific daily workflow.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <UseCaseTab 
                  active={activeUseCase === 'consultants'} 
                  label="Consultants" 
                  icon={Briefcase} 
                  onClick={() => { setActiveUseCase('consultants'); setMockApproved(false); }}
                />
                <UseCaseTab 
                  active={activeUseCase === 'therapists'} 
                  label="Therapists" 
                  icon={Users}
                  onClick={() => { setActiveUseCase('therapists'); setMockApproved(false); }}
                />
                <UseCaseTab 
                  active={activeUseCase === 'tutors'} 
                  label="Tutors" 
                  icon={Bot} 
                  onClick={() => { setActiveUseCase('tutors'); setMockApproved(false); }}
                />
                <UseCaseTab 
                  active={activeUseCase === 'coaches'} 
                  label="Coaches" 
                  icon={Star} 
                  onClick={() => { setActiveUseCase('coaches'); setMockApproved(false); }}
                />
              </div>
            </div>

            {/* Right Column: Visual & Details */}
            <div className="lg:col-span-8">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{useCases[activeUseCase].title}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-teal-700 text-sm font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Impact</span>
                      <span className="text-teal-700 text-sm font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {useCases[activeUseCase].stats}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 hidden md:block">
                     <Layout size={32} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="prose prose-slate mb-8">
                  <p className="text-slate-600 text-lg leading-relaxed">{useCases[activeUseCase].description}</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {useCases[activeUseCase].points.map((point, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-2">
                      <CheckCircle size={20} className="text-teal-600" />
                      <span className="text-sm font-semibold text-slate-900">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Mock UI Interface */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xl bg-white transition-all duration-300">
                  {/* Browser Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto text-xs text-slate-400 font-mono bg-white px-3 py-1 rounded border border-slate-100 shadow-sm">
                      app.serviceflow.com/dashboard
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-6 bg-slate-50/50 min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-lg font-bold text-slate-900">Incoming Requests</div>
                        <div className="text-sm text-slate-500">
                          {mockApproved ? 'All caught up!' : '2 unread inquiries awaiting review'}
                        </div>
                      </div>
                      {!mockApproved && (
                        <button 
                          onClick={() => { setMockApproved(true); showNotification("Inquiries approved and syncing to calendar."); }}
                          className="bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-md hover:bg-teal-700 transition-colors"
                        >
                          Auto-Approve All
                        </button>
                      )}
                    </div>

                    {!mockApproved ? (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">JS</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-bold text-slate-900">James Smith</div>
                                <div className="text-xs text-slate-500">Requested: {activeUseCase === 'therapists' ? 'Initial Consultation' : 'Discovery Call'}</div>
                              </div>
                              <span className="text-xs text-slate-400">2m ago</span>
                            </div>
                            <div className="mt-3 bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100">
                               AI Note: Availability confirmed. Calendar invite drafted.
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4 items-start opacity-70">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">RL</div>
                           <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-slate-400 animate-in zoom-in duration-300">
                        <CheckCircle size={48} className="text-teal-500 mb-4" />
                        <p className="font-medium text-slate-600">All caught up!</p>
                        <p className="text-sm">0 pending requests</p>
                        <button 
                          onClick={() => setMockApproved(false)} 
                          className="mt-4 text-xs text-teal-600 hover:underline"
                        >
                          Reset Demo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Waitlist) */}
      <section id="waitlist-section" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
            {/* Abstract circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-400 opacity-20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Scale Your Practice?</h2>
              
              {status === 'success' ? (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-lg mx-auto border border-white/20 animate-in fade-in zoom-in duration-300">
                  <CheckCircle size={48} className="text-teal-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
                  <p className="text-teal-100">We'll reach out as soon as a spot opens up for you.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-teal-200 hover:text-white underline underline-offset-4"
                  >
                    Register another email
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg text-teal-100 mb-10 max-w-2xl mx-auto">
                    Join the waitlist today and get 50% off your first 3 months. No credit card required.
                  </p>
                  
                  <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto relative">
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                      className="px-6 py-4 rounded-lg text-slate-900 w-full focus:outline-none focus:ring-4 focus:ring-teal-500/30 font-medium disabled:opacity-70"
                    />
                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                      {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Get Started'}
                    </button>
                    
                    {status === 'error' && (
                       <div className="absolute -bottom-10 left-0 w-full text-center text-red-200 text-sm font-medium">
                         {errorMessage}
                       </div>
                    )}
                  </form>
                  <p className="mt-6 text-sm text-teal-200/80 font-medium">
                    Free 14-day trial • Cancel anytime • No setup fees
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-teal-600 text-white p-1.5 rounded">
                  <Bot size={20} />
                </div>
                <span className="text-xl font-bold text-slate-900">ServiceFlow</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Empowering independent professionals with enterprise-grade automation tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Features')} className="hover:text-teal-600">Features</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Pricing')} className="hover:text-teal-600">Pricing</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Integrations')} className="hover:text-teal-600">Integrations</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Roadmap')} className="hover:text-teal-600">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'About')} className="hover:text-teal-600">About Us</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Careers')} className="hover:text-teal-600">Careers</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Blog')} className="hover:text-teal-600">Blog</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Contact')} className="hover:text-teal-600">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Privacy')} className="hover:text-teal-600">Privacy</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Terms')} className="hover:text-teal-600">Terms</a></li>
                <li><a href="#" onClick={(e) => handleLinkClick(e, 'Security')} className="hover:text-teal-600">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} ServiceFlow Inc. All rights reserved.
            </div>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div onClick={() => handleSocialClick('https://twitter.com')} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer">
                 <span className="sr-only">Twitter</span>
                 <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
               </div>
               <div onClick={() => handleSocialClick('https://linkedin.com')} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer">
                 <span className="sr-only">LinkedIn</span>
                 <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}