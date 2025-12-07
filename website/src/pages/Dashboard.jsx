import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check, CreditCard, Lock, Zap, Calendar, Download, Settings, Shield, AlertCircle, Mail, ChevronRight, Bell, Activity, Clock, BarChart3, Bot, Send, Edit3 } from 'lucide-react';
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
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAgentConfigOpen, setIsAgentConfigOpen] = useState(false);
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // --- NEW: Agent Queue State ---
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  // --- NEW: Fetch Pending Drafts from Python Agent ---
  const fetchPendingDrafts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('agent_queue')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      
      if (data) {
        setPendingDrafts(data);
        if (data.length > 0) {
           // Add a notification if new drafts arrived
           const newCount = data.length;
           if (newCount > 0) setNotifications([`${newCount} email(s) waiting for approval`]);
        }
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await fetchClients();
          await fetchPendingDrafts();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Poll for new drafts every 10 seconds
    const interval = setInterval(fetchPendingDrafts, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- NEW: Handle Draft Actions ---
  const handleApproveDraft = async (id, finalContent) => {
    // 1. Update status in DB so Python agent sees it
    await supabase
      .from('agent_queue')
      .update({ status: 'APPROVED', draft_reply: finalContent })
      .eq('id', id);
    
    // 2. Remove from UI
    setPendingDrafts(prev => prev.filter(d => d.id !== id));
    alert("Draft Approved! The agent will send it in the next cycle.");
  };

  const handleRejectDraft = async (id) => {
    await supabase.from('agent_queue').update({ status: 'REJECTED' }).eq('id', id);
    setPendingDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleDraftEdit = (id, newText) => {
    setPendingDrafts(prev => prev.map(d => d.id === id ? { ...d, draft_reply: newText } : d));
  };

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

  const upcomingTasks = clients
    .filter(c => c.next_follow_up)
    .sort((a, b) => new Date(a.next_follow_up) - new Date(b.next_follow_up))
    .slice(0, 3);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Navbar Skeleton */}
        <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-9 w-9 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>

          {/* Analytics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-20 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Clients Table Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2"><Logo /></div>
        <div className="flex items-center gap-4 md:gap-6 relative">
           <button onClick={() => navigate('/calendar')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><Calendar size={18} /> <span className="hidden md:inline">Calendar</span></button>
           
           {/* Notification Bell */}
           <div className="relative">
             <button onClick={() => setShowNotifications(!showNotifications)} className={`text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors ${showNotifications ? 'text-teal-600' : ''}`}>
               <Bell size={18} /> <span className="hidden md:inline">Notifications</span>
               {pendingDrafts.length > 0 && <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">{pendingDrafts.length}</span>}
             </button>
             {showNotifications && (
               <div className="absolute top-10 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in duration-200">
                 <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                   <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                   <button onClick={() => setShowNotifications(false)}><X size={14} className="text-slate-400 hover:text-slate-600"/></button>
                 </div>
                 {notifications.length === 0 ? <div className="text-center py-4 text-slate-400 text-sm italic">No new alerts.</div> : <div className="space-y-2">{notifications.map((n, i) => <div key={i} className="text-sm text-slate-600 border-b border-slate-50 pb-2">{n}</div>)}</div>}
               </div>
             )}
           </div>

           <button onClick={() => navigate('/settings')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><Settings size={18} /> <span className="hidden md:inline">Settings</span></button>
           <button onClick={() => navigate('/billing')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors"><CreditCard size={18} /> <span className="hidden md:inline">Billing</span></button>
           <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-xs md:text-sm font-medium transition-colors"><LogOut size={18} /> <span className="hidden md:inline">Sign Out</span></button>
           <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">{user?.email?.[0].toUpperCase() || 'U'}</div>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* --- NEW: AGENT PENDING APPROVALS WIDGET --- */}
        {pendingDrafts.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-200 mb-10 animate-in slide-in-from-top-4 border-l-4 border-l-teal-500">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
              <Bot size={24} className="text-teal-600"/> 
              Pending Approvals 
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{pendingDrafts.length}</span>
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingDrafts.map(draft => (
                <div key={draft.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-md transition-all flex flex-col h-full relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">To: {draft.sender}</p>
                      <p className="text-xs text-slate-500 truncate w-48">Sub: {draft.subject}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-1 rounded">Needs Review</span>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-4 flex-grow">
                    <p className="text-xs text-slate-400 mb-1 font-bold uppercase">Original Message:</p>
                    <p className="text-xs text-slate-500 italic mb-3 line-clamp-2 border-b border-slate-100 pb-2">{draft.original_snippet}</p>
                    
                    <p className="text-xs text-teal-600 mb-1 font-bold uppercase flex items-center gap-1"><Sparkles size={10}/> AI Draft:</p>
                    <textarea 
                      className="w-full text-sm text-slate-700 bg-transparent outline-none resize-none h-24 font-medium"
                      value={draft.draft_reply}
                      onChange={(e) => handleDraftEdit(draft.id, e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                     <button onClick={() => handleRejectDraft(draft.id)} className="flex-1 py-2 text-red-500 text-xs font-bold hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 flex items-center justify-center gap-1 transition-colors"><X size={14}/> Reject</button>
                     <button onClick={() => handleApproveDraft(draft.id, draft.draft_reply)} className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 flex items-center justify-center gap-1 transition-colors shadow-sm hover:shadow-md"><Send size={14}/> Send Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your clients and monitor agent activity.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center" title="Export CSV"><Download size={20} /></button>
            <button onClick={() => setIsAgentConfigOpen(true)} className="bg-white border border-slate-200 text-teal-600 px-4 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-sm flex items-center justify-center gap-2" title="Configure Agent"><Settings size={20} /></button>
            
            <button onClick={() => { if (clients.length >= 3) setIsUpgradeModalOpen(true); else setIsModalOpen(true); }} className="bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
              <Plus size={20} /> <span className="hidden md:inline">Add Client</span>
            </button>
          </div>
        </div>
        
        {/* ANALYTICS WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="absolute top-3 right-3 bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</div>
             <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
                <Mail size={16} className="text-teal-600"/> Email Triage Rate
             </div>
             <div className="text-3xl font-extrabold text-slate-300">--%</div>
             <p className="text-xs text-slate-400 mt-1">Automated responses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="absolute top-3 right-3 bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</div>
             <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
                <BarChart3 size={16} className="text-teal-600"/> Leads Generated
             </div>
             <div className="text-3xl font-extrabold text-slate-300">--</div>
             <p className="text-xs text-slate-400 mt-1">New clients this month</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="absolute top-3 right-3 bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</div>
             <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
                <Clock size={16} className="text-teal-600"/> Time Saved
             </div>
             <div className="text-3xl font-extrabold text-slate-300">--h</div>
             <p className="text-xs text-slate-400 mt-1">Estimated manual work</p>
          </div>
        </div>

        {/* REAL STATS & TASKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users size={28} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900">{clients.length} <span className="text-sm text-slate-400 font-normal">/ 3 Free</span></p>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar size={20} className="text-teal-600"/> Next Follow-ups</h3>
             {upcomingTasks.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No scheduled follow-ups found in database.</p>
             ) : (
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

        {/* Client List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Client List</h3>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-medium">Live Data</span>
          </div>
          
          {loading ? <div className="p-12 text-center text-slate-500">Loading...</div> : filteredClients.length === 0 ? (
            <div className="p-16 text-center text-slate-400"><Users size={48} className="mx-auto mb-4 opacity-20" /><p>No clients found.</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <div key={client.id} onClick={() => navigate(`/client/${client.id}`)} className="group p-4 px-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-teal-500">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">{client.name[0]}</div>
                    <div><p className="font-bold text-slate-900">{client.name}</p><p className="text-xs text-slate-500">{client.email}</p></div>
                  </div>
                  <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-100 text-slate-600">{client.status || 'Lead'}</button>
                    <button onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }} className="p-2 text-slate-400 hover:text-purple-600"><Sparkles size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AgentConfigModal isOpen={isAgentConfigOpen} onClose={() => setIsAgentConfigOpen(false)} user={user} />

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl overflow-y-auto border border-slate-200 relative max-h-[90vh]">
            <button onClick={() => setIsUpgradeModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-2 shadow-sm z-10"><X size={24} /></button>
            <div className="p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Upgrade Your Agent Platform</h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">You've hit the 3-contact limit. Choose a plan below to deploy unlimited agents and scale your business.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative opacity-60 grayscale">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                   <div className="text-4xl font-extrabold text-slate-900 mb-6">$0<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                   <button disabled className="w-full py-3 rounded-xl font-bold border-2 border-slate-200 text-slate-400 mb-8 cursor-not-allowed">Current Plan</button>
                   <ul className="space-y-4"><li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Up to 3 Clients</li></ul>
                </div>
                <div className="bg-white p-8 rounded-2xl border-4 border-teal-500 shadow-2xl relative transform md:-translate-y-4">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">Most Popular</div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">Pro <Zap size={20} className="text-amber-400 fill-amber-400"/></h3>
                   <div className="text-4xl font-extrabold text-slate-900 mb-6">$29<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                   <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-lg flex items-center justify-center mb-8">Upgrade Now</a>
                   <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Unlimited Clients</li>
                     <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> AI Email Assistant</li>
                     <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Smart Calendar Sync</li>
                     <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Priority Support</li>
                   </ul>
                </div>
                 <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Agency</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mb-6">$99<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                    <button className="w-full py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 transition-all mb-8">Contact Sales</button>
                 </div>
              </div>
              <div className="mt-12"><button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-medium">No thanks, I'll stick to free for now</button></div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4">Add Client</h3>
              <form onSubmit={handleAddClient} className="space-y-4">
                 <input autoFocus required placeholder="Name" className="w-full p-3 border rounded-lg" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                 <input placeholder="Email" className="w-full p-3 border rounded-lg" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
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