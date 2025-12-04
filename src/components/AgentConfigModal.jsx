import React, { useState, useEffect } from 'react';
import { X, Bot, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AgentConfigModal({ isOpen, onClose, user }) {
  const [agentName, setAgentName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [agentTone, setAgentTone] = useState('Professional');
  const [businessContext, setBusinessContext] = useState('');
  const [formality, setFormality] = useState(5);
  const [creativity, setCreativity] = useState(5);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      const fetchData = async () => {
        const { data } = await supabase.from('agent_settings').select('*').eq('user_id', user.id).single();
        if (data) {
          setAgentName(data.agent_name);
          setJobTitle(data.job_title || 'Virtual Assistant');
          setAgentTone(data.agent_tone);
          setBusinessContext(data.business_context || '');
          setFormality(data.formality_level || 5);
          setCreativity(data.creativity_level || 5);
          setSignature(data.email_signature || '');
        }
      };
      fetchData();
    }
  }, [user, isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('agent_settings').upsert({
      user_id: user.id,
      agent_name: agentName,
      job_title: jobTitle,
      agent_tone: agentTone,
      business_context: businessContext,
      formality_level: formality,
      creativity_level: creativity,
      email_signature: signature
    });
    setLoading(false);
    if (!error) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2"><Bot className="text-teal-600"/> Configure Agent</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g. Sarah" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Receptionist" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Context</label>
              <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl h-24 resize-none" value={businessContext} onChange={(e) => setBusinessContext(e.target.value)} placeholder="Describe your business..." />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between"><span>Casual</span><span>Formal</span></label>
                    <input type="range" min="1" max="10" value={formality} onChange={(e) => setFormality(e.target.value)} className="w-full accent-teal-600" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between"><span>Concise</span><span>Creative</span></label>
                    <input type="range" min="1" max="10" value={creativity} onChange={(e) => setCreativity(e.target.value)} className="w-full accent-teal-600" />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Tone</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Professional', 'Friendly', 'Empathetic', 'Urgent'].map((tone) => (
                      <button key={tone} type="button" onClick={() => setAgentTone(tone)} className={`py-2 px-2 rounded-lg text-xs font-bold border ${agentTone === tone ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200'}`}>{tone}</button>
                  ))}
                </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
               <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
               <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">{loading ? 'Saving...' : 'Save Changes'} <Save size={16} /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}