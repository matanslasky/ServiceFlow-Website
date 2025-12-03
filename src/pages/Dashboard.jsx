import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check, CreditCard, Lock, Zap, Calendar } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search State
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (clients.length >= 3) {
      setIsModalOpen(false); 
      setIsUpgradeModalOpen(true);
      return;
    }
    if (!newClientName) return;

    const { error } = await supabase.from('clients').insert([{ name: newClientName, email: newClientEmail }]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
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

  const generateEmail = async (clientName) => {
    if (!aiEngine) { alert("AI Service is currently offline (Missing API Key)."); return; }
    setAiModalOpen(true);
    setAiLoading(true);
    setAiDraft('');
    try {
      const model = aiEngine.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(`Write a welcome email for ${clientName}. Keep it under 100 words.`);
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

  // --- FILTER LOGIC ---
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UPCOMING TASKS LOGIC ---
  const upcomingTasks = clients
    .filter(c => c.next_follow_up)
    .sort((a, b) => new Date(a.next_follow_up) - new Date(b.next_follow_up))
    .slice(0, 3); // Show top 3

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => navigate('/billing')} className="text-slate-500 hover:text-teal-600 text-xs md:text-sm font-bold flex items-center gap-2 transition-colors">
            <CreditCard size={18} /> <span className="hidden md:inline">Billing</span>
          </button>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-xs md:text-sm font-medium transition-colors">
            <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
          </button>
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your client relationships.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* NEW: SEARCH BAR */}
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <button 
              onClick={() => {
                if (clients.length >= 3) setIsUpgradeModalOpen(true);
                else setIsModalOpen(true);
              }} 
              className="bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> <span className="hidden md:inline">New Client</span>
            </button>
          </div>
        </div>
        
        {/* Stats & Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Stat Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users size={28} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900">{clients.length} <span className="text-sm text-slate-400 font-normal">/ 3 Free</span></p>
            </div>
          </div>

          {/* NEW: Upcoming Tasks Card */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar size={20} className="text-teal-600"/> Upcoming Follow-ups</h3>
             {upcomingTasks.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No follow-ups scheduled. Open a client to set a date.</p>
             ) : (
               <div className="space-y-3">
                 {upcomingTasks.map(task => (
                   <div key={task.id} onClick={() => navigate(`/client/${task.id}`)} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center font-bold text-xs">{task.name[0]}</div>
                        <span className="font-medium text-slate-700">{task.name}</span>
                      </div>
                      <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        {new Date(task.next_follow_up).toLocaleDateString()}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Your Clients</h3>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-medium">Live Data</span>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>{searchTerm ? "No clients match your search." : "No clients found."}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => navigate(`/client/${client.id}`)}
                  className="p-4 md:p-6 px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group gap-4"
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
                  <div className="flex items-center gap-4 justify-end">
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${client.status === 'Active Client' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{client.status}</button>
                    <button onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full" title="AI Draft"><Sparkles size={20} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full" title="Delete"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals (Upgrade, Add, AI) - Keeping the same structure but ensuring responsiveness */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-amber-400 relative p-8 text-center">
             <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white"><Sparkles size={28} fill="currentColor" /></div>
             <h3 className="text-2xl font-extrabold text-slate-900">Unlock Pro Power</h3>
             <p className="text-slate-500 mb-8 text-sm">Upgrade to remove limits and enable AI.</p>
             <button onClick={() => navigate('/billing')} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 mb-4">Upgrade for $29/mo</button>
             <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 text-sm">Maybe Later</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4">Add New Client</h3>
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
                 <h3 className="font-bold text-purple-900 flex gap-2"><Sparkles/> AI Assistant</h3>
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