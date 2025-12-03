import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Search, X, Trash2, Sparkles, Copy, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom'; // NEW IMPORT

// Connect to Database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Gemini AI (Safely)
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

export default function Dashboard() {
  const navigate = useNavigate(); // NEW HOOK
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName) return;

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
          .then(() => console.log("Email sent!"), (err) => console.error("Email failed:", err));
      }
      
      setIsModalOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      fetchClients();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', id);
    fetchClients(); 
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'New Lead' ? 'Active Client' : 'New Lead';
    setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
    await supabase.from('clients').update({ status: newStatus }).eq('id', id);
  };

  const generateEmail = async (clientName) => {
    if (!genAI) {
      alert("Gemini API Key is missing!");
      return;
    }
    setAiModalOpen(true);
    setAiLoading(true);
    setAiDraft('');
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const prompt = `Write a professional welcome email for ${clientName}. Keep it under 100 words.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiDraft(response.text());
    } catch (error) {
      console.error(error);
      setAiDraft("Error generating email.");
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
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ServiceFlow" className="h-8 w-auto" onError={(e) => {e.target.style.display='none';}} />
          <span className="font-bold text-xl text-slate-900 md:hidden lg:hidden">ServiceFlow</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium">
            <LogOut size={18} /> Sign Out
          </button>
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your client relationships.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Plus size={18} /> New Client
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Your Clients</h3>
            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">Live Data</span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>No clients found. Add your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => navigate(`/client/${client.id}`)} // NEW: Click to Navigate
                  className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="text-sm text-slate-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                      client.status === 'Active Client' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {client.status}
                    </button>
                    
                    {/* AI Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); generateEmail(client.name); }}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                      title="Generate AI Email"
                    >
                      <Sparkles size={18} />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Add New Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <input autoFocus required type="text" placeholder="Name" className="w-full px-4 py-2 border rounded-lg" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg">Save & Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Draft Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border-2 border-purple-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-purple-50">
              <h3 className="font-bold text-purple-900 flex items-center gap-2"><Sparkles size={18}/> AI Email Draft</h3>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                  <p>Writing email...</p>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiDraft}
                </div>
              )}
              <div className="pt-6 flex justify-end gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}