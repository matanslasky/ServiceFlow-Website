import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut, Bot, Sliders, FileText, Briefcase, User, Building, Users, Globe, CreditCard, Bell, Clock, Trash2, Shield, Calendar, Download, MessageSquare, X } from 'lucide-react';
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
    setMessage('Account settings updated successfully!');
  };

  const SettingSection = ({ icon: Icon, title, description, children, comingSoonTrigger }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 relative ${comingSoonTrigger ? 'opacity-80' : ''}`}>
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
      <div className={comingSoonTrigger ? 'pointer-events-none filter blur-[1px]' : ''}>{children}</div>
      {comingSoonTrigger && <button onClick={handleComingSoon} className="absolute inset-0 w-full h-full cursor-not-allowed"></button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}><Logo /></div>
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors"><ArrowLeft size={18} /> Back to Dashboard</button>
      </div>

      {comingSoon && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <Clock size={16} className="text-teal-400" /><span className="text-sm font-medium">This feature is coming soon!</span>
          <button onClick={() => setComingSoon(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Settings & Preferences</h1>
        <p className="text-slate-500 mb-10">Manage your account, organization, and agent configuration.</p>

        {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium border border-green-200 flex items-center gap-2">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-200">{error}</div>}

        {/* 1. User Account */}
        <SettingSection icon={User} title="User Account" description="Manage personal profile and login.">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <input type="password" placeholder="Set new password" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg">Update Password</button>
          </form>
        </SettingSection>

        {/* 8. Security Settings */}
        <SettingSection icon={Shield} title="Security & MFA" description="Control login methods, devices, and session timeouts." comingSoonTrigger>
            <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Security Configuration Placeholder</div>
        </SettingSection>

        {/* 9. Legal & Compliance */}
        <SettingSection icon={FileText} title="Legal & Compliance" description="View agreements and manage GDPR/HIPAA compliance." comingSoonTrigger>
             <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Compliance Documents Placeholder</div>
        </SettingSection>

        {/* 10. Data Management */}
        <SettingSection icon={Download} title="Data Management" description="Export your client data and manage data retention policies.">
           <p className="text-sm text-slate-600 mb-4">Export all client records including notes and history.</p>
           <button onClick={() => alert('Export')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2"><Download size={16}/> Export All Data (CSV)</button>
           <div className="mt-6 pt-4 border-t border-red-100">
               <p className="text-sm font-bold text-red-600 mb-2">Danger Zone</p>
               <button onClick={() => alert('Delete')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 flex items-center gap-2"><Trash2 size={16}/> Delete Account</button>
           </div>
        </SettingSection>

        {/* Placeholders for Other Sections */}
        <SettingSection icon={Building} title="Organization" description="Manage company name, logo, and industry settings." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Organization Placeholder</div></SettingSection>
        <SettingSection icon={Users} title="Team & Roles" description="Invite members and manage permissions." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Team Placeholder</div></SettingSection>
        <SettingSection icon={Globe} title="Branding" description="Customize your dashboard look." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Branding Placeholder</div></SettingSection>
        <SettingSection icon={CreditCard} title="Billing" description="Manage plan and invoices." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Billing Placeholder</div></SettingSection>
        <SettingSection icon={Bell} title="Notifications" description="Manage alerts." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Notifications Placeholder</div></SettingSection>
        <SettingSection icon={MessageSquare} title="Support" description="Access guides and support." comingSoonTrigger><div className="h-16 bg-slate-50 rounded-xl border-dashed border-slate-200 flex items-center justify-center text-slate-400">Support Placeholder</div></SettingSection>

        <div className="mt-12 text-center">
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto"><LogOut size={18} /> Sign Out of Account</button>
        </div>
      </div>
    </div>
  );
}