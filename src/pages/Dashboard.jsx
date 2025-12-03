import React, { useEffect, useState } from 'react';
import { Users, LogOut, Plus, Sparkles, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo'; // Central Logo

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
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

  const handleAddClient = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Elegant Top Bar with Green Border */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <Logo />
        <div className="flex items-center gap-6">
          <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-teal-600 text-sm font-medium flex items-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm border border-teal-200">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-teal-500/30">
            <Plus size={18} /> New Client
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600"><Users size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Your Clients</h3>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded">Live Data</span>
          </div>
          
          {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
            <div className="divide-y divide-slate-100">
              {clients.map((client) => (
                <div key={client.id} onClick={() => navigate(`/client/${client.id}`)} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">{client.name[0]}</div>
                    <div><p className="font-medium text-slate-900">{client.name}</p><p className="text-sm text-slate-500">{client.email}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(client.id, client.status); }} className={`px-3 py-1 rounded-full text-xs font-medium border ${client.status === 'Active Client' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{client.status}</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6">
            <h3 className="font-bold text-xl mb-4">Add Client</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <input autoFocus required type="text" placeholder="Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}