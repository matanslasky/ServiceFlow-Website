import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check, CreditCard, Lock, Zap, Calendar, Download, Settings, Shield, AlertCircle, Clock, Activity, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import AgentConfigModal from '../components/AgentConfigModal';

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
  const [isAgentConfigOpen, setIsAgentConfigOpen] = useState(false);
  
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
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
    if (!aiEngine) { alert("AI Service is offline."); return; }
    setAiModalOpen(true); setAiLoading(true); setAiDraft('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: settings } = await supabase.from('agent_settings').select('*').eq('user_id', user.id).single();
      
      const name = settings?.agent_name || "Medical Assistant";
      const tone = settings?.agent_tone || "Professional";
      
      const prompt = `Act as an AI Agent named ${name}. Write a ${tone} email to ${clientName} confirming an appointment. Keep it under 100 words.`;
      
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

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "Name,Email,Status,Created At\n" + clients.map(c => `${c.name},${c.email},${c.status},${c.created_at}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_clients.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Agent Command Center</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Live monitoring of your AI workforce.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center" title="Export CSV"><Download size={20} /></button>
            <button onClick={() => setIsAgentConfigOpen(true)} className="bg-white border border-slate-200 text-teal-600 px-4 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-sm flex items-center justify-center gap-2" title="Configure Agent"><Settings size={20} /></button>
            <button onClick={() => { if (clients.length >= 3) setIsUpgradeModalOpen(true); else setIsModalOpen(true); }} className="bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
              <Plus size={20} /> <span className="hidden md:inline">Manual Entry</span>
            </button>
          </div>
        </div>

        {/* NEW: ANALYTICS WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Activity size={14}/> Triage Rate</span>
             <span className="text-3xl font-extrabold text-slate-900">94%</span>
             <span className="text-xs text-green-600 font-medium">+2.4% this week</span>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Clock size={14}/> Time Saved</span>
             <span className="text-3xl font-extrabold text-slate-900">12h</span>
             <span className="text-xs text-slate-500 font-medium">Est. manual work</span>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Mail size={14}/> Emails Drafted</span>
             <span className="text-3xl font-extrabold text-slate-900">142</span>
             <span className="text-xs text-slate-500 font-medium">Last 30 days</span>
           </div>
           <div className="bg-teal-900 p-6 rounded-2xl shadow-lg border border-teal-800 flex flex-col gap-2 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
             <span className="text-xs font-bold text-teal-200 uppercase tracking-wider flex items-center gap-2"><Zap size={14}/> Active Agents</span>
             <span className="text-3xl font-extrabold">3</span>
             <span className="text-xs text-teal-200 font-medium">System Healthy</span>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Client List (Premium List View Restored) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Monitored Contacts</h3>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">Live</span>
              </div>
              
              {loading ? <div className="p-12 text-center text-slate-500">Loading...</div> : filteredClients.length === 0 ? (
                <div className="p-16 text-center text-slate-400"><Users size={48} className="mx-auto mb-4 opacity-20" /><p>No contacts found.</p></div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredClients.map((client) => (
                    <div key={client.id} onClick={() => navigate(`/client/${client.id}`)} className="group p-4 px-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-teal-500">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">{client.name[0]}</div>
                        <div><p className="font-bold text-slate-900">{client.name}</p><p className="text-xs text-slate-500">{client.email}</p></div>
                      </div>
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-100 text-slate-600">{client.status || 'Queue'}</button>
                        <button onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }} className="p-2 text-slate-400 hover:text-purple-600"><Sparkles size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NEW: Agent Activity Feed (Sidebar) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Activity size={18} className="text-teal-600"/> Agent Activity</h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-teal-500 z-10 mt-0.5"></div>
                            <div>
                                <p className="text-sm text-slate-700 font-medium">Agent processed incoming email</p>
                                <p className="text-xs text-slate-400 mt-1">Action taken • {i * 15} mins ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* KEEP MODALS (Add, Upgrade, AI, Config) */}
      <AgentConfigModal isOpen={isAgentConfigOpen} onClose={() => setIsAgentConfigOpen(false)} user={user} />
      {/* ... (Keep Upgrade, Add, AI modals from previous code here for brevity) ... */}
        {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-4 border-amber-400 relative">
             <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-8 py-6 border-b border-amber-100 text-center">
              <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 text-white"><Sparkles size={28} fill="currentColor" /></div>
              <h3 className="text-2xl font-extrabold text-slate-900">Unlock Pro Power</h3>
            </div>
            <div className="p-8 bg-white text-center">
              <p className="text-slate-500 mb-6">Limit reached. Upgrade to continue.</p>
              <a href={PAYMENT_LINK} target="_blank" rel="noreferrer" className="w-full block py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 mb-4">Upgrade for $29/mo</a>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 text-sm">Maybe Later</button>
            </div>
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
              {aiLoading ? <div className="text-center py-10">Generating...</div> : <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border">{aiDraft}</div>}
              {!aiLoading && (
                 <div className="pt-6 flex justify-end"><button onClick={copyToClipboard} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">{copied ? "Copied!" : "Copy Text"}</button></div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}