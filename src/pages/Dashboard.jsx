import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check, CreditCard, Lock, Zap, Calendar, Download, Settings, Shield, AlertCircle, Mail, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const aiKey = import.meta.env.VITE_GEMINI_API_KEY;
const aiEngine = aiKey ? new GoogleGenerativeAI(aiKey) : null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const PAYMENT_LINK = "https://serviceflow.lemonsqueezy.com/checkout/buy/...";

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setClients(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) await fetchClients();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (clients.length >= 3) { setIsModalOpen(false); setIsUpgradeModalOpen(true); return; }
    if (!newClientName) return;
    const { error } = await supabase.from('clients').insert([{ name: newClientName, email: newClientEmail }]);
    if (error) alert('Error: ' + error.message);
    else {
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (serviceID && templateID && publicKey) {
        emailjs.send(serviceID, templateID, { to_name: newClientName, to_email: newClientEmail }, publicKey);
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

  const generateEmail = async (clientName) => {
    if (!aiEngine) { alert("AI Offline."); return; }
    setAiModalOpen(true); setAiLoading(true); setAiDraft('');
    try {
      // 1. Get Settings
      const { data: { user } } = await supabase.auth.getUser();
      const { data: settings } = await supabase.from('agent_settings').select('*').eq('user_id', user.id).single();
      
      const name = settings?.agent_name || "Medical Assistant";
      const title = settings?.job_title || "Virtual Assistant";
      const context = settings?.business_context || "";
      const tone = settings?.agent_tone || "Professional";

      // 2. Enhanced Prompt
      const prompt = `You are ${name}, a ${title}.
      Business Context: ${context}
      Task: Write a ${tone} welcome email to a patient named ${clientName}.
      Goal: Schedule an appointment.
      Keep it under 100 words.`;
      
      const model = aiEngine.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(prompt);
      setAiDraft(await result.response.text());
    } catch (error) {
      setAiDraft("Error generating email.");
    }
    setAiLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingTasks = clients.filter(c => c.next_follow_up).sort((a, b) => new Date(a.next_follow_up) - new Date(b.next_follow_up)).slice(0, 3);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2"><Logo /></div>
        <div className="flex items-center gap-4 md:gap-6">
           <button onClick={() => navigate('/calendar')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><Calendar size={18} /> <span className="hidden md:inline">Calendar</span></button>
           <button onClick={() => navigate('/settings')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><Settings size={18} /> <span className="hidden md:inline">Settings</span></button>
           <button onClick={() => navigate('/billing')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><CreditCard size={18} /> <span className="hidden md:inline">Billing</span></button>
           <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-xs md:text-sm font-medium transition-colors"><LogOut size={18} /> <span className="hidden md:inline">Sign Out</span></button>
           <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">{user?.email?.[0].toUpperCase() || 'U'}</div>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agent Command Center</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Real-time monitoring of your AI workforce.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <button onClick={() => { if (clients.length >= 3) setIsUpgradeModalOpen(true); else setIsModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
              <Plus size={20} /> <span className="hidden md:inline">Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Stats & Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
             <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600"><Users size={28} /></div>
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Patients</p>
               <p className="text-3xl font-extrabold text-slate-900">{clients.length}</p>
             </div>
           </div>

           <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Calendar size={18} className="text-teal-600"/> Next Agent Actions</h3>
             {upcomingTasks.length === 0 ? <p className="text-slate-400 text-sm italic">No scheduled follow-ups.</p> : (
               <div className="grid md:grid-cols-3 gap-4">
                 {upcomingTasks.map(task => (
                   <div key={task.id} onClick={() => navigate(`/client/${task.id}`)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-300 cursor-pointer transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{new Date(task.next_follow_up).toLocaleDateString()}</span>
                        <ChevronRight size={14} className="text-slate-400"/>
                      </div>
                      <p className="font-bold text-slate-700 text-sm truncate">{task.name}</p>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Client List - RESTORED LIST VIEW BUT PREMIUM */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Monitored Contacts</h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Live Sync</span>
          </div>

          {loading ? <div className="p-12 text-center text-slate-500">Loading...</div> : filteredClients.length === 0 ? (
            <div className="p-16 text-center text-slate-400"><Users size={48} className="mx-auto mb-4 opacity-20" /><p>No contacts found.</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => navigate(`/client/${client.id}`)}
                  className="group p-4 px-8 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-teal-500"
                >
                  {/* Name & Email */}
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-white group-hover:shadow-sm transition-all">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="w-1/3 flex justify-center md:justify-start">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                      client.status === 'Active Client' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {client.status || 'In Queue'}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 justify-end w-1/3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all flex items-center gap-1 text-xs font-medium border border-transparent hover:border-purple-100">
                      <Sparkles size={16} /> <span className="hidden md:inline">AI Draft</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KEEP EXISTING MODALS (UPGRADE, ADD, AI) */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-4 border-amber-400 relative p-8 text-center">
             <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white"><Sparkles size={28} fill="currentColor" /></div>
             <h3 className="text-2xl font-extrabold text-slate-900">Unlock Pro Power</h3>
             <p className="text-slate-500 mb-8 text-sm">Upgrade to remove limits and enable AI.</p>
             <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                <div className="flex gap-3 text-sm font-medium text-slate-700"><Check size={16} className="text-teal-600"/> Unlimited Patients</div>
                <div className="flex gap-3 text-sm font-medium text-slate-700"><Check size={16} className="text-teal-600"/> AI Secretary Agent</div>
                <div className="flex gap-3 text-sm font-medium text-slate-700"><Check size={16} className="text-teal-600"/> Smart Calendar Sync</div>
             </div>
             <a href={PAYMENT_LINK} target="_blank" rel="noreferrer" className="w-full block py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 mb-4">Upgrade for $29/mo</a>
             <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 text-sm">Maybe Later</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4">Add Manual Entry</h3>
              <form onSubmit={handleAddClient} className="space-y-4">
                 <input autoFocus required placeholder="Full Name" className="w-full p-3 border rounded-lg" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                 <input placeholder="Email Address" className="w-full p-3 border rounded-lg" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
                 <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Save</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-lg border-4 border-purple-50 p-6 md:p-8">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-purple-900 flex gap-2"><Sparkles/> AI Agent Response</h3>
                 <button onClick={() => setAiModalOpen(false)}><X size={24} className="text-slate-400"/></button>
              </div>
              {aiLoading ? <div className="text-center py-10">Thinking...</div> : <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border">{aiDraft}</div>}
              {!aiLoading && (
                 <div className="pt-6 flex justify-end"><button onClick={copyToClipboard} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">{copied ? "Copied!" : "Copy Text"}</button></div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}