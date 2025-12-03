import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut } from 'lucide-react';
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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');
    };
    getUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const updates = {};
    if (email !== user.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase.auth.updateUser(updates);

    if (error) setError(error.message);
    else {
      setMessage('Settings updated successfully!');
      setPassword(''); // Clear password field for security
    }
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

      <div className="p-6 md:p-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Settings</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          
          {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium">{message}</div>}
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Changing this will require email confirmation.</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>

          </form>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut size={18} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}