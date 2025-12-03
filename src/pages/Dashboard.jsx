import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check, CreditCard, Lock, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

// Connect to Database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize AI Engine (Generic Name)
const aiKey = import.meta.env.VITE_GEMINI_API_KEY;
const aiEngine = aiKey ? new GoogleGenerativeAI(aiKey) : null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // AI State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setClients(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) await fetchClients();
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- ADD CLIENT (With Limit Check) ---
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    // 1. CHECK LIMIT
    if (clients.length >= 3) {
      setIsModalOpen(false); 
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!newClientName) return;

    // 2. Save
    const { error } = await supabase
      .from('clients')
      .insert([{ name: newClientName, email: newClientEmail }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      // Send Email via EmailJS
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceID && templateID && publicKey) {
        emailjs.send(serviceID, templateID, { to_name: newClientName, to_email: newClientEmail }, publicKey)
          .then(() => console.log("Sent"), (err) => console.error("Failed", err));
      }
      
      setIsModalOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      fetchClients();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await supabase.from('clients').delete().eq('id', id);
    fetchClients(); 
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'New Lead' ? 'Active Client' : 'New Lead';
    setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
    await supabase.from('clients').update({ status: newStatus }).eq('id', id);
  };

  // --- AI Logic ---
  const generateEmail = async (clientName) => {
    if (!aiEngine) { 
      alert("AI Service is currently offline (Missing API Key)."); 
      return; 
    }
    setAiModalOpen(true);
    setAiLoading(true);
    setAiDraft('');
    
    try {
      const model = aiEngine.getGenerativeModel({ model: "gemini-pro"});
      const prompt = `Write a professional, warm, and concise welcome email for a new client named ${clientName}. I am a consultant. The email should propose a time for a kick-off call. Keep it under 100 words.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiDraft(response.text());
    } catch (error) {
      console.error("AI Error:", error);
      setAiDraft("I'm having trouble connecting to the AI service right now. Please try again later.");
    }
    setAiLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/billing')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors">
            <CreditCard size={18} /> Billing
          </button>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your client relationships.</p>
          </div>
          
          <button 
            onClick={() => {
              if (clients.length >= 3) {
                setIsUpgradeModalOpen(true);
              } else {
                setIsModalOpen(true);
              }
            }} 
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> New Client
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users size={28} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900">{clients.length} <span className="text-sm text-slate-400 font-normal">/ 3 Free</span></p>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Your Clients</h3>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-medium">Live Data</span>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading your data...</div>
          ) : clients.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>No clients found. Add your first one above!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => navigate(`/client/${client.id}`)}
                  className="p-6 px-8 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{client.name}</p>
                      <p className="text-sm text-slate-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${client.status === 'Active Client' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}>{client.status}</button>
                    
                    {/* AI Button */}
                    <button onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all" title="Draft Email"><Sparkles size={20} /></button>
                    
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Delete"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-900">Add New Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddClient} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input autoFocus required type="text" placeholder="e.g. Elon Musk" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" placeholder="contact@example.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL (Rebranded) */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-4 border-amber-400 relative">
            
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-8 py-6 border-b border-amber-100 text-center">
              <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 text-white">
                <Sparkles size={28} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Unlock Pro Power</h3>
            </div>

            {/* Features List */}
            <div className="p-8 bg-white">
              <p className="text-center text-slate-500 mb-6 leading-relaxed">
                You've hit the 3-client limit. Upgrade now to scale your business without boundaries.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-700">
                  <Check className="text-teal-600 shrink-0" size={20} />
                  <span className="font-medium">Unlimited Clients</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Check className="text-teal-600 shrink-0" size={20} />
                  <span className="font-medium">AI Assistant</span> {/* RENAMED */}
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Check className="text-teal-600 shrink-0" size={20} />
                  <span className="font-medium">Smart Calendar Sync</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Check className="text-teal-600 shrink-0" size={20} />
                  <span className="font-medium">Priority Support</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/billing')}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Upgrade for $29/mo <Zap size={18} fill="currentColor" />
              </button>
              
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full mt-4 text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                No thanks, I'll keep it small
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Draft Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border-4 border-purple-50">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
              <h3 className="font-bold text-xl text-purple-900 flex items-center gap-3"><Sparkles size={24} className="text-purple-600"/> AI Assistant</h3> {/* RENAMED */}
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="p-8">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-600 mb-6"></div><p className="font-medium">Generating personalized email...</p></div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-medium shadow-inner">{aiDraft}</div>
              )}
              <div className="pt-8 flex justify-end gap-3">
                <button onClick={copyToClipboard} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg hover:shadow-purple-500/30">
                  {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}