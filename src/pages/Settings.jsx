import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut, Bot, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Logo from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Agent State
  const [agentName, setAgentName] = useState('');
  const [agentTone, setAgentTone] = useState('Professional');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');

      // Fetch Agent Settings
      if (user) {
        const { data } = await supabase.from('agent_settings').select('*').eq('user_id', user.id).single();
        if (data) {
          setAgentName(data.agent_name);
          setAgentTone(data.agent_tone);
        } else {
          // If no settings exist, create default
          const { data: newData } = await supabase
            .from('agent_settings')
            .insert([{ user_id: user.id, agent_name: 'Medical Assistant', agent_tone: 'Professional' }])
            .select()
            .single();
          if (newData) {
             setAgentName(newData.agent_name);
             setAgentTone(newData.agent_tone);
          }
        }
      }
    };
    getData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    // 1. Update Auth (Email/Pass)
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setError(error.message);
    }

    // 2. Update Agent Settings
    const { error: agentError } = await supabase
      .from('agent_settings')
      .update({ agent_name: agentName, agent_tone: agentTone })
      .eq('user_id', user.id);

    if (agentError) setError(agentError.message);
    else setMessage('Settings and Agent updated successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">System Settings</h1>

        {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium border border-green-200">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-200">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Column 1: Agent Brain */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bot className="text-teal-600" /> Agent Personality
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agent Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Sarah, Front Desk"
                />
                <p className="text-xs text-slate-400 mt-2">Your clients will see emails signed by this name.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Communication Tone</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Professional', 'Friendly', 'Empathetic', 'Urgent'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setAgentTone(tone)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                        agentTone === tone 
                          ? 'bg-teal-50 border-teal-500 text-teal-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Account Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="text-slate-400" /> Security
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                    value={email}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Set new password"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-8"
              >
                <Save size={18} /> Save All Changes
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <button 
                onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto text-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}