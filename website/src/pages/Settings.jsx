import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Save, LogOut, Bot, Sliders, FileText, Briefcase, User, Building, Users, Globe, CreditCard, Bell, Clock, Trash2, Shield, Calendar, Download, MessageSquare, X, AlertCircle, Check } from 'lucide-react';
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
  const [agentSettings, setAgentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [comingSoon, setComingSoon] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || '');

      // Load agent settings from database
      if (user) {
        const { data, error } = await supabase
          .from('agent_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setAgentSettings(data);
        } else if (error && error.code === 'PGRST116') {
          // No settings exist yet, create default
          const { data: newSettings } = await supabase
            .from('agent_settings')
            .insert([{
              user_id: user.id,
              active_agents: [],
              email_draft_mode: 'review_all',
              auto_send_enabled: false,
              business_hours_only: true,
              notification_preferences: { email: true, sms: false }
            }])
            .select()
            .single();
          setAgentSettings(newSettings);
        }
      }
      setLoading(false);
    };
    getData();
  }, []);

  const handleComingSoon = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 3000);
  };

  const handlePasswordReset = async () => {
    setMessage(''); setError(''); setResetEmailSent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`
    });
    if (error) {
      setError(error.message);
    } else {
      setResetEmailSent(true);
      setMessage('Password reset email sent! Check your inbox.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setError(error.message);
      setPassword('');
    }
    setMessage('Password updated successfully!');
  };

  const handleUpdateAgentSettings = async (updates) => {
    if (!user || !agentSettings) return;
    
    const { error } = await supabase
      .from('agent_settings')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      setError('Failed to update settings: ' + error.message);
    } else {
      setAgentSettings({ ...agentSettings, ...updates });
      setMessage('Agent settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" 
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Change Password</label>
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="submit" 
                  disabled={!password}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Update Password
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button 
                onClick={handlePasswordReset}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2"
              >
                <Mail size={14} /> Send password reset email
              </button>
              {resetEmailSent && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <Check size={12} /> Check your email for reset instructions
                </div>
              )}
            </div>
          </div>
        </SettingSection>

        {/* 2. Agent Configuration */}
        {!loading && agentSettings && (
          <SettingSection icon={Bot} title="Agent Configuration" description="Control which AI agents are active and their behavior.">
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Email Secretary Agent</span>
                  <button
                    onClick={() => {
                      const newActiveAgents = agentSettings.active_agents.includes('email_secretary')
                        ? agentSettings.active_agents.filter(a => a !== 'email_secretary')
                        : [...agentSettings.active_agents, 'email_secretary'];
                      handleUpdateAgentSettings({ active_agents: newActiveAgents });
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      agentSettings.active_agents.includes('email_secretary') ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        agentSettings.active_agents.includes('email_secretary') ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                <p className="text-xs text-slate-500">Automatically drafts responses to incoming emails</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Draft Mode</label>
                <select
                  value={agentSettings.email_draft_mode}
                  onChange={(e) => handleUpdateAgentSettings({ email_draft_mode: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="review_all">Review All - I approve every draft</option>
                  <option value="auto_simple">Auto-send Simple - Auto-send routine replies only</option>
                  <option value="auto_all">Auto-send All - Full automation (risky)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Business Hours Only</span>
                  <button
                    onClick={() => handleUpdateAgentSettings({ business_hours_only: !agentSettings.business_hours_only })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      agentSettings.business_hours_only ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        agentSettings.business_hours_only ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                <p className="text-xs text-slate-500 mt-1">Only send emails during 9 AM - 5 PM</p>
              </div>
            </div>
          </SettingSection>
        )}

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