import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, User, Calendar, Send, Trash2, LogOut, Clock, Save } from 'lucide-react';
import Logo from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientData } = await supabase.from('clients').select('*').eq('id', id).single();
      setClient(clientData);
      
      // Format date for input (YYYY-MM-DD) if it exists
      if (clientData?.next_follow_up) {
        setFollowUpDate(new Date(clientData.next_follow_up).toISOString().split('T')[0]);
      }

      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      setNotes(notesData || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote) return;
    const { data, error } = await supabase.from('notes').insert([{ content: newNote, client_id: id }]).select();
    if (!error && data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
    }
  };

  const handleSaveDate = async () => {
    setSavingDate(true);
    const { error } = await supabase
      .from('clients')
      .update({ next_follow_up: followUpDate || null }) // Send null if empty
      .eq('id', id);
    
    if (!error) alert("Follow-up date updated!");
    setSavingDate(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Navbar Skeleton */}
        <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 md:p-10 max-w-5xl mx-auto">
          <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-6"></div>
          
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!client) return <div className="h-screen flex items-center justify-center text-slate-500">Client not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2">
          <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>

      <div className="p-4 md:p-10 max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 mb-6 font-bold transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Client Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-teal-500">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold uppercase shadow-lg shadow-teal-500/20 shrink-0">
              {client.name[0]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{client.name}</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base">{client.email}</p>
            </div>
          </div>
          
          {/* Follow Up Date Picker */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Next Follow-up</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-600"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
              <button 
                onClick={handleSaveDate}
                disabled={savingDate}
                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                title="Save Date"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Left: Add Note */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-teal-600" /> Add Note
              </h3>
              <form onSubmit={handleAddNote}>
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-32 bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Meeting details..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  <Send size={16} /> Save Note
                </button>
              </form>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <Calendar size={20} className="text-teal-600" /> History
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 font-medium italic">No history yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative hover:border-teal-200">
                    <div className="absolute left-0 top-8 w-1 h-8 bg-teal-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">{note.content}</p>
                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(note.created_at).toLocaleDateString()} • {new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}