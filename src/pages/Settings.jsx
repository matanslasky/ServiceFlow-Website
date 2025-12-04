import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut, Bot, Sliders, FileText, Briefcase, User, Building, Users, Globe, CreditCard, Bell, Clock, Trash2, Shield, Calendar, Download } from 'lucide-react';

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
  const [jobTitle, setJobTitle] = useState('');
  const [agentTone, setAgentTone] = useState('Professional');
  const [businessContext, setBusinessContext] = useState('');
  const [formality, setFormality] = useState(5);
  const [creativity, setCreativity] = useState(5);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [comingSoon, setComingSoon] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');

      if (user) {
        const { data } = await supabase.from('agent_settings').select('*').eq('user_id', user.id).single();
        if (data) {
          setAgentName(data.agent_name || 'Medical Assistant');
          setJobTitle(data.job_title || 'Virtual Assistant');
          setAgentTone(data.agent_tone);
          setBusinessContext(data.business_context || '');
          setFormality(data.formality_level || 5);
          setCreativity(data.creativity_level || 5);
        }
      }
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

    const { error: agentError } = await supabase
      .from('agent_settings')
      .update({ 
        agent_name: agentName, 
        job_title: jobTitle,
        agent_tone: agentTone,
        business_context: businessContext,
        formality_level: formality,
        creativity_level: creativity,
      })
      .eq('user_id', user.id);

    if (agentError) setError(agentError.message);
    else setMessage('Agent personality updated successfully!');
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
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-opacity duration-500 opacity-100">
          <Clock size={16} className="text-teal-400" />
          <span className="text-sm font-medium">This feature is coming soon!</span>
          <button onClick={() => setComingSoon(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Settings & Preferences</h1>
        <p className="text-slate-500 mb-10">Manage your account, organization, and agent configuration.</p>

        {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium border border-green-200 flex items-center gap-2"><Bot size={20}/> {message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-200">{error}</div>}

        {/* --- AGENT CONFIGURATION --- */}
        <SettingSection icon={Bot} title="Agent Persona" description="Customize your AI's name, job title, and communication style.">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agent Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g. Sarah" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Receptionist" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Context (e.g., Dermatology Clinic, Legal Firm)</label>
              <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white h-24 resize-none" value={businessContext} onChange={(e) => setBusinessContext(e.target.value)} placeholder="e.g. We are a dermatology clinic specializing in skincare. We are closed on Sundays." />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between"><span>Casual</span><span>Formal</span></label>
                  <input type="range" min="1" max="10" value={formality} onChange={(e) => setFormality(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between"><span>Concise</span><span>Creative</span></label>
                  <input type="range" min="1" max="10" value={creativity} onChange={(e) => setCreativity(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Tone</label>
              <div className="grid grid-cols-4 gap-3">
                {['Professional', 'Friendly', 'Empathetic', 'Urgent'].map((tone) => (
                    <button key={tone} type="button" onClick={() => setAgentTone(tone)} className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${agentTone === tone ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}`}>{tone}</button>
                ))}
              </div>
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-8"><Save size={18} /> Save Agent Identity</button>
          </form>
        </SettingSection>


        {/* --- ACCOUNTS & COMPLIANCE --- */}

        {/* 8. Security Settings (Coming Soon) */}
        <SettingSection icon={Shield} title="Security & MFA" description="Control login methods, devices, and session timeouts." comingSoonTrigger>
            <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Security Configuration Placeholder</div>
        </SettingSection>

        {/* 9. Legal & Compliance (Coming Soon) */}
        <SettingSection icon={FileText} title="Legal & Compliance" description="View agreements and manage GDPR/HIPAA compliance." comingSoonTrigger>
             <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Compliance Documents Placeholder</div>
        </SettingSection>

        {/* 10. Data Management (Delete & Export) */}
        <SettingSection icon={Download} title="Data Management" description="Export your client data and manage data retention policies.">
           <p className="text-sm text-slate-600 mb-4">Export all client records including notes and history (GDPR requirement).</p>
           <button onClick={() => alert('Export all data logic here')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <Download size={16}/> Export All Data (CSV)
           </button>
           
           <div className="mt-6 pt-4 border-t border-red-100">
               <p className="text-sm font-bold text-red-600 mb-2">Danger Zone</p>
               <button onClick={() => alert('Delete account logic here')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-all flex items-center gap-2">
                 <Trash2 size={16}/> Delete Account and Data
               </button>
           </div>
        </SettingSection>

        {/* 1. User Account Settings (Moved to bottom right) */}
        <SettingSection icon={User} title="User Account" description="Manage personal profile and login (Sign Out here).">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <input type="password" placeholder="Set new password" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Update Password</button>
          </form>
        </SettingSection>

        {/* 2. Organization / Company Settings (Coming Soon) */}
        <SettingSection icon={Building} title="Organization" description="Manage company name, logo, and industry settings." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Company Profile Placeholder</div>
        </SettingSection>

        {/* 3. Team & Roles (Coming Soon) */}
        <SettingSection icon={Users} title="Team & Roles" description="Invite members and manage permissions." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Team Management UI Placeholder</div>
        </SettingSection>

        {/* 4. Website Branding Settings (Coming Soon) */}
        <SettingSection icon={Globe} title="Website Branding" description="Customize your dashboard look and domain." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Branding UI Placeholder</div>
        </SettingSection>

        {/* 5. Subscription & Billing (Coming Soon) */}
        <SettingSection icon={CreditCard} title="Subscription & Billing" description="Manage plan, invoices, and payment methods." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Billing Panel Placeholder</div>
        </SettingSection>

        {/* 6. Notification Settings (Coming Soon) */}
        <SettingSection icon={Bell} title="Notification Settings" description="Manage alerts and email preferences." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Notification Preferences Placeholder</div>
        </SettingSection>

        {/* 11. Support & Feedback (Coming Soon) */}
        <SettingSection icon={MessageSquare} title="Support & Feedback" description="Access guides, chat support, and submit feature requests." comingSoonTrigger>
           <div className="h-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">Support Links Placeholder</div>
        </SettingSection>
      </div>
    </div>
  );
}