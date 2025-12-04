import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut, User, Building, Users, Globe, CreditCard, Bell, Clock, X } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [comingSoon, setComingSoon] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');
    };
    getData();
  }, []);

  const handleComingSoon = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setError(error.message);
    }

    // Here we would save Full Name to a 'profiles' table in the future
    setMessage('Account settings updated successfully!');
  };

  const SettingSection = ({ icon: Icon, title, description, children, comingSoonTrigger }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 ${comingSoonTrigger ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-slate-50 rounded-lg text-teal-600 border border-slate-100"><Icon size={20} /></div>
           <div>
             <h2 className="text-lg font-bold text-slate-900">{title}</h2>
             <p className="text-sm text-slate-500">{description}</p>
           </div>
        </div>
        {comingSoonTrigger && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Coming Soon</span>}
      </div>
      <div className={comingSoonTrigger ? 'pointer-events-none filter blur-[1px]' : ''}>
        {children}
      </div>
      {comingSoonTrigger && (
         <button onClick={handleComingSoon} className="absolute inset-0 w-full h-full cursor-not-allowed"></button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      {/* Toast */}
      {comingSoon && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <Clock size={16} className="text-teal-400" />
          <span className="text-sm font-medium">This feature is coming soon!</span>
          <button onClick={() => setComingSoon(false)}><X size={16} /></button>
        </div>
      )}

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Settings & Preferences</h1>
        <p className="text-slate-500 mb-10">Manage your account, organization, and billing.</p>

        {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium border border-green-200">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-200">{error}</div>}

        {/* 1. User Account Settings */}
        <SettingSection icon={User} title="User Account" description="Manage your personal details and login.">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                 <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                 <input type="email" disabled className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" value={email} />
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input type="password" placeholder="Set new password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
               </div>
            </div>
            <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Save size={16} /> Update Profile
            </button>
          </form>
        </SettingSection>

        {/* 2. Organization Settings (Coming Soon) */}
        <SettingSection icon={Building} title="Organization" description="Manage company details and industry settings." comingSoonTrigger>
           <div className="h-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Organization Settings UI Placeholder</div>
        </SettingSection>

        {/* 3. Team & Roles (Coming Soon) */}
        <SettingSection icon={Users} title="Team & Roles" description="Invite members and manage permissions." comingSoonTrigger>
           <div className="h-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Team Management UI Placeholder</div>
        </SettingSection>

        {/* 4. Branding (Coming Soon) */}
        <SettingSection icon={Globe} title="Website Branding" description="Customize your dashboard look and domain." comingSoonTrigger>
           <div className="h-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Branding UI Placeholder</div>
        </SettingSection>

        {/* 5. Billing (Coming Soon - Logic is in Billing page) */}
        <SettingSection icon={CreditCard} title="Subscription & Billing" description="Manage plan, invoices, and payment methods." comingSoonTrigger>
           <div className="h-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Billing UI Placeholder</div>
        </SettingSection>

        {/* 6. Notifications (Coming Soon) */}
        <SettingSection icon={Bell} title="Notifications" description="Manage alerts and email preferences." comingSoonTrigger>
           <div className="h-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Notification UI Placeholder</div>
        </SettingSection>

        <div className="mt-12 text-center">
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto">
            <LogOut size={18} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}